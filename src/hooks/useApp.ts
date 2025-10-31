// hooks/useApp.ts
import { useState, useEffect, useCallback } from "react";
import { AppState, Vault, Transaction, NotificationState } from "@/types";
import {
  generateMockVaults,
  updateVaultAPYs,
  findBestVault,
  generateAppStats,
  generateEmptyPortfolio,
  addPositionToPortfolio,
  simulatePortfolioGrowth,
  simulateXCMDelay,
  generateTxHash,
  generateXCMMessageId,
} from "@/lib/mockData";

export const useApp = () => {
  const [state, setState] = useState<AppState>({
    vaults: [],
    portfolio: generateEmptyPortfolio(),
    stats: {
      totalTVL: 0,
      bestAPY: 0,
      activeChains: 0,
      totalUsers: 0,
      volume24h: 0,
      totalYieldGenerated: 0,
    },
    wallet: {
      isConnected: false,
      address: null,
      balance: 0,
      network: "Polkadot Hub TestNet",
    },
    transactions: [],
    selectedVault: null,
    loading: {
      vaults: false,
      deposit: false,
      optimize: false,
      wallet: false,
    },
    currentTab: "dashboard",
  });

  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: "",
    type: "info",
  });

  // Initialize vaults on mount
  useEffect(() => {
    const initialVaults = generateMockVaults();
    const vaultsWithBest = findBestVault(initialVaults);
    const portfolio = generateEmptyPortfolio();
    const stats = generateAppStats(vaultsWithBest, portfolio);

    setState((prev) => ({
      ...prev,
      vaults: vaultsWithBest,
      stats,
    }));
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.vaults.length === 0) return prev;

        // Randomly update some vault APYs (30% chance)
        let updatedVaults = prev.vaults;
        if (Math.random() > 0.7) {
          updatedVaults = updateVaultAPYs(prev.vaults);
          updatedVaults = findBestVault(updatedVaults);
        }

        // Simulate portfolio growth
        const updatedPortfolio = simulatePortfolioGrowth(
          prev.portfolio,
          updatedVaults
        );

        // Update stats
        const updatedStats = generateAppStats(updatedVaults, updatedPortfolio);

        return {
          ...prev,
          vaults: updatedVaults,
          portfolio: updatedPortfolio,
          stats: updatedStats,
        };
      });
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const showNotification = useCallback(
    (message: string, type: NotificationState["type"] = "info") => {
      setNotification({ show: true, message, type });
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 4000);
    },
    []
  );

  const connectWallet = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, wallet: true },
    }));

    // Simulate wallet connection delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setState((prev) => ({
      ...prev,
      wallet: {
        ...prev.wallet,
        isConnected: true,
        address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        balance: 1000 + Math.random() * 5000, // Random balance
      },
      loading: { ...prev.loading, wallet: false },
    }));

    showNotification("Wallet connected successfully!", "success");
  }, [showNotification]);

  const refreshVaults = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, vaults: true },
    }));

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setState((prev) => {
      const updatedVaults = updateVaultAPYs(prev.vaults);
      const vaultsWithBest = findBestVault(updatedVaults);
      const updatedStats = generateAppStats(vaultsWithBest, prev.portfolio);

      return {
        ...prev,
        vaults: vaultsWithBest,
        stats: updatedStats,
        loading: { ...prev.loading, vaults: false },
      };
    });

    showNotification("Yield data updated from all parachains via XCM", "info");
  }, [showNotification]);

  const depositToVault = useCallback(
    async (vaultId: string, amount: number) => {
      if (!state.wallet.isConnected) {
        showNotification("Please connect your wallet first", "warning");
        return;
      }

      const vault = state.vaults.find((v) => v.id === vaultId);
      if (!vault) return;

      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, deposit: true },
      }));

      // Create transaction record
      const transaction: Transaction = {
        id: generateTxHash(),
        type: "deposit",
        vaultId,
        amount,
        status: "pending",
        timestamp: new Date(),
        xcmMessageId: generateXCMMessageId(),
      };

      setState((prev) => ({
        ...prev,
        transactions: [transaction, ...prev.transactions],
      }));

      showNotification(
        `Depositing $${amount.toLocaleString()} to ${
          vault.chainName
        }. XCM message sent...`,
        "info"
      );

      try {
        // Simulate XCM delay
        await simulateXCMDelay();

        // Update transaction status
        setState((prev) => ({
          ...prev,
          transactions: prev.transactions.map((tx) =>
            tx.id === transaction.id
              ? {
                  ...tx,
                  status: "completed" as const,
                  txHash: generateTxHash(),
                }
              : tx
          ),
        }));

        // Add to portfolio
        setState((prev) => {
          const updatedPortfolio = addPositionToPortfolio(
            prev.portfolio,
            vaultId,
            amount,
            vault.apy
          );

          // Update vault TVL
          const updatedVaults = prev.vaults.map((v) =>
            v.id === vaultId ? { ...v, tvl: v.tvl + amount } : v
          );

          const updatedStats = generateAppStats(
            updatedVaults,
            updatedPortfolio
          );

          return {
            ...prev,
            portfolio: updatedPortfolio,
            vaults: updatedVaults,
            stats: updatedStats,
            loading: { ...prev.loading, deposit: false },
          };
        });

        showNotification(
          `Successfully deposited $${amount.toLocaleString()} to ${
            vault.chainName
          }!`,
          "success"
        );
      } catch (error) {
        setState((prev) => ({
          ...prev,
          transactions: prev.transactions.map((tx) =>
            tx.id === transaction.id ? { ...tx, status: "failed" as const } : tx
          ),
          loading: { ...prev.loading, deposit: false },
        }));

        showNotification("Deposit failed. Please try again.", "error");
      }
    },
    [state.wallet.isConnected, state.vaults, showNotification]
  );

  const optimizeYield = useCallback(
    async (amount: number) => {
      if (!state.wallet.isConnected) {
        showNotification("Please connect your wallet first", "warning");
        return;
      }

      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, optimize: true },
      }));

      showNotification("Analyzing yields across all parachains...", "info");

      // Simulate optimization analysis
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const bestVault = state.vaults.find((v) => v.isBest);
      if (!bestVault) return;

      showNotification(
        `Best yield found: ${bestVault.chainName} (${bestVault.apy.toFixed(
          1
        )}% APY). Executing deposit...`,
        "info"
      );

      // Auto-deposit to best vault
      await depositToVault(bestVault.id, amount);

      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, optimize: false },
      }));
    },
    [state.wallet.isConnected, state.vaults, depositToVault, showNotification]
  );

  const switchTab = useCallback((tab: AppState["currentTab"]) => {
    setState((prev) => ({ ...prev, currentTab: tab }));
  }, []);

  const selectVault = useCallback((vault: Vault | null) => {
    setState((prev) => ({ ...prev, selectedVault: vault }));
  }, []);

  return {
    state,
    notification,
    actions: {
      connectWallet,
      refreshVaults,
      depositToVault,
      optimizeYield,
      switchTab,
      selectVault,
      showNotification,
    },
  };
};

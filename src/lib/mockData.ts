// lib/mockData.ts
import { Vault, AppStats, Portfolio } from "@/types";

export const generateMockVaults = (): Vault[] => {
  const baseVaults = [
    {
      id: "acala",
      chainName: "Acala",
      chainId: 2000,
      apy: 22.8,
      tvl: 850000,
      riskScore: 4,
      type: "Liquid Staking",
      logo: "🔴",
      volume24h: 125000,
      fees: 0.3,
      strategy: {
        name: "LDOT Liquid Staking",
        description: "Stake DOT and receive LDOT while maintaining liquidity",
        protocols: ["Acala DEX", "Honzon Protocol"],
      },
    },
    {
      id: "hydradx",
      chainName: "HydraDX",
      chainId: 2034,
      apy: 19.5,
      tvl: 420000,
      riskScore: 7,
      type: "DEX LP",
      logo: "🌊",
      volume24h: 89000,
      fees: 0.25,
      strategy: {
        name: "Omnipool LP",
        description: "Provide liquidity to the universal Omnipool",
        protocols: ["HydraDX Omnipool"],
      },
    },
    {
      id: "moonbeam",
      chainName: "Moonbeam",
      chainId: 1000,
      apy: 15.3,
      tvl: 650000,
      riskScore: 5,
      type: "DeFi Lending",
      logo: "🌙",
      volume24h: 78000,
      fees: 0.5,
      strategy: {
        name: "Multi-Protocol Lending",
        description: "Automated lending across Moonwell and StellaSwap",
        protocols: ["Moonwell", "StellaSwap", "BeamSwap"],
      },
    },
    {
      id: "interlay",
      chainName: "Interlay",
      chainId: 2032,
      apy: 12.1,
      tvl: 320000,
      riskScore: 3,
      type: "BTC Yield",
      logo: "⚡",
      volume24h: 45000,
      fees: 0.2,
      strategy: {
        name: "iBTC Vault Strategy",
        description: "Earn yield on Bitcoin through iBTC vaults",
        protocols: ["Interlay Vaults", "Kintsugi"],
      },
    },
    {
      id: "astar",
      chainName: "Astar",
      chainId: 2006,
      apy: 14.7,
      tvl: 180000,
      riskScore: 6,
      type: "dApp Staking",
      logo: "⭐",
      volume24h: 32000,
      fees: 0.35,
      strategy: {
        name: "dApp Staking Plus",
        description: "Stake ASTAR in dApps and farming protocols",
        protocols: ["Astar dApp Staking", "ArthSwap"],
      },
    },
    {
      id: "bifrost",
      chainName: "Bifrost",
      chainId: 2001,
      apy: 16.2,
      tvl: 270000,
      riskScore: 4,
      type: "Liquid Staking",
      logo: "🌈",
      volume24h: 56000,
      fees: 0.28,
      strategy: {
        name: "vToken Strategy",
        description: "Stake multiple assets and receive liquid vTokens",
        protocols: ["Bifrost SLP", "Zenlink DEX"],
      },
    },
  ];

  // Add dynamic variations to make it realistic
  return baseVaults
    .map((vault) => ({
      ...vault,
      apy: vault.apy + (Math.random() - 0.5) * 2, // ±1% variation
      tvl: vault.tvl + Math.random() * 50000, // Random TVL variation
      isBest: false, // Will be calculated
      isActive: Math.random() > 0.1, // 90% active
      lastUpdate: new Date(),
      volume24h: vault.volume24h + Math.random() * 20000,
    }))
    .map((vault) => ({
      ...vault,
      apy: Math.max(5, Math.min(30, vault.apy)), // Keep APY realistic
    }));
};

export const updateVaultAPYs = (vaults: Vault[]): Vault[] => {
  return vaults.map((vault) => {
    // Simulate realistic APY changes
    const change = (Math.random() - 0.5) * 0.5; // ±0.25% change
    const newAPY = Math.max(5, Math.min(30, vault.apy + change));

    return {
      ...vault,
      apy: newAPY,
      lastUpdate: new Date(),
      // TVL changes with APY sometimes
      tvl:
        vault.tvl +
        (change > 0 ? Math.random() * 10000 : -Math.random() * 5000),
    };
  });
};

export const findBestVault = (vaults: Vault[]): Vault[] => {
  const maxAPY = Math.max(
    ...vaults.filter((v) => v.isActive).map((v) => v.apy)
  );
  return vaults.map((vault) => ({
    ...vault,
    isBest: vault.isActive && vault.apy === maxAPY,
  }));
};

export const generateAppStats = (
  vaults: Vault[],
  portfolio: Portfolio
): AppStats => {
  const totalTVL = vaults.reduce((sum, vault) => sum + vault.tvl, 0);
  const bestAPY = Math.max(
    ...vaults.filter((v) => v.isActive).map((v) => v.apy)
  );
  const activeChains = vaults.filter((v) => v.isActive).length;
  const volume24h = vaults.reduce((sum, vault) => sum + vault.volume24h, 0);

  return {
    totalTVL,
    bestAPY,
    activeChains,
    totalUsers: 1247 + Math.floor(Math.random() * 50), // Simulate growing users
    volume24h,
    totalYieldGenerated: 125000 + Math.random() * 25000,
  };
};

export const generateEmptyPortfolio = (): Portfolio => ({
  totalDeposited: 0,
  totalValue: 0,
  totalEarned: 0,
  positions: [],
  avgApy: 0,
  lastUpdate: new Date(),
});

export const addPositionToPortfolio = (
  portfolio: Portfolio,
  vaultId: string,
  amount: number,
  currentAPY: number
): Portfolio => {
  const newPosition = {
    vaultId,
    amount,
    shares: amount, // 1:1 for simplicity in demo
    depositedAt: new Date(),
    currentValue: amount,
    earned: 0,
    apy: currentAPY,
  };

  const updatedPositions = [...portfolio.positions, newPosition];
  const totalDeposited = portfolio.totalDeposited + amount;
  const totalValue = portfolio.totalValue + amount;

  // Calculate average APY weighted by position size
  const totalAmount = updatedPositions.reduce(
    (sum, pos) => sum + pos.amount,
    0
  );
  const avgApy =
    updatedPositions.reduce((sum, pos) => sum + pos.apy * pos.amount, 0) /
    totalAmount;

  return {
    totalDeposited,
    totalValue,
    totalEarned: portfolio.totalEarned,
    positions: updatedPositions,
    avgApy,
    lastUpdate: new Date(),
  };
};

export const simulatePortfolioGrowth = (
  portfolio: Portfolio,
  vaults: Vault[]
): Portfolio => {
  if (portfolio.positions.length === 0) return portfolio;

  const updatedPositions = portfolio.positions.map((position) => {
    const vault = vaults.find((v) => v.id === position.vaultId);
    if (!vault) return position;

    // Simulate daily growth (very small for demo)
    const dailyGrowth = vault.apy / 365 / 100;
    const growth = position.currentValue * dailyGrowth * 0.1; // Scale down for demo

    return {
      ...position,
      currentValue: position.currentValue + growth,
      earned: position.earned + growth,
      apy: vault.apy,
    };
  });

  const totalValue = updatedPositions.reduce(
    (sum, pos) => sum + pos.currentValue,
    0
  );
  const totalEarned = updatedPositions.reduce(
    (sum, pos) => sum + pos.earned,
    0
  );
  const totalAmount = updatedPositions.reduce(
    (sum, pos) => sum + pos.amount,
    0
  );
  const avgApy =
    totalAmount > 0
      ? updatedPositions.reduce((sum, pos) => sum + pos.apy * pos.amount, 0) /
        totalAmount
      : 0;

  return {
    ...portfolio,
    totalValue,
    totalEarned,
    positions: updatedPositions,
    avgApy,
    lastUpdate: new Date(),
  };
};

// Simulate XCM message delay
export const simulateXCMDelay = (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, 2000 + Math.random() * 2000); // 2-4 second delay
  });
};

// Generate realistic transaction hash
export const generateTxHash = (): string => {
  return (
    "0x" +
    Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")
  );
};

// Generate XCM message ID
export const generateXCMMessageId = (): string => {
  return (
    "xcm_" +
    Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")
  );
};

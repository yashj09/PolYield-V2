// app/page.tsx
"use client";

import React, { useState } from "react";
import { useApp } from "@/hooks/useApp";
import Header from "@/components/Header";
import StatsGrid from "@/components/StatsGrid";
import YieldOptimizer from "@/components/YieldOptimizer";
import VaultGrid from "@/components/VaultGrid";
import Portfolio from "@/components/Portfolio";
import DepositModal from "@/components/DepositModal";
import Notification from "@/components/Notification";

export default function HomePage() {
  const { state, notification, actions } = useApp();
  const [showDepositModal, setShowDepositModal] = useState(false);

  const handleSelectVault = (vault: any) => {
    if (state.wallet.isConnected) {
      actions.selectVault(vault);
      setShowDepositModal(true);
    } else {
      // actions.showNotification("Please connect your wallet first", "warning");
    }
  };

  const handleDeposit = (vaultId: string, amount: number) => {
    actions.depositToVault(vaultId, amount);
    setShowDepositModal(false);
  };

  const renderContent = () => {
    switch (state.currentTab) {
      case "portfolio":
        return (
          <Portfolio
            portfolio={state.portfolio}
            vaults={state.vaults}
            isConnected={state.wallet.isConnected}
          />
        );
      case "analytics":
        return (
          <div className="glass-container p-12 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-2xl font-bold gradient-text mb-2">
              Analytics Dashboard
            </h3>
            <p className="text-gray-600">
              Advanced analytics and yield tracking coming soon
            </p>
          </div>
        );
      default:
        return (
          <>
            {/* Stats Grid */}
            <StatsGrid stats={state.stats} portfolio={state.portfolio} />

            {/* Yield Optimizer */}
            <YieldOptimizer
              isConnected={state.wallet.isConnected}
              loading={state.loading.optimize}
              vaults={state.vaults}
              onOptimize={actions.optimizeYield}
            />

            {/* Vault Grid */}
            <VaultGrid
              vaults={state.vaults}
              loading={state.loading.vaults}
              isConnected={state.wallet.isConnected}
              onRefresh={actions.refreshVaults}
              onSelectVault={handleSelectVault}
            />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen main-gradient">
      {/* Floating Background Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="floating-shape w-64 h-64 top-10 right-20"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="floating-shape w-48 h-48 bottom-20 left-10"
          style={{ animationDelay: "5s" }}
        />
        <div
          className="floating-shape w-80 h-80 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{ animationDelay: "10s" }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Header */}
          <Header
            wallet={state.wallet}
            currentTab={state.currentTab}
            loading={state.loading}
            onConnectWallet={actions.connectWallet}
            onSwitchTab={actions.switchTab}
          />

          {/* Main Content */}
          {renderContent()}

          {/* Deposit Modal */}
          <DepositModal
            vault={state.selectedVault}
            isOpen={showDepositModal}
            loading={state.loading.deposit}
            onClose={() => {
              setShowDepositModal(false);
              actions.selectVault(null);
            }}
            onDeposit={handleDeposit}
          />

          {/* Notification */}
          <Notification notification={notification} />
        </div>

        {/* Footer */}
        <footer className="relative z-10 mt-20 border-t border-white/20">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="glass-container p-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="font-bold gradient-text text-lg mb-1">
                    Cross-Chain Yield Aggregator
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Built for Polkadot Hackathon 2025 • Powered by XCM
                  </p>
                </div>
                <div className="flex gap-4">
                  <button className="btn-glass text-sm">
                    📚 Documentation
                  </button>
                  <button className="btn-glass text-sm">💬 Discord</button>
                  <button className="btn-glass text-sm">🐦 Twitter</button>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// components/Header.tsx
import React from "react";
import { AppState } from "@/types";

interface HeaderProps {
  wallet: AppState["wallet"];
  currentTab: AppState["currentTab"];
  loading: AppState["loading"];
  onConnectWallet: () => void;
  onSwitchTab: (tab: AppState["currentTab"]) => void;
}

const Header: React.FC<HeaderProps> = ({
  wallet,
  currentTab,
  loading,
  onConnectWallet,
  onSwitchTab,
}) => {
  return (
    <div className="relative">
      {/* Header Section */}
      <div className="text-center mb-12 pt-16 pb-8">
        <h1 className="text-5xl font-bold text-white mb-4">
          ⚡ Cross-Chain Yield Aggregator
        </h1>
        <p className="text-xl text-white/90 font-medium max-w-2xl mx-auto">
          First native yield optimizer for Polkadot ecosystem using XCM
        </p>
      </div>

      {/* Navigation Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
        {/* Navigation Pills */}
        <div className="glass-nav p-2 flex gap-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: "📊" },
            { id: "vaults", label: "Vaults", icon: "🏦" },
            { id: "portfolio", label: "Portfolio", icon: "💼" },
            { id: "analytics", label: "Analytics", icon: "📈" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSwitchTab(tab.id as AppState["currentTab"])}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                currentTab === tab.id
                  ? "bg-white/25 text-gray-800 backdrop-blur-lg shadow-lg"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Wallet Section */}
        <div className="flex items-center gap-4">
          {/* Network Indicator */}
          <div className="flex items-center gap-3 bg-white/15 backdrop-blur-lg border border-white/20 rounded-xl px-4 py-2">
            <div className="status-dot"></div>
            <span className="text-white font-medium text-sm">
              {wallet.network}
            </span>
          </div>

          {/* Wallet Button */}
          <button
            onClick={onConnectWallet}
            disabled={loading.wallet}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              wallet.isConnected
                ? "btn-polkadot"
                : "btn-glass hover:bg-white/30"
            }`}
          >
            {loading.wallet ? (
              <>
                <div className="loading-spinner"></div>
                Connecting...
              </>
            ) : wallet.isConnected ? (
              <>
                <span className="text-lg">✅</span>
                {wallet.address
                  ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(
                      -4
                    )}`
                  : "Connected"}
              </>
            ) : (
              <>
                <span className="text-lg">👛</span>
                Connect Wallet
              </>
            )}
          </button>

          {/* Balance Display */}
          {wallet.isConnected && (
            <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-xl px-4 py-2">
              <div className="text-white/70 text-xs">Balance</div>
              <div className="text-white font-semibold">
                {wallet.balance.toFixed(2)} DOT
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;

// components/VaultGrid.tsx
import React from "react";
import { Vault } from "@/types";

interface VaultGridProps {
  vaults: Vault[];
  loading: boolean;
  isConnected: boolean;
  onRefresh: () => void;
  onSelectVault: (vault: Vault) => void;
}

const VaultGrid: React.FC<VaultGridProps> = ({
  vaults,
  loading,
  isConnected,
  onRefresh,
  onSelectVault,
}) => {
  const getRiskColor = (score: number) => {
    if (score <= 3) return "bg-green-400";
    if (score <= 6) return "bg-yellow-400";
    return "bg-red-400";
  };

  const getRiskLabel = (score: number) => {
    if (score <= 3) return "Low Risk";
    if (score <= 6) return "Medium Risk";
    return "High Risk";
  };

  return (
    <div className="mb-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span>🏦</span>
          Available Yield Vaults
        </h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="btn-glass flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="loading-spinner"></div>
              Updating...
            </>
          ) : (
            <>
              <span>🔄</span>
              Refresh Yields
            </>
          )}
        </button>
      </div>

      {/* Vault Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {vaults.map((vault) => (
          <div
            key={vault.id}
            className={`glass-container p-6 relative overflow-hidden group cursor-pointer ${
              vault.isBest ? "ring-2 ring-[#e6007a] ring-opacity-50" : ""
            }`}
            onClick={() => onSelectVault(vault)}
          >
            {/* Best Yield Badge */}
            {vault.isBest && (
              <div className="absolute top-4 right-4 bg-[#e6007a] text-white px-3 py-1 rounded-full text-xs font-bold">
                🏆 BEST YIELD
              </div>
            )}

            {/* Vault Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                {/* Chain Logo */}
                <div className="w-12 h-12 polkadot-gradient rounded-xl flex items-center justify-center text-lg font-bold text-white">
                  {vault.logo}
                </div>

                {/* Chain Info */}
                <div>
                  <h3 className="text-xl font-bold gradient-text">
                    {vault.chainName}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Chain ID: {vault.chainId}
                  </p>
                </div>
              </div>

              {/* APY Display */}
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">
                  {vault.apy.toFixed(1)}%
                </div>
                <div className="text-gray-500 text-sm">APY</div>
              </div>
            </div>

            {/* Vault Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold gradient-text">
                  ${(vault.tvl / 1000).toFixed(0)}K
                </div>
                <div className="text-gray-600 text-sm">TVL</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold gradient-text">
                  {vault.type}
                </div>
                <div className="text-gray-600 text-sm">Strategy</div>
              </div>
            </div>

            {/* Strategy Info */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">
                {vault.strategy.name}
              </h4>
              <p className="text-gray-600 text-sm mb-3">
                {vault.strategy.description}
              </p>

              {/* Protocols */}
              <div className="flex flex-wrap gap-2">
                {vault.strategy.protocols.map((protocol, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white/30 rounded-md text-xs text-gray-700 font-medium"
                  >
                    {protocol}
                  </span>
                ))}
              </div>
            </div>

            {/* Risk Indicator */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-gray-600 text-sm">Risk Level:</span>
              <div className="flex gap-1">
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < vault.riskScore
                        ? getRiskColor(vault.riskScore)
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600 text-sm">
                {vault.riskScore}/10 ({getRiskLabel(vault.riskScore)})
              </span>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <span className="text-gray-500">24h Volume:</span>
                <div className="font-semibold gradient-text">
                  ${(vault.volume24h / 1000).toFixed(0)}K
                </div>
              </div>
              <div>
                <span className="text-gray-500">Fees:</span>
                <div className="font-semibold gradient-text">{vault.fees}%</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectVault(vault);
                }}
                disabled={!isConnected}
                className="flex-1 btn-polkadot disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ➕ Deposit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Manage vault - future feature
                }}
                className="flex-1 bg-white/20 backdrop-blur-lg text-gray-800 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300"
              >
                ⚙️ Manage
              </button>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    vault.isActive ? "bg-green-400" : "bg-red-400"
                  }`}
                ></div>
                <span className="text-sm text-gray-600">
                  {vault.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Updated {vault.lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {vaults.length === 0 && !loading && (
        <div className="glass-container p-12 text-center">
          <div className="text-4xl mb-4">🏦</div>
          <h3 className="text-xl font-semibold gradient-text mb-2">
            No Vaults Available
          </h3>
          <p className="text-gray-600">
            Refresh to load available yield opportunities
          </p>
        </div>
      )}

      {/* Connection Prompt */}
      {!isConnected && vaults.length > 0 && (
        <div className="glass-container p-6 text-center mt-6">
          <div className="text-2xl mb-2">👛</div>
          <p className="text-gray-700 font-medium">
            Connect your wallet to start depositing into vaults
          </p>
        </div>
      )}
    </div>
  );
};

export default VaultGrid;

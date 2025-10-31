// components/Portfolio.tsx
import React from "react";
import { Portfolio as PortfolioType, Vault } from "@/types";

interface PortfolioProps {
  portfolio: PortfolioType;
  vaults: Vault[];
  isConnected: boolean;
}

const Portfolio: React.FC<PortfolioProps> = ({
  portfolio,
  vaults,
  isConnected,
}) => {
  if (!isConnected) {
    return (
      <div className="glass-container p-12 text-center">
        <div className="text-4xl mb-4">👛</div>
        <h3 className="text-2xl font-bold gradient-text mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600">
          Connect your wallet to view your portfolio and track your positions
        </p>
      </div>
    );
  }

  if (portfolio.positions.length === 0) {
    return (
      <div>
        {/* Portfolio Summary - Empty State */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Deposited", value: "$0", icon: "💰" },
            { label: "Current Value", value: "$0", icon: "📈" },
            { label: "Total Earned", value: "$0", icon: "💎" },
            { label: "Active Positions", value: "0", icon: "🎯" },
          ].map((stat, index) => (
            <div key={index} className="glass-container p-6 text-center">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold gradient-text">
                {stat.value}
              </div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        <div className="glass-container p-12 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-2xl font-bold gradient-text mb-2">
            No Positions Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start by depositing into a vault to see your portfolio here
          </p>
          <button className="btn-polkadot">🚀 Start Earning</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-container p-6 text-center">
          <div className="text-2xl mb-2">💰</div>
          <div className="text-2xl font-bold gradient-text">
            ${portfolio.totalDeposited.toLocaleString()}
          </div>
          <div className="text-gray-600 text-sm">Total Deposited</div>
        </div>

        <div className="glass-container p-6 text-center">
          <div className="text-2xl mb-2">📈</div>
          <div className="text-2xl font-bold gradient-text">
            ${portfolio.totalValue.toLocaleString()}
          </div>
          <div className="text-gray-600 text-sm">Current Value</div>
          {portfolio.totalEarned > 0 && (
            <div className="text-green-600 text-sm font-semibold mt-1">
              +${portfolio.totalEarned.toFixed(2)} earned
            </div>
          )}
        </div>

        <div className="glass-container p-6 text-center">
          <div className="text-2xl mb-2">💎</div>
          <div className="text-2xl font-bold text-green-600">
            ${portfolio.totalEarned.toFixed(2)}
          </div>
          <div className="text-gray-600 text-sm">Total Earned</div>
          <div className="text-green-600 text-xs font-semibold mt-1">
            {portfolio.totalEarned > 0
              ? `+${(
                  (portfolio.totalEarned / portfolio.totalDeposited) *
                  100
                ).toFixed(2)}%`
              : "0%"}
          </div>
        </div>

        <div className="glass-container p-6 text-center">
          <div className="text-2xl mb-2">🎯</div>
          <div className="text-2xl font-bold gradient-text">
            {portfolio.positions.length}
          </div>
          <div className="text-gray-600 text-sm">Active Positions</div>
          <div className="text-gray-500 text-xs mt-1">
            Avg APY: {portfolio.avgApy.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Positions List */}
      <div className="glass-container p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold gradient-text">Your Positions</h3>
          <div className="text-gray-500 text-sm">
            Last updated: {portfolio.lastUpdate.toLocaleTimeString()}
          </div>
        </div>

        <div className="space-y-4">
          {portfolio.positions.map((position, index) => {
            const vault = vaults.find((v) => v.id === position.vaultId);
            if (!vault) return null;

            const gainLoss = position.currentValue - position.amount;
            const gainLossPercent = (gainLoss / position.amount) * 100;

            return (
              <div
                key={index}
                className="bg-white/20 rounded-xl p-4 hover:bg-white/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  {/* Vault Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 polkadot-gradient rounded-xl flex items-center justify-center text-white font-bold">
                      {vault.logo}
                    </div>
                    <div>
                      <h4 className="font-bold gradient-text text-lg">
                        {vault.chainName}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {vault.strategy.name}
                      </p>
                      <p className="text-gray-500 text-xs">
                        Deposited {position.depositedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Position Metrics */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-gray-600 text-xs">Deposited</div>
                      <div className="font-semibold">
                        ${position.amount.toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-600 text-xs">Current Value</div>
                      <div className="font-semibold">
                        ${position.currentValue.toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-600 text-xs">Gain/Loss</div>
                      <div
                        className={`font-semibold ${
                          gainLoss >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {gainLoss >= 0 ? "+" : ""}${gainLoss.toFixed(2)}
                        <span className="text-xs ml-1">
                          ({gainLossPercent >= 0 ? "+" : ""}
                          {gainLossPercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-600 text-xs">APY</div>
                      <div className="font-semibold text-green-600">
                        {position.apy.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Action Menu */}
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors">
                      ➕ Add
                    </button>
                    <button className="px-3 py-1 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors">
                      ➖ Withdraw
                    </button>
                  </div>
                </div>

                {/* Position Progress */}
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Earning Progress</span>
                    <span>{position.shares.toLocaleString()} shares</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="polkadot-gradient h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (position.earned / (position.amount * 0.1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Earned: ${position.earned.toFixed(2)}</span>
                    <span>Target: ${(position.amount * 0.1).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Portfolio Actions */}
        <div className="flex gap-4 mt-6 pt-6 border-t border-white/20">
          <button className="btn-polkadot flex-1">
            🔄 Rebalance Portfolio
          </button>
          <button className="btn-glass flex-1">📊 View Analytics</button>
          <button className="btn-glass flex-1">💸 Harvest All</button>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;

// components/OptimizeModal.tsx
import React from "react";
import { Vault } from "@/types";

interface OptimizeModalProps {
  bestVault: Vault | null;
  amount: number;
  isOpen: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const OptimizeModal: React.FC<OptimizeModalProps> = ({
  bestVault,
  amount,
  isOpen,
  loading,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !bestVault) return null;

  const estimatedYearlyReturn = (amount * bestVault.apy) / 100;
  const estimatedMonthlyReturn = estimatedYearlyReturn / 12;

  const getRiskColor = (score: number) => {
    if (score <= 3) return "text-green-600";
    if (score <= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getRiskLabel = (score: number) => {
    if (score <= 3) return "Low Risk";
    if (score <= 6) return "Medium Risk";
    return "High Risk";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal - Glassmorphic Design */}
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🎯</span>
              Yield Optimization
            </h2>
            <p className="text-white/70 text-xs mt-1">
              Review before deploying
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Best Vault Card */}
        <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🏆</span>
            <h3 className="text-sm font-bold text-white">Best Yield Found</h3>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 polkadot-gradient rounded-lg flex items-center justify-center text-lg font-bold text-white">
              {bestVault.logo}
            </div>
            <div className="flex-1">
              <h4 className="text-base font-bold text-white">
                {bestVault.chainName}
              </h4>
              <p className="text-white/70 text-xs">{bestVault.strategy.name}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">
                {bestVault.apy.toFixed(1)}%
              </div>
              <div className="text-white/60 text-xs">APY</div>
            </div>
          </div>

          {/* Vault Metrics */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <div className="text-sm font-bold text-white">
                ${(bestVault.tvl / 1000).toFixed(0)}K
              </div>
              <div className="text-white/60 text-xs">TVL</div>
            </div>
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <div className="text-sm font-bold text-white">
                {bestVault.fees}%
              </div>
              <div className="text-white/60 text-xs">Fees</div>
            </div>
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <div className="text-sm font-bold text-yellow-400">
                {bestVault.riskScore}/10
              </div>
              <div className="text-white/60 text-xs">Risk</div>
            </div>
          </div>

          {/* Protocols */}
          <div className="flex flex-wrap gap-1.5">
            {bestVault.strategy.protocols.slice(0, 3).map((protocol, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-white/30 rounded-full text-xs text-white font-medium"
              >
                {protocol}
              </span>
            ))}
          </div>
        </div>

        {/* Deposit Summary */}
        <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-xl p-4 mb-4">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2 text-sm">
            <span>💰</span>
            Deposit Summary
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-xs">Deposit Amount:</span>
              <span className="font-bold text-white text-sm">
                ${amount.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-white/70 text-xs">Est. Monthly:</span>
              <span className="font-bold text-green-400 text-sm">
                ${estimatedMonthlyReturn.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-white/70 text-xs">Est. Yearly:</span>
              <span className="font-bold text-green-400 text-base">
                ${estimatedYearlyReturn.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* XCM Details */}
        <div className="bg-blue-500/20 backdrop-blur-lg border border-blue-400/30 rounded-xl p-3 mb-3">
          <div className="flex items-start gap-2">
            <span className="text-lg">⚡</span>
            <div className="flex-1">
              <h4 className="font-bold text-blue-200 mb-2 text-xs">
                XCM Cross-Chain Transfer
              </h4>
              <div className="space-y-1 text-xs text-blue-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-blue-300 rounded-full"></span>
                  <span>Route: Asset Hub → {bestVault.chainName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-blue-300 rounded-full"></span>
                  <span>Est. time: ~12 seconds</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-white/30 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 disabled:opacity-50 text-sm backdrop-blur-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#e6007a] to-[#ff1a9b] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#e6007a]/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="loading-spinner"></div>
                <span className="text-xs">Processing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1.5">
                <span>🚀</span>
                <span>Confirm</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptimizeModal;

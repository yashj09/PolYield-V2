// components/DepositModal.tsx
import React, { useState, useEffect } from "react";
import { Vault } from "@/types";

interface DepositModalProps {
  vault: Vault | null;
  isOpen: boolean;
  loading: boolean;
  onClose: () => void;
  onDeposit: (vaultId: string, amount: number) => void;
}

const DepositModal: React.FC<DepositModalProps> = ({
  vault,
  isOpen,
  loading,
  onClose,
  onDeposit,
}) => {
  const [amount, setAmount] = useState("");
  const [estimatedShares, setEstimatedShares] = useState(0);
  const [estimatedYearlyReturn, setEstimatedYearlyReturn] = useState(0);

  useEffect(() => {
    if (amount && vault) {
      const numAmount = parseFloat(amount);
      setEstimatedShares(numAmount); // 1:1 for simplicity
      setEstimatedYearlyReturn((numAmount * vault.apy) / 100);
    } else {
      setEstimatedShares(0);
      setEstimatedYearlyReturn(0);
    }
  }, [amount, vault]);

  const handleDeposit = () => {
    if (vault && amount) {
      const numAmount = parseFloat(amount);
      if (numAmount > 0) {
        onDeposit(vault.id, numAmount);
        setAmount("");
      }
    }
  };

  const quickAmounts = [100, 500, 1000, 2500];

  if (!isOpen || !vault) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-container p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold gradient-text">
            Deposit to {vault.chainName}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Vault Summary */}
        <div className="bg-white/20 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 polkadot-gradient rounded-lg flex items-center justify-center text-white font-bold">
              {vault.logo}
            </div>
            <div>
              <h3 className="font-bold gradient-text">{vault.chainName}</h3>
              <p className="text-gray-600 text-sm">{vault.strategy.name}</p>
            </div>
            <div className="ml-auto text-right">
              <div className="text-2xl font-bold text-green-600">
                {vault.apy.toFixed(1)}%
              </div>
              <div className="text-gray-500 text-xs">APY</div>
            </div>
          </div>

          {/* XCM Status */}
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg p-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            XCM cross-chain routing enabled for Chain ID {vault.chainId}
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-3">
            Deposit Amount
          </label>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount.toString())}
                className="px-3 py-2 bg-white/30 rounded-lg text-sm font-medium hover:bg-white/40 transition-colors"
              >
                ${quickAmount}
              </button>
            ))}
          </div>

          {/* Custom Amount Input */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
              $
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount..."
              className="text-black w-full pl-8 pr-4 py-4 border border-gray-300 rounded-xl bg-white/50 backdrop-blur-lg font-semibold text-lg focus:outline-none focus:border-[#e6007a] focus:bg-white/70 transition-all duration-300"
            />
          </div>
        </div>

        {/* Deposit Preview */}
        {amount && (
          <div className="bg-white/20 rounded-xl p-4 mb-6">
            <h4 className="font-semibold gradient-text mb-3">
              Deposit Preview
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">You deposit:</span>
                <span className="font-semibold">
                  ${parseFloat(amount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">You receive:</span>
                <span className="font-semibold">
                  {estimatedShares.toLocaleString()} shares
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Est. yearly return:</span>
                <span className="font-semibold text-green-600">
                  ${estimatedYearlyReturn.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Target chain:</span>
                <span className="font-semibold">
                  {vault.chainName} ({vault.chainId})
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Risk Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-yellow-600 text-xl">⚠️</span>
            <div>
              <h4 className="font-semibold text-yellow-800 mb-1">
                Risk Notice
              </h4>
              <p className="text-yellow-700 text-sm">
                This vault has a risk score of {vault.riskScore}/10. Cross-chain
                operations involve additional risks including XCM message
                failures and parachain downtime. Only deposit what you can
                afford to lose.
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-blue-800 mb-2">
            Transaction Steps
          </h4>
          <ol className="text-blue-700 text-sm space-y-1">
            <li>1. Sign transaction with your wallet</li>
            <li>2. XCM message sent to {vault.chainName}</li>
            <li>3. Funds deployed to yield strategy</li>
            <li>4. Receive vault shares & start earning</li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 btn-glass">
            Cancel
          </button>
          <button
            onClick={handleDeposit}
            disabled={!amount || loading || parseFloat(amount) <= 0}
            className="flex-1 btn-polkadot disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="loading-spinner"></div>
                Processing...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>🚀</span>
                Deposit & Optimize
              </div>
            )}
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-500 text-xs mt-4">
          Gas fees will be paid automatically using your wallet balance
        </p>
      </div>
    </div>
  );
};

export default DepositModal;

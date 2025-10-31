// components/YieldOptimizer.tsx
import React, { useState } from "react";

interface YieldOptimizerProps {
  isConnected: boolean;
  loading: boolean;
  onOptimize: (amount: number) => void;
}

const YieldOptimizer: React.FC<YieldOptimizerProps> = ({
  isConnected,
  loading,
  onOptimize,
}) => {
  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState("");

  const quickAmounts = [100, 500, 1000, 5000];

  const handleOptimize = () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (amount > 0) {
      onOptimize(amount);
    }
  };

  return (
    <div className="glass-container p-10 text-center mb-10">
      {/* Icon */}
      <div className="w-20 h-20 mx-auto mb-6 polkadot-gradient rounded-2xl flex items-center justify-center text-3xl">
        ⚡
      </div>

      {/* Title */}
      <h2 className="text-3xl font-bold gradient-text mb-4">
        Smart Yield Optimization
      </h2>

      {/* Subtitle */}
      <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
        Automatically analyze and deploy to the best yield opportunities across
        Polkadot parachains using XCM
      </p>

      {/* XCM Status */}
      <div className="flex items-center justify-center gap-3 mb-8 bg-green-50 border border-green-200 rounded-xl p-4 max-w-md mx-auto">
        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-green-700 font-semibold">
          XCM Cross-Chain Messaging Active
        </span>
      </div>

      {/* Amount Selection */}
      <div className="mb-8">
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => {
                setSelectedAmount(amount);
                setCustomAmount("");
              }}
              className={`px-6 py-3 rounded-xl border font-semibold transition-all duration-300 ${
                selectedAmount === amount && !customAmount
                  ? "btn-polkadot"
                  : "border-gray-300 bg-white/50 text-gray-700 hover:bg-white/70 hover:border-gray-400"
              }`}
            >
              ${amount.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Custom Amount Input */}
        <div className="max-w-xs mx-auto font-black">
          <input
            type="number"
            placeholder="Custom amount..."
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/50 backdrop-blur-lg text-center text-black focus:outline-none focus:border-[#e6007a] focus:bg-white/70 transition-all duration-300"
          />
        </div>
      </div>

      {/* Optimize Button */}
      <button
        onClick={handleOptimize}
        disabled={!isConnected || loading}
        className={`btn-polkadot text-xl px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed ${
          loading ? "pointer-events-none" : ""
        }`}
      >
        {loading ? (
          <div className="flex items-center gap-3">
            <div className="loading-spinner"></div>
            Optimizing...
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span>🎯</span>
            Optimize My Yield
          </div>
        )}
      </button>

      {/* Connection Warning */}
      {!isConnected && (
        <p className="text-gray-500 mt-4 text-sm">
          Connect your wallet to start optimizing yields
        </p>
      )}

      {/* Feature List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 pt-8 border-t border-white/20">
        <div className="text-center">
          <div className="text-2xl mb-2">🔍</div>
          <div className="font-semibold text-gray-800 mb-1">
            Real-Time Analysis
          </div>
          <div className="text-sm text-gray-600">
            Scan all parachains for best yields
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-2">⚡</div>
          <div className="font-semibold text-gray-800 mb-1">XCM Execution</div>
          <div className="text-sm text-gray-600">
            Native cross-chain deployment
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-2">🛡️</div>
          <div className="font-semibold text-gray-800 mb-1">Risk Adjusted</div>
          <div className="text-sm text-gray-600">
            Smart risk-reward optimization
          </div>
        </div>
      </div>
    </div>
  );
};

export default YieldOptimizer;

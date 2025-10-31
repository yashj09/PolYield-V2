// components/StatsGrid.tsx
import React from "react";
import { AppStats, Portfolio } from "@/types";

interface StatsGridProps {
  stats: AppStats;
  portfolio: Portfolio;
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats, portfolio }) => {
  const statsData = [
    {
      value: `$${(stats.totalTVL / 1000000).toFixed(1)}M`,
      label: "Total Value Locked",
      change: "+12.5%",
      icon: "💰",
      isPositive: true,
    },
    {
      value: `${stats.bestAPY.toFixed(1)}%`,
      label: "Best APY Available",
      change: "HydraDX LP",
      icon: "🚀",
      isPositive: true,
    },
    {
      value: stats.activeChains.toString(),
      label: "Active Parachains",
      change: "XCM Enabled",
      icon: "⛓️",
      isPositive: true,
    },
    {
      value:
        portfolio.totalValue > 0
          ? `$${portfolio.totalValue.toLocaleString()}`
          : "$0",
      label: "Your Portfolio",
      change:
        portfolio.totalEarned > 0
          ? `+$${portfolio.totalEarned.toFixed(2)} earned`
          : "Start earning",
      icon: "💼",
      isPositive: portfolio.totalEarned >= 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {statsData.map((stat, index) => (
        <div
          key={index}
          className="glass-container p-8 text-center group hover:scale-105 transition-transform duration-300"
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 polkadot-gradient rounded-t-2xl opacity-60"></div>

          {/* Icon */}
          <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
            {stat.icon}
          </div>

          {/* Value */}
          <div className="text-3xl font-bold gradient-text mb-2">
            {stat.value}
          </div>

          {/* Label */}
          <div className="text-gray-600 font-medium mb-3">{stat.label}</div>

          {/* Change Indicator */}
          <div
            className={`flex items-center justify-center gap-2 text-sm font-semibold ${
              stat.isPositive ? "text-green-600" : "text-gray-500"
            }`}
          >
            {stat.isPositive && stat.change.includes("%") && (
              <span className="text-green-500">↗️</span>
            )}
            {stat.change.includes("XCM") && <span>🔗</span>}
            {stat.change.includes("Start") && <span>➕</span>}
            {stat.change.includes("earned") && <span>💎</span>}
            {stat.change}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;

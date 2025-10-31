"use client";
import React from "react";
import { PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";
import { defineChain } from "viem";
import { addRpcUrlOverrideToChain } from "@privy-io/chains";
export const PassetHub = defineChain({
  id: 420420422,
  name: "PassetHub",
  nativeCurrency: {
    decimals: 18,
    name: "PASEO",
    symbol: "PAS",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-passet-hub-eth-rpc.polkadot.io"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://passet-hub.paseo.io" },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 5882,
    },
  },
});
const supportedChains = [
  addRpcUrlOverrideToChain(
    PassetHub,
    "https://testnet-passet-hub-eth-rpc.polkadot.io"
  ),
];

let loginMethods = ["email", "wallet"];

export default function Providers({ children }: { children: React.ReactNode }) {
  const config = {
    supportedChains,
    loginMethods,
    appearance: {
      theme: "light" as const,
      accentColor: "#676FFF" as const,
    },
    embeddedWallets: {
      createOnLogin: "users-without-wallets" as const,
    },
  };

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      clientId={process.env.PRIVY_APP_SECRET!}
      config={config as PrivyClientConfig}
    >
      {children}
    </PrivyProvider>
  );
}

"use client";
import { useEffect, useState } from "react";
import { usePrivy, useLogin } from "@privy-io/react-auth";
import { useLogout } from "@privy-io/react-auth";

export default function WalletUI() {
  const [paseobalance, setPaseobalance] = useState<string>("");
  const { ready, authenticated } = usePrivy();
  const disableLogin = !ready || (ready && authenticated);

  useEffect(() => {
    let isMounted = true;

    const getBalance = async () => {
      if (!isMounted) return;

      if ((window as any).ethereum?.selectedAddress && authenticated && ready) {
        try {
          const balance = await (window as any).ethereum.request({
            method: "eth_getBalance",
            params: [(window as any).ethereum.selectedAddress, "latest"],
          });

          if (!isMounted) return;

          // Convert from wei to PAS (divide by 10^18)
          const balanceInPAS = (
            parseInt(balance, 16) / Math.pow(10, 18)
          ).toFixed(4);
          setPaseobalance(`${balanceInPAS} PAS`);
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      } else if (!authenticated && isMounted) {
        setPaseobalance("");
      }
    };

    // Add a small delay to prevent rapid calls
    const timeoutId = setTimeout(() => {
      if (ready && authenticated) {
        getBalance();
      }
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [ready, authenticated]);

  const { logout } = useLogout({
    onSuccess: () => {
      console.log("User logged out");
      setPaseobalance("");
    },
  });

  const { login } = useLogin({
    onComplete: () => {
      console.log("User logged in successfully");
    },
    onError: (error: any) => {
      console.error("Login error:", error);
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#061734] via-[#0a1f3a] to-[#000000] flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Paseo Wallet</h1>
          <p className="text-gray-300">Connect and manage your PAS tokens</p>
        </div>

        {/* Balance Display */}
        {authenticated && paseobalance && (
          <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
            <div className="text-center">
              <p className="text-gray-300 text-sm mb-2">Your Balance</p>
              <p className="text-2xl font-bold text-white">{paseobalance}</p>
            </div>
          </div>
        )}

        {/* Connection Status */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                authenticated ? "bg-green-400" : "bg-red-400"
              }`}
            ></div>
            <span className="text-white text-sm">
              {authenticated ? "Connected" : "Not Connected"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {!authenticated ? (
            <button
              disabled={disableLogin}
              onClick={login}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {!ready ? "Loading..." : "Connect Wallet"}
            </button>
          ) : (
            <button
              onClick={logout}
              className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Disconnect
            </button>
          )}
        </div>

        {/* Network Info */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="text-center">
            <p className="text-gray-400 text-xs">Network: Paseo PassetHub</p>
            <p className="text-gray-400 text-xs">Chain ID: 420420422</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// types/index.ts

export interface Vault {
  id: string;
  chainName: string;
  chainId: number;
  apy: number;
  tvl: number;
  riskScore: number; // 1-10
  type: string;
  logo: string;
  isBest: boolean;
  isActive: boolean;
  lastUpdate: Date;
  volume24h: number;
  fees: number;
  strategy: {
    name: string;
    description: string;
    protocols: string[];
  };
}

export interface UserPosition {
  vaultId: string;
  amount: number;
  shares: number;
  depositedAt: Date;
  currentValue: number;
  earned: number;
  apy: number;
}

export interface Portfolio {
  totalDeposited: number;
  totalValue: number;
  totalEarned: number;
  positions: UserPosition[];
  avgApy: number;
  lastUpdate: Date;
}

export interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "harvest" | "optimize";
  vaultId: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  timestamp: Date;
  txHash?: string;
  xcmMessageId?: string;
}

export interface AppStats {
  totalTVL: number;
  bestAPY: number;
  activeChains: number;
  totalUsers: number;
  volume24h: number;
  totalYieldGenerated: number;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: number;
  network: string;
}

export interface NotificationState {
  show: boolean;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

export interface AppState {
  vaults: Vault[];
  portfolio: Portfolio;
  stats: AppStats;
  wallet: WalletState;
  transactions: Transaction[];
  selectedVault: Vault | null;
  loading: {
    vaults: boolean;
    deposit: boolean;
    optimize: boolean;
    wallet: boolean;
  };
  currentTab: "dashboard" | "vaults" | "portfolio" | "analytics";
}

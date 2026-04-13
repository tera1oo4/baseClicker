import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base, baseSepolia } from '@reown/appkit/networks'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'NEEDS_PROJECT_ID'

// Testnet first — default network for development/testing
export const networks = [baseSepolia, base] as [typeof baseSepolia, typeof base]

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
})

export const config = wagmiAdapter.wagmiConfig

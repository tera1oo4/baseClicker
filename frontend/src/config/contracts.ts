import { baseSepolia, base } from '@reown/appkit/networks'

const ZERO = '0x0000000000000000000000000000000000000000' as `0x${string}`
const LEGACY = import.meta.env.VITE_CLICKER_CONTRACT_ADDRESS as string | undefined

function normalizeAddress(value?: string): `0x${string}` {
  const v = value?.trim()
  if (!v || !v.startsWith('0x') || v.length !== 42) return ZERO
  return v as `0x${string}`
}

// Per-network contract addresses
const contractAddresses: Record<number, `0x${string}`> = {
  [baseSepolia.id]: normalizeAddress(import.meta.env.VITE_CLICKER_CONTRACT_SEPOLIA || LEGACY),
  [base.id]: normalizeAddress(import.meta.env.VITE_CLICKER_CONTRACT_MAINNET || LEGACY),
}

export function getClickerAddress(chainId?: number): `0x${string}` {
  if (!chainId) return ZERO
  return contractAddresses[chainId] ?? ZERO
}

// Legacy export for backwards compat
export const CLICKER_ADDRESS = getClickerAddress(baseSepolia.id)

export const clickerGameAbi = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  { anonymous: false, inputs: [{ indexed: true, internalType: 'address', name: 'player', type: 'address' }, { indexed: false, internalType: 'uint256', name: 'clicks', type: 'uint256' }, { indexed: false, internalType: 'uint256', name: 'newScore', type: 'uint256' }], name: 'ClicksSynced', type: 'event' },
  { anonymous: false, inputs: [{ indexed: true, internalType: 'address', name: 'player', type: 'address' }, { indexed: true, internalType: 'uint256', name: 'upgradeId', type: 'uint256' }, { indexed: false, internalType: 'uint8', name: 'newLevel', type: 'uint8' }, { indexed: false, internalType: 'uint256', name: 'cost', type: 'uint256' }], name: 'UpgradePurchased', type: 'event' },
  { inputs: [{ internalType: 'uint256', name: 'upgradeId', type: 'uint256' }], name: 'buyUpgrade', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ internalType: 'uint256', name: 'limit', type: 'uint256' }], name: 'getLeaderboard', outputs: [{ components: [{ internalType: 'address', name: 'player', type: 'address' }, { internalType: 'uint256', name: 'score', type: 'uint256' }, { internalType: 'uint256', name: 'totalClicks', type: 'uint256' }], internalType: 'struct ClickerGame.LeaderboardEntry[]', name: '', type: 'tuple[]' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'getPlayerCount', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'address', name: 'addr', type: 'address' }], name: 'getPlayerData', outputs: [{ internalType: 'uint256', name: 'totalClicks', type: 'uint256' }, { internalType: 'uint256', name: 'score', type: 'uint256' }, { internalType: 'uint256', name: 'clickMultiplier', type: 'uint256' }, { internalType: 'uint256', name: 'autoClickRate', type: 'uint256' }, { internalType: 'uint64', name: 'lastSyncTime', type: 'uint64' }, { internalType: 'bool', name: 'exists', type: 'bool' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'address', name: 'addr', type: 'address' }], name: 'getPlayerUpgrades', outputs: [{ internalType: 'uint8[]', name: '', type: 'uint8[]' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'getUpgradeCount', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'uint256', name: 'upgradeId', type: 'uint256' }, { internalType: 'uint8', name: 'currentLevel', type: 'uint8' }], name: 'getUpgradeCost', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'uint256', name: 'newClicks', type: 'uint256' }], name: 'syncClicks', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], name: 'upgrades', outputs: [{ internalType: 'string', name: 'name', type: 'string' }, { internalType: 'uint256', name: 'baseCost', type: 'uint256' }, { internalType: 'uint256', name: 'costMultiplier', type: 'uint256' }, { internalType: 'uint256', name: 'effectValue', type: 'uint256' }, { internalType: 'uint8', name: 'effectType', type: 'uint8' }, { internalType: 'uint8', name: 'maxLevel', type: 'uint8' }], stateMutability: 'view', type: 'function' },
] as const

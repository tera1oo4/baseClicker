import { ref, computed } from 'vue'
import { useAccount, useChainId } from '@wagmi/vue'
import { readContract } from '@wagmi/core'
import { config } from '@/config/wagmi'
import { getClickerAddress, clickerGameAbi } from '@/config/contracts'

export interface LeaderboardEntry {
  player: string
  score: bigint
  totalClicks: bigint
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export function useLeaderboard() {
  const { address } = useAccount()
  const chainId = useChainId()
  const entries = ref<LeaderboardEntry[]>([])
  const loading = ref(false)

  const currentAddress = computed(() => getClickerAddress(chainId.value))
  const contractAvailable = computed(() => currentAddress.value !== ZERO_ADDRESS)

  const playerRank = computed(() => {
    if (!address.value) return -1
    const idx = entries.value.findIndex(
      (e) => e.player.toLowerCase() === address.value!.toLowerCase(),
    )
    return idx >= 0 ? idx + 1 : -1
  })

  async function fetchLeaderboard(limit = 50) {
    if (!contractAvailable.value) return
    loading.value = true
    try {
      const data = await readContract(config, {
        address: currentAddress.value,
        abi: clickerGameAbi,
        functionName: 'getLeaderboard',
        args: [BigInt(limit)],
      })

      entries.value = data.map((e) => ({
        player: e.player,
        score: e.score,
        totalClicks: e.totalClicks,
      }))
    } catch {
      // Contract not deployed
    } finally {
      loading.value = false
    }
  }

  return { entries, loading, playerRank, fetchLeaderboard, contractAvailable }
}

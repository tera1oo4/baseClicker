import { ref, computed, watch, onUnmounted } from 'vue'
import { useAccount, useChainId, useWriteContract } from '@wagmi/vue'
import { readContract, waitForTransactionReceipt } from '@wagmi/core'
import { config } from '@/config/wagmi'
import { getClickerAddress, clickerGameAbi } from '@/config/contracts'

const STORAGE_KEY = 'clicker_local_state'
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

interface LocalState {
  localClicks: number
  localScore: number
}

function loadLocalState(): LocalState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as LocalState
      return { localClicks: parsed.localClicks || 0, localScore: parsed.localScore || 0 }
    }
  } catch { /* ignore */ }
  return { localClicks: 0, localScore: 0 }
}

function saveLocalState(state: LocalState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

const localClicks = ref(0)
const localScore = ref(0)
const onChainScore = ref(0n)
const onChainClicks = ref(0n)
const clickMultiplier = ref(1n)
const autoClickRate = ref(0n)
const upgradeLevels = ref<number[]>([0, 0, 0, 0, 0])
const isSyncing = ref(false)
const isBuying = ref(false)
const dataLoaded = ref(false)

// Restore local state
const saved = loadLocalState()
localClicks.value = saved.localClicks
localScore.value = saved.localScore

const clickPower = computed(() => Number(clickMultiplier.value))
const clicksPerSecond = computed(() => Number(autoClickRate.value))
const totalScore = computed(() => Number(onChainScore.value) + localScore.value)

export function useClicker() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { writeContractAsync } = useWriteContract()

  const currentAddress = computed(() => getClickerAddress(chainId.value))
  const contractAvailable = computed(() => currentAddress.value !== ZERO_ADDRESS)

  // Auto-clicker interval
  let autoInterval: ReturnType<typeof setInterval> | null = null

  function startAutoClicker() {
    stopAutoClicker()
    autoInterval = setInterval(() => {
      if (autoClickRate.value > 0n) {
        localScore.value += Number(autoClickRate.value)
        saveLocalState({ localClicks: localClicks.value, localScore: localScore.value })
      }
    }, 1000)
  }

  function stopAutoClicker() {
    if (autoInterval) {
      clearInterval(autoInterval)
      autoInterval = null
    }
  }

  function click() {
    localClicks.value += 1
    localScore.value += clickPower.value
    saveLocalState({ localClicks: localClicks.value, localScore: localScore.value })
  }

  async function fetchPlayerData() {
    if (!address.value || !contractAvailable.value) return

    try {
      const data = await readContract(config, {
        address: currentAddress.value,
        abi: clickerGameAbi,
        functionName: 'getPlayerData',
        args: [address.value],
      })

      onChainClicks.value = data[0]
      onChainScore.value = data[1]
      clickMultiplier.value = data[2] || 1n
      autoClickRate.value = data[3]

      const upgradeData = await readContract(config, {
        address: currentAddress.value,
        abi: clickerGameAbi,
        functionName: 'getPlayerUpgrades',
        args: [address.value],
      })

      upgradeLevels.value = Array.from({ length: 5 }, (_, i) => Number(upgradeData[i] ?? 0))
      dataLoaded.value = true
    } catch {
      // Contract not deployed or not available
    }
  }

  async function sync() {
    if (!address.value || !contractAvailable.value || localClicks.value === 0) return
    isSyncing.value = true
    try {
      const clicksToSync = localClicks.value
      const hash = await writeContractAsync({
        address: currentAddress.value,
        abi: clickerGameAbi,
        functionName: 'syncClicks',
        args: [BigInt(clicksToSync)],
      })

      await waitForTransactionReceipt(config, { hash })

      localClicks.value = Math.max(0, localClicks.value - clicksToSync)
      localScore.value = 0
      saveLocalState({ localClicks: localClicks.value, localScore: localScore.value })
      await fetchPlayerData()
    } catch {
      // TX failed
    } finally {
      isSyncing.value = false
    }
  }

  async function buyUpgrade(id: number) {
    if (!address.value || !contractAvailable.value) return
    isBuying.value = true
    try {
      const hash = await writeContractAsync({
        address: currentAddress.value,
        abi: clickerGameAbi,
        functionName: 'buyUpgrade',
        args: [BigInt(id)],
      })

      await waitForTransactionReceipt(config, { hash })
      await fetchPlayerData()
    } catch {
      // TX failed
    } finally {
      isBuying.value = false
    }
  }

  // Watch for wallet connection
  watch(
    () => address.value,
    (addr) => {
      if (addr) {
        fetchPlayerData()
        startAutoClicker()
      }
    },
    { immediate: true },
  )

  // Reload data when network changes
  watch(
    () => chainId.value,
    () => {
      if (address.value) {
        onChainScore.value = 0n
        onChainClicks.value = 0n
        clickMultiplier.value = 1n
        autoClickRate.value = 0n
        upgradeLevels.value = [0, 0, 0, 0, 0]
        dataLoaded.value = false
        fetchPlayerData()
      }
    },
  )

  // Start auto clicker regardless (works locally too)
  startAutoClicker()

  onUnmounted(() => {
    stopAutoClicker()
  })

  return {
    localClicks,
    localScore,
    onChainScore,
    onChainClicks,
    clickMultiplier,
    autoClickRate,
    upgradeLevels,
    isSyncing,
    isBuying,
    clickPower,
    clicksPerSecond,
    totalScore,
    contractAvailable,
    dataLoaded,
    click,
    sync,
    buyUpgrade,
    fetchPlayerData,
    isConnected,
    address,
  }
}

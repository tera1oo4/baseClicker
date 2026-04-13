import { useAccount, useConnect, useDisconnect, useSwitchChain } from '@wagmi/vue'
import { computed } from 'vue'

const BASE_CHAIN_ID = 8453

export function useWallet() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

  const isWrongChain = computed(
    () => isConnected.value && chain.value && chain.value.id !== BASE_CHAIN_ID,
  )

  function switchToBase() {
    switchChain({ chainId: BASE_CHAIN_ID })
  }

  function truncatedAddress(addr: string | undefined): string {
    if (!addr) return ''
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`
  }

  return { address, isConnected, chain, isWrongChain, connectors, connect, disconnect, switchToBase, truncatedAddress }
}

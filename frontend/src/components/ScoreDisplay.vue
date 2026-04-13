<script setup lang="ts">
import { computed } from 'vue'
import { useAccount, useBalance, useChainId } from '@wagmi/vue'
import { formatUnits } from 'viem'
import { useClicker } from '@/composables/useClicker'

const { totalScore, clicksPerSecond, localClicks } = useClicker()
const { address, isConnected } = useAccount()
const chainId = useChainId()
const { data: balance } = useBalance({ address })

const chainLabel = computed(() => {
  if (chainId.value === 84532) return 'Base Sepolia'
  if (chainId.value === 8453) return 'Base Mainnet'
  return 'Unknown network'
})

const balanceLabel = computed(() => {
  const b = balance.value
  if (!b) return '—'
  return `${Number(formatUnits(b.value, b.decimals)).toFixed(4)} ${b.symbol}`
})

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}
</script>

<template>
  <div class="score-display">
    <div class="score-main">
      <span class="score-label">Score</span>
      <span class="score-value">{{ formatNumber(totalScore) }}</span>
    </div>
    <div class="score-stats">
      <div class="stat">
        <span class="stat-label">⚡ Clicks/sec</span>
        <span class="stat-value">{{ clicksPerSecond }}</span>
      </div>
      <div v-if="localClicks > 0" class="stat unsynced">
        <span class="stat-label">🔄 Unsynced</span>
        <span class="stat-value">{{ formatNumber(localClicks) }}</span>
      </div>
      <div v-if="isConnected" class="stat">
        <span class="stat-label">🌐 Network</span>
        <span class="stat-value">{{ chainLabel }}</span>
      </div>
      <div v-if="isConnected" class="stat">
        <span class="stat-label">💰 Balance</span>
        <span class="stat-value">{{ balanceLabel }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.score-display {
  text-align: center;
  padding: 1rem;
}

.score-main {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.score-label {
  color: #8899bb;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.score-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #fff;
  font-variant-numeric: tabular-nums;
}

.score-stats {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-top: 0.5rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.stat-label {
  color: #8899bb;
  font-size: 0.75rem;
}

.stat-value {
  color: #ccd;
  font-size: 1rem;
  font-weight: 600;
}

.unsynced .stat-value {
  color: #ffaa00;
}
</style>

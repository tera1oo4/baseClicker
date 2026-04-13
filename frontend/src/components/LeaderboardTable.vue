<script setup lang="ts">
import { onMounted } from 'vue'
import { useLeaderboard } from '@/composables/useLeaderboard'
import { useWallet } from '@/composables/useWallet'

const { entries, loading, playerRank, fetchLeaderboard } = useLeaderboard()
const { address, truncatedAddress } = useWallet()

function formatScore(n: bigint): string {
  const num = Number(n)
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
  return num.toString()
}

function isCurrentPlayer(addr: string): boolean {
  return !!address.value && addr.toLowerCase() === address.value.toLowerCase()
}

onMounted(() => {
  fetchLeaderboard()
})
</script>

<template>
  <div class="leaderboard">
    <div class="lb-header">
      <h2>🏆 Leaderboard</h2>
      <button class="refresh-btn" :disabled="loading" @click="fetchLeaderboard()">
        {{ loading ? '...' : '🔄 Refresh' }}
      </button>
    </div>

    <p v-if="playerRank > 0" class="player-rank">Your rank: #{{ playerRank }}</p>

    <div v-if="entries.length === 0 && !loading" class="empty">
      <p>No players yet. Be the first!</p>
    </div>

    <table v-else class="lb-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Player</th>
          <th>Score</th>
          <th>Clicks</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(entry, idx) in entries"
          :key="entry.player"
          :class="{ highlight: isCurrentPlayer(entry.player) }"
        >
          <td class="rank">{{ idx + 1 }}</td>
          <td class="addr">{{ truncatedAddress(entry.player) }}</td>
          <td>{{ formatScore(entry.score) }}</td>
          <td>{{ formatScore(entry.totalClicks) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.leaderboard {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.lb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.lb-header h2 {
  margin: 0;
  color: #e2e8f0;
  font-size: 1.3rem;
}

.refresh-btn {
  background: #1e293b;
  color: #8899bb;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  cursor: pointer;
}

.refresh-btn:hover:not(:disabled) {
  background: #334155;
}

.player-rank {
  color: #0052ff;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
}

.empty {
  text-align: center;
  color: #64748b;
  padding: 2rem;
}

.lb-table {
  width: 100%;
  border-collapse: collapse;
}

.lb-table th {
  text-align: left;
  color: #64748b;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.5rem;
  border-bottom: 1px solid #1e293b;
}

.lb-table td {
  padding: 0.6rem 0.5rem;
  color: #cbd5e1;
  border-bottom: 1px solid #111827;
  font-size: 0.9rem;
}

.lb-table tr.highlight td {
  color: #0052ff;
  font-weight: 600;
  background: rgba(0, 82, 255, 0.08);
}

.rank {
  font-weight: bold;
  color: #8899bb;
  width: 40px;
}

.addr {
  font-family: monospace;
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { useClicker } from '@/composables/useClicker'

const { upgradeLevels, totalScore, buyUpgrade, isBuying, contractAvailable, isConnected } = useClicker()

interface UpgradeDef {
  id: number
  emoji: string
  name: string
  baseCost: number
  costMultiplier: number
  effectValue: number
  effectType: number
  maxLevel: number
  description: string
}

const upgrades: UpgradeDef[] = [
  { id: 0, emoji: '✌️', name: 'Double Click', baseCost: 100, costMultiplier: 150, effectValue: 2, effectType: 0, maxLevel: 5, description: 'x2 click power' },
  { id: 1, emoji: '🤖', name: 'Auto Clicker', baseCost: 500, costMultiplier: 150, effectValue: 1, effectType: 1, maxLevel: 10, description: '+1 click/sec' },
  { id: 2, emoji: '💎', name: 'Mega Tap', baseCost: 2000, costMultiplier: 200, effectValue: 5, effectType: 0, maxLevel: 3, description: 'x5 click power' },
  { id: 3, emoji: '⚡', name: 'Turbo Auto', baseCost: 10000, costMultiplier: 200, effectValue: 10, effectType: 1, maxLevel: 5, description: 'x10 auto clicks' },
  { id: 4, emoji: '🙌', name: 'Diamond Hands', baseCost: 50000, costMultiplier: 300, effectValue: 2, effectType: 2, maxLevel: 3, description: 'x2 global multiplier' },
]

function getCost(upgrade: UpgradeDef, level: number): number {
  let cost = upgrade.baseCost
  for (let i = 0; i < level; i++) {
    cost = Math.floor((cost * upgrade.costMultiplier) / 100)
  }
  return cost
}

const upgradeItems = computed(() =>
  upgrades.map((u) => {
    const level = upgradeLevels.value[u.id] ?? 0
    const cost = getCost(u, level)
    const isMaxed = level >= u.maxLevel
    const canAfford = totalScore.value >= cost
    return { ...u, level, cost, isMaxed, canAfford }
  }),
)

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

function handleBuy(id: number) {
  buyUpgrade(id)
}
</script>

<template>
  <div class="upgrade-panel">
    <h3 class="panel-title">Upgrades</h3>
    <div class="upgrade-list">
      <div v-for="u in upgradeItems" :key="u.id" class="upgrade-item" :class="{ maxed: u.isMaxed }">
        <div class="upgrade-info">
          <span class="upgrade-emoji">{{ u.emoji }}</span>
          <div class="upgrade-details">
            <span class="upgrade-name">{{ u.name }}</span>
            <span class="upgrade-desc">{{ u.description }}</span>
            <span class="upgrade-level">Lv {{ u.level }}/{{ u.maxLevel }}</span>
          </div>
        </div>
        <button
          class="buy-btn"
          :disabled="u.isMaxed || !u.canAfford || isBuying || !isConnected || !contractAvailable"
          @click="handleBuy(u.id)"
        >
          <template v-if="u.isMaxed">MAX</template>
          <template v-else>{{ formatNumber(u.cost) }}</template>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upgrade-panel {
  width: 100%;
  max-width: 360px;
}

.panel-title {
  color: #8899bb;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 0.75rem 0;
}

.upgrade-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upgrade-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #111827;
  border: 1px solid #1e293b;
  border-radius: 10px;
  padding: 0.75rem;
  transition: border-color 0.2s;
}

.upgrade-item:hover {
  border-color: #0052ff44;
}

.upgrade-item.maxed {
  opacity: 0.5;
}

.upgrade-info {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.upgrade-emoji {
  font-size: 1.6rem;
}

.upgrade-details {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.upgrade-name {
  color: #e2e8f0;
  font-weight: 600;
  font-size: 0.9rem;
}

.upgrade-desc {
  color: #64748b;
  font-size: 0.75rem;
}

.upgrade-level {
  color: #0052ff;
  font-size: 0.7rem;
  font-weight: 600;
}

.buy-btn {
  background: #0052ff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.4rem 0.9rem;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s, opacity 0.2s;
}

.buy-btn:hover:not(:disabled) {
  background: #0040cc;
}

.buy-btn:disabled {
  background: #1e293b;
  color: #64748b;
  cursor: not-allowed;
}
</style>

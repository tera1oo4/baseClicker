<script setup lang="ts">
import { computed } from 'vue'
import { useClicker } from '@/composables/useClicker'

const { localClicks, sync, isSyncing, isConnected, contractAvailable } = useClicker()

const disabledReason = computed(() => {
  if (!isConnected.value) return 'Подключи кошелек'
  if (!contractAvailable.value) return 'Контракт не настроен для текущей сети'
  if (localClicks.value === 0) return 'Сделай клики перед синком'
  return ''
})
</script>

<template>
  <button
    class="sync-btn"
    :class="{ pulsing: localClicks > 0 && !isSyncing }"
    :disabled="localClicks === 0 || isSyncing || !isConnected || !contractAvailable"
    @click="sync()"
  >
    <span v-if="isSyncing" class="spinner" />
    <template v-else>
      🔗 Sync to Chain
      <span v-if="localClicks > 0" class="badge">{{ localClicks }}</span>
    </template>
  </button>
  <p v-if="disabledReason" class="hint">{{ disabledReason }}</p>
</template>

<style scoped>
.sync-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #0052ff, #0040cc);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.sync-btn:hover:not(:disabled) {
  transform: scale(1.03);
  box-shadow: 0 0 20px rgba(0, 82, 255, 0.4);
}

.sync-btn:disabled {
  background: #1e293b;
  color: #64748b;
  cursor: not-allowed;
}

.sync-btn.pulsing {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 82, 255, 0.4); }
  50% { box-shadow: 0 0 0 10px rgba(0, 82, 255, 0); }
}

.badge {
  background: #ff4444;
  color: #fff;
  border-radius: 10px;
  padding: 0.1rem 0.5rem;
  font-size: 0.75rem;
  font-weight: bold;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.hint {
  margin-top: 0.5rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.8rem;
}
</style>

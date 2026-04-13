<script setup lang="ts">
import ClickButton from '@/components/ClickButton.vue'
import ScoreDisplay from '@/components/ScoreDisplay.vue'
import UpgradePanel from '@/components/UpgradePanel.vue'
import SyncButton from '@/components/SyncButton.vue'
</script>

<template>
  <div class="game-view">
    <div class="game-top">
      <ScoreDisplay />
    </div>
    <div class="game-main">
      <div class="game-center">
        <ClickButton />
        <div class="sync-area">
          <SyncButton />
        </div>
      </div>
      <div class="game-side">
        <UpgradePanel />
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
  min-height: calc(100vh - 80px);
}

.game-top {
  width: 100%;
  text-align: center;
}

.game-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  max-width: 800px;
}

.game-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.sync-area {
  display: flex;
  justify-content: center;
}

.game-side {
  width: 100%;
  display: flex;
  justify-content: center;
}

@media (min-width: 768px) {
  .game-main {
    flex-direction: row;
    align-items: flex-start;
    justify-content: center;
  }

  .game-center {
    flex: 1;
  }

  .game-side {
    width: auto;
  }
}
</style>

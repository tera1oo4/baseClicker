<script setup lang="ts">
import LeaderboardTable from '@/components/LeaderboardTable.vue'
</script>

<template>
  <div class="leaderboard-view">
    <LeaderboardTable />
  </div>
</template>

<style scoped>
.leaderboard-view {
  padding: 1.5rem 1rem;
  max-width: 700px;
  margin: 0 auto;
}
</style>

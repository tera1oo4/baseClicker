<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app">
    <header class="app-header">
      <div class="header-left">
        <RouterLink to="/" class="logo-link">💎 Base Clicker</RouterLink>
      </div>
      <nav class="header-nav">
        <RouterLink to="/">Game</RouterLink>
        <RouterLink to="/leaderboard">Leaderboard</RouterLink>
      </nav>
      <div class="header-right">
        <appkit-network-button />
        <appkit-button />
      </div>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  background: #0a0f1a;
  border-bottom: 1px solid #1e293b;
  gap: 1rem;
}

.header-left {
  flex-shrink: 0;
}

.logo-link {
  color: #fff;
  font-weight: 700;
  font-size: 1.15rem;
  text-decoration: none;
}

.header-nav {
  display: flex;
  gap: 1rem;
}

.header-nav a {
  color: #8899bb;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  transition: color 0.2s, background 0.2s;
}

.header-nav a:hover {
  color: #e2e8f0;
}

.header-nav a.router-link-exact-active {
  color: #0052ff;
  background: rgba(0, 82, 255, 0.1);
}

.header-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>

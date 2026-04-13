<script setup lang="ts">
import { ref } from 'vue'
import { useClicker } from '@/composables/useClicker'

const { click, clickPower } = useClicker()

const floats = ref<{ id: number; value: number }[]>([])
let floatId = 0

function handleClick() {
  click()
  floatId++
  floats.value.push({ id: floatId, value: clickPower.value })
  const thisId = floatId
  setTimeout(() => {
    floats.value = floats.value.filter((f) => f.id !== thisId)
  }, 800)
}
</script>

<template>
  <div class="click-area">
    <div class="float-container">
      <TransitionGroup name="float">
        <span v-for="f in floats" :key="f.id" class="float-text">+{{ f.value }}</span>
      </TransitionGroup>
    </div>
    <button class="click-button" @click="handleClick">
      <span class="click-emoji">💎</span>
    </button>
    <p class="click-power">+{{ clickPower }} per click</p>
  </div>
</template>

<style scoped>
.click-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  gap: 0.5rem;
}

.click-button {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: 4px solid #0052ff;
  background: linear-gradient(135deg, #0a1628, #1a2a4a);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s, box-shadow 0.1s;
  box-shadow: 0 0 30px rgba(0, 82, 255, 0.3);
}

.click-button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 40px rgba(0, 82, 255, 0.5);
}

.click-button:active {
  transform: scale(0.92);
  box-shadow: 0 0 20px rgba(0, 82, 255, 0.6);
}

.click-emoji {
  font-size: 64px;
  user-select: none;
  pointer-events: none;
}

.click-power {
  color: #8899bb;
  font-size: 0.9rem;
  margin: 0;
}

.float-container {
  position: absolute;
  top: -30px;
  pointer-events: none;
}

.float-text {
  position: absolute;
  color: #0052ff;
  font-size: 1.4rem;
  font-weight: bold;
  white-space: nowrap;
  left: 50%;
  transform: translateX(-50%);
}

.float-enter-active {
  transition: all 0.8s ease-out;
}

.float-enter-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.float-enter-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-60px);
}

.float-leave-active {
  display: none;
}

@media (min-width: 768px) {
  .click-button {
    width: 200px;
    height: 200px;
  }

  .click-emoji {
    font-size: 80px;
  }
}
</style>

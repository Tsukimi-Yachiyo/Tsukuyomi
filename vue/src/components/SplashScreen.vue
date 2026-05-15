<template>
  <div id="splash-screen" :class="{ hidden: isHidden }">
    <img id="splash-image" src="/loginani.png" alt="月读空间">
    <div id="progress-container">
      <div id="progress-bar" :style="{ width: progress + '%' }"></div>
    </div>
    <div id="loading-text">{{ loadingText }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  progress: number;
  isHidden: boolean;
}>();

const loadingText = ref('LOADING');

const loadingChars = ['L', 'O', 'A', 'D', 'I', 'N', 'G'];
let frame = 0;
let intervalId: number | null = null;

const animateText = () => {
  frame = (frame + 1) % loadingChars.length;
  const text = loadingChars.map((char, i) => {
    if (i === frame) return char;
    return char.toLowerCase();
  }).join('');
  loadingText.value = text;
};

watch(() => props.isHidden, (hidden) => {
  if (!hidden && !intervalId) {
    intervalId = window.setInterval(animateText, 150);
  } else if (hidden && intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}, { immediate: true });
</script>

<style scoped>
#splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: opacity 0.8s ease-out, visibility 0.8s ease-out;
}

#splash-screen.hidden {
  opacity: 0;
  visibility: hidden;
}

#splash-image {
  max-width: 60vw;
  max-height: 60vh;
  object-fit: contain;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

#progress-container {
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin-top: 40px;
  overflow: hidden;
}

#progress-bar {
  width: 0%;
  height: 100%;
  background: linear-gradient(90deg, #a855f7, #6366f1, #06b6d4);
  background-size: 200% 100%;
  animation: gradientMove 2s linear infinite;
  transition: width 0.3s ease-out;
}

@keyframes gradientMove {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

#loading-text {
  margin-top: 20px;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 2px;
}
</style>

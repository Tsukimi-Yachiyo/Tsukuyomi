<template>
  <div
    class="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center z-9999 bg-linear-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] transition-[opacity,visibility] duration-800 ease-out"
    :class="{ 'opacity-0 invisible': isHidden }"
  >
    <img src="/loginani.png" alt="月读空间" class="max-w-[60vw] max-h-[60vh] object-contain animate-[splash-float_3s_ease-in-out_infinite]">
    <div class="w-[200px] h-1 bg-white/10 rounded-sm mt-10 overflow-hidden">
      <div
        class="h-full bg-linear-to-r from-purple-500 via-indigo-500 to-cyan-500 bg-[length:200%_100%] animate-[splash-gradient_2s_linear_infinite] transition-[width] duration-300 ease-out"
        :style="{ width: progress + '%' }"
      ></div>
    </div>
    <div class="mt-5 font-sans text-sm text-white/60 tracking-[2px]">{{ loadingText }}</div>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue';

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
  loadingText.value = loadingChars.map((char, i) => {
    if (i === frame) return char;
    return char.toLowerCase();
  }).join('');
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

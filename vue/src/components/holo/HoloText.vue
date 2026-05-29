<template>
  <div class="holo-text m-0 tracking-[2px] leading-[1.2] whitespace-pre-wrap" :class="{ 'is-secondary': secondary }" :style="textStyle">
    <template v-if="text && anim">
      <span
        v-for="(char, index) in text.split('')"
        :key="index"
        class="holo-char"
        :style="{ animationDelay: `${anim[0] + index * anim[1]}s` }"
      >{{ char }}</span>
    </template>
    <template v-else-if="text">{{ text }}</template>
    <slot v-else></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  text?: string;
  size?: string;
  weight?: string;
  secondary?: boolean;
  anim?: [number, number]; // [startDelay, intervalPerChar]
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  size: '14px',
  weight: 'normal',
  secondary: false,
  anim: undefined,
});

const textStyle = computed(() => ({
  fontSize: props.size,
  fontWeight: props.weight,
}));
</script>

<style scoped>
.holo-text {
  color: var(--theme-color);
  text-shadow: 0 0 8px var(--theme-color-glow);
  font-family: var(--font-holo);
}

.holo-text.is-secondary {
  color: #fff0f5;
  text-shadow: 0 0 6px rgba(255, 150, 180, 0.8);
}

.holo-char {
  display: inline-block;
  opacity: 0;
  transform: translateY(8px);
  filter: blur(2px);
  animation: typeChar 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes typeChar {
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}
</style>

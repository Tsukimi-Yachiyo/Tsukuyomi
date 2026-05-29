<template>
  <div class="holo-checkerboard grid gap-0.5 opacity-[0.85]" :style="boardStyle">
    <div
        v-for="cell in cells"
        :key="cell.id"
        class="checker-cell"
        :class="{ empty: !cell.filled, 'is-looping': loop }"
        :style="cell.filled ? cellStyle(cell) : {}"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  rows?: number;
  cols?: number;
  size?: number;
  animDelay?: number;
  loop?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  rows: 5,
  cols: 6,
  size: 10,
  animDelay: 0,
  loop: false,
});

interface Cell {
  id: string;
  filled: boolean;
  delay: number;
  duration: number;
}

const cells = computed<Cell[]>(() => {
  const result: Cell[] = [];
  for (let r = 0; r < props.rows; r++) {
    for (let c = 0; c < props.cols; c++) {
      const delayNum = props.animDelay + Math.random() * 0.5;
      const durationNum = 1.0 + Math.random() * 2.0;
      result.push({
        id: `${r}-${c}`,
        filled: (r + c) % 2 === 0,
        delay: delayNum,
        duration: durationNum,
      });
    }
  }
  return result;
});

const boardStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.cols}, ${props.size}px)`,
  gridTemplateRows: `repeat(${props.rows}, ${props.size}px)`,
}));

// 利用 CSS 变量传递每格的随机延迟时长，修复作用域下动画名称找不到的问题
const cellStyle = (cell: Cell) => {
  return {
    '--anim-delay': `${cell.delay}s`,
    '--anim-delay-pulse': `${cell.delay + 0.4}s`,
    '--anim-duration': `${cell.duration}s`
  };
};
</script>

<style scoped>
.checker-cell {
  --anim-delay: 0s;
  --anim-delay-pulse: 0.4s;
  --anim-duration: 1s;

  background-color: var(--theme-color);
  box-shadow: 0 0 5px var(--theme-color-glow);
  opacity: 0;
  animation: fadeCell 0.4s ease-out forwards;
  animation-delay: var(--anim-delay);
}

.checker-cell.is-looping {
  animation: fadeCell 0.4s ease-out forwards, pulseCell var(--anim-duration) ease-in-out infinite alternate forwards;
  animation-delay: var(--anim-delay), var(--anim-delay-pulse);
}

.checker-cell.empty {
  background-color: transparent;
  box-shadow: none;
  animation: none !important;
}

@keyframes fadeCell {
  0% { opacity: 0; }
  100% { opacity: 0.7; }
}

@keyframes pulseCell {
  0% { opacity: 0.2; }
  100% { opacity: 1; box-shadow: 0 0 10px var(--theme-color-glow); }
}
</style>
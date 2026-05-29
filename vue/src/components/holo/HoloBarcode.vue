<template>
  <div class="barcode-container flex gap-0.75 h-[45px] mt-3">
    <div
        v-for="(line, index) in lines"
        :key="index"
        class="barcode-line"
        :class="{ 'is-looping': loop }"
        :style="{
         width: `${line.w}px`,
         '--anim-delay': `${line.delay}s`,
         '--anim-delay-loop': `${line.delay + 0.4}s`,
         '--anim-duration': `${line.duration}s`
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  animDelay?: number;
  loop?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  animDelay: 0,
  loop: false,
});

interface Line {
  w: number;
  delay: number;
  duration: number;
}

const lines = computed<Line[]>(() => {
  const result: Line[] = [];
  for (let i = 0; i < 16; i++) {
    const delayNum = props.animDelay + Math.random() * 0.3;
    const durationNum = 0.5 + Math.random();
    result.push({
      w: Math.floor(Math.random() * 4) + 1,
      delay: delayNum,
      duration: durationNum,
    });
  }
  return result;
});
</script>

<style scoped>
.barcode-line {
  --anim-delay: 0s;
  --anim-delay-loop: 0.4s;
  --anim-duration: 1s;

  background: var(--theme-color);
  box-shadow: 0 0 5px var(--theme-color-glow);
  transform: scaleY(0);
  transform-origin: top;
  animation: scanBarcode 0.4s ease-out forwards;
  animation-delay: var(--anim-delay);
}

.barcode-line.is-looping {
  animation: scanBarcode 0.4s ease-out forwards, barcodeLoop var(--anim-duration) ease-in-out infinite alternate forwards;
  animation-delay: var(--anim-delay), var(--anim-delay-loop);
}

@keyframes scanBarcode {
  0% { transform: scaleY(0); }
  100% { transform: scaleY(1); }
}

@keyframes barcodeLoop {
  0% { transform: scaleY(1); }
  100% { transform: scaleY(0.3); }
}
</style>
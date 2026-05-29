<template>
  <div class="holo-avatar w-full h-full flex items-center justify-center">
    <svg
      v-if="!src"
      viewBox="0 0 100 100"
      class="avatar-svg w-full h-full fill-transparent stroke-2.5"
    >
      <circle
        cx="50"
        cy="50"
        r="42"
        stroke-dasharray="6 3"
        fill="none"
        :class="{ 'is-looping': loop }"
        class="avatar-ring"
      />
      <path
        d="M 25 65 Q 50 95 75 65 Q 65 45 85 35 Q 50 15 15 35 Q 35 45 25 65 Z"
        fill="none"
        stroke="var(--theme-color)"
        stroke-width="2.5"
      />
      <circle cx="38" cy="48" r="4" fill="var(--theme-color)" />
      <circle cx="62" cy="48" r="4" fill="var(--theme-color)" />
      <path d="M 45 58 Q 50 64 55 58" fill="none" stroke-linecap="round" stroke="var(--theme-color)" stroke-width="2.5" />
    </svg>
    <img v-else :src="src" class="avatar-img w-[80%] h-[80%] object-contain border-2 border-solid p-1" alt="avatar" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  loop?: boolean;
  src?: string;
}

withDefaults(defineProps<Props>(), {
  loop: false,
  src: '',
});
</script>

<style scoped>
.avatar-svg {
  stroke: var(--theme-color);
  filter: drop-shadow(0 0 4px var(--theme-color));
}

.avatar-ring {
  stroke: var(--theme-color);
  transform-origin: 50px 50px;
  opacity: 0.6;
}

.avatar-ring.is-looping {
  animation: spinRing 8s linear infinite;
}

.avatar-img {
  border-color: var(--theme-color);
  box-shadow: 0 0 10px var(--theme-color-glow), inset 0 0 10px var(--theme-color-glow);
}

@keyframes spinRing {
  to { transform: rotate(360deg); }
}
</style>

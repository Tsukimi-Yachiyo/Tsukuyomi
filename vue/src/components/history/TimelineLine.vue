<template>
  <svg
    class="absolute inset-0 w-full h-full pointer-events-none"
    :viewBox="`0 0 ${width} ${height}`"
    xmlns="http://www.w3.org/2000/svg"
  >
    <polyline
      :points="pointsString"
      fill="none"
      stroke="rgba(255,255,255,0.15)"
      stroke-width="1"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  points: Array<{ x: number; y: number }>
  width: number
  height: number
}>()

const pointsString = computed(() =>
  props.points.map(p => `${p.x},${p.y}`).join(' ')
)
</script>

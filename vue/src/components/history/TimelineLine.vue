<template>
  <svg
    class="absolute inset-0 w-full h-full pointer-events-none"
    :viewBox="`0 0 ${width} ${height}`"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Past segment -->
    <polyline
      v-if="pastPoints.length > 1"
      :points="pastPointsString"
      fill="none"
      stroke="rgba(255,255,255,0.15)"
      stroke-width="1"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <!-- Future segment (dashed + dimmer) -->
    <polyline
      v-if="futurePoints.length > 1"
      :points="futurePointsString"
      fill="none"
      stroke="rgba(255,255,255,0.07)"
      stroke-width="1"
      stroke-dasharray="6 4"
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
  futureIndex?: number
}>()

const pastPoints = computed(() => {
  if (props.futureIndex === undefined) return props.points
  return props.points.slice(0, props.futureIndex + 1)
})

const futurePoints = computed(() => {
  if (props.futureIndex === undefined) return []
  return props.points.slice(props.futureIndex)
})

const pastPointsString = computed(() =>
  pastPoints.value.map(p => `${p.x},${p.y}`).join(' ')
)

const futurePointsString = computed(() =>
  futurePoints.value.map(p => `${p.x},${p.y}`).join(' ')
)
</script>

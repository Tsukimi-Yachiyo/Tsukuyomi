<template>
  <div class="w-1/5 min-w-0 border-r border-[#4df0ff]/30 pr-4 flex items-start justify-center">
    <div class="w-full max-w-[180px] aspect-square flex items-center justify-center">
      <DynamicChessboard class="w-full h-full" />
    </div>
  </div>
</template>

<script setup lang="ts">
import DynamicChessboard from './DynamicChessboard.vue';
</script>
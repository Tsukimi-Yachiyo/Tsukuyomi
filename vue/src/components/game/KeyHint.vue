<template>
  <span class="relative inline-flex">
    <slot />
    <kbd class="absolute -right-[6px] -bottom-[6px] inline-flex items-center px-[6px] py-[2px] bg-black/60 border border-white/20 rounded-[3px] text-white/80 font-bold text-[10px] font-mono whitespace-nowrap pointer-events-none">{{ hintKey }}</kbd>
  </span>
</template>

<script setup lang="ts">
defineProps<{ hintKey: string }>();
</script>

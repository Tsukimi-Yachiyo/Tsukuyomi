<template>
  <span class="key-hint-root">
    <slot />
    <kbd class="key-hint-kbd">{{ hintKey }}</kbd>
  </span>
</template>

<script setup lang="ts">
defineProps<{ hintKey: string }>();
</script>

<style scoped>
.key-hint-root {
  position: relative;
  display: inline-flex;
}

.key-hint-kbd {
  position: absolute;
  right: -6px;
  bottom: -6px;
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'Courier New', Courier, monospace;
  font-size: 10px;
  font-weight: bold;
  white-space: nowrap;
  pointer-events: none;
}
</style>

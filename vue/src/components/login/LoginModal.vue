<template>
  <div class="modal-overlay" :style="overlayStyle">
    <div
        class="modal-content"
        @mouseenter="hovering = true"
        @mouseleave="hovering = false"
    >
      <LoginPanel @success="$emit('success')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import LoginPanel from '@/components/login/LoginPanel.vue'

defineEmits<{
  success: []
}>()

const hovering = ref(false)

const overlayStyle = computed(() => ({
  background: hovering.value ? 'rgba(0, 0, 0, 0.85)' : 'transparent',
  backdropFilter: hovering.value ? 'blur(4px)' : 'none',
  transition: 'background 0.3s, backdrop-filter 0.3s'
}))
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  /* 初始背景与模糊已在 JS 中动态控制，此处可省略或作为后备 */
}

.modal-content {
  pointer-events: auto;
}
</style>
<template>
  <div class="fixed inset-0 z-[9999] flex items-center justify-center" :style="overlayStyle">
    <div
        class="pointer-events-auto"
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
<template>
  <div class="message-toast fixed z-[10000] pointer-events-none" :style="toastStyle">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="message-toast-item pointer-events-auto mb-2"
      :class="toastTypeClass(toast.type)"
    >
      <span class="text-sm font-medium">{{ toast.message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { addModal } from '@/store/modalStore';
import type { ModalConfig } from '@/store/modalStore';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const toasts = ref<Toast[]>([]);

const toastStyle = computed(() => ({
  top: '20px',
  right: '20px',
}));

function toastTypeClass(type: string) {
  switch (type) {
    case 'success':
      return 'bg-green-500/90 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm';
    case 'error':
      return 'bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm';
    case 'warning':
      return 'bg-yellow-500/90 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm';
    case 'info':
    default:
      return 'bg-blue-500/90 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm';
  }
}

function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 3000) {
  const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  toasts.value.push({ id, message, type });

  setTimeout(() => {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  }, duration);
}

function showMessageModal(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', autoClose = 3000) {
  const config: ModalConfig = {
    type: 'message',
    component: {
      template: `
        <div class="message-modal relative px-6 py-4 rounded-lg shadow-xl backdrop-blur-md border max-w-sm">
          <div class="text-center">
            <p class="text-white text-sm">{{ message }}</p>
          </div>
        </div>
      `,
      props: { message: String },
    },
    props: { message },
    autoClose,
    closable: true,
  };

  return addModal(config);
}

defineExpose({
  showToast,
  showMessageModal,
  toasts,
});
</script>

<style scoped>
.message-toast-item {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>

<template>
  <div v-if="isChecking" class="fixed inset-0 z-9999 bg-[#0a0a0f] flex items-center justify-center">
    <div class="flex flex-col items-center gap-4">
      <span class="text-sm text-slate-400 font-sans">系统初始化中...</span>
    </div>
  </div>
  <template v-else>
    <ModalProvider />
    <MessageToast />
    <slot />
  </template>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/userStore';
import { checkBackendHealth } from '@/core/bootstrap';
import ModalProvider from '@/components/global/ModalProvider.vue';
import MessageToast from '@/components/global/MessageToast.vue';

const router = useRouter();
const userStore = useUserStore();
const isChecking = ref(true);

onMounted(async () => {
  const healthy = await checkBackendHealth();
  if (!healthy) {
    isChecking.value = false;
    router.push('/maintenance');
    return;
  }

  if (userStore.token) {
    await userStore.validateAndRestoreSession();
  }

  isChecking.value = false;
});
</script>

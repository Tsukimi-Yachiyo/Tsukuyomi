<template>
  <div v-if="isChecking" class="fixed inset-0 z-9999 bg-[#0a0a0f] flex items-center justify-center">
    <div class="flex flex-col items-center gap-4">
      <span class="text-sm text-slate-400 font-sans">系统初始化中...</span>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/userStore';
import { checkBackendHealth } from '@/core/bootstrap';

const router = useRouter();
const userStore = useUserStore();
const isChecking = ref(true);

onMounted(async () => {
  // 1. 后端健康检查
  const healthy = await checkBackendHealth();
  if (!healthy) {
    router.push('/maintenance');
    return;
  }

  // 2. 恢复用户会话（如果有 token）
  if (userStore.token) {
    await userStore.validateAndRestoreSession();
  }

  isChecking.value = false;
});
</script>

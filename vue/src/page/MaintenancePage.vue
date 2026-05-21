<template>
  <div class="fixed inset-0 z-9999 flex items-center justify-center bg-linear-to-br from-[#1a1a2e] to-[#16213e]">
    <div class="text-center text-white p-10">
      <div class="items-center mx-auto mb-8 text-rose-500 animate-pulse">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
        </svg>
      </div>
      <h1 class="text-4xl font-bold mb-4">系统维护中</h1>
      <p class="text-lg text-gray-400 mb-10">后端服务暂时不可用，请稍后再试。</p>
      <button
        class="px-16 py-5 text-base w-20 font-semibold rounded-lg cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 bg-linear-to-br from-[#e94560] to-[#c73659]"
        @click="retryCheck"
      >
        重新检测
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const retryCheck = () => {
  router.push('/');
};
</script>

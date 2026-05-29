<template>
  <PostEditor :theme="currentTheme" @toggle:theme="toggleTheme" />

  <LoginModal v-if="showLoginModal" @success="onLoginSuccess" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import PostEditor from '@/components/post-editor/PostEditor.vue';

// 1. 引入认证检查 hook 和登录弹窗组件
import { useAuthCheck } from '@/composables/useAuthCheck';
import LoginModal from '@/components/login/LoginModal.vue';

// 2. 提取认证相关的变量与方法
const { showLoginModal, checkAuth, onLoginSuccess } = useAuthCheck();

const currentTheme = ref<'light' | 'dark'>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
);

function toggleTheme(): void {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light';
}

function handleSystemThemeChange(e: MediaQueryListEvent): void {
  currentTheme.value = e.matches ? 'dark' : 'light';
}

onMounted(() => {
  // 3. 在页面挂载时检查登录状态，未登录会自动将 showLoginModal 设为 true 弹出拦截
  checkAuth();

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleSystemThemeChange);
});

onUnmounted(() => {
  window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleSystemThemeChange);
});
</script>
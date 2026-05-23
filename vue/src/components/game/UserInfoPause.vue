<template>
  <div class="message-panel-wrapper">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p class="status-text">正在同步档案数据...</p>
    </div>

    <!-- 内容显示区域 -->
    <div v-else-if="messageData" class="content-area">
      <h3 class="data-title">{{ messageData.title || '系统通知' }}</h3>
      <div class="data-body">
        {{ messageData.content }}
      </div>
      <div class="data-footer">
        <span class="timestamp">{{ currentTime }}</span>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <p class="error-text">档案同步失败</p>
      <button @click="fetchData" class="retry-btn">重新连接</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/api';

const loading = ref(false);
const messageData = ref<{title: string, content: string} | null>(null);
const error = ref(false);
const currentTime = ref('');

const fetchData = async () => {
  loading.value = true;
  error.value = false;
  try {
    // 替换为你的实际接口
    const response = await api.get('/user/message');
    messageData.value = response.data;
    currentTime.value = new Date().toLocaleTimeString();
  } catch (e) {
    console.error('Failed to fetch user data', e);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
</script>

<style scoped>
.message-panel-wrapper {
  width: 100%;
  max-width: 400px;
  min-height: 140px;
  padding: 20px;
  background: rgba(10, 15, 30, 0.7);
  border: 1px solid rgba(77, 240, 255, 0.4);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  color: #fff;
  font-family: 'Courier New', monospace;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.data-title {
  margin: 0 0 12px 0;
  color: #4df0ff;
  font-size: 16px;
  letter-spacing: 1px;
}

.data-body {
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 16px;
}

.timestamp {
  font-size: 11px;
  color: rgba(77, 240, 255, 0.5);
}

.retry-btn {
  background: rgba(77, 240, 255, 0.1);
  border: 1px solid #4df0ff;
  color: #4df0ff;
  padding: 6px 16px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: rgba(77, 240, 255, 0.2);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(77, 240, 255, 0.3);
  border-top: 2px solid #4df0ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
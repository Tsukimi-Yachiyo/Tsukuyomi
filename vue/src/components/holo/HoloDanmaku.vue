<template>
  <div class="danmaku-container">
    <div class="danmaku-stack">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="danmaku-item"
        :class="['type-' + msg.type, { 'is-visible': msg.visible }]"
      >
        <div class="danmaku-panel" :style="getPanelStyle(msg.type)">
          <HoloBorder
            :anim="[0, 0.3]"
            :layers="[
              { inset: 0, borderWidth: 1, cornerOffset: 0, cornerStrokeWidth: 2, opacity: 0.8 },
              { inset: 4, borderWidth: 0, cornerOffset: 6, cornerStrokeWidth: 1, opacity: 0.4 }
            ]"
            :corners="['tl', 'tr', 'bl', 'br']"
            :corner-size="40"
            :show-notches="false"
          />
          <span class="danmaku-bracket">[</span>
          <span class="danmaku-text">{{ msg.text }}</span>
          <span class="danmaku-bracket">]</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { eventBus } from '@/utils/eventBus';
import HoloBorder from '@/components/holo/HoloBorder.vue';

interface DanmakuMessage {
  id: number;
  text: string;
  type: 'success' | 'error' | 'warning' | 'info';
  visible: boolean;
}

const messages = ref<DanmakuMessage[]>([]);
let msgId = 0;

const typeColors = {
  success: { color: '#4df0ff', glow: 'rgba(77, 240, 255, 0.6)' },
  error: { color: '#ff4d4f', glow: 'rgba(255, 77, 79, 0.6)' },
  warning: { color: '#ffc53d', glow: 'rgba(255, 197, 61, 0.6)' },
  info: { color: '#ffffff', glow: 'rgba(255, 255, 255, 0.6)' }
};

const getPanelStyle = (type: string) => {
  const colors = typeColors[type as keyof typeof typeColors] || typeColors.info;
  return {
    '--theme-color': colors.color,
    '--theme-color-glow': colors.glow
  };
};

const addMessage = (payload: { text: string; type?: 'success' | 'error' | 'warning' | 'info' }) => {
  const id = msgId++;
  const newMsg: DanmakuMessage = {
    id,
    text: payload.text,
    type: payload.type || 'info',
    visible: false
  };
  
  messages.value.unshift(newMsg);
  
  // 限制最多显示5条
  if (messages.value.length > 5) {
    const removed = messages.value.pop();
    if (removed) {
      removed.visible = false;
    }
  }
  
  // 触发显示动画
  setTimeout(() => {
    newMsg.visible = true;
  }, 10);
  
  // 3秒后隐藏并移除
  setTimeout(() => {
    newMsg.visible = false;
    setTimeout(() => {
      messages.value = messages.value.filter(m => m.id !== id);
    }, 300);
  }, 3000);
};

onMounted(() => {
  eventBus.on('vue:show-message', addMessage);
});

onUnmounted(() => {
  eventBus.off('vue:show-message', addMessage);
});
</script>

<style scoped>
.danmaku-container {
  position: fixed;
  top: 20px;
  right: 20px;
  pointer-events: none;
  z-index: 99999;
}

.danmaku-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.danmaku-item {
  opacity: 0;
  transform: translateX(100px) scale(0.8);
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

.danmaku-item.is-visible {
  opacity: 1;
  transform: translateX(0) scale(1);
}

.danmaku-panel {
  position: relative;
  background: rgba(0, 15, 25, 0.7);
  backdrop-filter: blur(6px);
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.danmaku-bracket {
  opacity: 0.6;
  font-size: 18px;
  font-family: 'Courier New', Courier, monospace;
}

.danmaku-text {
  font-size: 16px;
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
}

/* 各类弹幕专属颜色与发光特效 */
.type-success .danmaku-text {
  color: #4df0ff;
  text-shadow: 0 0 10px #4df0ff;
}
.type-success .danmaku-bracket {
  color: #4df0ff;
}

.type-error .danmaku-text {
  color: #ff4d4f;
  text-shadow: 0 0 10px #ff4d4f;
}
.type-error .danmaku-bracket {
  color: #ff4d4f;
}

.type-warning .danmaku-text {
  color: #ffc53d;
  text-shadow: 0 0 10px #ffc53d;
}
.type-warning .danmaku-bracket {
  color: #ffc53d;
}

.type-info .danmaku-text {
  color: #ffffff;
  text-shadow: 0 0 10px #ffffff;
}
.type-info .danmaku-bracket {
  color: #ffffff;
}
</style>

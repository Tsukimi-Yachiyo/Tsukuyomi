<template>
  <Transition name="panel-fade">
    <div v-if="visible" class="pause-panel-overlay" @click.self="$emit('close')">
      <div class="pause-panel">
        <div class="panel-header">
          <span class="panel-title">暂停</span>
          <button class="panel-close" @click="$emit('close')">×</button>
        </div>
        <div class="panel-body">
          <!-- TODO: 暂停菜单功能 -->
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{ visible: boolean }>();
defineEmits<{ (e: 'close'): void }>();
</script>

<style scoped>
.pause-panel-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.pause-panel {
  width: 420px;
  max-height: 70vh;
  background: rgba(10, 15, 30, 0.92);
  border: 1px solid rgba(77, 240, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 60px rgba(77, 240, 255, 0.05);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(77, 240, 255, 0.1);
}

.panel-title {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 2px;
}

.panel-close {
  width: 28px;
  height: 28px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.panel-close:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.panel-body {
  padding: 20px;
  min-height: 200px;
}

.panel-fade-enter-active {
  transition: opacity 0.25s ease;
}
.panel-fade-leave-active {
  transition: opacity 0.2s ease;
}
.panel-fade-enter-from,
.panel-fade-leave-to {
  opacity: 0;
}
</style>

<template>
  <Teleport to="body">
    <template v-if="modalStack.length > 0">
      <div
        class="modal-backdrop fixed inset-0 z-[9990]"
        :class="backdropClass"
        @click.self="handleBackdropClick"
      >
      </div>

      <div class="modal-content-layer fixed inset-0 z-[9991] pointer-events-none">
        <div
          v-for="modal in modalStack"
          :key="modal.id"
          class="modal-item pointer-events-auto"
          :class="{ 'is-top': modal.id === topModal?.id }"
          :style="getModalStyle(modal)"
          @keydown.stop
          @keyup.stop
          @mousedown="modal.type === 'function' ? handleDragStart(modal.id, $event) : null"
        >
          <button
            v-if="modal.closable"
            class="modal-close-btn absolute top-5 right-5 z-[10] w-6 h-6 rounded-full border-none bg-black/60 text-white/80 cursor-pointer hover:text-white hover:bg-black/80 transition-all duration-200 flex items-center justify-center"
            @click="handleClose(modal.id)"
          >
            <svg viewBox="0 0 12 12" class="w-3 h-3">
              <line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </button>

          <div class="modal-content-wrapper w-full h-full flex items-center justify-center pointer-events-auto">
            <component
              :is="modal.component"
              v-bind="modal.props"
              @close="handleClose(modal.id)"
              @select-user="handleSelectUser"
              @follow-success="handleFollowSuccess(modal.id)"
            />
          </div>
        </div>
      </div>
    </template>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive } from 'vue';
import {
  getModalStack,
  removeModal,
  clearAllModals,
  getTopFunctionModal,
  addModal,
} from '@/store/modalStore';
import type { ModalInstance } from '@/store/modalStore';
import HoloUserProfile from '@/components/holo/HoloUserProfile.vue';

const modalStack = getModalStack();

const topModal = computed(() => modalStack.value[modalStack.value.length - 1] || null);

const modalPositions = reactive<Record<string, { offsetX: number; offsetY: number }>>({});

const backdropClass = computed(() => {
  const top = topModal.value;
  if (!top) return '';
  return top.type === 'message'
    ? 'bg-black/20 pointer-events-auto'
    : 'bg-black/40 backdrop-blur-[2px] pointer-events-auto';
});

function getModalStyle(modal: ModalInstance) {
  const pos = modalPositions[modal.id];
  if (!pos) return {};
  return {
    transform: `translate(${pos.offsetX}px, ${pos.offsetY}px)`,
  };
}

function handleBackdropClick() {
  const top = topModal.value;
  if (top && top.closable) {
    removeModal(top.id);
  }
}

function handleClose(id: string) {
  delete modalPositions[id];
  removeModal(id);
}

function handleSelectUser(userId: number) {
  addModal({
    type: 'function',
    component: HoloUserProfile,
    props: { userId },
  });
}

function handleFollowSuccess(modalId: string) {
  const modal = modalStack.value.find(m => m.id === modalId);
  if (!modal) return;
  const isFollowing = !!(modal.props as any)?.isFollowing;
  removeModal(modalId);
  addModal({
    type: 'message',
    component: {
      template: '<div class="px-6 py-4 rounded-lg text-white text-center text-sm shadow-lg backdrop-blur-md border">' +
        '<span :class="isFollowing ? \'text-[#4df0ff]\' : \'text-[#4df0ff]/60\'">{{ isFollowing ? \'关注成功\' : \'已取消关注\' }}</span>' +
        '</div>',
      props: { isFollowing: { type: Boolean, default: false } },
    },
    props: { isFollowing },
    autoClose: 2000,
    closable: true,
  });
}

function handleDragStart(modalId: string, e: MouseEvent) {
  const pos = modalPositions[modalId] || { offsetX: 0, offsetY: 0 };
  const startX = e.clientX - pos.offsetX;
  const startY = e.clientY - pos.offsetY;

  modalPositions[modalId] = { offsetX: pos.offsetX, offsetY: pos.offsetY };

  const originalUserSelect = document.body.style.userSelect;
  document.body.style.userSelect = 'none';

  function onMove(moveEvent: MouseEvent) {
    modalPositions[modalId] = {
      offsetX: moveEvent.clientX - startX,
      offsetY: moveEvent.clientY - startY,
    };
  }

  function onUp() {
    document.body.style.userSelect = originalUserSelect;
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  }

  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
}

function handleEscKey(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    const topFunctionModal = getTopFunctionModal();
    if (topFunctionModal && topFunctionModal.closable) {
      delete modalPositions[topFunctionModal.id];
      removeModal(topFunctionModal.id);

      // 关键！不仅阻止冒泡，还要阻止同级别(window)上的其他监听器执行
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  }
}

onMounted(() => {
  // 加上 { capture: true }，让弹窗管理器成为真正的“捕获最高优先级”
  window.addEventListener('keydown', handleEscKey, { capture: true });
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscKey, { capture: true });
  clearAllModals();
});

defineExpose({
  removeModal,
  clearAllModals,
});
</script>

<style scoped>
.modal-item {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.modal-item.is-top {
  opacity: 1;
}

.modal-close-btn {
  font-family: monospace;
  font-size: 10px;
}
</style>

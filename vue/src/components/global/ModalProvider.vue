<template>
  <ModalManager ref="modalManagerRef" />
</template>

<script setup lang="ts">
import { ref, provide } from 'vue';
import ModalManager from '@/components/global/ModalManager.vue';
import { addModal, removeModal, clearAllModals } from '@/store/modalStore';
import type { ModalConfig } from '@/store/modalStore';
import { ModalKey } from '@/composables/useModal';
import type { ModalApi } from '@/composables/useModal';

const modalManagerRef = ref<InstanceType<typeof ModalManager> | null>(null);

const modalApi: ModalApi = {
  addModal,
  removeModal,
  clearAllModals,
};

provide(ModalKey, modalApi);

defineExpose({
  modalManager: modalManagerRef,
});
</script>

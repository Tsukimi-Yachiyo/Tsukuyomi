<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity">
    <div class="bg-(--editor-bg) text-(--editor-text) p-6 rounded-lg w-[32rem] border border-(--editor-border) shadow-xl">
      <h3 class="text-lg font-bold mb-4">文章属性设置</h3>

      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">
          帖子标题 (Title) <span class="text-red-500">*</span>
        </label>
        <input
            v-model="localTitle"
            type="text"
            placeholder="请输入帖子标题"
            class="w-full px-3 py-2 border border-(--editor-border) rounded bg-transparent focus:outline-none focus:border-(--editor-accent)"
        />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">
          帖子类型 (Type) <span class="text-red-500">*</span>
        </label>
        <input
            v-model="localType"
            type="text"
            placeholder="例如：技术、随笔、教程"
            class="w-full px-3 py-2 border border-(--editor-border) rounded bg-transparent focus:outline-none focus:border-(--editor-accent)"
        />
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium mb-1">封面图 (Cover Image)</label>
        <input
            type="file"
            accept="image/*"
            @change="handleCoverImageChange"
            class="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-(--editor-accent) file:text-white hover:file:bg-blue-600 cursor-pointer"
        />

        <div v-if="coverPreviewUrl" class="mt-3 relative border border-(--editor-border) rounded-lg overflow-hidden bg-black/5 p-2 flex items-center justify-center max-h-40">
          <img :src="coverPreviewUrl" class="object-contain max-h-36 rounded" alt="Cover Preview" />
          <button
              type="button"
              @click="clearCoverImage"
              class="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-1 text-xs transition-colors shadow"
              title="移除封面"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p v-else class="mt-2 text-xs text-gray-400">暂无封面图预览</p>
      </div>

      <div class="flex justify-end gap-3">
        <button
            @click="closeModal"
            class="px-4 py-2 rounded border border-(--editor-border) hover:bg-(--editor-hover-bg)"
        >
          取消
        </button>
        <button
            @click="handleConfirm"
            class="px-4 py-2 rounded bg-(--editor-accent) text-white hover:bg-blue-600 transition-colors"
        >
          保存设置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onUnmounted, ref, watch,} from 'vue';

const props = defineProps<{
  visible: boolean;
  initialTitle: string;
  initialType: string;
  initialCover: File | undefined;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  'confirm': [title: string, type: string, coverImage: File | undefined];
}>();

const localTitle = ref('');
const localType = ref('');
const localCoverImage = ref<File | undefined>(undefined);
const coverPreviewUrl = ref('');

// 监听弹窗打开状态，同步父组件传来的最新状态并构造预览 Blob URL
watch(() => props.visible, (newVal) => {
  if (newVal) {
    localTitle.value = props.initialTitle;
    localType.value = props.initialType;
    localCoverImage.value = props.initialCover;

    // 每次打开时，如果已有封面则创建预览，否则重置
    if (coverPreviewUrl.value) {
      URL.revokeObjectURL(coverPreviewUrl.value);
      coverPreviewUrl.value = '';
    }
    if (props.initialCover) {
      coverPreviewUrl.value = URL.createObjectURL(props.initialCover);
    }
  }
});

function handleCoverImageChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    localCoverImage.value = file;

    // 释放旧的预览链接以节省系统内存
    if (coverPreviewUrl.value) {
      URL.revokeObjectURL(coverPreviewUrl.value);
    }
    coverPreviewUrl.value = URL.createObjectURL(file);
  }
}

function clearCoverImage() {
  localCoverImage.value = undefined;
  if (coverPreviewUrl.value) {
    URL.revokeObjectURL(coverPreviewUrl.value);
    coverPreviewUrl.value = '';
  }
}

function closeModal() {
  emit('update:visible', false);
}

function handleConfirm() {
  if (!localTitle.value.trim()) {
    alert('请输入帖子标题！');
    return;
  }
  if (!localType.value.trim()) {
    alert('请输入帖子类型！');
    return;
  }

  // 仅保存设置到父组件作用域，不做真正的 API 提交
  emit('confirm', localTitle.value, localType.value, localCoverImage.value);
}

// 组件卸载时清理内存
onUnmounted(() => {
  if (coverPreviewUrl.value) {
    URL.revokeObjectURL(coverPreviewUrl.value);
  }
});
</script>
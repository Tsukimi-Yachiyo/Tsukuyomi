<template>
  <div
      class="post-editor-root flex flex-col h-screen w-full transition-colors duration-300"
      :class="theme === 'dark' ? 'editor-dark' : 'editor-light'"
  >
    <EditorToolbar
        v-model:title="title"
        :mode="mode"
        :theme="theme"
        :show-preview="showPreview"
        @toggle:theme="toggleTheme"
        @toggle:preview="showPreview = !showPreview"
        @insert:image="insertImage"
        @import:file="handleFileImport"
        @format="(prefix, suffix) => editorAreaRef?.insertText(prefix, suffix)"
        @publish="handlePublish"
    />

    <div class="flex-1 flex overflow-hidden bg-(--editor-bg)">
      <EditorArea
          ref="editorAreaRef"
          v-model:content="content"
          :mode="mode"
          :class="{ 'w-1/2 border-r border-(--editor-border)': showPreview, 'w-full': !showPreview }"
          @file-drop="handleFileImport"
      />

      <div v-if="showPreview" class="w-1/2 h-full bg-(--editor-bg) overflow-y-auto p-6">
        <PostView
            :content="content"
            :files="attachedFiles"
        />
      </div>
    </div>

    <StatusBar
        :word-count="content.length"
        :draft-status="isPublishing ? 'saving' : draftStatus"
        :import-hint="isPublishing ? '正在打包上传帖子数据...' : importHint"
    />

    <button
        @click="showSettingsModal = true"
        class="fixed bottom-16 right-6 z-40 flex items-center justify-center px-4 py-2.5 bg-(--editor-accent) text-white font-medium rounded-full shadow-lg hover:bg-blue-600 transition-all active:scale-95 text-sm"
    >
      <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.767c-.307.235-.45c.623-.146.967-.146.12.186l1.003.767a1.125 1.125 0 0 1 .26 1.43l-1.296 2.247a1.125 1.125 0 0 1-1.37.49l-1.216-.456c-.356-.133-.751-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.767c.304-.233.446-.634.342-1.004a6.745 6.745 0 0 1 0-1.202c.104-.37-.038-.771-.342-1.004L3.292 9.713a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 .37-.49l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
      文章设置
    </button>

    <PostSettingsModal
        v-model:visible="showSettingsModal"
        :initial-title="title"
        :initial-type="postType"
        :initial-cover="coverImage"
        @confirm="handleSettingsSave"
        :is-publishing="isPublishing"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import EditorToolbar from './EditorToolbar.vue';
import EditorArea from './EditorArea.vue';
import PostView from '@/components/viewer/PostView.vue';
import StatusBar from './StatusBar.vue';
import PostSettingsModal from './PostSettingsModal.vue';
import api from '@/api';

const route = useRoute();

// 草稿 localStorage 键：新建用 'new'，编辑用帖子 id
const draftKey = `post_draft_${route.params.id || 'new'}`;

const props = defineProps<{
  theme: 'light' | 'dark';
}>();

const emit = defineEmits<{
  'toggle:theme': [];
}>();

const title = ref('');
const content = ref('');
const mode = ref<'wysiwyg' | 'source'>('source');
const showPreview = ref(true);
const draftStatus = ref<'saved' | 'saving' | 'unsaved'>('saved');
const importHint = ref('');

// 帖子配置相关状态
const showSettingsModal = ref(false);
const isPublishing = ref(false);
const postType = ref('');
const coverImage = ref<File | undefined>(undefined);

// 收集用户在编辑器中导入的多媒体文件
const attachedFiles = ref<File[]>([]);
const editorAreaRef = ref<InstanceType<typeof EditorArea> | null>(null);

// --- 草稿持久化 ---
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

function saveDraft() {
  try {
    const draft = {
      title: title.value,
      content: content.value,
      postType: postType.value,
    };
    localStorage.setItem(draftKey, JSON.stringify(draft));
    draftStatus.value = 'saved';
  } catch {
    draftStatus.value = 'unsaved';
  }
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(draftKey);
    if (!raw) return false;
    const draft = JSON.parse(raw);
    if (draft.title) title.value = draft.title;
    if (draft.content) content.value = draft.content;
    if (draft.postType) postType.value = draft.postType;
    return !!(draft.title || draft.content);
  } catch {
    return false;
  }
}

function clearDraft() {
  localStorage.removeItem(draftKey);
}

watch([title, content, postType], () => {
  draftStatus.value = 'unsaved';
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    draftStatus.value = 'saving';
    saveDraft();
  }, 1500);
});

function toggleTheme() {
  emit('toggle:theme');
}

function insertImage() {
  editorAreaRef.value?.insertText('\n![图片描述](', ')\n');
}

function handleFileImport(file: File) {
  importHint.value = `正在读取: ${file.name}...`;
  const isTextFile = file.type.startsWith('text/') ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.html') ||
      file.name.endsWith('.htm');

  if (isTextFile) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const fileContent = e.target.result.toString();
        editorAreaRef.value?.insertText('\n' + fileContent + '\n', '');
        importHint.value = '本地文件内容读取成功';
        setTimeout(() => importHint.value = '', 3000);
      }
    };
    reader.readAsText(file, 'UTF-8');
  } else {
    attachedFiles.value.push(file);
    editorAreaRef.value?.insertText(`\n{{media:${file.name}}}\n`, '');
    importHint.value = '多媒体文件已插入';
    setTimeout(() => importHint.value = '', 3000);
  }
}

// 接收弹窗保存的数据，仅回填到本地状态，不发网络请求
function handleSettingsSave(newTitle: string, newType: string, newCover: File | undefined) {
  title.value = newTitle;
  postType.value = newType;
  coverImage.value = newCover;
  showSettingsModal.value = false;
}

// 【核心修改】：点击工具栏发布按钮时，执行完整的表单校验与 API 上传
async function handlePublish() {
  if (!title.value.trim()) {
    alert('帖子标题不能为空，请在右上角输入或点击右下角“文章设置”填写！');
    return;
  }
  if (!content.value.trim()) {
    alert('帖子正文内容不能为空！');
    return;
  }
  if (!postType.value.trim()) {
    alert('请先点击右下角“文章设置”填写帖子类型 (Type)！');
    showSettingsModal.value = true; // 贴心引导：未填写类型自动弹出设置窗
    return;
  }
  if (!coverImage.value) {
    alert('请先点击右下角“文章设置”上传帖子封面！');
    showSettingsModal.value = true; // 贴心引导：未上传封面自动弹出设置窗
    return;
  }

  if (isPublishing.value) return; // 节流防重

  isPublishing.value = true;
  try {
    const success = await api.posting.upload(
        title.value,
        content.value,
        postType.value,
        coverImage.value,
        attachedFiles.value.length > 0 ? attachedFiles.value : undefined
    );

    if (success) {
      alert('帖子发布成功！');
      clearDraft();
      title.value = '';
      content.value = '';
      postType.value = '';
      coverImage.value = undefined;
      attachedFiles.value = [];
      draftStatus.value = 'saved';
    }
  } catch (error: any) {
    alert(`发布失败：${error.message || '网络连接异常'}`);
  } finally {
    isPublishing.value = false;
  }
}

function onBeforeUnload(e: BeforeUnloadEvent) {
  if (draftStatus.value === 'unsaved' && (title.value || content.value)) {
    e.preventDefault();
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', onBeforeUnload);

  const editId = route.params.id;
  if (editId) {
    // 编辑模式：加载已有帖子数据（detail 有 content，encapsulate 有 title）
    const id = Number(editId);
    Promise.all([
      api.posting.getDetail(id),
      api.posting.getEncapsulate(id),
    ]).then(([detail, encapsulate]) => {
      title.value = encapsulate.title || '';
      content.value = detail.content || '';
      // coverImage 是远程 URL，暂不回填 File 对象（用户可重新上传）
    }).catch(err => {
      alert('加载帖子失败：' + (err.message || '未知错误'));
    });
  } else {
    // 新建模式：尝试恢复草稿
    loadDraft();
  }
});

onUnmounted(() => {
  window.removeEventListener('beforeunload', onBeforeUnload);
});
</script>

<style scoped>
.post-editor-root {
  --editor-accent: #3b82f6;
}
.post-editor-root.editor-light {
  --editor-bg: #ffffff;
  --editor-text: #333333;
  --editor-toolbar-bg: #f9f9f9;
  --editor-statusbar-bg: #f9f9f9;
  --editor-border: #e5e5e5;
  --editor-hover-bg: rgba(0, 0, 0, 0.05);
}
.post-editor-root.editor-dark {
  --editor-bg: #1a1a1a;
  --editor-text: #e5e5e5;
  --editor-toolbar-bg: #242424;
  --editor-statusbar-bg: #242424;
  --editor-border: #333333;
  --editor-hover-bg: rgba(255, 255, 255, 0.1);
}
</style>
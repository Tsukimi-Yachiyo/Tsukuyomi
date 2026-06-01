<template>
  <div class="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#1a1a2e] p-5 flex justify-center items-start">
    <HoloPanel :is-open="true" theme-color="#ff6b6b" :glow-opacity="0.1" class="p-4">
      <div class="relative z-20 w-[900px] max-h-[90vh] overflow-y-auto p-8">
        <HoloBorder
          :anim="[0.3, 1.0]"
          :layers="[
            { inset: 18, borderWidth: 1, cornerOffset: 18, cornerStrokeWidth: 2, opacity: 0.3 },
            { inset: 12, borderWidth: 2, cornerOffset: 12, cornerStrokeWidth: 3, opacity: 0.8 }
          ]"
          :corners="['tl', 'tr', 'bl', 'br']"
          :corner-size="45"
          :show-notches="false"
        />

        <!-- Header -->
        <div class="flex justify-between items-center mb-5">
          <HoloText size="24px" weight="bold" text="管理后台" :anim="[0.5, 0.05]" />
        </div>

        <!-- Login Form -->
        <div v-if="!isAdminLoggedIn" class="flex flex-col gap-4 max-w-md">
          <HoloText text="管理员登录" size="16px" weight="bold" />
          <HoloInput v-model="adminLogin.username" label="USERNAME / 用户名" placeholder="admin..." :anim-delay="0.2" />
          <HoloInput v-model="adminLogin.password" label="PASSWORD / 密码" type="password" placeholder="***" :anim-delay="0.4" />
          <OceanButton variant="primary" @click="handleAdminLogin">登录</OceanButton>
        </div>

        <!-- Admin Dashboard -->
        <div v-else class="flex flex-col gap-5">
          <!-- Tabs -->
          <div class="flex gap-2 flex-wrap border-b border-white/10 pb-3">
            <OceanButton
              v-for="tab in tabs"
              :key="tab.key"
              :variant="activeTab === tab.key ? 'primary' : 'ghost'"
              size="sm"
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
            </OceanButton>
          </div>

          <!-- ============ Review Tab ============ -->
          <div v-if="activeTab === 'review'" class="flex flex-col gap-4">
            <div class="flex gap-3 mb-4">
              <OceanButton
                v-for="status in statusList"
                :key="status.value"
                :variant="reviewStatus === status.value ? 'secondary' : 'ghost'"
                size="sm"
                @click="loadPostings(status.value)"
              >
                {{ status.label }}
              </OceanButton>
            </div>

            <OceanState v-if="loading" type="loading" />
            <OceanState v-else-if="postings.length === 0" type="empty" text="暂无帖子" />
            <div v-else class="flex flex-col gap-2.5 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
              <div v-for="posting in postings" :key="posting.id" class="flex justify-between items-center p-4 bg-black/40 border border-white/10 rounded-lg cursor-pointer hover:border-[rgba(77,240,255,0.3)] transition-colors" @click="openPost(posting.id)">
                <div class="flex flex-col gap-1">
                  <HoloText :text="posting.title || 'Untitled'" size="14px" weight="bold" />
                  <HoloText :text="`ID: ${posting.id} | 作者: ${posting.userId}`" size="10px" secondary />
                  <HoloText :text="`类型: ${posting.type} | 评分: ${posting.score}`" size="10px" secondary />
                </div>
                <div class="flex gap-2" @click.stop>
                  <OceanButton variant="success" size="sm" @click="reviewPost(posting.id, 'APPROVE')">通过</OceanButton>
                  <OceanButton variant="warning" size="sm" @click="reviewPost(posting.id, 'REJECT')">拒绝</OceanButton>
                  <OceanButton variant="danger" size="sm" @click="reviewPost(posting.id, 'DELETE')">删除</OceanButton>
                </div>
              </div>
            </div>
          </div>

          <!-- ============ Columns Tab ============ -->
          <div v-if="activeTab === 'columns'" class="flex flex-col gap-4">
            <!-- 添加栏目表单 -->
            <div class="p-4 bg-black/30 border border-white/10 rounded-lg flex flex-col gap-3">
              <HoloText text="添加栏目" size="14px" weight="bold" />
              <div class="flex gap-3">
                <HoloInput v-model="newColumn.name" label="名称" placeholder="栏目名称..." :anim-delay="0.1" />
                <HoloInput v-model="newColumn.description" label="描述" placeholder="栏目描述..." :anim-delay="0.2" />
              </div>
              <div class="flex gap-3 items-end">
                <div class="flex flex-col gap-1">
                  <span class="text-[10px] text-white/40 tracking-widest uppercase">TYPE / 类型</span>
                  <select v-model="newColumn.type" class="bg-black/60 border border-white/15 text-white rounded px-3 py-2 text-sm outline-none focus:border-[rgba(77,240,255,0.5)]">
                    <option value="SIMPLE">随笔</option>
                    <option value="NOVEL">小说</option>
                    <option value="ACTIVITY">活动</option>
                  </select>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-[10px] text-white/40 tracking-widest uppercase">FILE / 文件</span>
                  <input type="file" @change="onColumnFileChange" class="text-sm text-white/70 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-[rgba(77,240,255,0.15)] file:text-[rgba(77,240,255,0.9)] file:text-xs file:cursor-pointer" />
                </div>
                <OceanButton variant="primary" size="sm" @click="addColumn">添加</OceanButton>
              </div>
            </div>

            <!-- 栏目列表 -->
            <OceanState v-if="columnsLoading" type="loading" />
            <OceanState v-else-if="columns.length === 0" type="empty" text="暂无栏目" />
            <div v-else class="flex flex-col gap-2.5 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
              <div v-for="column in columns" :key="column.id" class="flex justify-between items-center p-4 bg-black/40 border border-white/10 rounded-lg">
                <div class="flex flex-col gap-1">
                  <HoloText :text="column.name" size="14px" weight="bold" />
                  <HoloText :text="`ID: ${column.id} | 类型: ${column.type || '-'}`" size="10px" secondary />
                  <HoloText :text="column.description || '无描述'" size="10px" secondary />
                </div>
                <OceanButton variant="danger" size="sm" @click="deleteColumn(column.id)">删除</OceanButton>
              </div>
            </div>
          </div>

          <!-- ============ Mail Tab ============ -->
          <div v-if="activeTab === 'mail'" class="flex flex-col gap-4">
            <div class="p-4 bg-black/30 border border-white/10 rounded-lg flex flex-col gap-3">
              <HoloText text="发送系统通知" size="14px" weight="bold" />
              <HoloInput v-model="mailForm.title" label="TITLE / 标题" placeholder="通知标题..." :anim-delay="0.1" />
              <div class="flex flex-col gap-1">
                <span class="text-[10px] text-white/40 tracking-widest uppercase">CONTENT / 内容</span>
                <textarea
                    v-model="mailForm.content"
                    rows="4"
                    placeholder="通知内容..."
                    class="bg-black/60 border border-white/15 text-white rounded px-3 py-2 text-sm outline-none focus:border-[rgba(77,240,255,0.5)] resize-y"
                />
              </div>
              <div class="flex gap-3">
                <OceanButton variant="primary" size="sm" @click="sendMail(false)">发送站内信</OceanButton>
                <OceanButton variant="secondary" size="sm" @click="sendMail(true)">发送邮件通知</OceanButton>
              </div>
            </div>

            <div class="text-center text-white/20 text-xs py-2">
              站内信将出现在所有用户的信箱中，邮件通知将发送到用户邮箱
            </div>
          </div>

          <!-- ============ Command Tab ============ -->
          <div v-if="activeTab === 'command'" class="flex flex-col gap-4">
            <form @submit.prevent="runCommand" class="p-4 bg-black/30 border border-white/10 rounded-lg flex flex-col gap-3">
              <HoloText text="执行命令" size="14px" weight="bold" />
              <div class="flex gap-3 items-end">
                <div class="flex-1">
                  <HoloInput v-model="commandInput" label="COMMAND / 命令" placeholder="输入命令..." :anim-delay="0.2" />
                </div>
                <OceanButton variant="primary" size="sm" :disabled="commandLoading">
                  {{ commandLoading ? '执行中...' : '执行' }}
                </OceanButton>
              </div>
            </form>

            <!-- �令输出 -->
            <div v-if="commandOutput" class="p-4 bg-black/50 border border-white/10 rounded-lg">
              <HoloText text="输出" size="12px" weight="bold" secondary />
              <pre class="mt-2 text-sm text-green-400/80 whitespace-pre-wrap break-all font-mono">{{ commandOutput }}</pre>
            </div>
            <div v-if="commandError" class="p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
              <HoloText text="错误" size="12px" weight="bold" />
              <pre class="mt-2 text-sm text-red-400/80 whitespace-pre-wrap break-all font-mono">{{ commandError }}</pre>
            </div>
          </div>
        </div>
      </div>
    </HoloPanel>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { api } from '@/api';
import type { PostingResponse, PostingStatus, EssayType } from '@/api/types';
import HoloPanel from '@/components/holo/HoloPanel.vue';
import HoloBorder from '@/components/holo/HoloBorder.vue';
import HoloText from '@/components/holo/HoloText.vue';
import HoloInput from '@/components/holo/HoloInput.vue';
import OceanButton from '@/components/ocean/OceanButton.vue';
import OceanState from '@/components/ocean/OceanState.vue';
import {useUserStore} from "@/store/userStore";

const isAdminLoggedIn = ref(false);
const activeTab = ref<'review' | 'columns' | 'mail' | 'command'>('review');
const reviewStatus = ref<PostingStatus>('PENDING');
const loading = ref(false);
const columnsLoading = ref(false);
const commandLoading = ref(false);

const adminLogin = reactive({
  username: '',
  password: '',
});

const postings = ref<PostingResponse[]>([]);
const columns = ref<any[]>([]);

const newColumn = reactive({
  name: '',
  description: '',
  type: 'SIMPLE' as EssayType,
  file: null as File | null,
});

const mailForm = reactive({
  title: '',
  content: '',
});

const commandInput = ref('');
const commandOutput = ref('');
const commandError = ref('');

const pageNum = ref(1);
const pageSize = ref(20);

const tabs = [
  { key: 'review' as const, label: '帖子审核' },
  { key: 'columns' as const, label: '栏目管理' },
  { key: 'mail' as const, label: '站内信' },
  { key: 'command' as const, label: '命令' },
];

const statusList = [
  { value: 'PENDING' as PostingStatus, label: '待审核' },
  { value: 'APPROVED' as PostingStatus, label: '已通过' },
  { value: 'REJECTED' as PostingStatus, label: '已拒绝' },
];

const handleAdminLogin = async () => {
  try {
    useUserStore().token = await api.admin.login(adminLogin.username, adminLogin.password);
    isAdminLoggedIn.value = true;
    await loadPostings('PENDING');
  } catch {}
};

// ===== 审核 =====
const loadPostings = async (status: PostingStatus) => {
  reviewStatus.value = status;
  loading.value = true;
  try {
    postings.value = await api.admin.queryPostings(status, '', pageNum.value, pageSize.value);
  } catch {} finally {
    loading.value = false;
  }
};

const reviewPost = async (postingId: number, action: 'APPROVE' | 'REJECT' | 'DELETE') => {
  try {
    await api.admin.review({ postingId, action });
    loadPostings(reviewStatus.value);
  } catch {}
};

const openPost = (id: number) => {
  window.open(`/#/post/${id}`, '_blank');
};

// ===== 栏目 =====
const loadColumns = async () => {
  columnsLoading.value = true;
  try {
    columns.value = await api.column.search('', pageNum.value, pageSize.value);
  } catch {} finally {
    columnsLoading.value = false;
  }
};

const onColumnFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  newColumn.file = input.files?.[0] || null;
};

const addColumn = async () => {
  if (!newColumn.name.trim()) return;
  try {
    const file = newColumn.file || new File([], '');
    await api.admin.addColumn(newColumn.name, newColumn.description, newColumn.type, 0, file);
    newColumn.name = '';
    newColumn.description = '';
    newColumn.type = 'SIMPLE';
    newColumn.file = null;
    loadColumns();
  } catch {}
};

const deleteColumn = async (id: number) => {
  try {
    await api.admin.deleteColumn(id);
    loadColumns();
  } catch {}
};

// ===== 站内信 =====
const sendMail = async (useEmail: boolean) => {
  if (!mailForm.title.trim() || !mailForm.content.trim()) return;
  try {
    if (useEmail) {
      await api.admin.sendEmail(mailForm);
    } else {
      await api.admin.sendMail(mailForm);
    }
    mailForm.title = '';
    mailForm.content = '';
  } catch {}
};

// ===== 命令 =====
const runCommand = async () => {
  if (!commandInput.value.trim()) return;
  commandLoading.value = true;
  commandOutput.value = '';
  commandError.value = '';
  try {
    commandOutput.value = await api.admin.runCommand(commandInput.value);
  } catch (e: any) {
    commandError.value = e.message || '命令执行失败';
  } finally {
    commandLoading.value = false;
  }
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 107, 107, 0.2);
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 107, 107, 0.4);
}
</style>

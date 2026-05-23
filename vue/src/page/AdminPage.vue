<template>
  <div class="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#1a1a2e] p-5 flex justify-center items-start">
    <HoloPanel :is-open="true" theme-color="#ff6b6b" :glow-opacity="0.1" class="p-4">
      <div class="relative z-20 w-[800px] max-h-[90vh] overflow-y-auto p-8">
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
          <div class="flex gap-3 border-b border-white/10 pb-3">
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

          <!-- Review Tab -->
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
            <div v-else class="flex flex-col gap-2.5">
              <div v-for="posting in postings" :key="posting.id" class="flex justify-between items-center p-4 bg-black/40 border border-white/10 rounded-lg">
                <div class="flex flex-col gap-1">
                  <HoloText :text="posting.title || 'Untitled'" size="14px" weight="bold" />
                  <HoloText :text="`ID: ${posting.id}`" size="10px" secondary />
                  <HoloText :text="`状态: ${posting.status}`" size="10px" secondary />
                </div>
                <div class="flex gap-2">
                  <OceanButton variant="success" size="sm" @click="reviewPost(posting.id, 'APPROVE')">通过</OceanButton>
                  <OceanButton variant="warning" size="sm" @click="reviewPost(posting.id, 'REJECT')">拒绝</OceanButton>
                  <OceanButton variant="danger" size="sm" @click="reviewPost(posting.id, 'DELETE')">删除</OceanButton>
                </div>
              </div>
            </div>
          </div>

          <!-- Columns Tab -->
          <div v-if="activeTab === 'columns'" class="flex flex-col gap-4">
            <div class="flex gap-3 items-end mb-4">
              <HoloInput v-model="newColumn.name" label="NAME / 栏目名称" placeholder="栏目名称..." :anim-delay="0.2" />
              <OceanButton variant="primary" @click="addColumn">添加栏目</OceanButton>
            </div>

            <OceanState v-if="columnsLoading" type="loading" />
            <OceanState v-else-if="columns.length === 0" type="empty" text="暂无栏目" />
            <div v-else class="flex flex-col gap-2.5">
              <div v-for="column in columns" :key="column.id" class="flex justify-between items-center p-4 bg-black/40 border border-white/10 rounded-lg">
                <HoloText :text="column.name" size="14px" />
                <OceanButton variant="danger" size="sm" @click="deleteColumn(column.id)">删除</OceanButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HoloPanel>

    <!-- 登录弹窗 -->
    <LoginModal v-if="showLoginModal" @success="onLoginSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { api } from '@/api';
import type { PostingResponse, PostingStatus } from '@/api/types';
import { useAuthCheck } from '@/composables/useAuthCheck';
import HoloPanel from '@/components/holo/HoloPanel.vue';
import HoloBorder from '@/components/holo/HoloBorder.vue';
import HoloText from '@/components/holo/HoloText.vue';
import HoloInput from '@/components/holo/HoloInput.vue';
import OceanButton from '@/components/ocean/OceanButton.vue';
import OceanState from '@/components/ocean/OceanState.vue';
import LoginModal from '@/components/login/LoginModal.vue';

const { showLoginModal, checkAuth, onLoginSuccess } = useAuthCheck();
const isAdminLoggedIn = ref(false);
const activeTab = ref<'review' | 'columns'>('review');
const reviewStatus = ref<PostingStatus>('PENDING');
const loading = ref(false);
const columnsLoading = ref(false);

const adminLogin = reactive({
  username: '',
  password: '',
});

const postings = ref<PostingResponse[]>([]);
const columns = ref<any[]>([]);

const newColumn = reactive({
  name: '',
});

const pageNum = ref(1);
const pageSize = ref(20);

const tabs = [
  { key: 'review' as const, label: '帖子审核' },
  { key: 'columns' as const, label: '栏目管理' },
];

const statusList = [
  { value: 'PENDING' as PostingStatus, label: '待审核' },
  { value: 'APPROVED' as PostingStatus, label: '已通过' },
  { value: 'REJECTED' as PostingStatus, label: '已拒绝' },
];

const handleAdminLogin = async () => {
  try {
    await api.admin.login(adminLogin.username, adminLogin.password);
    isAdminLoggedIn.value = true;
    loadPostings('PENDING');
  } catch {}
};

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

const loadColumns = async () => {
  columnsLoading.value = true;
  try {
    columns.value = await api.column.search('', pageNum.value, pageSize.value);
  } catch {} finally {
    columnsLoading.value = false;
  }
};

const addColumn = async () => {
  if (!newColumn.name.trim()) return;
  try {
    await api.admin.addColumn(newColumn.name, '', 'SIMPLE', 0, new File([], ''));
    newColumn.name = '';
    loadColumns();
  } catch {}
};

const deleteColumn = async (id: number) => {
  try {
    await api.admin.deleteColumn(id);
    loadColumns();
  } catch {}
};

onMounted(() => {
  checkAuth();
});
</script>

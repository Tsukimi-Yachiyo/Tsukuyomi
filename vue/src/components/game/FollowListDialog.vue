<template>
  <div class="relative w-[500px] max-h-[80vh]">
    <HoloPanel :is-open="true" theme-color="#4df0ff" :glow-opacity="0.15">

      <div class="relative z-10 flex max-h-[75vh] flex-col gap-4 overflow-hidden px-5 py-4">
        <div class="flex justify-between items-center pb-3">
          <HoloText size="14px" weight="bold" :text="`${userName} - ${isSearching ? '搜索结果' : (activeTab === 'follower' ? '粉丝列表' : '关注列表')}`" />
          <button @click="emit('close')" class="text-[#4df0ff] hover:text-white transition-colors text-3xl leading-none outline-none">&times;</button>
        </div>

        <div class="flex gap-2">
          <button
            class="flex-1 py-1.5 text-sm font-medium rounded transition-all"
            :class="activeTab === 'follower' ? 'bg-[#4df0ff]/20 text-[#4df0ff]' : 'text-[#4df0ff]/60 hover:text-[#4df0ff]'"
            @click="switchTab('follower')"
          >
            粉丝 ({{ followerCount }})
          </button>
          <button
            class="flex-1 py-1.5 text-sm font-medium rounded transition-all"
            :class="activeTab === 'followee' ? 'bg-[#4df0ff]/20 text-[#4df0ff]' : 'text-[#4df0ff]/60 hover:text-[#4df0ff]'"
            @click="switchTab('followee')"
          >
            关注 ({{ followeeCount }})
          </button>
        </div>

        <div class="relative">
          <input
            v-model="searchKeyword"
            @input="onSearch"
            type="text"
            placeholder="搜索用户..."
            class="w-full px-3 py-2 bg-[#4df0ff]/10 border border-[#4df0ff]/30 rounded-lg text-sm text-white placeholder-[#4df0ff]/40 focus:outline-none focus:border-[#4df0ff] transition-colors"
          /> <button
            v-if="searchKeyword"
            @click="clearSearch"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-[#4df0ff]/50 hover:text-white transition-colors flex items-center justify-center outline-none"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          </button>
        </div>

        <slot name="content"></slot>

        <div class="max-h-[50vh] flex-1 overflow-y-auto pr-1">
          <div v-if="loading" class="flex items-center justify-center py-10">
            <div class="text-[#4df0ff] text-sm animate-pulse">数据加载中...</div>
          </div>
          <div v-else-if="userList.length === 0" class="flex items-center justify-center py-10">
            <div class="text-[#4df0ff]/50 text-sm">暂无数据</div>
          </div>
          <div v-else class="flex flex-col gap-2">
            <div
              v-for="user in userList"
              :key="user.userId"
              class="flex items-center gap-3 p-2 rounded-lg bg-[#4df0ff]/5 hover:bg-[#4df0ff]/10 transition-all cursor-pointer group"
              @click="selectUser(user.userId)"
            >
              <UserAvatar
                :user-id="user.userId"
                :avatar-url="user.userAvatar"
                :username="user.userName"
                size="sm"
                class="shrink-0"
              />
              <div class="flex-1 min-w-0">
                <div class="text-sm text-white truncate group-hover:text-[#4df0ff] transition-colors">
                  {{ user.userName }}
                </div>
              </div>
              <button
                v-if="showFollowBtn(user)"
                class="flex-shrink-0 px-3 py-1 text-xs rounded transition-all"
                :class="user.isFollowing ? 'bg-[#4df0ff]/10 text-[#4df0ff]/60 hover:text-white' : 'bg-[#4df0ff]/20 text-[#4df0ff] hover:bg-[#4df0ff] hover:text-black'"
                @click.stop="toggleFollow(user)"
              >
                {{ user.isFollowing ? '已关注' : '+ 关注' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </HoloPanel>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { api } from '@/api';
import type { FollowerInfo } from '@/api/types';
import { useUserStore } from '@/store/userStore';
import HoloPanel from '@/components/holo/HoloPanel.vue';
import HoloText from '@/components/holo/HoloText.vue';
import UserAvatar from '@/components/UserAvatar.vue';

const props = defineProps<{
  userId: number;
  userName: string;
  followerCount: number;
  followeeCount: number;
  initialTab?: 'follower' | 'followee';
}>();

const emit = defineEmits<{
  close: [];
  selectUser: [userId: number];
}>();

const userStore = useUserStore();
const activeTab = ref<'follower' | 'followee'>(props.initialTab || 'follower');
const userList = ref<FollowerInfo[]>([]);
const loading = ref(false);
const followerCount = ref(props.followerCount);
const followeeCount = ref(props.followeeCount);
const searchKeyword = ref('');
const isSearching = ref(false);
let searchTimer: ReturnType<typeof setTimeout> | null = null;

const isSelf = computed(() => String(props.userId) === userStore.userId);

async function loadList() {
  loading.value = true;
  try {
    if (activeTab.value === 'follower') {
      const ids = await api.user.getFollowers(props.userId);
      followerCount.value = ids.length;
      if (ids.length > 0) {
        const details: FollowerInfo[] = [];
        for (const id of ids) {
          if (isSelf.value) {
            details.push({
              userId: id,
              userName: '',
              userAvatar: '',
              isFollowing: false,
              isFollowed: true,
            });
          } else {
            const detail = await api.user.getDetail('SEARCH', id);
            details.push({
              userId: id,
              userName: detail.userName,
              userAvatar: detail.userAvatar,
              isFollowing: detail.isFollowed,
              isFollowed: detail.isFollowing,
            });
          }
        }
        userList.value = details;
      } else {
        userList.value = [];
      }
    } else {
      const ids = await api.user.getFollowees(props.userId);
      followeeCount.value = ids.length;
      if (ids.length > 0) {
        const details: FollowerInfo[] = [];
        for (const id of ids) {
          if (isSelf.value) {
            details.push({
              userId: id,
              userName: '',
              userAvatar: '',
              isFollowing: false,
              isFollowed: false,
            });
          } else {
            const detail = await api.user.getDetail('SEARCH', id);
            details.push({
              userId: id,
              userName: detail.userName,
              userAvatar: detail.userAvatar,
              isFollowing: detail.isFollowed,
              isFollowed: detail.isFollowing,
            });
          }
        }
        userList.value = details;
      } else {
        userList.value = [];
      }
    }
  } catch (error) {
    console.error('[FollowListDialog] Failed to load list:', error);
    userList.value = [];
  } finally {
    loading.value = false;
  }
}

function switchTab(tab: 'follower' | 'followee') {
  if (activeTab.value === tab) return;
  activeTab.value = tab;
  loadList();
}

function selectUser(userId: number) {
  emit('selectUser', userId);
}

async function toggleFollow(user: FollowerInfo) {
  try {
    await api.user.follow(user.userId);
    user.isFollowing = !user.isFollowing;
  } catch (error) {
    console.error('[FollowListDialog] Follow toggle failed:', error);
  }
}

function showFollowBtn(user: FollowerInfo): boolean {
  if (isSelf.value) return false;
  return String(user.userId) !== userStore.userId;
}

function onSearch() {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }

  if (!searchKeyword.value.trim()) {
    isSearching.value = false;
    loadList();
    return;
  }

  searchTimer = setTimeout(async () => {
    await performSearch();
  }, 500);
}

async function performSearch() {
  if (!searchKeyword.value.trim()) return;

  loading.value = true;
  isSearching.value = true;

  try {
    const results = await api.user.search(searchKeyword.value.trim(), 1, 20);

    userList.value = results.map(r => ({
      userId: Number(r.userPhone),
      userName: r.userName,
      userAvatar: r.userAvatar,
      isFollowing: r.isFollowed,
      isFollowed: r.isFollowing,
    }));
  } catch (error) {
    console.error('[FollowListDialog] Search failed:', error);
    userList.value = [];
  } finally {
    loading.value = false;
  }
}

function clearSearch() {
  searchKeyword.value = '';
  isSearching.value = false;
  if (searchTimer) {
    clearTimeout(searchTimer);
    searchTimer = null;
  }
  loadList();
}

loadList();
</script>

<style scoped>
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #4df0ff33 transparent;
}
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #4df0ff33;
  border-radius: 2px;
}
</style>

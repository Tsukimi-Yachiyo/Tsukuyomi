<template>
  <div class="relative w-175 h-130">
    <HoloPanel :is-open="true" theme-color="#4df0ff" :glow-opacity="0.15">
      <div class="relative z-10 flex h-120 flex-col gap-0 overflow-hidden px-5 py-4">
        <div class="flex justify-between items-center pb-3">
          <HoloText size="14px" weight="bold" text="聊天 / Chat" />
          <button @click="emit('close')" class="text-[#4df0ff] hover:text-white transition-colors text-3xl leading-none outline-none">&times;</button>
        </div>

        <div class="flex flex-1 min-h-0 gap-3">
          <div class="w-50 shrink-0 flex flex-col border-r border-[#4df0ff]/20 pr-3">
            <div v-if="loadingFriends" class="flex items-center justify-center py-10">
              <div class="text-[#4df0ff] text-sm animate-pulse">加载中...</div>
            </div>
            <div v-else-if="friendList.length === 0" class="flex items-center justify-center py-10">
              <div class="text-[#4df0ff]/50 text-xs text-center">暂无好友</div>
            </div>
            <div v-else class="flex-1 overflow-y-auto pr-1">
              <div
                v-for="friend in friendList"
                :key="friend.userId"
                class="flex items-center gap-2 p-2 rounded-lg mb-1 transition-all cursor-pointer"
                :class="selectedFriendId === friend.userId ? 'bg-[#4df0ff]/20' : 'bg-[#4df0ff]/5 hover:bg-[#4df0ff]/10'"
                @click="selectFriend(friend)"
              >
                <UserAvatar
                  :user-id="friend.userId"
                  :avatar-url="friend.userAvatar"
                  :username="friend.userName"
                  size="sm"
                  class="shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <div class="text-xs text-white truncate" :class="{ 'text-[#4df0ff]': selectedFriendId === friend.userId }">
                    {{ friend.userName }}
                  </div>
                  <div v-if="getLatestMessage(friend.userId)" class="text-[10px] text-white/40 truncate mt-0.5">
                    {{ getLatestMessage(friend.userId)?.message }}
                  </div>
                </div>
                <div v-if="unreadCountMap[friend.userId]" class="w-4 h-4 rounded-full bg-[#4df0ff] text-[10px] text-black flex items-center justify-center font-bold">
                  {{ unreadCountMap[friend.userId] }}
                </div>
              </div>
            </div>
          </div>

          <div class="flex-1 flex flex-col min-w-0">
            <div v-if="!selectedFriendId" class="flex-1 flex items-center justify-center">
              <div class="text-[#4df0ff]/40 text-sm">请选择一个好友开始聊天</div>
            </div>

            <template v-else>
              <div class="flex items-center gap-2 pb-2 border-b border-[#4df0ff]/20">
                <UserAvatar
                  :user-id="selectedFriendId"
                  :avatar-url="currentFriendInfo?.userAvatar || ''"
                  :username="currentFriendInfo?.userName || ''"
                  size="sm"
                  class="shrink-0"
                />
                <span class="text-sm text-white font-medium">{{ currentFriendInfo?.userName || '加载中...' }}</span>
              </div>

              <div ref="messageListRef" class="flex-1 overflow-y-auto py-3 pr-1 min-h-0">
                <div v-if="loadingMessages" class="flex items-center justify-center py-5">
                  <div class="text-[#4df0ff] text-xs animate-pulse">加载消息...</div>
                </div>

                <div v-else-if="currentMessages.length === 0" class="flex items-center justify-center py-5">
                  <div class="text-[#4df0ff]/40 text-xs">暂无消息记录</div>
                </div>

                <div v-else class="flex flex-col gap-2">
                  <div
                    v-for="(msg, idx) in currentMessages"
                    :key="idx"
                    class="flex"
                    :class="msg.isSelf ? 'justify-end' : 'justify-start'"
                  >
                    <div
                      class="max-w-[70%] px-3 py-2 rounded-lg text-xs leading-relaxed"
                      :class="msg.isSelf
                        ? 'bg-[#4df0ff]/20 text-white rounded-br-sm'
                        : 'bg-white/10 text-white/90 rounded-bl-sm'"
                    >
                      <div class="break-words whitespace-pre-wrap">{{ msg.message }}</div>
                      <div class="text-[10px] text-white/30 mt-1 text-right">
                        {{ formatTime(msg.createTime) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex gap-2 pt-2 border-t border-[#4df0ff]/20">
                <input
                  v-model="inputText"
                  @keyup.enter="sendMessage"
                  type="text"
                  placeholder="输入消息..."
                  class="flex-1 px-3 py-2 bg-[#4df0ff]/10 border border-[#4df0ff]/30 rounded-lg text-xs text-white placeholder-[#4df0ff]/40 focus:outline-none focus:border-[#4df0ff] transition-colors"
                />
                <button
                  @click="sendMessage"
                  :disabled="!inputText.trim() || !chatSocketService.isConnected()"
                  class="px-4 py-2 rounded-lg text-xs font-medium transition-all bg-[#4df0ff]/20 text-[#4df0ff] hover:bg-[#4df0ff]/30 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  发送
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </HoloPanel>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { api } from '@/api';
import { chatSocketService } from '@/api/chat';
import { eventBus } from '@/utils/eventBus';
import { useUserStore } from '@/store/userStore';
import type { FollowerInfo } from '@/api/types';
import type { ChatMessageDTO } from '@/api/types';
import HoloPanel from '@/components/holo/HoloPanel.vue';
import HoloText from '@/components/holo/HoloText.vue';
import UserAvatar from '@/components/UserAvatar.vue';

const emit = defineEmits<{
  close: [];
}>();

const userStore = useUserStore();
const messageListRef = ref<HTMLElement | null>(null);

const friendList = ref<FollowerInfo[]>([]);
const loadingFriends = ref(false);
const selectedFriendId = ref<number | null>(null);
const currentMessages = ref<Array<ChatMessageDTO & { isSelf: boolean }>>([]);
const loadingMessages = ref(false);
const inputText = ref('');
const unreadCountMap = ref<Record<number, number>>({});
const latestMessageMap = ref<Record<number, ChatMessageDTO>>({});

const currentFriendInfo = computed(() => {
  if (!selectedFriendId.value) return null;
  return friendList.value.find(f => f.userId === selectedFriendId.value) || null;
});

const currentUserId = computed(() => {
  if (userStore.userId) return Number(userStore.userId);
  const token = userStore.token;
  if (token) {
    const parts = token.split('.');
    if (parts.length >= 2) {
      return Number(parts[0]) || 0;
    }
  }
  return 0;
});

async function loadFriends() {
  loadingFriends.value = true;
  try {
    const friendIds = await api.chat.getFriends();
    const details: FollowerInfo[] = [];
    for (const id of friendIds) {
      const detail = await api.user.getDetail('SEARCH', id);
      details.push({
        userId: id,
        userName: detail.userName,
        userAvatar: detail.userAvatar,
        isFollowing: detail.isFollowing,
        isFollowed: detail.isFollowed,
      });
    }
    friendList.value = details;
  } catch (error) {
    console.error('[ChatDialog] Failed to load friends:', error);
    friendList.value = [];
  } finally {
    loadingFriends.value = false;
  }
}

async function selectFriend(friend: FollowerInfo) {
  selectedFriendId.value = friend.userId;
  unreadCountMap.value[friend.userId] = 0;
  await loadMessages(friend.userId);
}

async function loadMessages(friendId: number) {
  loadingMessages.value = true;
  try {
    const messages = await api.chat.getMessages(friendId);
    const uid = currentUserId.value;
    currentMessages.value = messages.map(msg => ({
      ...msg,
      isSelf: Number(msg.fromUserId) === uid,
    })).reverse();
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error('[ChatDialog] Failed to load messages:', error);
    currentMessages.value = [];
  } finally {
    loadingMessages.value = false;
  }
}

function scrollToBottom() {
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
  }
}

async function sendMessage() {
  if (!inputText.value.trim() || !selectedFriendId.value) return;

  const uid = currentUserId.value;
  const messageText = inputText.value.trim();

  chatSocketService.sendChatMessage({
    fromId: uid,
    toId: selectedFriendId.value,
    toType: 0,
    message: messageText,
  });

  currentMessages.value.push({
    message: messageText,
    fromUserId: uid,
    createTime: new Date().toISOString(),
    isSelf: true,
  });

  latestMessageMap.value[selectedFriendId.value] = {
    message: messageText,
    fromUserId: uid,
    createTime: new Date().toISOString(),
  };

  inputText.value = '';
  await nextTick();
  scrollToBottom();
}

function getLatestMessage(friendId: number) {
  return latestMessageMap.value[friendId] || null;
}

function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function handleIncomingMessage(data: any) {
  const fromId = Number(data.from_id);
  const message = data.message as string;

  let relatedFriendId: number | null = null;
  if (selectedFriendId.value && fromId === selectedFriendId.value) {
    relatedFriendId = fromId;
  } else {
    const friend = friendList.value.find(f => f.userId === fromId);
    if (friend) {
      relatedFriendId = fromId;
      if (!unreadCountMap.value[fromId]) {
        unreadCountMap.value[fromId] = 0;
      }
      unreadCountMap.value[fromId]++;
    }
  }

  if (relatedFriendId) {
    latestMessageMap.value[relatedFriendId] = {
      message,
      fromUserId: fromId,
      createTime: new Date().toISOString(),
    };

    if (selectedFriendId.value === relatedFriendId) {
      currentMessages.value.push({
        message,
        fromUserId: fromId,
        createTime: new Date().toISOString(),
        isSelf: false,
      });
      nextTick(() => scrollToBottom());
    }
  }
}

onMounted(async () => {
  await loadFriends();
  eventBus.on('chat:received', handleIncomingMessage);
  await chatSocketService.connect();
});

onUnmounted(() => {
  eventBus.off('chat:received', handleIncomingMessage);
});

defineExpose({ chatSocketService });
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

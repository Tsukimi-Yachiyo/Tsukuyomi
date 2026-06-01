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
            <div class="flex-1 overflow-y-auto pr-1">
              <!-- AI entry -->
              <div
                class="flex items-center gap-2 p-2 rounded-lg mb-1 transition-all cursor-pointer"
                :class="chatMode === 'ai' ? 'bg-[#4df0ff]/20' : 'bg-[#4df0ff]/5 hover:bg-[#4df0ff]/10'"
                @click="selectAI"
              >
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#4df0ff] to-[#646cff] flex items-center justify-center shrink-0">
                  <span class="text-[10px] text-white font-bold">🌙</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs text-white truncate" :class="{ 'text-[#4df0ff]': chatMode === 'ai' }">月见八千代</div>
                  <div class="text-[10px] text-white/40 truncate mt-0.5">与 月见八千代 对话</div>
                </div>
              </div>

              <div class="border-t border-[#4df0ff]/10 my-1" />

              <div v-if="loadingFriends" class="flex items-center justify-center py-10">
                <div class="text-[#4df0ff] text-sm animate-pulse">加载中...</div>
              </div>
              <div v-else-if="friendList.length === 0" class="flex items-center justify-center py-10">
                <div class="text-[#4df0ff]/50 text-xs text-center">暂无好友</div>
              </div>
              <template v-else>
                <div
                  v-for="friend in friendList"
                  :key="friend.userId"
                  class="flex items-center gap-2 p-2 rounded-lg mb-1 transition-all cursor-pointer"
                  :class="chatMode === 'friend' && selectedFriendId === friend.userId ? 'bg-[#4df0ff]/20' : 'bg-[#4df0ff]/5 hover:bg-[#4df0ff]/10'"
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
                    <div class="text-xs text-white truncate" :class="{ 'text-[#4df0ff]': chatMode === 'friend' && selectedFriendId === friend.userId }">
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
              </template>
            </div>
          </div>

          <div class="flex-1 flex flex-col min-w-0">
            <div v-if="chatMode !== 'ai' && !selectedFriendId" class="flex-1 flex items-center justify-center">
              <div class="text-[#4df0ff]/40 text-sm">请选择一个好友或 AI 开始聊天</div>
            </div>

            <template v-else>
              <div class="flex items-center gap-2 pb-2 border-b border-[#4df0ff]/20">
                <template v-if="chatMode === 'ai'">
                  <div class="w-7 h-7 rounded-full bg-gradient-to-br from-[#4df0ff] to-[#646cff] flex items-center justify-center shrink-0">
                    <span class="text-[9px] text-white font-bold">AI</span>
                  </div>
                </template>
                <template v-else>
                  <UserAvatar
                    :user-id="selectedFriendId!"
                    :avatar-url="currentFriendInfo?.userAvatar || ''"
                    :username="currentFriendInfo?.userName || ''"
                    size="sm"
                    class="shrink-0"
                  />
                </template>
                <span class="text-sm text-white font-medium">{{ currentFriendInfo?.userName || '加载中...' }}</span>
              </div>

              <div ref="messageListRef" @scroll="onMessageScroll" class="flex-1 overflow-y-auto py-3 pr-1 min-h-0">
                <div v-if="chatMode === 'ai' ? aiLoadingHistory : loadingMessages" class="flex items-center justify-center py-5">
                  <div class="text-[#4df0ff] text-xs animate-pulse">加载消息...</div>
                </div>

                <template v-else-if="chatMode === 'friend'">
                  <!-- Loading older messages indicator -->
                  <div v-if="loadingOlder" class="flex items-center justify-center py-3">
                    <div class="text-[#4df0ff] text-[10px] animate-pulse">加载更早消息...</div>
                  </div>
                  <div v-else-if="!hasMoreMessages && currentMessages.length > 0" class="flex items-center justify-center py-2">
                    <div class="text-[#4df0ff]/30 text-[10px]">没有更早的消息了</div>
                  </div>

                  <div v-if="currentMessages.length === 0" class="flex items-center justify-center py-5">
                    <div class="text-[#4df0ff]/40 text-xs">暂无消息记录</div>
                  </div>

                  <div v-else class="flex flex-col gap-2">
                    <div
                      v-for="(msg, idx) in currentMessages"
                      :key="`${msg.createTime}_${idx}`"
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
                </template>

                <template v-else-if="chatMode === 'ai'">
                  <div v-if="aiLoadingHistory" class="flex items-center justify-center py-5">
                    <div class="text-[#4df0ff] text-xs animate-pulse">加载消息...</div>
                  </div>
                  <div v-else-if="aiMessages.length === 0" class="flex items-center justify-center py-5">
                    <div class="text-[#4df0ff]/40 text-xs">开始和 AI 对话吧</div>
                  </div>
                  <div v-else class="flex flex-col gap-2">
                    <div
                      v-for="(msg, idx) in aiMessages"
                      :key="idx"
                      class="flex"
                      :class="msg.isSelf ? 'justify-end' : 'justify-start'"
                    >
                      <div
                        class="max-w-[70%] px-3 py-2 rounded-lg text-xs leading-relaxed"
                        :class="msg.isSelf
                          ? 'bg-[#4df0ff]/20 text-white rounded-br-sm'
                          : 'bg-gradient-to-br from-[#4df0ff]/10 to-[#646cff]/10 text-white/90 rounded-bl-sm'"
                      >
                        <div class="break-words whitespace-pre-wrap">{{ msg.message }}</div>
                        <div class="text-[10px] text-white/30 mt-1 text-right">
                          {{ formatTime(msg.time) }}
                        </div>
                      </div>
                    </div>
                    <div v-if="aiSending" class="flex justify-start">
                      <div class="max-w-[70%] px-3 py-2 rounded-lg text-xs leading-relaxed bg-gradient-to-br from-[#4df0ff]/10 to-[#646cff]/10 text-white/90 rounded-bl-sm">
                        <div class="flex items-center gap-1">
                          <span class="w-1.5 h-1.5 rounded-full bg-[#4df0ff] animate-bounce [animation-delay:0ms]" />
                          <span class="w-1.5 h-1.5 rounded-full bg-[#4df0ff] animate-bounce [animation-delay:150ms]" />
                          <span class="w-1.5 h-1.5 rounded-full bg-[#4df0ff] animate-bounce [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>

              <div v-if="chatMode === 'friend' && !wsConnected" class="text-[10px] text-red-400/80 text-center py-1">
                未连接服务器，消息无法发送
              </div>
              <div class="flex gap-2 pt-2 border-t border-[#4df0ff]/20">
                <input
                  v-model="inputText"
                  @keyup.enter="sendMessage"
                  type="text"
                  :placeholder="chatMode === 'ai' ? '向 AI 提问...' : '输入消息...'"
                  class="flex-1 px-3 py-2 bg-[#4df0ff]/10 border border-[#4df0ff]/30 rounded-lg text-xs text-white placeholder-[#4df0ff]/40 focus:outline-none focus:border-[#4df0ff] transition-colors"
                />
                <button
                  @click="sendMessage"
                  :disabled="!inputText.trim() || (chatMode === 'friend' && !wsConnected) || (chatMode === 'ai' && aiSending)"
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
import { socketService } from '@/api/socket';
import { eventBus } from '@/utils/eventBus';
import { useUserStore } from '@/store/userStore';
import type { FollowerInfo, AIChatHistory, ChatMessageDTO } from '@/api/types';
import HoloPanel from '@/components/holo/HoloPanel.vue';
import HoloText from '@/components/holo/HoloText.vue';
import UserAvatar from '@/components/UserAvatar.vue';

const emit = defineEmits<{ close: [] }>();

const userStore = useUserStore();
const messageListRef = ref<HTMLElement | null>(null);

const AI_USER_ID = -1;
const CACHE_PREFIX = 'chat_messages_';
const MAX_CACHED_MESSAGES = 50;

type ChatMode = 'friend' | 'ai';
type DisplayMessage = ChatMessageDTO & { isSelf: boolean };

const friendList = ref<FollowerInfo[]>([]);
const loadingFriends = ref(false);
const selectedFriendId = ref<number | null>(null);
const chatMode = ref<ChatMode>('friend');
const currentMessages = ref<DisplayMessage[]>([]);
const loadingMessages = ref(false);
const loadingOlder = ref(false);
const hasMoreMessages = ref(true);
const inputText = ref('');
const unreadCountMap = ref<Record<number, number>>({});
const latestMessageMap = ref<Record<number, ChatMessageDTO>>({});

// AI chat state
const aiSessionId = ref<number | null>(null);
const aiMessages = ref<Array<{ message: string; isSelf: boolean; time: string }>>([]);
const aiSending = ref(false);
const aiLoadingHistory = ref(false);
const wsConnected = ref(socketService.isConnected());

const currentFriendInfo = computed(() => {
  if (chatMode.value === 'ai') {
    return { userId: AI_USER_ID, userName: '月见八千代', userAvatar: '', isFollowing: false, isFollowed: false };
  }
  if (!selectedFriendId.value) return null;
  return friendList.value.find(f => f.userId === selectedFriendId.value) || null;
});

const currentUserId = computed(() => {
  if (userStore.userId) return Number(userStore.userId);
  const token = userStore.token;
  if (token) {
    const parts = token.split('.');
    if (parts.length >= 2) return Number(parts[0]) || 0;
  }
  return 0;
});

// ======================== Cache ========================

function getCacheKey(friendId: number): string {
  return `${CACHE_PREFIX}${currentUserId.value}_${friendId}`;
}

function loadFromCache(friendId: number): DisplayMessage[] {
  try {
    const raw = localStorage.getItem(getCacheKey(friendId));
    if (!raw) return [];
    const cached: ChatMessageDTO[] = JSON.parse(raw);
    const uid = currentUserId.value;
    return cached.map(msg => ({ ...msg, isSelf: Number(msg.fromUserId) === uid }));
  } catch {
    return [];
  }
}

function saveToCache(friendId: number, messages: DisplayMessage[]) {
  try {
    const toCache = messages.slice(-MAX_CACHED_MESSAGES).map(({ isSelf, ...rest }) => rest);
    localStorage.setItem(getCacheKey(friendId), JSON.stringify(toCache));
  } catch { /* quota exceeded, ignore */ }
}

function appendToCache(friendId: number, msg: ChatMessageDTO) {
  try {
    const raw = localStorage.getItem(getCacheKey(friendId));
    const cached: ChatMessageDTO[] = raw ? JSON.parse(raw) : [];
    cached.push(msg);
    if (cached.length > MAX_CACHED_MESSAGES) cached.splice(0, cached.length - MAX_CACHED_MESSAGES);
    localStorage.setItem(getCacheKey(friendId), JSON.stringify(cached));
  } catch { /* ignore */ }
}

// ======================== Friends ========================

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

    // Load latest messages for sidebar preview
    for (const id of friendIds) {
      const cached = loadFromCache(id);
      if (cached.length > 0) {
        const last = cached[cached.length - 1];
        latestMessageMap.value[id] = { message: last.message, fromUserId: last.fromUserId, createTime: last.createTime };
      }
    }
  } catch (error) {
    console.error('[ChatDialog] Failed to load friends:', error);
    friendList.value = [];
  } finally {
    loadingFriends.value = false;
  }
}

// ======================== Friend Chat ========================

async function selectFriend(friend: FollowerInfo) {
  chatMode.value = 'friend';
  selectedFriendId.value = friend.userId;
  unreadCountMap.value[friend.userId] = 0;
  hasMoreMessages.value = true;
  await loadMessages(friend.userId);
}

async function loadMessages(friendId: number) {
  loadingMessages.value = true;
  try {
    // 1. Show cache instantly
    const cached = loadFromCache(friendId);
    if (cached.length > 0) {
      currentMessages.value = cached;
      await nextTick();
      scrollToBottom();
    }

    // 2. Fetch latest from server
    const before = toLocalDateTime();
    const messages = await api.chat.getMessages(friendId, before);
    const uid = currentUserId.value;
    const fresh: DisplayMessage[] = messages.map(msg => ({
      ...msg,
      isSelf: Number(msg.fromUserId) === uid,
    })).reverse();

    if (fresh.length > 0) {
      // Merge: cached + fresh, deduplicate by createTime+message
      const merged = deduplicateMessages([...cached, ...fresh]);
      currentMessages.value = merged;
      saveToCache(friendId, merged);
      await nextTick();
      scrollToBottom();
    }

    hasMoreMessages.value = messages.length >= 10;
  } catch (error) {
    console.error('[ChatDialog] Failed to load messages:', error);
    if (currentMessages.value.length === 0) currentMessages.value = [];
  } finally {
    loadingMessages.value = false;
  }
}

async function loadOlderMessages() {
  if (!selectedFriendId.value || loadingOlder.value || !hasMoreMessages.value) return;

  const friendId = selectedFriendId.value;
  const oldest = currentMessages.value[0];
  if (!oldest) return;

  loadingOlder.value = true;
  try {
    const before = oldest.createTime;
    const messages = await api.chat.getMessages(friendId, before);
    const uid = currentUserId.value;
    const older: DisplayMessage[] = messages.map(msg => ({
      ...msg,
      isSelf: Number(msg.fromUserId) === uid,
    })).reverse();

    if (older.length === 0) {
      hasMoreMessages.value = false;
    } else {
      // Preserve scroll position
      const el = messageListRef.value;
      const prevHeight = el?.scrollHeight ?? 0;

      const merged = deduplicateMessages([...older, ...currentMessages.value]);
      currentMessages.value = merged;
      saveToCache(friendId, merged);

      await nextTick();
      if (el) el.scrollTop = el.scrollHeight - prevHeight;
    }

    if (messages.length < 10) hasMoreMessages.value = false;
  } catch (error) {
    console.error('[ChatDialog] Failed to load older messages:', error);
  } finally {
    loadingOlder.value = false;
  }
}

function deduplicateMessages(messages: DisplayMessage[]): DisplayMessage[] {
  const seen = new Set<string>();
  return messages.filter(msg => {
    const key = `${msg.createTime}_${msg.fromUserId}_${msg.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function onMessageScroll() {
  const el = messageListRef.value;
  if (!el || chatMode.value !== 'friend') return;
  if (el.scrollTop <= 20) {
    loadOlderMessages();
  }
}

// ======================== Send ========================

async function sendMessage() {
  if (!inputText.value.trim()) return;
  if (chatMode.value === 'ai') { await sendAIMessage(); return; }
  if (!selectedFriendId.value) return;

  const uid = currentUserId.value;
  const messageText = inputText.value.trim();
  const now = toLocalDateTime();

  socketService.sendChat({ fromId: uid, toId: selectedFriendId.value, toType: 0, message: messageText });

  const msg: DisplayMessage = { message: messageText, fromUserId: uid, createTime: now, isSelf: true };
  currentMessages.value.push(msg);
  latestMessageMap.value[selectedFriendId.value] = { message: messageText, fromUserId: uid, createTime: now };
  appendToCache(selectedFriendId.value, { message: messageText, fromUserId: uid, createTime: now });

  inputText.value = '';
  await nextTick();
  scrollToBottom();
}

async function sendAIMessage() {
  const messageText = inputText.value.trim();
  if (!messageText || aiSending.value) return;

  aiSending.value = true;
  const now = toLocalDateTime();

  aiMessages.value.push({ message: messageText, isSelf: true, time: now });
  inputText.value = '';
  await nextTick();
  scrollToBottom();

  try {
    await ensureAISession();
    const response = await api.ai.chat({ prompt: messageText, session_id: aiSessionId.value ?? undefined });
    aiMessages.value.push({ message: response, isSelf: false, time: new Date().toISOString() });
    await nextTick();
    scrollToBottom();
  } catch (e) {
    console.error('[ChatDialog] AI chat error:', e);
    aiMessages.value.push({ message: '发送失败，请稍后重试', isSelf: false, time: new Date().toISOString() });
    await nextTick();
    scrollToBottom();
  } finally {
    aiSending.value = false;
  }
}

// ======================== AI ========================

async function selectAI() {
  chatMode.value = 'ai';
  selectedFriendId.value = null;
  await loadAIHistory();
}

async function loadAIHistory() {
  if (!aiSessionId.value) { aiMessages.value = []; return; }
  aiLoadingHistory.value = true;
  try {
    const history: AIChatHistory[] = await api.ai.getHistory(aiSessionId.value);
    const merged: typeof aiMessages.value = [];
    for (let i = 0; i < history.length; i++) {
      merged.push({ message: history[i].human_input, isSelf: true, time: history[i].create_time });
      merged.push({ message: history[i].ai_result, isSelf: false, time: history[i].create_time });
    }
    aiMessages.value = merged;
    await nextTick();
    scrollToBottom();
  } catch (e) {
    console.error('[ChatDialog] Failed to load AI history:', e);
    aiMessages.value = [];
  } finally {
    aiLoadingHistory.value = false;
  }
}

async function ensureAISession() {
  if (aiSessionId.value) return;
  try {
    const sessions = await api.ai.getSessions();
    if (sessions && sessions.length > 0) {
      aiSessionId.value = sessions[sessions.length - 1].id;
    } else {
      await api.ai.addSession();
      const newSessions = await api.ai.getSessions();
      if (newSessions && newSessions.length > 0) aiSessionId.value = newSessions[newSessions.length - 1].id;
    }
  } catch (e) {
    console.error('[ChatDialog] Failed to ensure AI session:', e);
  }
}

// ======================== Incoming Message ========================

function onWsConnected() { wsConnected.value = true; }
function onWsDisconnected() { wsConnected.value = false; }

function handleIncomingMessage(data: any) {
  const fromId = Number(data.fromId);
  const message = data.message as string;
  const now = toLocalDateTime();

  let relatedFriendId: number | null = null;
  if (selectedFriendId.value && fromId === selectedFriendId.value) {
    relatedFriendId = fromId;
  } else {
    const friend = friendList.value.find(f => f.userId === fromId);
    if (friend) {
      relatedFriendId = fromId;
      if (!unreadCountMap.value[fromId]) unreadCountMap.value[fromId] = 0;
      unreadCountMap.value[fromId]++;
    }
  }

  if (relatedFriendId) {
    const chatMsg: ChatMessageDTO = { message, fromUserId: fromId, createTime: now };
    latestMessageMap.value[relatedFriendId] = chatMsg;
    appendToCache(relatedFriendId, chatMsg);

    if (selectedFriendId.value === relatedFriendId) {
      currentMessages.value.push({ ...chatMsg, isSelf: false });
      nextTick(() => scrollToBottom());
    }
  }
}

// ======================== Helpers ========================

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

function toLocalDateTime(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  const h = date.getHours().toString().padStart(2, '0');
  const mi = date.getMinutes().toString().padStart(2, '0');
  const s = date.getSeconds().toString().padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${mi}:${s}`;
}

function scrollToBottom() {
  if (messageListRef.value) messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
}

// ======================== Lifecycle ========================

onMounted(async () => {
  await loadFriends();
  eventBus.on('cocos:new-chat', handleIncomingMessage);
  eventBus.on('socket:connected', onWsConnected);
  eventBus.on('socket:disconnected', onWsDisconnected);
});

onUnmounted(() => {
  eventBus.off('cocos:new-chat', handleIncomingMessage);
  eventBus.off('socket:connected', onWsConnected);
  eventBus.off('socket:disconnected', onWsDisconnected);
});
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

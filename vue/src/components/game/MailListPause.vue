<template>
  <div class="relative w-[90vw] max-w-300 h-full flex flex-col bg-transparent text-white font-(--font-cuxi) p-5 box-border">
    <!-- 头部 -->
    <div class="flex items-center justify-between mb-4 shrink-0 border-b border-white/20 pb-4">
      <div class="flex items-center gap-4">
        <h2 class="text-[22px] font-semibold m-0 text-white tracking-widest">星海信箱</h2>
        <span class="text-[12px] text-[rgba(77,240,255,0.8)] px-2 py-0.5 border border-[rgba(77,240,255,0.4)] rounded-full">
          {{ unreadCount > 0 ? `${unreadCount} 封未读` : '全部已读' }}
        </span>
      </div>
      <button
          @click="showCompose = true"
          class="px-4 py-1.5 bg-[rgba(77,240,255,0.8)] text-black rounded-full text-[13px] font-bold hover:bg-[rgba(77,240,255,1)] transition-colors cursor-pointer"
      >
        写信
      </button>
    </div>

    <!-- 邮件列表 -->
    <div
        ref="listContainerRef"
        class="flex-1 overflow-y-auto smooth-scroll custom-scrollbar min-h-0"
    >
      <div class="flex flex-col gap-2 pb-4">
        <div
            v-for="mail in mailList"
            :key="mail.id"
            class="mail-item group relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-black/50 hover:border-[rgba(77,240,255,0.3)] transition-all duration-300 cursor-pointer"
            :class="{ 'border-l-2 border-l-[rgba(77,240,255,0.6)]': !mail.isRead }"
            @click="openMail(mail)"
        >
          <!-- 未读标记 -->
          <div v-if="!mail.isRead" class="absolute top-4 left-4 w-2 h-2 rounded-full bg-[rgba(77,240,255,0.9)]"></div>

          <div class="flex items-start gap-3" :class="mail.isRead ? 'pl-0' : 'pl-5'">
            <!-- 特殊邮件标记 -->
            <div v-if="mail.isSpecial" class="shrink-0 w-10 h-10 rounded-lg bg-[rgba(255,180,77,0.15)] flex items-center justify-center">
              <svg class="w-5 h-5 text-[rgba(255,180,77,0.8)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div v-else class="shrink-0 w-10 h-10 rounded-lg bg-[rgba(77,240,255,0.1)] flex items-center justify-center">
              <img :src="mailIcon" alt="" class="w-5 h-5 opacity-60" />
            </div>

            <!-- 内容 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <h3 class="text-[14px] font-medium truncate m-0" :class="mail.isRead ? 'text-white/70' : 'text-white'">
                  {{ mail.title || '无标题' }}
                </h3>
                <span class="shrink-0 text-[11px] text-white/30 ml-2">
                  {{ formatTime(mail.sendTime) }}
                </span>
              </div>
              <p class="text-[12px] text-white/40 m-0 truncate">
                {{ mail.content || '暂无内容' }}
              </p>
            </div>

            <!-- 删除按钮 -->
            <button
                class="shrink-0 opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all"
                @click.stop="deleteMail(mail.id)"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div class="flex items-center justify-center py-4">
          <div v-if="loading" class="w-6 h-6 border-2 border-transparent border-t-[rgba(77,240,255,0.8)] rounded-full animate-spin"></div>
          <span v-else-if="mailList.length === 0" class="text-[12px] text-white/30">
            信箱空空如也
          </span>
        </div>
      </div>
    </div>

    <!-- 写信弹窗 -->
    <Transition name="modal-fade">
      <div v-if="showCompose" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" @click.self="showCompose = false">
        <div class="w-full max-w-lg bg-[#0d1f33] border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-white m-0">写信</h3>
            <button @click="showCompose = false" class="text-white/40 hover:text-white transition-colors">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="flex flex-col gap-3">
            <input
                v-model="composeForm.title"
                type="text"
                placeholder="标题"
                class="w-full bg-black/40 border border-white/15 text-white rounded-lg px-4 py-2.5 outline-none focus:border-[rgba(77,240,255,0.6)] transition-all text-sm"
            />
            <input
                v-model.number="composeForm.receiverId"
                type="number"
                placeholder="接收者ID"
                class="w-full bg-black/40 border border-white/15 text-white rounded-lg px-4 py-2.5 outline-none focus:border-[rgba(77,240,255,0.6)] transition-all text-sm"
            />
            <textarea
                v-model="composeForm.content"
                placeholder="内容..."
                rows="5"
                class="w-full bg-black/40 border border-white/15 text-white rounded-lg px-4 py-2.5 outline-none focus:border-[rgba(77,240,255,0.6)] transition-all text-sm resize-y"
            />
            <button
                @click="sendMail"
                :disabled="!canSend"
                class="w-full py-2.5 bg-[rgba(77,240,255,0.8)] text-black rounded-lg text-sm font-bold hover:bg-[rgba(77,240,255,1)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 邮件详情弹窗 -->
    <Transition name="modal-fade">
      <div v-if="selectedMail" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" @click.self="selectedMail = null">
        <div class="w-full max-w-lg bg-[#0d1f33] border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span v-if="selectedMail.isSpecial" class="text-[rgba(255,180,77,0.8)]">
                <svg class="w-4 h-4 inline" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </span>
              <h3 class="text-lg font-semibold text-white m-0">{{ selectedMail.title }}</h3>
            </div>
            <button @click="selectedMail = null" class="text-white/40 hover:text-white transition-colors">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="text-[11px] text-white/30 mb-4">
            发送时间: {{ formatFullTime(selectedMail.sendTime) }}
          </div>

          <div class="bg-black/30 rounded-lg p-4 text-sm text-white/80 leading-relaxed whitespace-pre-wrap min-h-[100px]">
            {{ selectedMail.content }}
          </div>

          <div class="flex justify-end mt-4">
            <button
                @click="selectedMail = null"
                class="px-6 py-2 bg-white/10 text-white/70 rounded-lg text-sm hover:bg-white/20 transition-colors cursor-pointer"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '@/api'
import type { Mail, MailSendRequest } from '@/api/types'
import mailIcon from '@/assets/icons/mail.svg'

// ---------- 状态 ----------
const mailList = ref<Mail[]>([])
const loading = ref(false)
const showCompose = ref(false)
const selectedMail = ref<Mail | null>(null)

const composeForm = ref<MailSendRequest>({
  title: '',
  content: '',
  receiverId: 0
})

const canSend = computed(() =>
    composeForm.value.title.trim() &&
    composeForm.value.content.trim() &&
    composeForm.value.receiverId > 0
)

const unreadCount = computed(() =>
    mailList.value.filter(m => !m.isRead).length
)

// ---------- 时间格式化 ----------
const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${diffMin}分钟前`
  if (diffHour < 24) return `${diffHour}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const formatFullTime = (timeStr: string) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// ---------- 数据操作 ----------
const fetchMailIds = async () => {
  loading.value = true
  try {
    const ids = await api.mail.search()
    if (!ids || ids.length === 0) {
      mailList.value = []
      return
    }
    // 获取每封邮件详情
    const mailPromises = ids.map(id => api.mail.get(id).catch(() => null))
    const results = await Promise.all(mailPromises)
    mailList.value = results.filter((m): m is Mail => m !== null)
    // 按时间倒序
    mailList.value.sort((a, b) => new Date(b.sendTime).getTime() - new Date(a.sendTime).getTime())
  } catch (error) {
    console.error('[MailList] 获取邮件失败:', error)
  } finally {
    loading.value = false
  }
}

const openMail = async (mail: Mail) => {
  selectedMail.value = mail
  if (!mail.isRead) {
    mail.isRead = true
    // 后端暂无标记已读接口，仅本地更新
  }
}

const deleteMail = async (id: number) => {
  try {
    await api.mail.delete(id)
    mailList.value = mailList.value.filter(m => m.id !== id)
    if (selectedMail.value?.id === id) {
      selectedMail.value = null
    }
  } catch (error) {
    console.error('[MailList] 删除邮件失败:', error)
  }
}

const sendMail = async () => {
  if (!canSend.value) return
  try {
    await api.mail.send(composeForm.value)
    showCompose.value = false
    composeForm.value = { title: '', content: '', receiverId: 0 }
    await fetchMailIds()
  } catch (error) {
    console.error('[MailList] 发送邮件失败:', error)
  }
}

// ---------- 生命周期 ----------
onMounted(() => {
  fetchMailIds()
})
</script>

<style scoped>
.mail-item {
  will-change: transform, border-color;
}

.smooth-scroll {
  scroll-behavior: smooth;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(77, 240, 255, 0.15);
  border-radius: 3px;
  transition: background 0.3s;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(77, 240, 255, 0.4);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>

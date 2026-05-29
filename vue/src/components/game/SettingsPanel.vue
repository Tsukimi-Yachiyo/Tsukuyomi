<template>
  <div class="w-[90vw] max-w-500 h-auto max-h-[80vh] flex bg-transparent text-white font-(--font-cuxi) overflow-hidden">
    <!-- 侧边导航 -->
    <nav class="w-40 shrink-0 flex flex-col gap-1 py-4 pr-3 border-r border-[rgba(77,240,255,0.12)]">
      <button
        v-for="item in navItems"
        :key="item.id"
        class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] tracking-[0.5px] text-left border-none cursor-pointer transition-all duration-200"
        :class="activeSection === item.id
          ? 'bg-[rgba(77,240,255,0.15)] text-[rgba(77,240,255,0.95)] shadow-[inset_0_0_12px_rgba(77,240,255,0.08)]'
          : 'bg-transparent text-white/50 hover:text-white/80 hover:bg-white/[0.04]'"
        @click="switchSection(item.id)"
      >
        <img :src="item.icon" alt="icon" class="w-4 h-4 object-contain" />
        <span>{{ item.label }}</span>
      </button>
    </nav>

    <!-- 内容区域 -->
    <div class="flex-1 min-w-0 overflow-y-auto px-5 py-4 custom-scrollbar">
      <Transition name="section-fade" mode="out-in">

        <!-- ==================== 游戏设置 ==================== -->
        <div v-if="activeSection === 'game'" key="game" class="flex flex-col gap-5">
          <h3 class="text-[15px] font-semibold text-[rgba(77,240,255,0.9)] m-0 tracking-[1px]">游戏画面设置</h3>

          <div class="flex flex-col gap-3">
            <label class="flex items-center justify-between">
              <span class="text-[13px] text-white/70">全屏模式</span>
              <button
                class="relative w-11 h-6 rounded-full transition-colors duration-200 border-none cursor-pointer"
                :class="gameSettings.fullscreen ? 'bg-[rgba(77,240,255,0.6)]' : 'bg-white/15'"
                @click="toggleGameSetting('fullscreen')"
              >
                <span
                  class="absolute top-0.5 left-0 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200"
                  :class="gameSettings.fullscreen ? 'translate-x-[22px]' : 'translate-x-[2px]'"
                />
              </button>
            </label>

            <label class="flex items-center justify-between">
              <span class="text-[13px] text-white/70">画面质量</span>
              <span class="flex gap-1.5">
                <button
                  v-for="q in qualityOptions"
                  :key="q.value"
                  class="px-3 py-1 text-[11px] rounded border transition-all cursor-pointer"
                  :class="gameSettings.quality === q.value
                    ? 'bg-[rgba(77,240,255,0.2)] border-[rgba(77,240,255,0.6)] text-[rgba(77,240,255,0.9)]'
                    : 'bg-transparent border-white/15 text-white/40 hover:text-white/70'"
                  @click="setQuality(q.value)"
                >
                  {{ q.label }}
                </button>
              </span>
            </label>

            <label class="flex items-center justify-between">
              <span class="text-[13px] text-white/70">分辨率</span>
              <select
                v-model="gameSettings.resolution"
                class="bg-black/40 border border-white/10 text-[rgba(77,240,255,0.8)] text-[12px] px-2.5 py-1 rounded outline-none cursor-pointer"
                @change="persistGameSettings"
              >
                <option v-for="r in resolutionOptions" :key="r.value" :value="r.value">{{ r.label }}</option>
              </select>
            </label>

            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[13px] text-white/70">主音量</span>
                <span class="text-[12px] text-[rgba(77,240,255,0.7)] font-mono">{{ gameSettings.volume }}%</span>
              </div>
              <input
                type="range" v-model.number="gameSettings.volume"
                min="0" max="100" step="5"
                class="w-full h-1 rounded-full appearance-none bg-white/15 accent-[rgba(77,240,255,0.8)] cursor-pointer"
                @change="persistGameSettings"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[13px] text-white/70">音乐音量</span>
                <span class="text-[12px] text-[rgba(77,240,255,0.7)] font-mono">{{ gameSettings.musicVolume }}%</span>
              </div>
              <input
                type="range" v-model.number="gameSettings.musicVolume"
                min="0" max="100" step="5"
                class="w-full h-1 rounded-full appearance-none bg-white/15 accent-[rgba(77,240,255,0.8)] cursor-pointer"
                @change="persistGameSettings"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[13px] text-white/70">音效音量</span>
                <span class="text-[12px] text-[rgba(77,240,255,0.7)] font-mono">{{ gameSettings.sfxVolume }}%</span>
              </div>
              <input
                type="range" v-model.number="gameSettings.sfxVolume"
                min="0" max="100" step="5"
                class="w-full h-1 rounded-full appearance-none bg-white/15 accent-[rgba(77,240,255,0.8)] cursor-pointer"
                @change="persistGameSettings"
              />
            </div>

            <label class="flex items-center justify-between">
              <span class="text-[13px] text-white/70">显示帧率</span>
              <button
                class="relative w-11 h-6 rounded-full transition-colors duration-200 border-none cursor-pointer"
                :class="gameSettings.showFps ? 'bg-[rgba(77,240,255,0.6)]' : 'bg-white/15'"
                @click="toggleGameSetting('showFps')"
              >
                <span
                  class="absolute top-0.5 left-0 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200"
                  :class="gameSettings.showFps ? 'translate-x-[22px]' : 'translate-x-[2px]'"
                />
              </button>
            </label>

            <label class="flex items-center justify-between">
              <span class="text-[13px] text-white/70">显示按键提示</span>
              <button
                class="relative w-11 h-6 rounded-full transition-colors duration-200 border-none cursor-pointer"
                :class="gameSettings.showKeyHints ? 'bg-[rgba(77,240,255,0.6)]' : 'bg-white/15'"
                @click="toggleGameSetting('showKeyHints')"
              >
                <span
                  class="absolute top-0.5 left-0 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200"
                  :class="gameSettings.showKeyHints ? 'translate-x-[22px]' : 'translate-x-[2px]'"
                />
              </button>
            </label>
          </div>

          <button
            class="mt-2 py-2 px-4 rounded-lg text-[13px] font-medium tracking-[0.5px] border border-white/15 text-white/50 cursor-pointer transition-all duration-200 hover:text-white/80 self-start"
            @click="resetGameSettings"
          >
            恢复默认设置
          </button>
        </div>

        <!-- ==================== 用户资料 ==================== -->
        <div v-else-if="activeSection === 'profile'" key="profile" class="flex flex-col gap-4">
          <h3 class="text-[15px] font-semibold text-[rgba(77,240,255,0.9)] m-0 tracking-[1px]">用户资料编辑</h3>

          <div class="flex items-center gap-4 mb-2">
            <div class="relative">
              <UserAvatar
                :user-id="Number(userStore.userId)"
                :avatar-url="profileForm.userAvatar"
                :username="profileForm.userName"
                size="lg"
                :clickable="false"
                class="rounded-full border-2 border-[rgba(77,240,255,0.3)]"
              />
              <label
                class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[rgba(77,240,255,0.9)] flex items-center justify-center cursor-pointer hover:bg-white transition-colors"
                title="更换头像"
              >
                <input type="file" accept="image/*" class="hidden" @change="handleAvatarUpload" />
                <svg class="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </label>
            </div>
            <div class="text-[13px] text-white/60">{{ profileForm.userName || '未设置用户名' }}</div>
          </div>

          <div class="flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-[11px] text-[rgba(77,240,255,0.6)] tracking-[1px]">用户名</label>
              <input v-model="profileForm.userName" class="settings-input" placeholder="请输入用户名" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[11px] text-[rgba(77,240,255,0.6)] tracking-[1px]">个人简介</label>
              <input v-model="profileForm.userIntroduction" class="settings-input" placeholder="介绍一下自己吧..." />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <label class="text-[11px] text-[rgba(77,240,255,0.6)] tracking-[1px]">城市</label>
                <input v-model="profileForm.userCity" class="settings-input" placeholder="居住城市" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[11px] text-[rgba(77,240,255,0.6)] tracking-[1px]">生日</label>
                <input v-model="profileForm.userBirthday" class="settings-input" placeholder="YYYY-MM-DD" />
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[11px] text-[rgba(77,240,255,0.6)] tracking-[1px]">性别</label>
              <div class="flex gap-2">
                <button
                  v-for="g in genderOptions"
                  :key="g.value"
                  class="px-3.5 py-1 text-[12px] rounded border transition-all cursor-pointer"
                  :class="profileForm.userGender === g.value ? g.activeClass : 'border-white/15 text-white/40 hover:text-white/70'"
                  @click="profileForm.userGender = g.value"
                >
                  {{ g.label }}
                </button>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <label class="text-[11px] text-[rgba(77,240,255,0.6)] tracking-[1px]">邮箱</label>
                <input v-model="profileForm.userMail" class="settings-input" placeholder="your@email.com" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[11px] text-[rgba(77,240,255,0.6)] tracking-[1px]">电话</label>
                <input v-model="profileForm.userPhone" class="settings-input" placeholder="手机号" />
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[11px] text-[rgba(77,240,255,0.6)] tracking-[1px]">QQ</label>
              <input v-model="profileForm.userQQ" class="settings-input" placeholder="QQ号" />
            </div>
          </div>

          <div v-if="profileErrors.length > 0" class="space-y-1">
            <div v-for="(err, idx) in profileErrors" :key="idx" class="text-[#ff4d4d] text-[11px] flex items-center gap-1">
              <span class="inline-block w-1 h-1 rounded-full bg-[#ff4d4d]" />
              {{ err }}
            </div>
          </div>

          <div class="flex gap-2.5 pt-1">
            <button
              class="flex-1 py-2 text-[13px] font-medium rounded border border-[rgba(77,240,255,0.5)] bg-[rgba(77,240,255,0.1)] text-[rgba(77,240,255,0.9)] cursor-pointer transition-all duration-200 hover:bg-[rgba(77,240,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="profileSaving"
              @click="saveProfile"
            >
              {{ profileSaving ? '保存中...' : '保存修改' }}
            </button>
            <button
              class="flex-1 py-2 text-[13px] font-medium rounded border border-white/15 text-white/50 cursor-pointer transition-all duration-200 hover:text-white/80"
              @click="resetProfile"
            >
              重置
            </button>
          </div>
        </div>

        <!-- ==================== 按键设置 ==================== -->
        <div v-else-if="activeSection === 'keys'" key="keys" class="flex flex-col gap-4">
          <h3 class="text-[15px] font-semibold text-[rgba(77,240,255,0.9)] m-0 tracking-[1px]">键盘按键设置</h3>

          <div class="flex flex-col gap-2.5">
            <div
              v-for="(binding, idx) in keyBindings"
              :key="binding.action"
              class="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-[rgba(77,240,255,0.2)] transition-colors"
            >
              <span class="text-[13px] text-white/70">{{ binding.action }}</span>
              <div class="flex items-center gap-2">
                <kbd
                  class="inline-flex items-center justify-center min-w-[28px] h-[26px] px-2 border border-[rgba(77,240,255,0.4)] rounded bg-[rgba(77,240,255,0.08)] text-[rgba(77,240,255,0.9)] text-[12px] font-bold font-mono tracking-[1px]"
                  style="text-shadow: 0 0 6px rgba(77, 240, 255, 0.6);"
                >{{ binding.key }}</kbd>
                <button
                  class="w-6 h-6 rounded flex items-center justify-center bg-transparent border border-white/15 text-white/40 cursor-pointer transition-all duration-200 hover:border-[rgba(77,240,255,0.5)] hover:text-[rgba(77,240,255,0.8)]"
                  @click="startRebind(idx)"
                  title="修改按键"
                >
                  <img :src="editIcon" alt="修改按键" class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div
            v-if="rebindingIndex !== null"
            class="flex items-center justify-center py-4 rounded-lg border-2 border-dashed border-[rgba(77,240,255,0.4)] bg-[rgba(77,240,255,0.05)] text-[rgba(77,240,255,0.9)] text-[13px] animate-pulse"
          >
            请按下新的按键... (ESC 取消)
          </div>

          <button
            class="mt-1 py-2 px-4 rounded-lg text-[13px] font-medium tracking-[0.5px] border border-white/15 text-white/50 cursor-pointer transition-all duration-200 hover:text-white/80 self-start"
            @click="resetKeyBindings"
          >
            恢复默认按键
          </button>
        </div>

        <!-- ==================== 账号安全 ==================== -->
        <div v-else-if="activeSection === 'security'" key="security" class="flex flex-col gap-5">
          <h3 class="text-[15px] font-semibold text-[rgba(77,240,255,0.9)] m-0 tracking-[1px]">账号安全</h3>

          <div class="flex flex-col gap-3 p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <h4 class="text-[13px] text-[rgba(77,240,255,0.8)] m-0">修改密码</h4>
            <input v-model="passwordForm.password" type="password" class="settings-input" placeholder="新密码" />
            <input v-model="passwordForm.email" type="email" class="settings-input" placeholder="绑定邮箱" />
            <div class="flex gap-2">
              <input v-model="passwordForm.code" class="settings-input flex-1" placeholder="验证码" />
              <button
                class="shrink-0 px-3 py-1.5 text-[11px] rounded border border-[rgba(77,240,255,0.4)] bg-[rgba(77,240,255,0.08)] text-[rgba(77,240,255,0.8)] cursor-pointer transition-all duration-200 hover:bg-[rgba(77,240,255,0.15)] disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                :disabled="codeCooldown > 0 || !passwordForm.email"
                @click="sendVerifyCode"
              >
                {{ codeCooldown > 0 ? `${codeCooldown}s` : '发送验证码' }}
              </button>
            </div>
            <button
              class="py-2 text-[13px] font-medium rounded border border-[rgba(77,240,255,0.5)] bg-[rgba(77,240,255,0.1)] text-[rgba(77,240,255,0.9)] cursor-pointer transition-all duration-200 hover:bg-[rgba(77,240,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="passwordSaving"
              @click="changePassword"
            >
              {{ passwordSaving ? '修改中...' : '确认修改密码' }}
            </button>
          </div>

          <div class="flex flex-col gap-3 p-3.5 rounded-lg bg-white/[0.02] border border-[rgba(255,100,100,0.15)]">
            <h4 class="text-[13px] text-[rgba(255,120,120,0.9)] m-0">危险操作</h4>
            <p class="text-[11px] text-white/40 m-0 leading-relaxed">
              冻结账号后，你将无法登录。账号数据会被保留，但需要联系管理员才能解冻。
            </p>
            <button
              class="py-2 text-[13px] font-medium rounded border border-[rgba(255,100,100,0.4)] bg-[rgba(255,100,100,0.08)] text-[rgba(255,120,120,0.9)] cursor-pointer transition-all duration-200 hover:bg-[rgba(255,100,100,0.15)] self-start"
              @click="freezeAccount"
            >
              冻结我的账号
            </button>
          </div>
        </div>

        <!-- ==================== 用户协议 ==================== -->
        <div v-else-if="activeSection === 'agreement'" key="agreement" class="flex flex-col gap-3">
          <h3 class="text-[15px] font-semibold text-[rgba(77,240,255,0.9)] m-0 tracking-[1px]">用户协议</h3>
          <div class="w-full h-[65vh] rounded-lg overflow-hidden border border-white/10 bg-black/30">
            <iframe
              src="/pdf/Disclaimers.pdf"
              class="w-full h-full border-none"
              title="用户协议"
            />
          </div>
        </div>

        <!-- ==================== 关于我们 ==================== -->
        <div v-else-if="activeSection === 'about'" key="about" class="flex flex-col gap-4 overflow-y-auto max-h-[68vh] custom-scrollbar">
          <h3 class="text-[15px] font-semibold text-[rgba(77,240,255,0.9)] m-0 tracking-[1px]">关于我们</h3>

          <section>
            <div class="inline-block text-[10px] text-[rgba(77,240,255,0.8)] border border-[rgba(77,240,255,0.2)] px-2 py-0.5 tracking-[2px] uppercase mb-2">游戏 / Game</div>
            <h4 class="text-[14px] text-white m-0 mb-2">
              <span style="text-shadow: 0 0 12px rgba(77,240,255,0.4);">《超时空辉夜姬》</span>
            </h4>
            <p class="text-[12px] leading-relaxed text-white/60 m-0">
              一款融合了像素艺术与 AI 技术的多人在线游戏。
              在这里，你将进入一个由代码构建的赛博世界，与来自各地的玩家一起冒险、交流、创造属于你们的故事。
            </p>
            <div class="grid grid-cols-3 gap-2.5 mt-3">
              <div class="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-3 text-center">
                <div class="text-[11px] text-[rgba(77,240,255,0.9)] mb-1.5 font-mono tracking-[2px]">[MP]</div>
                <h5 class="text-[11px] text-white m-0 mb-1 tracking-[1px]">多人联机</h5>
                <p class="text-[10px] text-white/40 m-0 leading-relaxed">与其他玩家实时互动</p>
              </div>
              <div class="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-3 text-center">
                <div class="text-[11px] text-[rgba(77,240,255,0.9)] mb-1.5 font-mono tracking-[2px]">[AI]</div>
                <h5 class="text-[11px] text-white m-0 mb-1 tracking-[1px]">AI 对话</h5>
                <p class="text-[10px] text-white/40 m-0 leading-relaxed">内置 AI 聊天模型</p>
              </div>
              <div class="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-3 text-center">
                <div class="text-[11px] text-[rgba(77,240,255,0.9)] mb-1.5 font-mono tracking-[2px]">[PX]</div>
                <h5 class="text-[11px] text-white m-0 mb-1 tracking-[1px]">像素美学</h5>
                <p class="text-[10px] text-white/40 m-0 leading-relaxed">精心打磨的像素风格</p>
              </div>
            </div>
          </section>

          <section>
            <div class="inline-block text-[10px] text-[rgba(77,240,255,0.8)] border border-[rgba(77,240,255,0.2)] px-2 py-0.5 tracking-[2px] uppercase mb-2">团队 / Team</div>
            <h4 class="text-[14px] text-white m-0 mb-2">
              <span style="text-shadow: 0 0 12px rgba(77,240,255,0.4);">月读工作室 / Tsukuyomi Studio</span>
            </h4>
            <p class="text-[12px] leading-relaxed text-white/60 m-0">
              我们是一支充满热情的小型团队，热爱游戏，热爱技术，热爱创造。
              虽然人不多，但每个人都身怀绝技。我们相信，好游戏不需要大团队，只需要用心去做。
            </p>
          </section>

          <section>
            <div class="inline-block text-[10px] text-[rgba(77,240,255,0.8)] border border-[rgba(77,240,255,0.2)] px-2 py-0.5 tracking-[2px] uppercase mb-2">技术 / Tech</div>
            <div class="flex flex-wrap gap-1.5 mt-2">
              <span v-for="tech in techStack" :key="tech" class="text-[10px] text-[rgba(77,240,255,0.8)] border border-[rgba(77,240,255,0.2)] px-2.5 py-1 rounded tracking-[1px] bg-[rgba(77,240,255,0.04)]">
                {{ tech }}
              </span>
            </div>
          </section>

          <section>
            <div class="inline-block text-[10px] text-[rgba(77,240,255,0.8)] border border-[rgba(77,240,255,0.2)] px-2 py-0.5 tracking-[2px] uppercase mb-2">联系 / Contact</div>
            <div class="grid grid-cols-3 gap-2 mt-2">
              <a href="https://github.com/Tsukimi-Yachiyo" target="_blank" rel="noopener" class="flex flex-col items-center gap-1 px-3 py-3 bg-white/[0.02] border border-white/[0.06] rounded-lg no-underline text-inherit transition-all duration-200 hover:border-[rgba(77,240,255,0.3)]">
                <span class="text-[11px] text-[rgba(77,240,255,0.9)] font-mono tracking-[2px]">[GH]</span>
                <span class="text-[11px] text-white tracking-[1px]">GitHub</span>
              </a>
              <div class="flex flex-col items-center gap-1 px-3 py-3 bg-white/2 border border-white/6 rounded-lg cursor-pointer transition-all duration-200 hover:border-[rgba(77,240,255,0.3)]" @click="copyQQ">
                <span class="text-[11px] text-[rgba(77,240,255,0.9)] font-mono tracking-[2px]">[QQ]</span>
                <span class="text-[11px] text-white tracking-[1px]">QQ 群</span>
              </div>
              <a href="https://space.bilibili.com/1543748387" target="_blank" rel="noopener" class="flex flex-col items-center gap-1 px-3 py-3 bg-white/[0.02] border border-white/[0.06] rounded-lg no-underline text-inherit transition-all duration-200 hover:border-[rgba(77,240,255,0.3)]">
                <span class="text-[11px] text-[rgba(77,240,255,0.9)] font-mono tracking-[2px]">[BV]</span>
                <span class="text-[11px] text-white tracking-[1px]">Bilibili</span>
              </a>
            </div>
          </section>

          <button
            class="w-full py-2 rounded-lg text-[13px] font-medium tracking-[0.5px] border border-[rgba(77,240,255,0.5)] bg-[rgba(77,240,255,0.1)] text-[rgba(77,240,255,0.9)] cursor-pointer transition-all duration-200 hover:bg-[rgba(77,240,255,0.2)]"
            @click="showAboutPage"
          >
            查看完整关于页面
          </button>

          <footer class="text-center pt-3 border-t border-white/6 mt-2">
            <p class="text-[10px] text-white/25 m-0 tracking-[2px]">&copy; 2026 月读工作室 / Tsukuyomi Studio</p>
          </footer>
        </div>

      </Transition>
    </div>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.visible" class="fixed top-10 left-1/2 -translate-x-1/2 bg-[rgba(77,240,255,0.15)] border border-[rgba(77,240,255,0.4)] text-[rgba(77,240,255,0.95)] px-5 py-2 rounded-md text-[12px] tracking-[1px] z-[9999] backdrop-blur-xl">
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, reactive, ref} from 'vue';
import {api} from '@/api';
import {useUserStore} from '@/store/userStore';
import UserAvatar from '@/components/UserAvatar.vue';
import settingIcon from '@/assets/icons/setting.svg';
import userTabIcon from '@/assets/icons/user-tab.svg';
import keyboardIcon from '@/assets/icons/keyboard.svg';
import shieldIcon from '@/assets/icons/shield.svg';
import documentIcon from '@/assets/icons/document.svg';
import infoIcon from '@/assets/icons/info.svg';
import editIcon from '@/assets/icons/edit.svg';

const userStore = useUserStore();

// --- localStorage 工具 ---
const STORAGE_PREFIX = 'tsukuyomi_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
}

// --- 导航 ---
type SectionId = 'game' | 'profile' | 'keys' | 'security' | 'agreement' | 'about';

const navItems: { id: SectionId; icon: string; label: string }[] = [
  { id: 'game', icon: settingIcon, label: '游戏设置' },
  { id: 'profile', icon: userTabIcon, label: '用户资料' },
  { id: 'keys', icon: keyboardIcon, label: '按键设置' },
  { id: 'security', icon: shieldIcon, label: '账号安全' },
  { id: 'agreement', icon: documentIcon, label: '用户协议' },
  { id: 'about', icon: infoIcon, label: '关于我们' },
];

const activeSection = ref<SectionId>(loadFromStorage('settings_section', 'game'));

function switchSection(id: SectionId) {
  activeSection.value = id;
  saveToStorage('settings_section', id);
}

// --- Toast ---
const toast = reactive({ visible: false, message: '' });
function showToast(msg: string) {
  toast.message = msg;
  toast.visible = true;
  setTimeout(() => { toast.visible = false; }, 2000);
}

// ==================== 游戏设置 ====================
const qualityOptions = [
  { value: 'low' as const, label: '低' },
  { value: 'medium' as const, label: '中' },
  { value: 'high' as const, label: '高' },
];

const resolutionOptions = [
  { value: '1280x720', label: '1280 x 720' },
  { value: '1600x900', label: '1600 x 900' },
  { value: '1920x1080', label: '1920 x 1080' },
  { value: '2560x1440', label: '2560 x 1440' },
];

interface GameSettings {
  fullscreen: boolean;
  quality: 'low' | 'medium' | 'high';
  resolution: string;
  volume: number;
  musicVolume: number;
  sfxVolume: number;
  showFps: boolean;
  showKeyHints: boolean;
}

const defaultGameSettings: GameSettings = {
  fullscreen: false,
  quality: 'medium',
  resolution: '1920x1080',
  volume: 80,
  musicVolume: 60,
  sfxVolume: 70,
  showFps: false,
  showKeyHints: true,
};

const gameSettings = reactive<GameSettings>(loadFromStorage('game_settings', { ...defaultGameSettings }));

function persistGameSettings() {
  saveToStorage('game_settings', { ...gameSettings });
}

function toggleGameSetting(key: 'fullscreen' | 'showFps' | 'showKeyHints') {
  gameSettings[key] = !gameSettings[key];
  persistGameSettings();
}

function setQuality(q: 'low' | 'medium' | 'high') {
  gameSettings.quality = q;
  persistGameSettings();
}

function resetGameSettings() {
  Object.assign(gameSettings, defaultGameSettings);
  persistGameSettings();
  showToast('游戏设置已恢复默认');
}

// ==================== 用户资料 ====================
interface ProfileForm {
  userName: string;
  userIntroduction: string;
  userCity: string;
  userGender: string;
  userPhone: string;
  userQQ: string;
  userMail: string;
  userBirthday: string;
  userAvatar: string;
}

const profileForm = reactive<ProfileForm>({
  userName: '', userIntroduction: '', userCity: '', userGender: 'OTHER',
  userPhone: '', userQQ: '', userMail: '', userBirthday: '', userAvatar: '',
});

const profileErrors = ref<string[]>([]);
const profileSaving = ref(false);

const genderOptions = [
  { value: 'MALE', label: '男', activeClass: 'bg-[rgba(77,240,255,0.2)] border-[rgba(77,240,255,0.6)] text-[rgba(77,240,255,0.9)]' },
  { value: 'FEMALE', label: '女', activeClass: 'bg-[rgba(255,112,166,0.2)] border-[rgba(255,112,166,0.6)] text-[rgba(255,112,166,0.9)]' },
  { value: 'OTHER', label: '保密', activeClass: 'bg-[rgba(77,240,255,0.15)] border-[rgba(77,240,255,0.4)] text-[rgba(77,240,255,0.8)]' },
];

function initProfileForm() {
  const info = userStore.userInfo;
  if (info) {
    profileForm.userName = info.userName || '';
    profileForm.userIntroduction = info.userIntroduction || '';
    profileForm.userCity = info.userCity || '';
    profileForm.userGender = info.userGender || 'OTHER';
    profileForm.userPhone = info.userPhone || '';
    profileForm.userQQ = info.userQQ || '';
    profileForm.userMail = info.userMail || '';
    profileForm.userBirthday = info.userBirthday || '';
    profileForm.userAvatar = info.userAvatar || '';
  }
}

function validateProfile(): boolean {
  profileErrors.value = [];
  if (!profileForm.userName.trim()) profileErrors.value.push('用户名不能为空');
  if (profileForm.userMail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.userMail)) profileErrors.value.push('邮箱格式不正确');
  if (profileForm.userPhone && !/^1\d{10}$/.test(profileForm.userPhone)) profileErrors.value.push('手机号格式不正确');
  if (profileForm.userBirthday && !/^\d{4}-\d{2}-\d{2}$/.test(profileForm.userBirthday)) profileErrors.value.push('生日格式应为 YYYY-MM-DD');
  if (profileForm.userQQ && !/^\d{5,12}$/.test(profileForm.userQQ)) profileErrors.value.push('QQ号格式不正确');
  return profileErrors.value.length === 0;
}

async function saveProfile() {
  if (!validateProfile()) return;
  profileSaving.value = true;
  try {
    await api.user.updateDetail({
      userName: profileForm.userName.trim(),
      userIntroduction: profileForm.userIntroduction,
      userCity: profileForm.userCity,
      userGender: profileForm.userGender,
      userPhone: profileForm.userPhone,
      userQQ: profileForm.userQQ,
      userMail: profileForm.userMail,
      userBirthday: profileForm.userBirthday,
    });
    await userStore.loadSelfUserInfo();
    saveToStorage('user_profile_cache', {
      userName: profileForm.userName,
      userIntroduction: profileForm.userIntroduction,
      userCity: profileForm.userCity,
      userGender: profileForm.userGender,
    });
    showToast('资料已更新');
  } catch {
    showToast('保存失败，请重试');
  } finally {
    profileSaving.value = false;
  }
}

function resetProfile() {
  initProfileForm();
  profileErrors.value = [];
}

async function handleAvatarUpload(e: Event) {
  const target = e.target as HTMLInputElement;
  if (!target.files?.length) return;
  const file = target.files[0];
  if (!file.type.startsWith('image/')) return;
  const formData = new FormData();
  formData.append('avatar', file);
  try {
    await api.user.updateAvatar(formData);
    await userStore.loadSelfUserInfo();
    profileForm.userAvatar = userStore.userInfo?.userAvatar || '';
    showToast('头像已更新');
  } catch {
    showToast('头像上传失败');
  }
  target.value = '';
}

// ==================== 按键设置 ====================
interface KeyBinding {
  action: string;
  key: string;
  defaultKey: string;
}

const defaultKeyBindings: KeyBinding[] = [
  { action: '向上移动', key: 'W', defaultKey: 'W' },
  { action: '向下移动', key: 'S', defaultKey: 'S' },
  { action: '向左移动', key: 'A', defaultKey: 'A' },
  { action: '向右移动', key: 'D', defaultKey: 'D' },
  { action: '切换左视角', key: 'Q', defaultKey: 'Q' },
  { action: '切换右视角', key: 'E', defaultKey: 'E' },
  { action: '暂停 / 菜单', key: 'Escape', defaultKey: 'Escape' },
  { action: '交互 / 确认', key: 'Enter', defaultKey: 'Enter' },
];

const keyBindings = ref<KeyBinding[]>([]);
const rebindingIndex = ref<number | null>(null);

function loadKeyBindings() {
  const saved = loadFromStorage<{ action: string; key: string }[] | null>('key_bindings', null);
  if (saved && Array.isArray(saved)) {
    keyBindings.value = defaultKeyBindings.map(d => {
      const s = saved.find(p => p.action === d.action);
      return { ...d, key: s?.key || d.defaultKey };
    });
  } else {
    keyBindings.value = defaultKeyBindings.map(d => ({ ...d }));
  }
}

function persistKeyBindings() {
  saveToStorage('key_bindings', keyBindings.value.map(b => ({ action: b.action, key: b.key })));
}

function startRebind(idx: number) {
  rebindingIndex.value = idx;
}

function onRebindKeydown(e: KeyboardEvent) {
  if (rebindingIndex.value === null) return;
  e.preventDefault();
  e.stopPropagation();

  if (e.key === 'Escape') {
    rebindingIndex.value = null;
    return;
  }

  keyBindings.value[rebindingIndex.value].key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
  rebindingIndex.value = null;
  persistKeyBindings();
  showToast('按键已更新');
}

function resetKeyBindings() {
  keyBindings.value = defaultKeyBindings.map(d => ({ ...d }));
  persistKeyBindings();
  showToast('按键已恢复默认');
}

// ==================== 账号安全 ====================
const passwordForm = reactive(loadFromStorage('password_draft', { password: '', email: '', code: '' }));
const passwordSaving = ref(false);
const codeCooldown = ref(0);
let cooldownTimer: ReturnType<typeof setInterval> | null = null;

async function sendVerifyCode() {
  if (!passwordForm.email) return;
  try {
    await userStore.sendCode(passwordForm.email);
    showToast('验证码已发送');
    codeCooldown.value = 60;
    cooldownTimer = setInterval(() => {
      codeCooldown.value--;
      if (codeCooldown.value <= 0 && cooldownTimer) {
        clearInterval(cooldownTimer);
        cooldownTimer = null;
      }
    }, 1000);
  } catch {
    showToast('验证码发送失败');
  }
}

async function changePassword() {
  if (!passwordForm.password || !passwordForm.email || !passwordForm.code) {
    showToast('请填写完整信息');
    return;
  }
  passwordSaving.value = true;
  try {
    await userStore.changePassword({
      username: userStore.username,
      password: passwordForm.password,
      email: passwordForm.email,
      code: passwordForm.code,
    });
    showToast('密码修改成功');
    passwordForm.password = '';
    passwordForm.code = '';
    saveToStorage('password_draft', { password: '', email: passwordForm.email, code: '' });
  } catch {
    showToast('密码修改失败');
  } finally {
    passwordSaving.value = false;
  }
}

async function freezeAccount() {
  if (!confirm('确定要冻结账号吗？此操作不可逆，需要联系管理员才能解冻。')) return;
  try {
    await api.auth.freeze();
    showToast('账号已冻结');
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) localStorage.removeItem(key);
    });
    userStore.logout();
    window.location.reload();
  } catch {
    showToast('冻结失败，请重试');
  }
}

// ==================== 关于我们 ====================
const techStack = [
  'Vue 3', 'TypeScript', 'Cocos Creator 3.8', 'Tailwind CSS',
  'WebSocket', 'Protobuf', 'Pinia',
  'Spring Boot', 'Spring AI', 'Redis', 'PostgreSQL',
];

async function copyQQ() {
  try {
    await navigator.clipboard.writeText('1094218305');
    showToast('QQ 群号已复制: 1094218305');
  } catch {
    showToast('复制失败，请手动复制: 1094218305');
  }
}

function showAboutPage() {
  window.open('/#/about', '_blank');
}
// --- 生命周期 ---
onMounted(() => {
  loadKeyBindings();
  initProfileForm();
  window.addEventListener('keydown', onRebindKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onRebindKeydown);
  if (cooldownTimer) clearInterval(cooldownTimer);
});
</script>

<style scoped>
.settings-input {
  width: 100%;
  box-sizing: border-box;
  padding: 7px 10px;
  font-size: 12px;
  font-family: 'Courier New', Courier, monospace;
  color: rgba(77, 240, 255, 0.85);
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  outline: none;
  transition: all 0.2s;
  text-shadow: 0 0 5px rgba(77, 240, 255, 0.3);
}

.settings-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
  text-shadow: none;
}

.settings-input:focus {
  background: rgba(77, 240, 255, 0.06);
  border-color: rgba(77, 240, 255, 0.3);
  box-shadow: inset 0 0 10px rgba(77, 240, 255, 0.05);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(77, 240, 255, 0.2);
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(77, 240, 255, 0.4);
}

.section-fade-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.section-fade-leave-active {
  transition: opacity 0.15s ease;
}
.section-fade-enter-from {
  opacity: 0;
  transform: translateX(8px);
}
.section-fade-leave-to {
  opacity: 0;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}
</style>

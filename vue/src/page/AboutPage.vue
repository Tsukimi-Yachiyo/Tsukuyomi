<template>
  <div class="h-screen overflow-y-auto overflow-x-hidden bg-[#0a0a0f] text-[#e0e0e0] relative [font-family:var(--font-holo)]">
    <div class="fixed inset-0 [background-image:linear-gradient(rgba(77,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(77,240,255,0.03)_1px,transparent_1px)] [background-size:40px_40px] pointer-events-none z-0" />

    <div class="relative z-10 max-w-[800px] mx-auto px-6 py-[60px]">
      <!-- 标题 -->
      <header class="text-center mb-[60px]">
        <h1 class="text-[2.5rem] text-[var(--theme-color)] [text-shadow:0_0_20px_var(--theme-color-glow)] m-0 [letter-spacing:8px]">关于我们</h1>
        <h2 class="text-base text-white/40 font-normal mt-2 mb-0 [letter-spacing:4px] uppercase">About Us</h2>
        <div class="w-[60px] h-[2px] bg-[var(--theme-color)] mx-auto mt-5 [box-shadow:0_0_10px_var(--theme-color-glow)]" />
      </header>

      <!-- 游戏介绍 -->
      <section class="mb-14">
        <div class="inline-block text-[0.7rem] text-[var(--theme-color)] border border-[rgba(77,240,255,0.3)] px-3 py-1 [letter-spacing:2px] uppercase mb-4">游戏 / Game</div>
        <h3 class="text-[1.3rem] text-white m-0 mb-4 leading-relaxed">
          <span class="[text-shadow:0_0_12px_var(--theme-color-glow)]">《超时空辉夜姬》</span>
        </h3>
        <p class="text-sm leading-relaxed text-white/75 m-0 mb-2">
          一款融合了像素艺术与 AI 技术的多人在线游戏。
          在这里，你将进入一个由代码构建的赛博世界，与来自各地的玩家一起冒险、交流、创造属于你们的故事。
        </p>
        <p class="text-[0.8rem] leading-relaxed text-white/40 m-0 italic">
          A multiplayer online game that fuses pixel art with AI technology.
          Step into a cyber world built from code, where you can adventure, chat, and create your own stories with players from around the globe.
        </p>

        <div class="grid grid-cols-3 gap-4 mt-6">
          <div class="bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-5 text-center transition-all duration-300 hover:border-[rgba(77,240,255,0.2)] hover:bg-[rgba(77,240,255,0.03)] hover:-translate-y-0.5">
            <div class="text-[1.2rem] text-[var(--theme-color)] mb-3 [font-family:monospace] [letter-spacing:2px]">[MP]</div>
            <h4 class="text-[0.8rem] text-white m-0 mb-2 [letter-spacing:1px]">多人联机 / Multiplayer</h4>
            <p class="text-[0.75rem] text-white/50 m-0 leading-relaxed">与其他玩家实时互动，共同探索赛博世界</p>
          </div>
          <div class="bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-5 text-center transition-all duration-300 hover:border-[rgba(77,240,255,0.2)] hover:bg-[rgba(77,240,255,0.03)] hover:-translate-y-0.5">
            <div class="text-[1.2rem] text-[var(--theme-color)] mb-3 [font-family:monospace] [letter-spacing:2px]">[AI]</div>
            <h4 class="text-[0.8rem] text-white m-0 mb-2 [letter-spacing:1px]">AI 对话 / AI Chat</h4>
            <p class="text-[0.75rem] text-white/50 m-0 leading-relaxed">内置 AI 聊天模型，NPC 也能和你谈天说地</p>
          </div>
          <div class="bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-5 text-center transition-all duration-300 hover:border-[rgba(77,240,255,0.2)] hover:bg-[rgba(77,240,255,0.03)] hover:-translate-y-0.5">
            <div class="text-[1.2rem] text-[var(--theme-color)] mb-3 [font-family:monospace] [letter-spacing:2px]">[PX]</div>
            <h4 class="text-[0.8rem] text-white m-0 mb-2 [letter-spacing:1px]">像素美学 / Pixel Art</h4>
            <p class="text-[0.75rem] text-white/50 m-0 leading-relaxed">精心打磨的像素风格，每一帧都是一幅画</p>
          </div>
        </div>
      </section>

      <!-- 团队介绍 -->
      <section class="mb-14">
        <div class="inline-block text-[0.7rem] text-[var(--theme-color)] border border-[rgba(77,240,255,0.3)] px-3 py-1 [letter-spacing:2px] uppercase mb-4">团队 / Team</div>
        <h3 class="text-[1.3rem] text-white m-0 mb-4 leading-relaxed">
          <span class="[text-shadow:0_0_12px_var(--theme-color-glow)]">月读工作室 / Tsukuyomi Studio</span>
        </h3>
        <p class="text-sm leading-relaxed text-white/75 m-0 mb-2">
          我们是一支充满热情的小型团队，热爱游戏，热爱技术，热爱创造。
          虽然人不多，但每个人都身怀绝技。我们相信，好游戏不需要大团队，只需要用心去做。
        </p>
        <p class="text-[0.8rem] leading-relaxed text-white/40 m-0 italic">
          We are a passionate small team that loves games, technology, and creation.
          Though small in number, each of us brings unique skills. We believe great games don't need big teams — just heart.
        </p>
      </section>

      <!-- 技术栈 -->
      <section class="mb-14">
        <div class="inline-block text-[0.7rem] text-[var(--theme-color)] border border-[rgba(77,240,255,0.3)] px-3 py-1 [letter-spacing:2px] uppercase mb-4">技术 / Tech Stack</div>
        <h3 class="text-[1.3rem] text-white m-0 mb-4 leading-relaxed">我们用了什么 / Our Tech Stack</h3>
        <div class="text-[0.7rem] text-white/40 [letter-spacing:2px] mt-4 mb-2">前端 / Frontend</div>
        <div class="flex flex-wrap gap-2.5 mt-4">
          <span class="text-[0.7rem] text-[var(--theme-color)] border border-[rgba(77,240,255,0.25)] px-3.5 py-1.5 rounded-[4px] [letter-spacing:1px] bg-[rgba(77,240,255,0.04)] transition-all duration-200 hover:bg-[rgba(77,240,255,0.1)] hover:border-[rgba(77,240,255,0.5)]">Vue 3</span>
          <span class="text-[0.7rem] text-[var(--theme-color)] border border-[rgba(77,240,255,0.25)] px-3.5 py-1.5 rounded-[4px] [letter-spacing:1px] bg-[rgba(77,240,255,0.04)] transition-all duration-200 hover:bg-[rgba(77,240,255,0.1)] hover:border-[rgba(77,240,255,0.5)]">TypeScript</span>
          <span class="text-[0.7rem] text-[var(--theme-color)] border border-[rgba(77,240,255,0.25)] px-3.5 py-1.5 rounded-[4px] [letter-spacing:1px] bg-[rgba(77,240,255,0.04)] transition-all duration-200 hover:bg-[rgba(77,240,255,0.1)] hover:border-[rgba(77,240,255,0.5)]">Cocos Creator 3.8</span>
          <span class="text-[0.7rem] text-[var(--theme-color)] border border-[rgba(77,240,255,0.25)] px-3.5 py-1.5 rounded-[4px] [letter-spacing:1px] bg-[rgba(77,240,255,0.04)] transition-all duration-200 hover:bg-[rgba(77,240,255,0.1)] hover:border-[rgba(77,240,255,0.5)]">Tailwind CSS</span>
          <span class="text-[0.7rem] text-[var(--theme-color)] border border-[rgba(77,240,255,0.25)] px-3.5 py-1.5 rounded-[4px] [letter-spacing:1px] bg-[rgba(77,240,255,0.04)] transition-all duration-200 hover:bg-[rgba(77,240,255,0.1)] hover:border-[rgba(77,240,255,0.5)]">WebSocket</span>
          <span class="text-[0.7rem] text-[var(--theme-color)] border border-[rgba(77,240,255,0.25)] px-3.5 py-1.5 rounded-[4px] [letter-spacing:1px] bg-[rgba(77,240,255,0.04)] transition-all duration-200 hover:bg-[rgba(77,240,255,0.1)] hover:border-[rgba(77,240,255,0.5)]">Protobuf</span>
          <span class="text-[0.7rem] text-[var(--theme-color)] border border-[rgba(77,240,255,0.25)] px-3.5 py-1.5 rounded-[4px] [letter-spacing:1px] bg-[rgba(77,240,255,0.04)] transition-all duration-200 hover:bg-[rgba(77,240,255,0.1)] hover:border-[rgba(77,240,255,0.5)]">Pinia</span>
        </div>
        <div class="text-[0.7rem] text-white/40 [letter-spacing:2px] mt-4 mb-2">后端 / Backend</div>
        <div class="flex flex-wrap gap-2.5 mt-4">
          <span class="text-[0.7rem] text-[var(--theme-color)] border border-[rgba(77,240,255,0.25)] px-3.5 py-1.5 rounded-[4px] [letter-spacing:1px] bg-[rgba(77,240,255,0.04)] transition-all duration-200 hover:bg-[rgba(77,240,255,0.1)] hover:border-[rgba(77,240,255,0.5)]">Spring Boot</span>
          <span class="text-[0.7rem] text-[var(--theme-color)] border border-[rgba(77,240,255,0.25)] px-3.5 py-1.5 rounded-[4px] [letter-spacing:1px] bg-[rgba(77,240,255,0.04)] transition-all duration-200 hover:bg-[rgba(77,240,255,0.1)] hover:border-[rgba(77,240,255,0.5)]">Spring AI</span>
          <span class="text-[0.7rem] text-[var(--theme-color)] border border-[rgba(77,240,255,0.25)] px-3.5 py-1.5 rounded-[4px] [letter-spacing:1px] bg-[rgba(77,240,255,0.04)] transition-all duration-200 hover:bg-[rgba(77,240,255,0.1)] hover:border-[rgba(77,240,255,0.5)]">Spring WebFlux</span>
          <span class="text-[0.7rem] text-[var(--theme-color)] border border-[rgba(77,240,255,0.25)] px-3.5 py-1.5 rounded-[4px] [letter-spacing:1px] bg-[rgba(77,240,255,0.04)] transition-all duration-200 hover:bg-[rgba(77,240,255,0.1)] hover:border-[rgba(77,240,255,0.5)]">Spring MVC</span>
          <span class="text-[0.7rem] text-[var(--theme-color)] border border-[rgba(77,240,255,0.25)] px-3.5 py-1.5 rounded-[4px] [letter-spacing:1px] bg-[rgba(77,240,255,0.04)] transition-all duration-200 hover:bg-[rgba(77,240,255,0.1)] hover:border-[rgba(77,240,255,0.5)]">Redis</span>
          <span class="text-[0.7rem] text-[var(--theme-color)] border border-[rgba(77,240,255,0.25)] px-3.5 py-1.5 rounded-[4px] [letter-spacing:1px] bg-[rgba(77,240,255,0.04)] transition-all duration-200 hover:bg-[rgba(77,240,255,0.1)] hover:border-[rgba(77,240,255,0.5)]">PostgreSQL</span>
          <span class="text-[0.7rem] text-[var(--theme-color)] border border-[rgba(77,240,255,0.25)] px-3.5 py-1.5 rounded-[4px] [letter-spacing:1px] bg-[rgba(77,240,255,0.04)] transition-all duration-200 hover:bg-[rgba(77,240,255,0.1)] hover:border-[rgba(77,240,255,0.5)]">Nacos</span>
          <span class="text-[0.7rem] text-[var(--theme-color)] border border-[rgba(77,240,255,0.25)] px-3.5 py-1.5 rounded-[4px] [letter-spacing:1px] bg-[rgba(77,240,255,0.04)] transition-all duration-200 hover:bg-[rgba(77,240,255,0.1)] hover:border-[rgba(77,240,255,0.5)]">Python FastAPI</span>
          <span class="text-[0.7rem] text-[var(--theme-color)] border border-[rgba(77,240,255,0.25)] px-3.5 py-1.5 rounded-[4px] [letter-spacing:1px] bg-[rgba(77,240,255,0.04)] transition-all duration-200 hover:bg-[rgba(77,240,255,0.1)] hover:border-[rgba(77,240,255,0.5)]">LangGraph</span>
        </div>
      </section>

      <!-- 加入我们 -->
      <section class="mb-14">
        <div class="inline-block text-[0.7rem] text-[var(--theme-color)] border border-[rgba(77,240,255,0.3)] px-3 py-1 [letter-spacing:2px] uppercase mb-4">加入 / Join Us</div>
        <h3 class="text-[1.3rem] text-white m-0 mb-4 leading-relaxed">一起创造 / Build Together</h3>
        <p class="text-sm leading-relaxed text-white/75 m-0 mb-2">
          我们正在寻找志同道合的伙伴。无论你是程序员、像素画师、剧情策划还是音乐创作者，
          只要你对游戏充满热情，我们都欢迎你的加入。
        </p>
        <p class="text-[0.8rem] leading-relaxed text-white/40 m-0 italic">
          We're looking for like-minded creators. Whether you're a programmer, pixel artist, story writer, or music composer —
          if you're passionate about games, you're welcome here.
        </p>
        <div class="flex flex-wrap gap-2.5 mt-5">
          <span class="text-[0.7rem] text-white border border-white/[0.15] px-4 py-2 rounded-[4px] [letter-spacing:1px] bg-white/[0.03]">前端开发 / Frontend Dev</span>
          <span class="text-[0.7rem] text-white border border-white/[0.15] px-4 py-2 rounded-[4px] [letter-spacing:1px] bg-white/[0.03]">Cocos 开发 / Cocos Dev</span>
          <span class="text-[0.7rem] text-white border border-white/[0.15] px-4 py-2 rounded-[4px] [letter-spacing:1px] bg-white/[0.03]">后端开发 / Backend Dev</span>
          <span class="text-[0.7rem] text-white border border-white/[0.15] px-4 py-2 rounded-[4px] [letter-spacing:1px] bg-white/[0.03]">AI 工程师 / AI Engineer</span>
          <span class="text-[0.7rem] text-white border border-white/[0.15] px-4 py-2 rounded-[4px] [letter-spacing:1px] bg-white/[0.03]">像素画师 / Pixel Artist</span>
          <span class="text-[0.7rem] text-white border border-white/[0.15] px-4 py-2 rounded-[4px] [letter-spacing:1px] bg-white/[0.03]">剧情策划 / Story Writer</span>
        </div>
      </section>

      <!-- 联系我们 -->
      <section class="mb-14">
        <div class="inline-block text-[0.7rem] text-[var(--theme-color)] border border-[rgba(77,240,255,0.3)] px-3 py-1 [letter-spacing:2px] uppercase mb-4">联系 / Contact</div>
        <h3 class="text-[1.3rem] text-white m-0 mb-4 leading-relaxed">找到我们 / Reach Out</h3>
        <div class="grid grid-cols-3 gap-4 mt-4">
          <a href="https://github.com/Tsukimi-Yachiyo" target="_blank" rel="noopener" class="flex flex-col items-center gap-2 px-4 py-6 bg-white/[0.02] border border-white/[0.06] rounded-lg no-underline text-inherit transition-all duration-300 hover:border-[rgba(77,240,255,0.3)] hover:bg-[rgba(77,240,255,0.04)] hover:-translate-y-0.5">
            <span class="text-[1.2rem] text-[var(--theme-color)] [font-family:monospace] [letter-spacing:2px]">[GH]</span>
            <span class="text-[0.85rem] text-white [letter-spacing:1px]">GitHub</span>
            <span class="text-[0.7rem] text-white/40">来看看我们的代码</span>
          </a>
          <div class="flex flex-col items-center gap-2 px-4 py-6 bg-white/[0.02] border border-white/[0.06] rounded-lg cursor-pointer transition-all duration-300 hover:border-[rgba(77,240,255,0.3)] hover:bg-[rgba(77,240,255,0.04)] hover:-translate-y-0.5" @click="onQqClick">
            <span class="text-[1.2rem] text-[var(--theme-color)] [font-family:monospace] [letter-spacing:2px]">[QQ]</span>
            <span class="text-[0.85rem] text-white [letter-spacing:1px]">QQ 群: 1094218305</span>
            <span class="text-[0.7rem] text-white/40">点击复制群号并查看二维码</span>
          </div>
          <a href="https://space.bilibili.com/1543748387" target="_blank" rel="noopener" class="flex flex-col items-center gap-2 px-4 py-6 bg-white/[0.02] border border-white/[0.06] rounded-lg no-underline text-inherit transition-all duration-300 hover:border-[rgba(77,240,255,0.3)] hover:bg-[rgba(77,240,255,0.04)] hover:-translate-y-0.5">
            <span class="text-[1.2rem] text-[var(--theme-color)] [font-family:monospace] [letter-spacing:2px]">[BV]</span>
            <span class="text-[0.85rem] text-white [letter-spacing:1px]">Bilibili</span>
            <span class="text-[0.7rem] text-white/40">关注获取最新动态</span>
          </a>
        </div>
      </section>

      <!-- 底部 -->
      <!-- Toast 弹窗 -->
      <Transition name="toast">
        <div v-if="toast.visible" class="fixed top-10 left-1/2 -translate-x-1/2 bg-[rgba(77,240,255,0.15)] border border-[rgba(77,240,255,0.4)] text-[var(--theme-color)] px-7 py-2.5 rounded-md text-[0.8rem] [letter-spacing:1px] z-[9999] backdrop-blur-xl">{{ toast.message }}</div>
      </Transition>

      <!-- QQ 群二维码弹窗 -->
      <Transition name="modal">
        <div v-if="showQrModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-[9998] backdrop-blur-sm" @click.self="showQrModal = false">
          <div class="bg-[#12121a] border border-[rgba(77,240,255,0.2)] rounded-xl p-8 text-center max-w-[320px]">
            <div class="text-base text-[var(--theme-color)] [letter-spacing:2px] mb-5">QQ 群二维码</div>
            <img src="/qq-group-qr.jpg" alt="QQ 群二维码" class="w-[200px] h-[200px] object-contain rounded-sm bg-white p-2" />
            <div class="text-[0.75rem] text-white/50 mt-3 [letter-spacing:1px]">群号: 1094218305</div>
            <button class="mt-5 bg-transparent border border-white/[0.15] text-white/60 px-6 py-2 rounded-[4px] text-[0.75rem] [letter-spacing:1px] cursor-pointer transition-all duration-200 hover:border-[var(--theme-color)] hover:text-[var(--theme-color)] [font-family:var(--font-holo)]" @click="showQrModal = false">关闭</button>
          </div>
        </div>
      </Transition>

      <footer class="text-center mt-20 pt-8 border-t border-white/[0.06]">
        <p class="text-[0.75rem] text-white/30 m-0 [letter-spacing:2px]">&copy; 2026 月读工作室 / Tsukuyomi Studio</p>
        <p class="text-[0.75rem] text-white/30 m-0 mt-2 italic [letter-spacing:2px]">用爱发电，用心造梦 / Made with love and caffeine</p>
        <div class="mt-6 space-y-1.5">
          <p class="text-[0.7rem] text-white/20 m-0 leading-relaxed">
            本站使用的《超时空辉夜姬》相关素材版权归原作者所有，本站为非盈利性质，如有侵权请联系删除。
          </p>
          <p class="text-[0.7rem] text-white/20 m-0 [letter-spacing:1px]">
            备案号：京ICP备2026016717号
          </p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';

const toast = reactive({ visible: false, message: '' });
const showQrModal = ref(false);

const showToast = (msg: string) => {
  toast.message = msg;
  toast.visible = true;
  setTimeout(() => { toast.visible = false; }, 2000);
};

const onQqClick = async () => {
  try {
    await navigator.clipboard.writeText('1094218305');
    showToast('QQ 群号已复制');
  } catch {
    showToast('复制失败，请手动复制: 1094218305');
  }
  showQrModal.value = true;
};
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
@media (max-width: 640px) {
  .grid-cols-3 {
    grid-template-columns: 1fr;
  }
}
</style>

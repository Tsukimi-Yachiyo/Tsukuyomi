<template>
  <div class="about-page">
    <div class="bg-grid"></div>

    <div class="about-container">
      <!-- 标题 -->
      <header class="about-header">
        <h1 class="title-cn">关于我们</h1>
        <h2 class="title-en">About Us</h2>
        <div class="title-line"></div>
      </header>

      <!-- 游戏介绍 -->
      <section class="about-section">
        <div class="section-tag">游戏 / Game</div>
        <h3 class="section-title">
          <span class="title-glow">《超时空辉夜姬》</span>
        </h3>
        <p class="section-desc">
          一款融合了像素艺术与 AI 技术的多人在线游戏。
          在这里，你将进入一个由代码构建的赛博世界，与来自各地的玩家一起冒险、交流、创造属于你们的故事。
        </p>
        <p class="section-desc-en">
          A multiplayer online game that fuses pixel art with AI technology.
          Step into a cyber world built from code, where you can adventure, chat, and create your own stories with players from around the globe.
        </p>

        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">[MP]</div>
            <h4>多人联机 / Multiplayer</h4>
            <p>与其他玩家实时互动，共同探索赛博世界</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">[AI]</div>
            <h4>AI 对话 / AI Chat</h4>
            <p>内置 AI 聊天模型，NPC 也能和你谈天说地</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">[PX]</div>
            <h4>像素美学 / Pixel Art</h4>
            <p>精心打磨的像素风格，每一帧都是一幅画</p>
          </div>
        </div>
      </section>

      <!-- 团队介绍 -->
      <section class="about-section">
        <div class="section-tag">团队 / Team</div>
        <h3 class="section-title">
          <span class="title-glow">月读工作室 / Tsukuyomi Studio</span>
        </h3>
        <p class="section-desc">
          我们是一支充满热情的小型团队，热爱游戏，热爱技术，热爱创造。
          虽然人不多，但每个人都身怀绝技。我们相信，好游戏不需要大团队，只需要用心去做。
        </p>
        <p class="section-desc-en">
          We are a passionate small team that loves games, technology, and creation.
          Though small in number, each of us brings unique skills. We believe great games don't need big teams — just heart.
        </p>
      </section>

      <!-- 技术栈 -->
      <section class="about-section">
        <div class="section-tag">技术 / Tech Stack</div>
        <h3 class="section-title">我们用了什么 / Our Tech Stack</h3>
        <div class="tech-section-label">前端 / Frontend</div>
        <div class="tech-list">
          <span class="tech-badge">Vue 3</span>
          <span class="tech-badge">TypeScript</span>
          <span class="tech-badge">Cocos Creator 3.8</span>
          <span class="tech-badge">Tailwind CSS</span>
          <span class="tech-badge">WebSocket</span>
          <span class="tech-badge">Protobuf</span>
          <span class="tech-badge">Pinia</span>
        </div>
        <div class="tech-section-label">后端 / Backend</div>
        <div class="tech-list">
          <span class="tech-badge">Spring Boot</span>
          <span class="tech-badge">Spring AI</span>
          <span class="tech-badge">Spring WebFlux</span>
          <span class="tech-badge">Spring MVC</span>
          <span class="tech-badge">Redis</span>
          <span class="tech-badge">PostgreSQL</span>
          <span class="tech-badge">Nacos</span>
          <span class="tech-badge">Python FastAPI</span>
          <span class="tech-badge">LangGraph</span>
        </div>
      </section>

      <!-- 加入我们 -->
      <section class="about-section">
        <div class="section-tag">加入 / Join Us</div>
        <h3 class="section-title">一起创造 / Build Together</h3>
        <p class="section-desc">
          我们正在寻找志同道合的伙伴。无论你是程序员、像素画师、剧情策划还是音乐创作者，
          只要你对游戏充满热情，我们都欢迎你的加入。
        </p>
        <p class="section-desc-en">
          We're looking for like-minded creators. Whether you're a programmer, pixel artist, story writer, or music composer —
          if you're passionate about games, you're welcome here.
        </p>
        <div class="recruit-tags">
          <span class="recruit-tag">前端开发 / Frontend Dev</span>
          <span class="recruit-tag">Cocos 开发 / Cocos Dev</span>
          <span class="recruit-tag">后端开发 / Backend Dev</span>
          <span class="recruit-tag">AI 工程师 / AI Engineer</span>
          <span class="recruit-tag">像素画师 / Pixel Artist</span>
          <span class="recruit-tag">剧情策划 / Story Writer</span>
        </div>
      </section>

      <!-- 联系我们 -->
      <section class="about-section">
        <div class="section-tag">联系 / Contact</div>
        <h3 class="section-title">找到我们 / Reach Out</h3>
        <div class="contact-grid">
          <a href="https://github.com/Tsukimi-Yachiyo" target="_blank" rel="noopener" class="contact-card">
            <span class="contact-icon">[GH]</span>
            <span class="contact-label">GitHub</span>
            <span class="contact-hint">来看看我们的代码</span>
          </a>
          <div class="contact-card" @click="onQqClick">
            <span class="contact-icon">[QQ]</span>
            <span class="contact-label">QQ 群: 1094218305</span>
            <span class="contact-hint">点击复制群号并查看二维码</span>
          </div>
          <a href="https://space.bilibili.com/1543748387" target="_blank" rel="noopener" class="contact-card">
            <span class="contact-icon">[BV]</span>
            <span class="contact-label">Bilibili</span>
            <span class="contact-hint">关注获取最新动态</span>
          </a>
        </div>
      </section>

      <!-- 底部 -->
      <!-- Toast 弹窗 -->
      <Transition name="toast">
        <div v-if="toast.visible" class="toast">{{ toast.message }}</div>
      </Transition>

      <!-- QQ 群二维码弹窗 -->
      <Transition name="modal">
        <div v-if="showQrModal" class="modal-overlay" @click.self="showQrModal = false">
          <div class="modal-box">
            <div class="modal-title">QQ 群二维码</div>
            <img src="/qq-group-qr.jpg" alt="QQ 群二维码" class="qr-image" />
            <div class="modal-hint">群号: 1094218305</div>
            <button class="modal-close" @click="showQrModal = false">关闭</button>
          </div>
        </div>
      </Transition>

      <footer class="about-footer">
        <p>&copy; 2026 月读工作室 / Tsukuyomi Studio</p>
        <p class="footer-sub">用爱发电，用心造梦 / Made with love and caffeine</p>
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
.about-page {
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  background: #0a0a0f;
  color: #e0e0e0;
  font-family: var(--font-holo);
  position: relative;
}

.bg-grid {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(77, 240, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(77, 240, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 0;
}

.about-container {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
  padding: 60px 24px;
}

/* 标题 */
.about-header {
  text-align: center;
  margin-bottom: 60px;
}

.title-cn {
  font-size: 2.5rem;
  color: var(--theme-color);
  text-shadow: 0 0 20px var(--theme-color-glow);
  margin: 0;
  letter-spacing: 8px;
}

.title-en {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.4);
  font-weight: normal;
  margin: 8px 0 0;
  letter-spacing: 4px;
  text-transform: uppercase;
}

.title-line {
  width: 60px;
  height: 2px;
  background: var(--theme-color);
  margin: 20px auto 0;
  box-shadow: 0 0 10px var(--theme-color-glow);
}

/* 区块 */
.about-section {
  margin-bottom: 56px;
}

.section-tag {
  display: inline-block;
  font-size: 0.7rem;
  color: var(--theme-color);
  border: 1px solid rgba(77, 240, 255, 0.3);
  padding: 4px 12px;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 16px;
}

.section-title {
  font-size: 1.3rem;
  color: #fff;
  margin: 0 0 16px;
  line-height: 1.6;
}

.title-glow {
  text-shadow: 0 0 12px var(--theme-color-glow);
}

.section-desc {
  font-size: 0.9rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.75);
  margin: 0 0 8px;
}

.section-desc-en {
  font-size: 0.8rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
  font-style: italic;
}

/* 特性卡片 */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 24px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 20px 16px;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  border-color: rgba(77, 240, 255, 0.2);
  background: rgba(77, 240, 255, 0.03);
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 1.2rem;
  color: var(--theme-color);
  margin-bottom: 12px;
  font-family: monospace;
  letter-spacing: 2px;
}

.feature-card h4 {
  font-size: 0.8rem;
  color: #fff;
  margin: 0 0 8px;
  letter-spacing: 1px;
}

.feature-card p {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  line-height: 1.6;
}

/* 技术栈 */
.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.tech-badge {
  font-size: 0.7rem;
  color: var(--theme-color);
  border: 1px solid rgba(77, 240, 255, 0.25);
  padding: 6px 14px;
  border-radius: 4px;
  letter-spacing: 1px;
  background: rgba(77, 240, 255, 0.04);
  transition: all 0.2s ease;
}

.tech-badge:hover {
  background: rgba(77, 240, 255, 0.1);
  border-color: rgba(77, 240, 255, 0.5);
}

/* 招募标签 */
.recruit-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.recruit-tag {
  font-size: 0.7rem;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 8px 16px;
  border-radius: 4px;
  letter-spacing: 1px;
  background: rgba(255, 255, 255, 0.03);
}

/* 联系方式 */
.contact-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.contact-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
}

.contact-card:hover {
  border-color: rgba(77, 240, 255, 0.3);
  background: rgba(77, 240, 255, 0.04);
  transform: translateY(-2px);
}

.contact-icon {
  font-size: 1.2rem;
  color: var(--theme-color);
  font-family: monospace;
  letter-spacing: 2px;
}

.contact-label {
  font-size: 0.85rem;
  color: #fff;
  letter-spacing: 1px;
}

.contact-hint {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
}

/* 底部 */
.about-footer {
  text-align: center;
  margin-top: 80px;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.about-footer p {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.3);
  margin: 0;
  letter-spacing: 2px;
}

.footer-sub {
  margin-top: 8px !important;
  font-style: italic;
}

/* 技术栈分组标签 */
.tech-section-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 2px;
  margin-top: 16px;
  margin-bottom: 8px;
}

/* Toast 弹窗 */
.toast {
  position: fixed;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(77, 240, 255, 0.15);
  border: 1px solid rgba(77, 240, 255, 0.4);
  color: var(--theme-color);
  padding: 10px 28px;
  border-radius: 6px;
  font-size: 0.8rem;
  letter-spacing: 1px;
  z-index: 9999;
  backdrop-filter: blur(12px);
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

/* 二维码弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
  backdrop-filter: blur(4px);
}

.modal-box {
  background: #12121a;
  border: 1px solid rgba(77, 240, 255, 0.2);
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  max-width: 320px;
}

.modal-title {
  font-size: 1rem;
  color: var(--theme-color);
  letter-spacing: 2px;
  margin-bottom: 20px;
}

.qr-image {
  width: 200px;
  height: 200px;
  object-fit: contain;
  border-radius: 4px;
  background: #fff;
  padding: 8px;
}

.modal-hint {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 12px;
  letter-spacing: 1px;
}

.modal-close {
  margin-top: 20px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.6);
  padding: 8px 24px;
  border-radius: 4px;
  font-size: 0.75rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--font-holo);
}

.modal-close:hover {
  border-color: var(--theme-color);
  color: var(--theme-color);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* 响应式 */
@media (max-width: 640px) {
  .feature-grid,
  .contact-grid {
    grid-template-columns: 1fr;
  }

  .title-cn {
    font-size: 1.8rem;
  }
}
</style>

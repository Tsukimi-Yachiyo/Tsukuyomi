<template>
  <div class="min-h-screen bg-linear-to-b from-[#0a0a0f] via-[#0a1628] to-[#0d1f3c] text-white [font-family:var(--font-cuxi)]">
    <div class="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(77,240,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(77,240,255,0.02)_1px,transparent_1px)] [background-size:40px_40px]" />

    <div class="relative z-10 max-w-[900px] mx-auto px-6 py-10">
      <button
        class="mb-6 flex items-center gap-2 text-[13px] text-white/40 hover:text-[rgba(77,240,255,0.8)] transition-colors cursor-pointer bg-transparent border-none"
        @click="router.back()"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        返回
      </button>

      <header class="text-center mb-10">
        <h1 class="text-[2rem] text-[rgba(77,240,255,0.9)] [text-shadow:0_0_20px_rgba(77,240,255,0.3)] m-0 [letter-spacing:4px]">用户协议</h1>
        <h2 class="text-sm text-white/40 font-normal mt-2 mb-0 [letter-spacing:3px] uppercase">User Agreement</h2>
        <div class="w-[60px] h-[2px] bg-[rgba(77,240,255,0.8)] mx-auto mt-4 [box-shadow:0_0_10px_rgba(77,240,255,0.3)]" />
      </header>

      <div class="rounded-xl bg-white/[0.02] border border-white/[0.06] p-6">
        <PdfViewer filename="Disclaimers.pdf" :max-height="800" :initial-scale="1.5" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import PdfViewer from '@/components/viewer/PdfViewer.vue';

const router = useRouter();
</script>

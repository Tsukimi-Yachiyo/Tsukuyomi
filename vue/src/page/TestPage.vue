<template>
  <div class="min-h-screen bg-[#0a0a0f] text-white p-10">
    <h1 class="text-2xl mb-8">Style Test Page</h1>

    <section class="mb-10">
      <h2 class="text-base mb-3 text-white/60">KeyHint</h2>
      <div class="flex gap-4 items-center">
        <KeyHint hint-key="ESC">
          <button class="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-md cursor-pointer">Home</button>
        </KeyHint>
        <KeyHint hint-key="T">
          <button class="w-[42px] h-[42px] p-0 flex items-center justify-center bg-white/10 border border-white/20 text-white rounded-full cursor-pointer">Chat</button>
        </KeyHint>
        <KeyHint hint-key="W A S D">
          <div class="w-[60px] h-[60px] flex items-center justify-center bg-white/5 border border-white/15 rounded-lg">Move</div>
        </KeyHint>
      </div>
    </section>

    <section class="mb-10">
      <h2 class="text-base mb-3 text-white/60">Buttons</h2>
      <div class="flex gap-4 items-center">
        <button class="px-4 py-2 bg-[#4df0ff] text-black rounded-md cursor-pointer">Primary</button>
        <button class="px-4 py-2 bg-[#4df0ff]/15 text-[#4df0ff] border border-[#4df0ff] rounded-md cursor-pointer">Secondary</button>
        <button class="px-4 py-2 bg-transparent text-white/60 border border-white/20 rounded-md cursor-pointer">Ghost</button>
      </div>
    </section>

    <section class="mb-10">
      <h2 class="text-base mb-3 text-white/60">Inputs</h2>
      <div class="flex flex-col gap-3">
        <input class="px-3 py-2 bg-black/40 border border-white/15 rounded text-white text-sm w-[250px] focus:outline-none focus:border-[#4df0ff]" placeholder="Default input..." />
        <input class="px-3 py-2 bg-black/40 border border-white/15 rounded text-white text-sm w-[250px] focus:outline-none focus:border-[#4df0ff]" placeholder="With value..." value="Hello" />
      </div>
    </section>

    <section class="mb-10">
      <h2 class="text-base mb-3 text-white/60">Colors</h2>
      <div class="flex gap-4 items-center">
        <div class="w-20 h-[60px] flex items-end justify-center p-1 text-[10px] text-black rounded bg-[#4df0ff]">#4df0ff</div>
        <div class="w-20 h-[60px] flex items-end justify-center p-1 text-[10px] text-black rounded bg-[#ff6b6b]">#ff6b6b</div>
        <div class="w-20 h-[60px] flex items-end justify-center p-1 text-[10px] text-black rounded bg-[#4caf50]">#4caf50</div>
        <div class="w-20 h-[60px] flex items-end justify-center p-1 text-[10px] text-black rounded bg-[#ff9800]">#ff9800</div>
      </div>
    </section>

    <section class="mb-10">
      <h2 class="text-base mb-3 text-white/60">Text</h2>
      <div class="flex flex-col gap-3">
        <p class="text-white">Primary text</p>
        <p class="text-white/60">Secondary text</p>
        <p class="text-white/30">Muted text</p>
      </div>
    </section>

    <section class="mb-10">
      <h2 class="text-base mb-3 text-white/60">Ocean Loading (Wave Rise + Bubbles)</h2>
      <div class="relative border border-white/10 rounded-lg bg-[#0a1628] overflow-hidden" style="height: 350px">
        <OceanLoading
          v-if="demoActive"
          :loading="demoLoading"
          :height="350"
          :layers="demoLayers"
          :target-base-y-ratio="0.7"
          :start-base-y-ratio="1.5"
          @complete="demoCompleted = true"
        />
      </div>
      <div class="flex items-center gap-4 mt-2">
        <button
          class="px-3 py-1.5 bg-white/10 border border-white/20 text-white/70 rounded text-sm hover:bg-white/20 cursor-pointer"
          @click="replayDemo"
        >
          Replay
        </button>
        <button
          class="px-3 py-1.5 bg-white/10 border border-white/20 text-white/70 rounded text-sm hover:bg-white/20 cursor-pointer"
          @click="demoLoading = false"
        >
          Finish Loading
        </button>
        <p class="text-white/30 text-sm">loading: {{ demoLoading }} | completed: {{ demoCompleted }}</p>
      </div>
    </section>

    <section class="mb-10">
      <h2 class="text-base mb-3 text-white/60">Ocean Waves (static)</h2>
      <div class="border border-white/10 rounded-lg bg-[#0a1628]">
        <OceanWaves ref="wavesRef" :height="200" />
      </div>
      <p class="text-white/30 mt-2">Wave Y at x=200: {{ waveY }}</p>
    </section>

    <section class="mb-10">
      <h2 class="text-base mb-3 text-white/60">Ocean Ripple (Click to create)</h2>
      <div class="border border-white/10 rounded-lg bg-[#0a1628]">
        <OceanRipple
          :height="250"
          :autoInterval="3000"
          :layers="4"
          :energyDecay="0.65"
          :layerDelay="6"
        />
      </div>
      <p class="text-white/30 mt-2">4 layers, energy decay 0.65, layer delay 6 frames</p>
    </section>

    <section class="mb-10">
      <h2 class="text-base mb-3 text-white/60">Ocean Bubbles</h2>
      <div class="border border-white/10 rounded-lg bg-[#0a1628] overflow-hidden">
        <OceanBubbles :height="250" :count="40" :speed-range="[0.4, 1.5]" :size-range="[2, 10]" />
      </div>
      <p class="text-white/30 mt-2">40 bubbles, speed 0.4-1.5, size 2-10</p>
    </section>

    <section class="mb-10">
      <h2 class="text-base mb-3 text-white/60">Ocean Fish</h2>
      <div class="border border-white/10 rounded-lg bg-[#0a1628]">
        <OceanFish :height="300" :count="20" />
      </div>
    </section>

    <section class="mb-10">
      <h2 class="text-base mb-3 text-white/60">Ocean PDF Viewer</h2>
      <div class="flex gap-4 mb-4">
        <input
          v-model="pdfFilename"
          class="px-3 py-2 bg-black/40 border border-white/15 rounded text-white text-sm flex-1 focus:outline-none focus:border-[#4df0ff]"
          placeholder="输入 PDF 文件名（如 sample.pdf）"
        />
        <input
          v-model="pdfUrl"
          class="px-3 py-2 bg-black/40 border border-white/15 rounded text-white text-sm flex-1 focus:outline-none focus:border-[#4df0ff]"
          placeholder="或输入 PDF URL"
        />
      </div>
      <PdfViewer
        v-if="pdfFilename || pdfUrl"
        :filename="pdfFilename || undefined"
        :url="pdfUrl || undefined"
        :max-height="500"
      />
      <div v-else class="border border-white/10 rounded-lg p-10 text-center text-white/30">
        请输入 PDF 文件名或 URL
      </div>
    </section>

    <section class="mb-10">
      <h2 class="text-base mb-3 text-white/60">Oceanolo Post Card</h2>
      <div class="border border-white/10 rounded-lg bg-[#0a1628]">
        <OceanPostCard
            :cover-image="'https://img0.baidu.com/it/u=2553302922,1577729704&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=785'"
            :author-id="1"
            :post-id="1"
            title="这里填写标题内容111111111111111123121241241231"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import KeyHint from '@/components/game/KeyHint.vue';
import OceanWaves from '@/components/ocean/OceanWaves.vue';
import OceanRipple from '@/components/ocean/OceanRipple.vue';
import OceanFish from '@/components/ocean/OceanFish.vue';
import PdfViewer from '@/components/viewer/PdfViewer.vue';
import OceanLoading from '@/components/ocean/OceanLoading.vue';
import OceanBubbles from "@/components/ocean/OceanBubbles.vue";
import OceanPostCard from "@/components/ocean/OceanPostCard.vue";

const wavesRef = ref<InstanceType<typeof OceanWaves>>();
const waveY = ref(0);
const pdfFilename = ref('');
const pdfUrl = ref('');

// Ocean Loading demo
const demoActive = ref(true);
const demoLoading = ref(true);
const demoCompleted = ref(false);
const demoLayers = [
  { color: '#00b9ff', amplitude: 18, frequency: 0.012, speed: 0.015, offsetY: 0, opacity: 1, jitter: 0.3 },
  { color: '#0076bf', amplitude: 14, frequency: 0.018, speed: 0.01, offsetY: 10, opacity: 1, jitter: 0.2 },
  { color: '#003e63', amplitude: 10, frequency: 0.018, speed: 0.005, offsetY: 20, opacity: 1, jitter: 0.2 },
];

function replayDemo() {
  demoActive.value = false;
  demoLoading.value = true;
  demoCompleted.value = false;
  setTimeout(() => { demoActive.value = true; }, 50);
}

onMounted(() => {
  if (wavesRef.value) {
    waveY.value = Math.round(wavesRef.value.getWaveY(200, 0));
  }
});
</script>

<template>
  <div class="relative w-[420px]">

    <HoloPanel :is-open="true" theme-color="#4df0ff" :glow-opacity="0.15" class="p-[25px]">

      <HoloBorder
          :anim="[0.1, 0.4]"
          :layers="[
          { inset: 5, borderWidth: 2, cornerOffset: 5, cornerStrokeWidth: 3, opacity: 0.8 },
          { inset: 0, borderWidth: 1, cornerOffset: 0, cornerStrokeWidth: 2, opacity: 0.5 }
        ]"
          :corners="['tl', 'br']"
          :corner-size="30"
          :show-notches="false"
      />

      <div class="relative z-10 flex flex-col gap-5">

        <div class="flex justify-between items-center border-b border-[#4df0ff]/30 pb-2">
          <HoloText size="16px" weight="bold" text="SECURITY CHECK / 安全验证" />
          <button @click="emit('close')" class="text-[#4df0ff] hover:text-white transition-colors text-3xl leading-none outline-none">&times;</button>
        </div>

        <div class="relative p-1 border border-[#4df0ff]/20 bg-black/50 group [box-shadow:inset_0_0_15px_rgba(77,240,255,0.05)]">
          <canvas ref="canvasRef" width="360" height="90" class="w-full cursor-pointer opacity-90 group-hover:opacity-100 transition-opacity" @click="refresh"></canvas>
          <div class="absolute bottom-2 right-3 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
            <HoloText size="10px" text="CLICK TO REFRESH" />
          </div>
        </div>

        <div class="flex gap-4 items-end">
          <div class="flex-1">
            <HoloInput
                v-model="inputCode"
                label="AUTH_CODE / 输入验证码"
                placeholder="Enter Code..."
                @keyup.enter="confirm"
            />
          </div><button
            @click="confirm"
            class="h-9.5 px-6 flex w-20 items-center bg-[#4df0ff]/10 border border-[#4df0ff] text-[#4df0ff]  hover:bg-[#4df0ff] hover:text-black transition-all  shadow-[0_0_8px_rgba(77,240,255,0.3)]  hover:shadow-[0_0_15px_rgba(77,240,255,0.6)] relative overflow-hidden"
        >
          <span class="absolute left-0 top-0 bottom-0 w-0.75 bg-[#4df0ff] shadow-[0_0_10px_#4df0ff]"></span>
          <span class=" absolute left-3 font-bold tracking-widest text-sm z-10 pl-1">VERIFY</span>
        </button>
        </div>

      </div>
    </HoloPanel>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import HoloPanel from '@/components/holo/HoloPanel.vue';
import HoloBorder from '@/components/holo/HoloBorder.vue';
import HoloText from '@/components/holo/HoloText.vue';
import HoloInput from '@/components/holo/HoloInput.vue';

const emit = defineEmits<{
  close: [];
  success: [];
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const inputCode = ref('');

const currentCode = ref('');

const generateCode = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const drawCode = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  currentCode.value = generateCode();

  ctx.fillStyle = '#020810';
  ctx.fillRect(0, 0, 360, 90);

  for (let i = 0; i < 10; i++) {
    ctx.strokeStyle = `rgba(77, 240, 255, ${Math.random() * 0.5 + 0.1})`;
    ctx.lineWidth = Math.random() * 2 + 1;
    ctx.beginPath();
    ctx.moveTo(Math.random() * 360, Math.random() * 90);
    ctx.lineTo(Math.random() * 360, Math.random() * 90);
    ctx.stroke();
  }

  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `rgba(77, 240, 255, ${Math.random() * 0.5 + 0.1})`;
    ctx.beginPath();
    ctx.arc(Math.random() * 360, Math.random() * 90, Math.random() * 2, 0, 2 * Math.PI);
    ctx.fill();
  }

  const colors = ['#4df0ff', '#ff70a6', '#fff0f5'];
  for (let i = 0; i < currentCode.value.length; i++) {
    ctx.fillStyle = colors[i % colors.length];

    ctx.font = `bold ${40 + Math.random() * 15}px "Courier New", Courier, monospace`;
    ctx.save();

    ctx.translate(45 + i * 75, 60 + Math.random() * 15);
    ctx.rotate((Math.random() - 0.5) * 0.5);

    ctx.shadowColor = colors[i % colors.length];
    ctx.shadowBlur = 12;

    ctx.fillText(currentCode.value[i], 0, 0);
    ctx.restore();
  }
};

const refresh = () => {
  drawCode();
};

const confirm = () => {
  if (!inputCode.value) {
    return;
  }

  if (inputCode.value.trim().toLowerCase() === currentCode.value.toLowerCase()) {
    emit('success');
  } else {
    refresh();
    inputCode.value = '';
  }
};

onMounted(() => {
  inputCode.value = '';
  nextTick(() => {
    drawCode();
  });
});
</script>

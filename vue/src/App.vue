<template>
  <router-view v-if="isPageRoute" />
  <SystemBoot v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import SystemBoot from '@/components/SystemBoot.vue';

const route = useRoute();
const isPageRoute = computed(() => {
  const pageRoutes = ['Home', 'Post', 'Admin', 'Maintenance', 'Test', 'About'];
  return pageRoutes.includes(route.name as string);
});
</script>

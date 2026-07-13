<!-- app/components/InfinityScroll.vue -->
<template>
  <div ref="target" class="h-12 w-full">
    <slot v-if="loading" name="loading">
      <div class="py-4 text-center">
        <div class="flex items-center justify-center gap-2">
          <div
            class="w-5 h-5 border-2 border-[#219653] border-t-transparent rounded-full animate-spin"
          />
          <span class="text-sm text-slate-500">در حال بارگذاری...</span>
        </div>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { useIntersectionObserver } from "@vueuse/core";

interface Props {
  loading?: boolean;
  disabled?: boolean;
  rootMargin?: string;
  threshold?: number;
  root?: HTMLElement | null;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  disabled: false,
  rootMargin: "200px",
  threshold: 0.1,
  root: null,
});

const emit = defineEmits<{
  loadMore: [];
}>();

const target = ref<HTMLElement | null>(null);

// ✅ استفاده از useIntersectionObserver از VueUse
const { stop } = useIntersectionObserver(
  target,
  ([entry]) => {
    if (entry.isIntersecting && !props.loading && !props.disabled) {
      emit("loadMore");
    }
  },
  {
    root: props.root,
    rootMargin: props.rootMargin,
    threshold: props.threshold,
  },
);

// expose stop برای مواقعی که نیاز به توقف دستی داریم
defineExpose({ stop });
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>

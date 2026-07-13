<template>
  <div class="flex items-center gap-2">
    <img
      v-if="!user"
      src="/icons/taskModal/responsible.svg"
      alt="assignee"
      class="w-5 h-5 ml-2 grayscale opacity-60 flex-shrink-0"
    >
    <div
      v-if="user"
      class="rounded-full flex items-center justify-center text-xs font-bold"
      :class="[sizeClass, bgClass, textClass]"
      :title="user.username"
    >
      {{ user.username.charAt(0).toUpperCase() }}
    </div>
    <span v-if="!user && !hideFallbackText" class="text-sm text-slate-400">تعیین نشده</span>
    <span v-if="user && showName" class="text-sm text-slate-700 font-medium">
      {{ user.username }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    user?: { id: number; username: string } | null;
    showName?: boolean;
    size?: "sm" | "md";
    variant?: "default" | "light";
    hideFallbackText?: boolean;
  }>(),
  {
    user: null,
    showName: false,
    size: "md",
    variant: "default",
    hideFallbackText: false,
  },
);

const sizeClass = computed(() => (props.size === "sm" ? "w-8 h-8" : "w-7 h-7"));

const bgClass = computed(() => {
  if (!props.user) return "bg-slate-200 text-slate-600";
  return props.variant === "light" ? "bg-[#DDF1E5] text-[#219653]" : "bg-[#219653] text-white";
});

const textClass = "text-xs";
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        @click="$emit('cancel')"
      />
      <div
        class="relative w-full max-w-sm rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/10 p-6 text-center"
      >
        <div class="mb-2 mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-slate-800 mb-2">{{ title }}</h3>
        <p class="text-sm text-slate-500 mb-6">{{ message }}</p>
        <div class="flex items-center gap-3 justify-center">
          <button
            @click="$emit('cancel')"
            class="px-6 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            {{ cancelText }}
          </button>
          <button
            @click="$emit('confirm')"
            class="px-6 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
}>()

defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<!-- app/components/AppToast.vue -->
<template>
  <Transition name="toast">
    <div
      v-if="toast"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]"
    >
      <div
        class="bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-bold"
      >
        {{ toast }}
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { toast } = useToast();
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
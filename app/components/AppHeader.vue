<!-- app/components/AppHeader.vue -->
<template>
  <header class="h-[76px] bg-[#FFFFFF] rounded-[24px] grid grid-cols-12 items-center px-4">
    <!-- Right -->
    <div class="col-span-10 flex justify-start">
      <div class="relative w-[427px] h-[44px]">
        <input
          :value="searchQuery"
          type="text"
          placeholder="جستجو در وظایف..."
          class="w-full h-12 rounded-2xl bg-[#FBFCFD] border border-slate-200 pr-12 text-sm text-slate-700 outline-none focus:border-[#219653] focus:ring-[#219653]/10 transition-all"
          @input="onSearch"
        >

        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
    <div class="flex items-center mr-6">
      <!-- Notification -->
      <button class="relative flex items-center justify-center hover:bg-slate-50 transition">
        <img src="/notif.svg" alt="assignee" class="w-6 h-8 ml-2 grayscale rounded-full" >

        <span
          class="absolute top-[4px] left-[25px] w-3 h-3 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-semibold"
        >
          3
        </span>
      </button>
      <!-- Profile -->
      <button class="flex items-center hover:bg-slate-50 m-2 transition">
        <div class="rounded-full flex items-center justify-center">
          <img src="/profile.png" alt="assignee" class="w-10 h-10 grayscale rounded-full" >
        </div>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useTaskStore } from "~/stores/taskStore";

const taskStore = useTaskStore();

const { searchQuery } = storeToRefs(taskStore);

const onSearch = (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  taskStore.setSearchQuery(value);
};
</script>

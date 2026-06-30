<!-- app/components/AppHeader.vue -->
<template>
  <header
   class="h-[76px] bg-[#FFFFFF] rounded-[24px] grid grid-cols-12 items-center px-4">
    <!-- Right -->
  <div class="col-span-10 flex justify-start">
      <div class="relative w-[427px] h-[44px] ">
        <input
          :value="searchQuery"
          @input="onSearch"
          type="text"
          placeholder="جستجو در وظایف..."
          class="w-full h-12 rounded-2xl  bg-[#FBFCFD] border border-slate-200 pr-12  text-sm text-slate-700 outline-none focus:border-[#219653]  focus:ring-[#219653]/10 transition-all"
        />

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
  <div class="col-span-2 flex items-center ml-16 justify-end gap-2">

      
      <!-- Notification -->
      <button
        class="relative w-10 h-10 rounded-2xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          class="w-5 h-5 text-slate-500"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 01-6 0"
          />
        </svg>

        <span
          class="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-semibold"
        >
          3
        </span>
      </button>
      <!-- Profile -->
      <button
        class="flex items-center gap-2 rounded-2xl hover:bg-slate-50 m-2 transition" 
      >
        <div
          class="w-10 h-10 rounded-full bg-[#DDF1E5] flex items-center justify-center text-[#219653] font-bold"
        >
          ا
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

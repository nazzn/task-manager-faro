<template>
  <div class="w-[143px] relative">
    <div
      class="w-full rounded-xl hover:bg-slate-50 border border-slate-200 bg-white px-3 min-h-[46px] py-2 flex items-center transition-all focus-within:border-[#219653]"
    >
      <img
        v-if="!modelValue.length"
        src="/icons/taskModal/responsible.svg"
        alt="assignee"
        class="w-5 h-5 ml-2 grayscale opacity-60 pointer-events-none flex-shrink-0"
      />

      <div v-click-outside="closeDropdown" class="w-full">
        <button
          type="button"
          @click="isOpen = !isOpen"
          class="w-full text-right"
        >
          <span
            v-if="!modelValue.length"
            class="text-sm text-slate-800"
            >انتخاب مسئول</span
          >
          <div v-else class="flex flex-wrap gap-1.5">
            <div
              v-for="id in modelValue"
              :key="id"
              class="w-7 h-7 rounded-full bg-[#219653] text-white flex items-center justify-center text-xs font-bold"
              :title="users.find((u) => u.id === id)?.username"
            >
              {{
                (users.find((u) => u.id === id)?.username || "?")
                  .charAt(0)
                  .toUpperCase()
              }}
            </div>
          </div>
        </button>

        <div
          v-if="isOpen"
          class="absolute z-[9999] left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto p-1.5 dropdown-scroll"
        >
          <div
            v-for="user in users"
            :key="user.id"
            @click.stop="toggle(user.id)"
            :class="[
              'flex items-center justify-between w-full my-1 gap-1 cursor-pointer text-sm rounded-lg transition-all',
              modelValue.includes(user.id)
                ? 'bg-[#cacaca] text-white'
                : 'hover:bg-slate-50 text-slate-700',
            ]"
          >
            <div class="flex items-center gap-2">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                :class="
                  modelValue.includes(user.id)
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-600'
                "
              >
                {{ user.username.charAt(0).toUpperCase() }}
              </div>
              <span>{{ user.username }}</span>
            </div>
            <button
              v-if="modelValue.includes(user.id)"
              type="button"
              @click.stop="remove(user.id)"
              class="w-5 h-5 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <svg
                class="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    <span
      v-if="error"
      class="text-xs text-red-500 mt-1 block"
    >
      {{ error }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  modelValue: number[];
  users: { id: number; username: string }[];
  error?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: number[]): void;
}>();

const isOpen = ref(false);

const closeDropdown = () => {
  isOpen.value = false;
};

const toggle = (id: number) => {
  const current = props.modelValue;
  let next: number[];
  if (current.includes(id)) {
    next = current.filter((i: number) => i !== id);
  } else {
    next = [...current, id];
  }
  emit("update:modelValue", next);
  isOpen.value = false;
};

const remove = (id: number) => {
  emit(
    "update:modelValue",
    props.modelValue.filter((i: number) => i !== id),
  );
};
</script>

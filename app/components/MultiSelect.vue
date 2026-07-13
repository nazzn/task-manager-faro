<!-- app/components/MultiSelect.vue -->

<template>
  <div v-click-outside="close" class="relative w-full">
    <label v-if="label" class="block text-xs font-medium text-slate-500 mb-1">
      {{ label }}
    </label>

    <!-- Trigger -->
    <button
      type="button"
      class="w-full p-2 border border-[#89899214] rounded-xl cursor-pointer bg-white flex items-center flex-wrap gap-1 text-right"
      :aria-expanded="isOpen"
      @click="toggleOpen"
    >
      <span v-if="selectedLabels.length === 0" class="text-[#111827CC] text-base font-bold">
        مسئول انجام:
      </span>

      <span
        v-for="item in selectedLabels"
        :key="item.value"
        class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-md inline-flex items-center gap-1"
      >
        {{ item.label }}
        <span
          role="button"
          tabindex="0"
          class="hover:text-blue-900 select-none"
          @click.stop="remove(item.value)"
          @keydown.enter.stop.prevent="remove(item.value)"
        >
          ×
        </span>
      </span>
    </button>

    <!-- Dropdown -->
    <div
      v-if="isOpen"
      class="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto"
      role="listbox"
    >
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="w-full p-2 hover:bg-slate-50 cursor-pointer flex items-center gap-2 text-sm text-right"
        @click="toggle(option.value)"
      >
        <input
          type="checkbox"
          class="pointer-events-none"
          :checked="modelValue.includes(option.value)"
          tabindex="-1"
        >
        <span>{{ option.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

type Option = { label: string; value: number };

const props = withDefaults(
  defineProps<{
    modelValue?: number[];
    options: Option[];
    label?: string;
  }>(),
  {
    modelValue: () => [],
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: number[]): void;
}>();

const isOpen = ref(false);

/* مقدار امن برای چند انتخابی */
const selectedValues = computed(() => props.modelValue ?? []);

function close() {
  isOpen.value = false;
}

function toggleOpen() {
  isOpen.value = !isOpen.value;
}

/* انتخاب یا حذف چند مسئول */
function toggle(value: number) {
  let next: number[];

  if (selectedValues.value.includes(value)) {
    next = selectedValues.value.filter((v) => v !== value);
  } else {
    next = [...selectedValues.value, value];
  }

  emit("update:modelValue", next);
}

function remove(value: number) {
  const next = selectedValues.value.filter((v) => v !== value);
  emit("update:modelValue", next);
}

/* لیبل‌های انتخاب شده */
const selectedLabels = computed(() =>
  props.options
    .filter((o) => selectedValues.value.includes(o.value))
    .map((o) => ({ value: o.value, label: o.label })),
);
</script>

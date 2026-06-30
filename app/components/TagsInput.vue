<!-- app/components/TagsInput.vue -->

<template>
  <div class="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2">
    <span
      v-for="(tag, idx) in modelValue"
      :key="idx"
      class="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-1 text-xs text-indigo-800"
    >
      {{ tag }}
      <button type="button" @click="removeTag(idx)" class="text-indigo-600 hover:text-indigo-800">×</button>
    </span>
    <input
      ref="inputRef"
      v-model="inputValue"
      type="text"
      class="min-w-[80px] flex-1 border-0 bg-transparent p-1 text-sm outline-none"
      placeholder="برچسب جدید..."
      @keydown.enter.prevent="addTag"
      @blur="addTag"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{ modelValue: string[] }>();
const emit = defineEmits<{ (e: "update:modelValue", value: string[]): void }>();

const inputValue = ref("");
const inputRef = ref<HTMLInputElement | null>(null);

function addTag() {
  const val = inputValue.value.trim();
  if (val && !props.modelValue.includes(val)) {
    emit("update:modelValue", [...props.modelValue, val]);
  }
  inputValue.value = "";
}
function removeTag(idx: number) {
  const newTags = [...props.modelValue];
  newTags.splice(idx, 1);
  emit("update:modelValue", newTags);
}
</script>
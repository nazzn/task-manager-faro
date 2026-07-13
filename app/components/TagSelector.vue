<template>
  <div class="w-[143px] relative">
    <div
      class="w-full rounded-xl hover:bg-slate-50 border border-slate-200 bg-white px-3 min-h-[46px] py-2 flex items-center transition-all focus-within:border-[#219653]"
    >
      <img
        v-if="!modelValue.length"
        src="/icons/taskModal/Label.svg"
        alt="tags"
        class="w-5 h-5 ml-2 grayscale opacity-60 pointer-events-none flex-shrink-0"
      >

      <div v-click-outside="closeDropdown" class="w-full">
        <button type="button" class="w-full text-right" @click="isOpen = !isOpen">
          <span v-if="!modelValue.length" class="text-sm text-slate-800">برچسب‌ها</span>
          <div v-else class="flex flex-wrap gap-1">
            <span
              v-for="id in modelValue"
              :key="id"
              class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
              :style="{
                backgroundColor: (tagMap[id]?.color || '#e2e8f0') + '30',
                color: tagMap[id]?.color || '#475569',
                border: '1px solid ' + (tagMap[id]?.color || '#e2e8f0'),
              }"
            >
              {{ tagMap[id]?.name || "?" }}
            </span>
          </div>
        </button>

        <div
          v-if="isOpen"
          class="absolute z-[9999] left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto p-1.5 dropdown-scroll"
        >
          <!-- Create tag section for admin -->
          <div v-if="isAdmin" class="px-2 py-1.5 border-b border-slate-100 mb-1">
            <div v-if="!isCreating" class="flex items-center justify-center">
              <button
                type="button"
                class="w-7 h-7 rounded-full bg-[#219653] text-white flex items-center justify-center text-lg font-bold hover:bg-[#1a7342] transition-colors"
                title="ایجاد برچسب جدید"
                @click.stop="startCreate"
              >
                +
              </button>
            </div>
            <div v-else class="flex flex-col gap-2">
              <input
                ref="createInputRef"
                v-model="newTagName"
                type="text"
                placeholder="نام برچسب..."
                class="w-full text-xs border border-slate-300 rounded-lg px-2 py-1.5 outline-none focus:border-[#219653]"
                @keydown.enter.stop="submitCreate"
                @keydown.esc.stop="cancelCreate"
              >
              <div class="flex items-center gap-1.5">
                <div
                  v-for="c in colors"
                  :key="c"
                  class="w-5 h-5 rounded-full cursor-pointer transition-all ring-1 ring-slate-300"
                  :class="
                    selectedColor === c
                      ? 'ring-2 ring-offset-1 ring-slate-600 scale-110'
                      : 'hover:scale-110'
                  "
                  :style="{ backgroundColor: c }"
                  @click.stop="selectedColor = c"
                />
              </div>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="w-6 h-6 rounded-full bg-[#219653] text-white flex items-center justify-center text-xs font-bold hover:bg-[#1a7342] transition-colors flex-shrink-0"
                  title="تایید"
                  @click.stop="submitCreate"
                >
                  ✓
                </button>
                <button
                  type="button"
                  class="w-6 h-6 rounded-full bg-slate-300 text-white flex items-center justify-center text-xs font-bold hover:bg-slate-400 transition-colors flex-shrink-0"
                  title="لغو"
                  @click.stop="cancelCreate"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          <div
            v-for="tag in tags"
            :key="tag.id"
            :class="[
              'flex items-center justify-between w-full my-1 gap-1 cursor-pointer text-sm rounded-lg transition-all px-3 py-2',
              modelValue.includes(tag.id)
                ? 'bg-[#cacaca] text-white'
                : 'hover:bg-slate-50 text-slate-700',
            ]"
            @click.stop="toggle(tag.id)"
          >
            <div class="flex items-center gap-2">
              <span
                class="w-3 h-3 rounded-full flex-shrink-0"
                :style="{ backgroundColor: tag.color || '#94a3b8' }"
              />
              <span>{{ tag.name }}</span>
            </div>
            <button
              v-if="modelValue.includes(tag.id)"
              type="button"
              class="w-5 h-5 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              @click.stop="remove(tag.id)"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M6 18L18 6M6 6l12 12"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
          <div v-if="!tags.length" class="text-center text-xs text-slate-400 py-3">
            برچسبی یافت نشد
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { taskService } from "~/services/taskService";
import { useRole } from "~/composables/useRole";

export type Tag = { id: number; name: string; color?: string };

const props = defineProps<{
  modelValue: number[];
  error?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: number[]): void;
}>();

const { isAdmin } = useRole();

const isOpen = ref(false);
const tags = ref<Tag[]>([]);
const isCreating = ref(false);
const newTagName = ref("");
const createInputRef = ref<HTMLInputElement | null>(null);

const tagMap = computed(() => {
  const map: Record<number, Tag> = {};
  for (const tag of tags.value) {
    map[tag.id] = tag;
  }
  return map;
});

const selectedColor = ref("#ef4444");
const colors = ["#ef4444", "#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ec4899", "#14b8a6"];

onMounted(async () => {
  try {
    const res: any = await taskService.getTags();
    tags.value = res?.data?.tags ?? res?.data ?? res ?? [];
  } catch (e) {
    console.error("Failed to load tags:", e);
  }
});

const closeDropdown = () => {
  isOpen.value = false;
  cancelCreate();
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

function startCreate() {
  isCreating.value = true;
  newTagName.value = "";
  selectedColor.value = colors[0];
  nextTick(() => {
    createInputRef.value?.focus();
  });
}

function cancelCreate() {
  isCreating.value = false;
  newTagName.value = "";
}

async function submitCreate() {
  const name = newTagName.value.trim();
  if (!name) return;

  try {
    const res: any = await taskService.createTag({ name, color: selectedColor.value });
    const created: Tag = res?.data ?? res;
    tags.value.push(created);
    emit("update:modelValue", [...props.modelValue, created.id]);
    isCreating.value = false;
    newTagName.value = "";
    isOpen.value = false;
  } catch (e) {
    console.error("Failed to create tag:", e);
  }
}
</script>

<style scoped>
.dropdown-scroll {
  direction: ltr;
}
.dropdown-scroll > * {
  direction: rtl;
}
.dropdown-scroll::-webkit-scrollbar {
  width: 5px;
}
.dropdown-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}
.dropdown-scroll::-webkit-scrollbar-thumb {
  background: #219653;
  border-radius: 10px;
}
</style>

<template>
  <transition
    enter-active-class="transition-all duration-200 ease-out"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div
      v-if="showAdvancedSearch"
      class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Priority Filter -->
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">اولویت</label>
          <select
            :value="priorityFilter"
            @change="taskStore.setPriorityFilter(($event.target as HTMLSelectElement).value as any || null)"
            class="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-[#219653] focus:ring-1 focus:ring-[#219653] outline-none transition-all appearance-none cursor-pointer"
          >
            <option :value="null">همه اولویت‌ها</option>
            <option value="high">فوری</option>
            <option value="medium">متوسط</option>
            <option value="low">عادی</option>
          </select>
        </div>

        <!-- Assignee Filter -->
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">مسئول</label>
          <select
            :value="assigneeFilter"
            @change="taskStore.setAssigneeFilter(Number(($event.target as HTMLSelectElement).value) || null)"
            class="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-[#219653] focus:ring-1 focus:ring-[#219653] outline-none transition-all appearance-none cursor-pointer"
          >
            <option :value="0">همه مسئولین</option>
            <option
              v-for="user in users"
              :key="user.id"
              :value="user.id"
            >
              {{ user.username }}
            </option>
          </select>
        </div>

        <!-- Date From -->
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">از تاریخ</label>
          <div class="relative">
            <input
              id="advanced-date-from"
              type="text"
              readonly
              :value="dateFrom ? new Date(dateFrom).toLocaleDateString('fa-IR') : ''"
              placeholder="انتخاب تاریخ"
              class="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 cursor-pointer outline-none transition-all focus:border-[#219653]"
            >
            <client-only>
              <date-picker
                v-model="dateFromModel"
                format="YYYY-MM-DD"
                display-format="jYYYY/jMM/jDD"
                auto-submit
                color="#219653"
                convert-numbers
                custom-input="#advanced-date-from"
              />
            </client-only>
          </div>
        </div>

        <!-- Date To -->
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">تا تاریخ</label>
          <div class="relative">
            <input
              id="advanced-date-to"
              type="text"
              readonly
              :value="dateTo ? new Date(dateTo).toLocaleDateString('fa-IR') : ''"
              placeholder="انتخاب تاریخ"
              class="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 cursor-pointer outline-none transition-all focus:border-[#219653]"
            >
            <client-only>
              <date-picker
                v-model="dateToModel"
                format="YYYY-MM-DD"
                display-format="jYYYY/jMM/jDD"
                auto-submit
                color="#219653"
                convert-numbers
                custom-input="#advanced-date-to"
              />
            </client-only>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
        <button
          class="h-9 px-4 rounded-xl bg-[#219653] text-white text-xs font-semibold hover:bg-[#1d854a] transition-all"
          @click="taskStore.toggleAdvancedSearch()"
        >
          اعمال فیلتر
        </button>
        <button
          class="h-9 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-all"
          @click="clearFilters"
        >
          پاک کردن فیلترها
        </button>
        <span class="text-xs text-slate-400 mr-auto">
          {{ activeCount }} فیلتر فعال
        </span>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useTaskStore } from "~/stores/taskStore";
import { useUsers } from "~/composables/useUsers";

const taskStore = useTaskStore();
const { USERS } = useUsers();

const {
  showAdvancedSearch,
  priorityFilter,
  assigneeFilter,
  dateFrom,
  dateTo,
} = storeToRefs(taskStore);

const dateFromModel = computed({
  get: () => dateFrom.value,
  set: (val: string) => {
    taskStore.setDateRange(val, dateTo.value);
  },
});

const dateToModel = computed({
  get: () => dateTo.value,
  set: (val: string) => {
    taskStore.setDateRange(dateFrom.value, val);
  },
});

const users = computed(() => USERS.value);

const activeCount = computed(() => {
  let count = 0;
  if (priorityFilter.value) count++;
  if (assigneeFilter.value) count++;
  if (dateFrom.value) count++;
  if (dateTo.value) count++;
  return count;
});

function clearFilters() {
  taskStore.clearAdvancedFilters();
}
</script>

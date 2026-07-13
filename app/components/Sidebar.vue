<!-- app/components/sidebar.vue -->

<template>
  <aside class="sticky h-screen w-[221px]">
    <div class="h-full bg-[#111827] overflow-hidden flex flex-col">
      <!-- Logo -->
      <div class="px-6 py-2">
        <div class="flex items-center gap-4">
          <div>
            <h2 class="text-[22px] font-bold text-white">فارو</h2>
            <p class="text-xs text-white mt-1">
              {{ projectLabel }}
            </p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-2 py-4">
        <ul class="space-y-2">
          <li v-for="item in items" :key="item.to">
            <!-- main menu -->
            <NuxtLink
              :to="item.to"
              @click="handleDashboardClick(item)"
              class="group flex items-center justify-between py-1 rounded-2xl transition-all bg-[#111827] hover:bg-[#1F2937]"
              :class="
                isActive(item.to)
                  ? 'bg-[#1F2937] text-white '
                  : 'text-white '
              "
            >
              <div class="flex items-center">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center"
                  :class="
                    isActive(item.to)
                      ? 'bg-[#1F2937]'
                      : 'bg-[#111827] group-hover:bg-[#1F2937]'
                  "
                >
                  <img
                    :src="`/icons/main/${item.icon}`"
                    :alt="item.label"
                    class="w-5 h-5"
                  />
                </div>

                <span class="text-sm font-medium">
                  {{ item.label }}
                </span>
              </div>

              <span
                v-if="item.badge"
                class="min-w-[24px] h-6 px-2 rounded-full bg-[#1F2937] text-[#219653] text-xs flex items-center justify-center font-semibold"
              >
                {{ item.badge }}
              </span>
            </NuxtLink>

            <!-- dashboard filters -->
            <transition
              enter-active-class="transition duration-100 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
            >
              <ul
                v-if="item.label === 'وظایف' && route.path === '/'"
                class="mt-2 space-y-1 pr-4"
              >
                <!-- pr-4 برای این است که زیرمنو کمی جلوتر از منوی اصلی باشد و سلسله مراتب رعایت شود -->
                <li v-for="tab in statusTabs" :key="tab.value">
                  <button
                    @click.stop="setStatus(tab.value)"
                    class="w-full flex items-center gap-2 py-2 text-xs rounded-xl transition-all"
                    :class="
                      statusFilter === tab.value
                        ? 'text-white bg-[#1F2937] font-bold'
                        : 'text-gray-400 hover:text-white hover:bg-[#1F2937]/50'
                    "
                  >
                    <!-- نمایش آیکون استاتوس -->
                    <img
                      :src="`/icons/main/${tab.icon}`"
                      :alt="tab.label"
                      class="w-4 h-4 opacity-70 group-hover:opacity-100"
                      :class="{ 'opacity-100': statusFilter === tab.value }"
                    />

                    <span>{{ tab.label }}</span>
                  </button>
                </li>
              </ul>
            </transition>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useTaskStore, type TaskStatus } from "@/stores/taskStore";

const taskStore = useTaskStore();

const { statusFilter } = storeToRefs(taskStore);

const route = useRoute();

/* تغییر فیلتر */
const setStatus = (value: TaskStatus) => {
  taskStore.setStatusFilter(value);
};

/* کلیک روی داشبورد = نمایش همه */
const handleDashboardClick = (item: any) => {
  if (item.to === "/") {
    taskStore.setStatusFilter(null);
  }
};

const isActive = (to: string) => route.path === to;

/* project label */
const projectLabelState = useState<string>(
  "projectLabel",
  () => "آوپارداز همراه دیجیتال",
);

const projectLabel = computed(() => projectLabelState.value);

/* navigation */
const items = [
  { label: "وظایف", to: "/", icon: "dashboard.svg" ,badge: 3,},
  // { label: "گزارش", to: "/report", icon: "report.svg" ,disabled: true },
  // { label: "تقویم", to: "/calender", icon: "calender.svg",disabled: true },
  // { label: "پیگیری", to: "/followups", badge: 3, icon: "followups.svg",disabled: true },
  // { label: "تیم", to: "/team", icon: "team.svg" ,disabled: true},
  // { label: "تنظیمات", to: "/settings", icon: "settings.svg" ,},
];
</script>

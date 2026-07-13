<!-- app/components/TaskComments.vue -->
<template>
  <div class="space-y-4" dir="rtl">
    <!-- لیست گزارش‌ها -->
    <div v-if="commentsLoading" class="text-center text-sm text-slate-400 py-4">
      در حال بارگذاری...
    </div>

    <div v-else-if="!comments.length" class="text-xs text-slate-400 py-2">
      هنوز گزارشی ثبت نشده است.
    </div>

    <div v-else class="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pl-1">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="group flex gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition"
      >
        <!-- آواتار -->
        <div
          class="w-8 h-8 rounded-full bg-[#238A63]/20 flex items-center justify-center flex-shrink-0 mt-0.5"
        >
          <span class="text-xs font-bold text-[#238A63]">
            {{ comment.user?.username?.charAt(0)?.toUpperCase() ?? "U" }}
          </span>
        </div>

        <div class="flex-1 min-w-0">
          <!-- هدر -->
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="text-xs font-bold text-slate-700">
              {{ comment.user?.username ?? "کاربر" }}
            </span>
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-slate-400">
                {{ formatDate(comment.created_at) }}
              </span>
              <!-- دکمه حذف گزارش -->
              <button
                v-if="canManage(comment)"
                class="opacity-0 group-hover:opacity-100 transition text-slate-300 hover:text-red-400"
                title="حذف گزارش"
                @click="handleDeleteComment(comment)"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- متن گزارش -->
          <p class="text-sm text-slate-600 leading-6 break-words">
            {{ comment.content }}
          </p>

          <!-- فایل پیوست شده به این گزارش -->
          <div
            v-if="comment.attachment"
            class="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 group/file"
          >
            <svg
              class="w-4 h-4 text-[#238A63] flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M15.172 7l-2.828-2.828a4 4 0 00-5.656 0L4.93 6.828a4 4 0 000 5.656l4.242 4.242a4 4 0 005.656 0l2.828-2.828M9 15l6-6"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
            <span class="text-xs text-slate-600 truncate flex-1" :title="comment.attachment.name">
              {{ comment.attachment.name }}
            </span>
            <span class="text-[10px] text-slate-400 flex-shrink-0">
              {{ formatFileSize(comment.attachment.size) }}
            </span>
            <!-- دانلود -->
            <a
              :href="`/api/attachments/${comment.attachment.id}/download`"
              download
              class="text-[#238A63] hover:text-[#1b6d4e] transition flex-shrink-0"
              title="دانلود"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </a>
            <!-- حذف فایل -->
            <button
              v-if="canManage(comment)"
              class="text-slate-300 hover:text-red-400 transition flex-shrink-0 opacity-0 group-hover/file:opacity-100"
              title="حذف فایل"
              @click="handleDeleteAttachment(comment)"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== فرم ثبت گزارش (مثل میزیتو) ===== -->
    <div
      class="rounded-2xl border border-slate-200 overflow-hidden focus-within:border-[#238A63] focus-within:ring-2 focus-within:ring-[#238A63]/10 transition"
    >
      <!-- textarea -->
      <div class="relative">
        <textarea
          v-model="newContent"
          rows="3"
          placeholder="درج گزارش و یا نظر شما ..."
          class="w-full text-sm p-4 outline-none resize-none bg-white text-slate-700 placeholder:text-slate-400 leading-7"
          @keydown.ctrl.enter="handleCreate"
        />
      </div>

      <!-- پیش‌نمایش فایل انتخاب‌شده -->
      <div
        v-if="selectedFile"
        class="flex items-center gap-2 px-4 py-2 bg-slate-50 border-t border-slate-100"
      >
        <svg
          class="w-4 h-4 text-[#238A63] flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M15.172 7l-2.828-2.828a4 4 0 00-5.656 0L4.93 6.828a4 4 0 000 5.656l4.242 4.242a4 4 0 005.656 0l2.828-2.828M9 15l6-6"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
        <span class="text-xs text-slate-600 truncate flex-1">{{ selectedFile.name }}</span>
        <span class="text-[10px] text-slate-400 flex-shrink-0">{{
          formatFileSize(selectedFile.size)
        }}</span>
        <button class="text-slate-400 hover:text-red-400 transition" @click="removeSelectedFile">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <!-- نوار پایین فرم — دقیقاً مثل میزیتو -->
      <div class="flex items-center justify-between px-3 py-2 bg-white border-t border-slate-100">
        <!-- دکمه‌های چپ: پیوست -->
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#238A63] transition text-xs font-medium"
            title="پیوست فایل"
            @click="triggerFileInput"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M15.172 7l-2.828-2.828a4 4 0 00-5.656 0L4.93 6.828a4 4 0 000 5.656l4.242 4.242a4 4 0 005.656 0l2.828-2.828M9 15l6-6"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
            پیوست
          </button>
          <input ref="fileInputRef" type="file" class="hidden" @change="handleFileSelect" >
        </div>

        <!-- دکمه ارسال -->
        <button
          :disabled="(!newContent.trim() && !selectedFile) || sending"
          class="px-5 py-1.5 rounded-lg bg-[#238A63] text-white text-xs font-bold hover:bg-[#1b6d4e] transition disabled:opacity-40"
          @click="handleCreate"
        >
          {{ sending ? "در حال ارسال..." : "ثبت" }}
        </button>
      </div>
    </div>
    <p class="text-[10px] text-slate-400 text-left">Ctrl + Enter برای ارسال سریع</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useTaskStore } from "~/stores/taskStore";
import { useRole } from "~/composables/useRole";
import { taskService } from "~/services/taskService";

const props = defineProps<{ taskId: number }>();

const taskStore = useTaskStore();
const { isAdmin } = useRole();
const userCookie = useCookie<any>("auth_user");

const comments = computed(() => taskStore.comments);
const commentsLoading = computed(() => taskStore.commentsLoading);

const newContent = ref("");
const sending = ref(false);
const selectedFile = ref<File | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

const canManage = (comment: any) => isAdmin.value || comment.user?.id === userCookie.value?.id;

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("fa-IR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatFileSize = (bytes: number) => {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`;
};

const triggerFileInput = () => fileInputRef.value?.click();

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files?.[0]) selectedFile.value = input.files[0];
  input.value = "";
};

const removeSelectedFile = () => {
  selectedFile.value = null;
};

const handleCreate = async () => {
  if ((!newContent.value.trim() && !selectedFile.value) || sending.value) return;
  sending.value = true;

  try {
    let uploadedAttachment: any = null;

    // ۱. اول فایل رو آپلود کن (اگه داریم)
    if (selectedFile.value) {
      const formData = new FormData();
      formData.append("file", selectedFile.value);
      const uploadRes: any = await taskService.uploadAttachment(props.taskId, formData);
      uploadedAttachment = uploadRes?.data ?? uploadRes;
    }

    // ۲. کامنت رو بفرست
    const content = newContent.value.trim() || `📎 ${selectedFile.value?.name}`;
    const created = await taskStore.addComment(props.taskId, content);

    // ۳. اگه فایل داشت، attachment رو به کامنت وصل کن (local state)
    if (created && uploadedAttachment) {
      const idx = taskStore.comments.findIndex((c) => c.id === created.id);
      if (idx !== -1) {
        taskStore.comments[idx] = {
          ...taskStore.comments[idx],
          attachment: uploadedAttachment,
        };
      }
    }

    newContent.value = "";
    selectedFile.value = null;
  } catch (e) {
    console.error("خطا در ارسال گزارش:", e);
  } finally {
    sending.value = false;
  }
};

const handleDeleteComment = async (comment: any) => {
  if (!confirm("آیا از حذف این گزارش مطمئن هستید؟")) return;
  try {
    if (comment.attachment?.id) {
      await taskService.deleteAttachment(comment.attachment.id);
    }
    await taskStore.removeComment(comment.id);
  } catch (e) {
    console.error(e);
  }
};

const handleDeleteAttachment = async (comment: any) => {
  if (!comment.attachment?.id) return;
  if (!confirm("آیا از حذف این فایل مطمئن هستید؟")) return;
  try {
    await taskService.deleteAttachment(comment.attachment.id);
    const idx = taskStore.comments.findIndex((c) => c.id === comment.id);
    if (idx !== -1) {
      taskStore.comments[idx] = { ...taskStore.comments[idx], attachment: null };
    }
  } catch (e) {
    console.error(e);
  }
};

onMounted(() => taskStore.loadComments(props.taskId));
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>

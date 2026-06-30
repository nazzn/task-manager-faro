<!-- <template>
  <nav
    v-if="totalPages >= 1"
    class="flex items-center justify-center gap-1 mt-6"
    aria-label="Pagination"
  >
    <button
      :disabled="currentPage === 1"
      @click="changePage(currentPage - 1)"
      class="w-4 h-[18px]  rounded-md text-sm font-medium transition-colors"
      :class="
        currentPage === 1
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
      "
    >
     <
    </button>

    <div class="flex gap-1">
      <button
        v-for="page in visiblePages"
        :key="page"
        @click="typeof page === 'number' ? changePage(page) : null"
        :disabled="typeof page !== 'number'"
        class=" w-4 h-[18px] rounded-md text-sm  transition-colors"
        :class="{
          'bg-[#219653] text-white': currentPage === page,
          'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300':
            currentPage !== page && typeof page === 'number',
          'bg-transparent text-gray-500 cursor-default': typeof page !== 'number',
        }"
      >
        {{ page }}
      </button>
    </div>

    <button
      :disabled="currentPage === totalPages"
      @click="changePage(currentPage + 1)"
      class="w-4 h-[18px]  rounded-md text-sm font-medium transition-colors"
      :class="
        currentPage === totalPages
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
      "
    >
      >
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  totalItems: number
  modelValue: number        // صفحه جاری (v-model)
  pageSize?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', page: number): void
}>()

const pageSizeValue = computed(() => props.pageSize ?? 5)
const totalPages = computed(() => Math.ceil(props.totalItems / pageSizeValue.value))

// صفحه جاری از modelValue
const currentPage = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// محاسبه صفحات قابل نمایش (با ...)
const visiblePages = computed<(number | string)[]>(() => {
  const current = currentPage.value
  const total = totalPages.value
  const delta = 2
  const range: number[] = []
  const rangeWithDots: (number | string)[] = []
  let l: number | undefined

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i)
    }
  }

  range.forEach((i) => {
    if (l !== undefined) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  })

  return rangeWithDots
})

const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  emit('update:modelValue', page)
}
</script> -->
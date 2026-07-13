<!-- // app/layouts/default.ts -->

<template>
  <div class="min-h-screen bg-[#F9FAFB]">
    <!-- کانتینر وسط‌چین با حداکثر عرض 1280px -->
    <div class="">
      <div class="flex flex-row gap-1" dir="ltr">
        <!-- محتوای اصلی -->
        <main class="flex-1 min-w-0">
          <div dir="rtl">
            <AppHeader />
            <div class="mt-4">
              <slot />
            </div>
          </div>
        </main>

        <!-- سایدبار -->
        <aside class="shrink-0">
          <div dir="rtl">
            <Sidebar />
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

// app/plugins/click-outside.ts.ts 
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("click-outside", {
    mounted(
      el: HTMLElement & { _clickOutside?: (event: Event) => void },
      binding
    ) {
      const handler = (event: Event) => {
        const target = event.target as Node;

        // اگر کلیک روی خود المان یا داخل آن بود، کاری نکن
        if (el === target || el.contains(target)) {
          return;
        }

        // اگر بیرون کلیک شد
        binding.value(event);
      };

      el._clickOutside = handler;

      document.addEventListener("click", handler);
    },

    unmounted(
      el: HTMLElement & { _clickOutside?: (event: Event) => void }
    ) {
      if (el._clickOutside) {
        document.removeEventListener("click", el._clickOutside);
        delete el._clickOutside;
      }
    },
  });
});

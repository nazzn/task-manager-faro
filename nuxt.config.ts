export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  devtools: { enabled: true },

  components: true,

  srcDir: "app/",

  css: ["./app/assets/main.css"],

  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt", "@nuxt/eslint"],

  runtimeConfig: {
    apiBase: "http://localhost:8080/api",
  },
});

export const normalizeError = (err: any): string => {
  // ۱. اگر خطا اصلاً وجود نداشت
  if (!err) return "خطای ناشناخته رخ داده است";

  // ۲. اگر خطا خودش یک رشته ساده بود
  if (typeof err === "string") return err;

  // ۳. استخراج پیام از ساختارهای مختلف (Nuxt $fetch, Axios, Generic)
  const message =
    err?.data?.message || // ساختار استاندارد Nuxt $fetch
    err?.response?._data?.message || // لایه عمیق‌تر در برخی نسخه‌های ohmyfetch
    err?.message || // خطاهای استاندارد JS
    err?.toString?.(); // آخرین تلاش: تبدیل کل شیء به رشته

  // ۴. بررسی نهایی برای جلوگیری از بازگشت مقادیر پوچ یا آبجکتهای عجیب
  if (
    !message ||
    typeof message !== "string" ||
    message.includes("[object Object]")
  ) {
    return "مشکلی در برقراری ارتباط با سرور پیش آمد";
  }

  return message;
};

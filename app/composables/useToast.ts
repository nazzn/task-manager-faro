// app/composables/useToast.ts
export const useToast = () => {
  const toast = useState<string | null>(
    "toast-message",
    () => null
  );

  const showToast = (
    message: string,
    duration = 3000
  ) => {
    toast.value = message;

    setTimeout(() => {
      toast.value = null;
    }, duration);
  };

  return {
    toast,
    showToast,
  };
};
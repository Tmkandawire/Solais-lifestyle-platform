import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors={false}
      closeButton
      toastOptions={{
        duration: 4500,
        classNames: {
          toast:
            "border border-[#122425]/10 bg-[#f7f3ed] text-[#122425] shadow-[0_18px_50px_rgba(18,36,37,0.14)]",
          title: "font-sans text-sm font-semibold text-[#122425]",
          description: "font-sans text-xs leading-5 text-[#5f6462]",
          actionButton:
            "rounded-full bg-[#122425] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f7f3ed]",
          cancelButton:
            "rounded-full bg-[#efe7dc] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#122425]",
          closeButton:
            "border-[#122425]/10 bg-transparent text-[#122425]/45 hover:bg-[#efe7dc] hover:text-[#122425]",
          success: "border-[#315f49]/20 bg-[#f7f3ed]",
          error: "border-[#704545]/20 bg-[#f7f3ed]",
          warning: "border-[#806238]/20 bg-[#f7f3ed]",
          info: "border-[#122425]/15 bg-[#f7f3ed]",
        },
      }}
    />
  );
}

import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "flex items-start gap-3 rounded-md border px-4 py-3 text-sm",
  {
    variants: {
      tone: {
        info: "border-slate-200 bg-white text-slate-700",
        success: "border-emerald-200 bg-emerald-50 text-emerald-900",
        error: "border-red-200 bg-red-50 text-red-900",
      },
    },
    defaultVariants: {
      tone: "info",
    },
  },
);

interface AlertProps extends VariantProps<typeof alertVariants> {
  children: ReactNode;
  className?: string;
  onDismiss?: () => void;
}

export function Alert({ tone, className, children, onDismiss }: AlertProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(alertVariants({ tone }), className)}
    >
      <div className="flex-1">{children}</div>
      {onDismiss && (
        <button
          type="button"
          aria-label="알림 닫기"
          onClick={onDismiss}
          className="rounded-md p-0.5 opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <X aria-hidden className="size-4" />
        </button>
      )}
    </div>
  );
}

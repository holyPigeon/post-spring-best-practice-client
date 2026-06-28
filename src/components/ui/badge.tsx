import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        neutral: "bg-slate-100 text-slate-700",
        info: "bg-sky-100 text-sky-800",
        success: "bg-emerald-100 text-emerald-800",
        danger: "bg-red-100 text-red-800",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ className, tone }))} {...props} />;
}

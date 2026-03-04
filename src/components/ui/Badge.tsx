import { type ReactNode } from "react";

type BadgeVariant = "default" | "success" | "danger" | "warning";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-accent-dim text-accent-light",
  success: "bg-success-dim text-success",
  danger: "bg-danger-dim text-danger",
  warning: "bg-warning-dim text-warning",
};

export function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium leading-none whitespace-nowrap",
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}

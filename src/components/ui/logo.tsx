import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

/** NextNest logomark — a simple house icon in a rounded square. */
export function LogoMark({ className, size = "sm" }: LogoMarkProps) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-7 w-7",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl bg-primary text-primary-foreground",
        sizes[size],
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={iconSizes[size]}
      >
        <path d="M3 12L12 4l9 8" />
        <path d="M5 12v7a1 1 0 001 1h12a1 1 0 001-1v-7" />
      </svg>
    </div>
  );
}

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

/** Full NextNest logo with mark + wordmark. */
export function Logo({ className, size = "sm", showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      {showText && (
        <span
          className={cn(
            "font-bold tracking-tight",
            size === "lg" ? "text-xl" : "text-lg"
          )}
        >
          NextNest
        </span>
      )}
    </div>
  );
}

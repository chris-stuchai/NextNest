import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * NextNest logomark — a geometric "N" lettermark in a squircle.
 * Replaces the generic Sparkles icon throughout the app.
 */
export function LogoMark({ className, size = "sm" }: LogoMarkProps) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
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
        className={cn(
          size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-7 w-7"
        )}
      >
        <path
          d="M6 18V6h1.5l9 9.5V6H18v12h-1.5L7.5 8.5V18H6Z"
          fill="currentColor"
        />
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

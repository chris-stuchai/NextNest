import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * NextNest logomark — two "N" letterforms styled as houses with peaked roofs,
 * connected by a curved road. Tells the NextNest story in a single mark.
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
          size === "sm" ? "h-5 w-5" : size === "md" ? "h-6 w-6" : "h-9 w-9"
        )}
      >
        <path
          d="M2 20V10L6 4L10 10V20M2 10L10 20M14 20V10L18 4L22 10V20M14 10L22 20M10 20C11.5 18.5 12.5 18.5 14 20"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
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

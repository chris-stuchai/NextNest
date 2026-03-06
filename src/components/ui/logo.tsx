import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * NextNest logomark — a clean house silhouette with a curved road
 * extending from its base, representing the journey to your next home.
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
        {/* House: peaked roof + walls */}
        <path
          d="M2 13L10 5L18 13M5 13V20H15V13"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Road curving away from house */}
        <path
          d="M15 20C17.5 20 20 19 22 17.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
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

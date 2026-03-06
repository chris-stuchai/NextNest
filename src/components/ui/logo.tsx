import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

/** NextNest logomark — a bold "N" in a rounded square. */
export function LogoMark({ className, size = "sm" }: LogoMarkProps) {
  const sizes = {
    sm: "h-8 w-8 text-lg",
    md: "h-10 w-10 text-xl",
    lg: "h-14 w-14 text-3xl",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold select-none",
        sizes[size],
        className
      )}
    >
      N
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

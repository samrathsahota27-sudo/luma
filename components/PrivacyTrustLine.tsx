import { cn } from "@/lib/utils";

type PrivacyTrustLineProps = {
  className?: string;
  /** Visual treatment for surrounding background */
  variant?: "hero" | "onDark" | "muted";
  /** Wider max width for footers / result stacks */
  size?: "default" | "wide";
};

export function PrivacyTrustLine({
  className,
  variant = "muted",
  size = "default",
}: PrivacyTrustLineProps) {
  const variantClass =
    variant === "hero"
      ? "text-white/72"
      : variant === "onDark"
        ? "text-white/55"
        : "text-muted-foreground";

  const maxW = size === "wide" ? "max-w-xl" : "max-w-lg";

  return (
    <p
      className={cn("text-center text-[13px] leading-snug mx-auto", maxW, variantClass, className)}
      role="note"
    >
      <span className="mr-1" aria-hidden>
        🔒
      </span>
      Your responses are private and never sold. We don&apos;t store images.
    </p>
  );
}

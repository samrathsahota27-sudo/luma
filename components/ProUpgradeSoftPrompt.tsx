import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { FREE_INDIVIDUAL_REFLECTIONS_PER_MONTH } from "@/lib/reflectionUsage";

type Props = {
  visible: boolean;
  className?: string;
  /** Light cards on reflect page vs dark on test */
  variant?: "light" | "dark";
};

export function ProUpgradeSoftPrompt({ visible, className, variant = "light" }: Props) {
  if (!visible) return null;

  const isDark = variant === "dark";

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 md:p-6 text-center",
        isDark
          ? "border-violet-400/25 bg-[linear-gradient(145deg,rgba(110,80,180,0.12),rgba(25,22,35,0.95))]"
          : "border-primary/25 bg-primary/[0.06]",
        className
      )}
      role="status"
    >
      <div className="inline-flex items-center justify-center gap-2 text-sm font-medium">
        <Sparkles className={cn("h-4 w-4", isDark ? "text-violet-200/90" : "text-primary")} aria-hidden />
        <span className={isDark ? "text-white/90" : "text-foreground"}>You&apos;ve reached your free limit</span>
      </div>
      <p
        className={cn(
          "mt-3 text-sm leading-relaxed max-w-md mx-auto",
          isDark ? "text-white/70" : "text-muted-foreground"
        )}
      >
        You&apos;ve used your {FREE_INDIVIDUAL_REFLECTIONS_PER_MONTH} free reflections this month. Upgrade to Pro for
        unlimited access.
      </p>
      <Link
        href="/pricing"
        className={cn(
          "mt-4 inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90",
          isDark
            ? "bg-white text-[#0b0a0d] shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_28px_rgba(120,90,180,0.25)]"
            : "bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.2)]"
        )}
      >
        View Pro pricing
      </Link>
    </div>
  );
}

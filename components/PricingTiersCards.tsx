import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const FREE_FEATURES = [
  "2 individual reflections per month",
  "Individual mode only (no couple sessions)",
  "Basic insights",
  "No saved history",
];

const PRO_FEATURES = [
  "Unlimited reflections",
  "Full history & pattern tracking",
  "Couples sync with shareable links",
  "Deeper AI insights",
  "Export to PDF",
  "Priority support",
];

type Props = {
  className?: string;
  /** Slightly tighter padding on homepage */
  compact?: boolean;
};

export function PricingTiersCards({ className, compact }: Props) {
  const pad = compact ? "p-6 md:p-7" : "p-7 md:p-8";

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-[920px] mx-auto", className)}>
      <div
        className={cn(
          "rounded-[22px] border border-white/10 bg-white/[0.04] shadow-[0_12px_48px_rgba(0,0,0,0.35)] backdrop-blur-sm",
          pad
        )}
      >
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">Free</p>
        <p className="mt-3 font-serif text-2xl text-white [font-family:var(--font-serif-display)]">$0</p>
        <p className="mt-1 text-sm text-white/50">Forever — try Luma at your pace</p>
        <ul className="mt-6 space-y-3">
          {FREE_FEATURES.map((line) => (
            <li key={line} className="flex gap-3 text-sm text-white/75">
              <Check className="h-4 w-4 shrink-0 text-emerald-400/90 mt-0.5" aria-hidden />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/choose-mode"
          className="mt-8 inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.1]"
        >
          Start free
        </Link>
      </div>

      <div
        className={cn(
          "relative rounded-[22px] border border-violet-400/30 bg-[linear-gradient(165deg,rgba(110,80,180,0.14),rgba(18,16,26,0.92))] shadow-[0_16px_56px_rgba(60,40,100,0.35)] backdrop-blur-sm ring-1 ring-white/8",
          pad
        )}
      >
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-violet-300/35 bg-[#1f1a2a] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-100/95">
          Most popular
        </span>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-200/75">Pro</p>
        <p className="mt-3 font-serif text-2xl text-white [font-family:var(--font-serif-display)]">
          $9<span className="text-base font-sans font-normal text-white/55">/mo</span>
        </p>
        <p className="mt-1 text-sm text-white/55">
          or <span className="text-white/75 font-medium">$79/year</span> — placeholder pricing; Stripe coming soon
        </p>
        <ul className="mt-6 space-y-3">
          {PRO_FEATURES.map((line) => (
            <li key={line} className="flex gap-3 text-sm text-white/82">
              <Check className="h-4 w-4 shrink-0 text-violet-300/90 mt-0.5" aria-hidden />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/pricing#pro-waitlist"
          className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-white py-3 text-sm font-semibold text-[#0b0a0d] shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_12px_40px_rgba(120,90,180,0.25)] transition-opacity hover:opacity-92"
        >
          Get early access to Pro
        </Link>
      </div>
    </div>
  );
}

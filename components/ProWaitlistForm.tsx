"use client";

import { WaitlistSignupForm } from "@/components/WaitlistSignupForm";
import { cn } from "@/lib/utils";

export function ProWaitlistForm({ className }: { className?: string }) {
  return (
    <div id="pro-waitlist" className={cn("scroll-mt-28", className)}>
      <WaitlistSignupForm
        source="pricing-pro"
        title="Get early access to Pro"
        description="Leave your email — no payment yet. We&apos;ll notify you when Pro is ready."
        submitLabel="Join waitlist"
        successMessage="You're on the list — we'll reach out when Pro launches."
        theme="dark"
        idPrefix="pro-waitlist"
      />
    </div>
  );
}

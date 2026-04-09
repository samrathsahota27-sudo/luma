import { cn } from "@/lib/utils";

/**
 * Standard non-clinical disclaimer for reflection result views.
 */
export function ResultClinicalDisclaimer({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "mx-auto max-w-[560px] px-4 text-center text-[11px] leading-relaxed text-muted-foreground/90",
        className
      )}
      role="note"
    >
      Luma is a reflective tool, not a clinical assessment. Results are interpretive, not diagnostic.
    </p>
  );
}

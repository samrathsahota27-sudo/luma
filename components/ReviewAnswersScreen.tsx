"use client";

import Image from "next/image";
import { reflectionRounds, TOTAL_ROUNDS } from "@/lib/reflection/reflectionRounds";
import { round5Images } from "@/lib/reflection/round5Images";
import { applyImageErrorFallback, normalizePublicImageSrc } from "@/lib/publicImage";

export type ReviewAnswersMap = Record<
  number,
  {
    selectedType?: string;
    selectedImage?: unknown;
    image?: number | null;
    selectedImageId?: number | null;
    text?: string;
    noneText?: string;
    userExplanation?: string;
  }
>;

function imagePublicPath(roundNumber: number, imageIndex: number): string | null {
  const def = reflectionRounds.find((r) => r.roundNumber === roundNumber);
  const segment = def?.images?.[imageIndex];
  if (typeof segment !== "string" || !segment) return null;
  return normalizePublicImageSrc(segment);
}

function excerpt(s: string, max = 140) {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function ReviewAnswersScreen({
  answers,
  onEdit,
  onContinue,
  errorMessage,
  maxRound = TOTAL_ROUNDS,
}: {
  answers: ReviewAnswersMap;
  onEdit: (roundNumber: number) => void;
  onContinue: () => void;
  errorMessage?: string | null;
  /** Cap which rounds appear (e.g. 4 for individual, full TOTAL_ROUNDS for couple). */
  maxRound?: number;
}) {
  const rounds = reflectionRounds.filter((r) => r.roundNumber <= maxRound);

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-32 pt-6 md:max-w-xl md:px-6 md:pt-8">
      <h1 className="text-center font-serif text-2xl leading-tight text-foreground md:text-3xl [font-family:var(--font-serif-display)]">
        Review your answers
      </h1>
      <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-muted-foreground">
        Quick check before your reflection. Tap edit to change any round.
      </p>
      <p className="mx-auto mt-4 max-w-sm text-center text-xs leading-relaxed text-muted-foreground/75 italic md:text-[13px]">
        These choices reflect your instinct — not your logic.
      </p>

      {errorMessage ? (
        <div
          className="mt-6 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      <ul className="mt-8 flex flex-col gap-8 md:gap-10">
        {rounds.map((meta) => {
          const n = meta.roundNumber;
          const a = answers[n];
          const isNone =
            a?.selectedType === "none" || a?.selectedImage === "none";
          const idx =
            typeof a?.selectedImageId === "number"
              ? a.selectedImageId
              : typeof a?.image === "number"
                ? a.image
                : null;
          const src = !isNone && typeof idx === "number" ? imagePublicPath(n, idx) : null;
          const r5label =
            n === 5 && typeof idx === "number" ? round5Images[idx]?.name : null;
          const noneBody = excerpt(
            String(a?.noneText ?? a?.text ?? a?.userExplanation ?? "")
          );

          return (
            <li
              key={n}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.25)] md:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Round {n}
                  </p>
                  <h2 className="mt-1 font-medium text-foreground">{meta.question}</h2>
                  {r5label ? (
                    <p className="mt-1 text-sm text-muted-foreground">{r5label}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => onEdit(n)}
                  className="shrink-0 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.1] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/45 min-h-[44px]"
                  aria-label={`Edit round ${n}`}
                >
                  Edit
                </button>
              </div>

              <div className="relative mt-4 w-full overflow-hidden rounded-xl border border-white/10 bg-black/20">
                {src ? (
                  <div className="relative aspect-[4/3] w-full md:aspect-[16/10]">
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 560px"
                      onError={applyImageErrorFallback}
                    />
                  </div>
                ) : (
                  <div className="flex min-h-[160px] flex-col justify-center gap-2 px-4 py-6 md:min-h-[200px]">
                    <p className="text-sm font-medium text-foreground">Written response</p>
                    {noneBody ? (
                      <p className="text-sm leading-relaxed text-muted-foreground">{noneBody}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">No image selected for this round.</p>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-background/95 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md md:static md:z-auto md:mt-10 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <button
          type="button"
          onClick={onContinue}
          className="flex w-full min-h-[52px] items-center justify-center rounded-2xl bg-primary px-6 text-base font-semibold text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_16px_48px_rgba(120,90,180,0.28)] transition-opacity hover:opacity-92 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
        >
          Continue → See result
        </button>
      </div>
    </div>
  );
}

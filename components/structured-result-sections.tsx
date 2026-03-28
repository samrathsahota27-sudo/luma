import React from "react"
import { BrutalTruthHeadline } from "@/components/BrutalTruthHeadline"
import { ShadowInsightBlock } from "@/components/ShadowInsightBlock"
import { HowToReadThisVisual, type HowToReadTagInput } from "@/components/HowToReadThisVisual"
import { InSimpleWordsSection } from "@/components/InSimpleWordsSection"

function toHtml(text: string) {
  return text.replace(/\n/g, "<br>")
}

function splitIntoSections(raw: string) {
  const cleaned = (raw || "").trim()
  const parts = cleaned
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  const fallback = { p: "", r: "", d: "", f: "" }
  if (parts.length === 0) return fallback
  if (parts.length === 1) return { p: parts[0], r: "", d: "", f: "" }
  if (parts.length === 2) return { p: parts[0], r: parts[1], d: "", f: "" }
  if (parts.length === 3) return { p: parts[0], r: parts[1], d: parts[2], f: "" }
  return {
    p: parts[0],
    r: parts[1],
    d: parts[2],
    f: parts.slice(3).join("\n\n"),
  }
}

function hasHowToReadTags(tags: HowToReadTagInput | null | undefined) {
  if (!tags || typeof tags !== "object") return false
  return !!(tags.round2Tag || tags.round3Tag || tags.round5Tag)
}

export function StructuredResultSections({
  result,
  brutalTruth,
  shadowInsight,
  howToReadTags = null,
  inSimpleWords = null,
}: {
  result: string
  brutalTruth?: string | null
  shadowInsight?: string | null
  /** Individual: tags for “How to Read This” (shown above In Simple Words when set). */
  howToReadTags?: HowToReadTagInput | null
  /** Plain 3–4 lines; shown below How to Read This, above Brutal Truth when set. */
  inSimpleWords?: string[] | null
}) {
  const { p, r, d, f } = splitIntoSections(result)

  const sections: Array<{ title: string; body: string }> = [
    { title: "Your emotional pattern", body: p },
    { title: "What this reveals", body: r || "" },
    { title: "Deeper insight", body: d || "" },
    { title: "Reflection", body: f || "" },
  ]

  const [firstSection, ...restSections] = sections

  function renderSection(s: { title: string; body: string }) {
    return (
      <section
        key={s.title}
        className="luma-glass border border-white/10 p-6 md:p-8"
      >
        <h2 className="font-serif text-[20px] md:text-[22px] text-foreground [font-family:var(--font-serif-display)] mb-4">
          {s.title}
        </h2>
        {s.body ? (
          <div
            className="text-muted-foreground text-base md:text-lg leading-[1.85] [&>br]:block [&>br]:mb-4"
            style={{ fontFamily: "var(--font-sans), Inter, system-ui, sans-serif" }}
            dangerouslySetInnerHTML={{ __html: toHtml(s.body) }}
          />
        ) : (
          <p className="text-muted-foreground text-base md:text-lg leading-[1.85]" style={{ fontFamily: "var(--font-sans), Inter, system-ui, sans-serif" }}>
            —
          </p>
        )}
      </section>
    )
  }

  const showHowToRead = hasHowToReadTags(howToReadTags)
  const topSpacer =
    showHowToRead || (inSimpleWords && inSimpleWords.length > 0) || brutalTruth?.trim()
      ? "mt-4 md:mt-6"
      : "mt-12 md:mt-16"

  return (
    <div className={topSpacer}>
      {showHowToRead ? (
        <HowToReadThisVisual tags={howToReadTags} className="mb-8 md:mb-10" />
      ) : null}
      <InSimpleWordsSection lines={inSimpleWords} className="mb-8 md:mb-10" />
      <BrutalTruthHeadline text={brutalTruth} />
      <div className="space-y-6 md:space-y-8">
        {firstSection ? renderSection(firstSection) : null}
        <ShadowInsightBlock text={shadowInsight} />
        {restSections.map((s) => renderSection(s))}
      </div>
    </div>
  )
}


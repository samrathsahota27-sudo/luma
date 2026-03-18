import React from "react"

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

export function StructuredResultSections({ result }: { result: string }) {
  const { p, r, d, f } = splitIntoSections(result)

  const sections: Array<{ title: string; body: string }> = [
    { title: "Your emotional pattern", body: p },
    { title: "What this reveals", body: r || "" },
    { title: "Deeper insight", body: d || "" },
    { title: "Reflection", body: f || "" },
  ]

  return (
    <div className="mt-12 md:mt-16 space-y-6 md:space-y-8">
      {sections.map((s) => (
        <section
          key={s.title}
          className="rounded-[16px] bg-[#F5F3EE] border border-[#E8E3D9]/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 md:p-8"
        >
          <h2 className="font-serif text-[20px] md:text-[22px] text-[#2F2F2F] [font-family:var(--font-serif-display)] mb-4">
            {s.title}
          </h2>
          {s.body ? (
            <div
              className="text-[#5a5a5a] text-base md:text-lg leading-[1.85] [&>br]:block [&>br]:mb-4"
              style={{ fontFamily: "var(--font-sans), Inter, system-ui, sans-serif" }}
              dangerouslySetInnerHTML={{ __html: toHtml(s.body) }}
            />
          ) : (
            <p className="text-[#5a5a5a] text-base md:text-lg leading-[1.85]" style={{ fontFamily: "var(--font-sans), Inter, system-ui, sans-serif" }}>
              —
            </p>
          )}
        </section>
      ))}
    </div>
  )
}


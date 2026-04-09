import type { ReactNode } from "react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight, ExternalLink } from "lucide-react";

function ExternalCitation({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1 text-foreground underline decoration-white/25 underline-offset-4 transition hover:decoration-violet-300/60"
    >
      {children}
      <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60 group-hover:opacity-90" aria-hidden />
    </a>
  );
}

export default function SciencePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />

      <main className="flex-1 pt-20">
        <section className="max-w-[720px] mx-auto px-6 py-16 md:py-24 text-center">
          <p className="text-sm text-muted-foreground leading-relaxed max-w-[560px] mx-auto">
            Inspired by research in projective psychology, visual cognition, and AI pattern recognition.
          </p>
          <h1 className="mt-6 font-serif text-3xl md:text-[2.75rem] leading-tight text-foreground text-balance [font-family:var(--font-serif-display)]">
            Our approach
          </h1>
          <p className="mt-6 text-muted-foreground text-base md:text-lg leading-relaxed max-w-[640px] mx-auto">
            Luma uses images and language to help you notice patterns in how you see and respond. We are transparent
            about what that involves—and what it does not.
          </p>
        </section>

        <section className="border-t border-white/10">
          <div className="max-w-[720px] mx-auto px-6 py-14 md:py-20">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground [font-family:var(--font-serif-display)]">
              Why images?
            </h2>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                For more than a century, clinicians and researchers have used{" "}
                <strong className="text-foreground/90 font-medium">ambiguous visual stimuli</strong> to study how people
                project meaning, memory, and feeling onto what they see. The Rorschach inkblots are the best-known
                example. <strong className="text-foreground/90 font-medium">Luma is not the Rorschach</strong>—we do not
                administer a standardized test or score responses against clinical norms.
              </p>
              <p>
                We are inspired by the same broad idea:{" "}
                <strong className="text-foreground/90 font-medium">
                  images can invite reflection before you have a neat verbal story
                </strong>
                . In expressive and arts-informed work, visual metaphor is often used to externalize inner experience and
                support meaning-making in a therapeutic relationship. Luma borrows that spirit for a{" "}
                <strong className="text-foreground/90 font-medium">self-guided</strong>, digital prompt—not therapy
                itself.
              </p>
              <p>
                Choosing among images is a form of{" "}
                <strong className="text-foreground/90 font-medium">non-verbal self-expression</strong>: what pulls you,
                what you avoid, and what you return to can be as informative as what you would say in a questionnaire—
                with the caveat that none of this is measurement in a clinical sense (see below).
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-white/[0.03]">
          <div className="max-w-[720px] mx-auto px-6 py-14 md:py-20">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground [font-family:var(--font-serif-display)]">
              What the AI does
            </h2>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                When you complete a flow, your image choices and any text you add are sent to a{" "}
                <strong className="text-foreground/90 font-medium">large language model</strong> (e.g. GPT-4 class
                models) that generates <strong className="text-foreground/90 font-medium">interpretive</strong> copy:
                themes, tensions, and language meant to mirror and extend your reflection.
              </p>
              <p>
                The model does <strong className="text-foreground/90 font-medium">not</strong> access medical records,
                diagnose conditions, or apply validated psychometric scoring. It produces plausible, empathetic
                narrative based on patterns in your inputs—useful for self-reflection, not for clinical decision-making.
              </p>
              <p>
                Outputs can be wrong, overly general, or misaligned with your situation. Treat them as{" "}
                <strong className="text-foreground/90 font-medium">starting points for your own judgment</strong>, not
                as facts about who you are.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10">
          <div className="max-w-[720px] mx-auto px-6 py-14 md:py-20">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground [font-family:var(--font-serif-display)]">
              What this is NOT
            </h2>
            <ul className="mt-6 space-y-3 text-muted-foreground leading-relaxed list-disc list-inside marker:text-white/35">
              <li>
                <strong className="text-foreground/90 font-medium">Not a diagnostic tool</strong>—it does not identify
                mental health disorders or replace assessment by a qualified professional.
              </li>
              <li>
                <strong className="text-foreground/90 font-medium">Not therapy</strong>—there is no therapeutic
                relationship, duty of care, or individualized treatment plan.
              </li>
              <li>
                <strong className="text-foreground/90 font-medium">Not a substitute for professional support</strong>
                —if you are in crisis or need care, please contact a licensed clinician or emergency services in your
                area.
              </li>
            </ul>
          </div>
        </section>

        <section className="border-t border-white/10 bg-white/[0.03]">
          <div className="max-w-[720px] mx-auto px-6 py-14 md:py-20">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground [font-family:var(--font-serif-display)]">
              Our inspiration
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              We read widely; the list below is not exhaustive. These works illustrate threads we find thought-provoking
              —from how projective methods are evaluated, to emotional processing through visual art, to how LLMs are
              being discussed in mental health research. Citing them does <strong className="text-foreground/90 font-medium">not</strong>{" "}
              mean Luma is &quot;validated&quot; by them; they inform our honest framing.
            </p>
            <ul className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
              <li>
                <p className="text-foreground font-medium">(a) Image-based projection and projective techniques</p>
                <p className="mt-2">
                  Lilienfeld, S. O., Wood, J. M., &amp; Garb, H. N. (2000). The scientific status of projective
                  techniques. <em>Psychological Science in the Public Interest</em>, 1(2), 27–66.{" "}
                  <ExternalCitation href="https://doi.org/10.1111/1529-1006.002">DOI: 10.1111/1529-1006.002</ExternalCitation>
                </p>
                <p className="mt-2 text-sm text-muted-foreground/90">
                  A landmark critical review of projective tests—useful context for why Luma avoids claiming clinical
                  validation.
                </p>
              </li>
              <li>
                <p className="text-foreground font-medium">(b) Visual art and emotional processing</p>
                <p className="mt-2">
                  Weinfeld-Yehoudayan, A., Czamanski-Cohen, J., Cohen, M., &amp; Weihs, K. L. (2024). A theoretical model
                  of emotional processing in visual artmaking and art therapy. <em>The Arts in Psychotherapy</em>, 90,
                  102196.{" "}
                  <ExternalCitation href="https://doi.org/10.1016/j.aip.2024.102196">
                    DOI: 10.1016/j.aip.2024.102196
                  </ExternalCitation>{" "}
                  ·{" "}
                  <ExternalCitation href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11391909/">PMC open-access version</ExternalCitation>
                </p>
                <p className="mt-2 text-sm text-muted-foreground/90">
                  Connects nonverbal, embodied experience in artmaking to emotional processing—parallel themes to
                  &quot;noticing before naming,&quot; outside a therapy room.
                </p>
              </li>
              <li>
                <p className="text-foreground font-medium">(c) AI and mental health tools</p>
                <p className="mt-2">
                  Guo, Z., Lai, A., Thygesen, J. H., Farrington, J., Keen, T., &amp; Li, K. (2024). Large language models
                  for mental health applications: Systematic review. <em>JMIR Mental Health</em>, 11, e57400.{" "}
                  <ExternalCitation href="https://doi.org/10.2196/57400">DOI: 10.2196/57400</ExternalCitation> ·{" "}
                  <ExternalCitation href="https://mental.jmir.org/2024/1/e57400">Journal page</ExternalCitation>
                </p>
                <p className="mt-2 text-sm text-muted-foreground/90">
                  Surveys LLM uses and risks in mental health contexts; aligns with treating Luma as a reflective aid,
                  not a clinical instrument.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <section className="border-t border-white/10">
          <div className="max-w-[720px] mx-auto px-6 py-14 md:py-16 text-center">
            <p className="font-serif text-xl md:text-2xl text-foreground leading-relaxed [font-family:var(--font-serif-display)]">
              Luma is not here to label you.
            </p>
            <p className="mt-3 font-serif text-xl md:text-2xl text-foreground leading-relaxed [font-family:var(--font-serif-display)]">
              It is here to help you notice.
            </p>
          </div>
        </section>

        <section className="border-t border-white/10 bg-card/85 backdrop-blur-xl text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_-24px_80px_rgba(100,80,160,0.1)]">
          <div className="max-w-[720px] mx-auto px-6 py-16 text-center">
            <h2 className="font-serif text-2xl md:text-3xl [font-family:var(--font-serif-display)]">
              Try a reflection
            </h2>
            <Link
              href="/reflect"
              className="inline-flex items-center justify-center gap-2 mt-8 rounded-[12px] bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] transition-opacity hover:opacity-90"
            >
              Begin reflection
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

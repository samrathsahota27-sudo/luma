import Link from "next/link";
import {
  LumaButton,
  LumaCard,
  LumaCTASection,
  LumaField,
  LumaHero,
  LumaResultPanel,
  LumaShell,
  LumaTopNav,
  LumaFocusSheet,
} from "@/components/luma-ui";

/**
 * Internal showcase: Luma design language + reusable blocks.
 * Not linked from main nav — visit `/design-system` directly.
 */
export default function DesignSystemShowcasePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LumaTopNav
        right={
          <Link href="/" className="text-foreground underline-offset-4 hover:underline">
            Home
          </Link>
        }
      />

      <main className="pt-14">
        <LumaShell>
          <LumaHero
            kicker="Pattern recognition"
            title="See the story you keep telling yourself."
            subtitle="Luma is built for slow honesty: a few choices, your words, and a mirror that does not flatter you."
            className="motion-safe:animate-luma-fade-in"
          >
            <LumaButton>Begin a reflection</LumaButton>
            <LumaButton variant="secondary">How it works</LumaButton>
          </LumaHero>
        </LumaShell>

        <LumaShell density="tight" className="space-y-8 md:space-y-10">
          <LumaCard eyebrow="Session" title="Round 2 — beneath the surface" variant="glass">
            <p className="mb-4 text-muted-foreground">
              Pick the scene that feels most true, then name what it borrows from your actual life.
            </p>
            <LumaField
              id="ds-sample-field"
              label="In your own words"
              hint="Short clauses beat polish. You can rewrite later — first pass should be honest."
              placeholder="This reminds me of…"
            />
          </LumaCard>

          <LumaResultPanel
            headline="You reach for closeness, then hesitate at the last step."
            pullQuote="The cost is not drama — it is a relationship that never quite lands."
          >
            <p>
              You described tension between wanting connection and protecting yourself from being misunderstood. That split
              often shows up as warmth followed by withdrawal.
            </p>
            <p>
              This is not a character flaw; it is a strategy that worked until it didn’t. naming it is the first move toward
              choosing differently.
            </p>
          </LumaResultPanel>

          <LumaCTASection
            title="Save this reflection"
            footnote="We keep your answers private. Accounts help you return without losing the thread."
          >
            <LumaButton fullWidth>Create account</LumaButton>
            <LumaButton variant="secondary" fullWidth>
              Maybe later
            </LumaButton>
          </LumaCTASection>

          <div className="flex justify-center pb-12">
            <LumaFocusSheet
              trigger={<LumaButton variant="ghost">Why we ask for depth</LumaButton>}
              title="Depth mode"
              description="Steel is direct. Satin leaves more room for ambiguity. Same mirror — different edge."
            >
              <p className="text-sm leading-relaxed text-muted-foreground">
                You can switch depth anytime. The goal is resonance, not shock: enough specificity to feel seen, enough
                safety to stay with it.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <LumaButton fullWidth>Continue</LumaButton>
              </div>
            </LumaFocusSheet>
          </div>
        </LumaShell>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { getReflectionById, type CoupleReflectionEntry } from "@/lib/reflectionStorage";
import { ArrowRight } from "lucide-react";
import { StructuredResultSections } from "@/components/structured-result-sections";
import { DangerousQuestionBlock } from "@/components/DangerousQuestionBlock";
import { ConflictAnalysisPanel } from "@/components/ConflictAnalysisPanel";
import { HowToReadThisVisual } from "@/components/HowToReadThisVisual";
import { GeneratedCoupleArtImage } from "@/components/GeneratedCoupleArtImage";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ViewReflectionPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [entry, setEntry] = useState<Awaited<ReturnType<typeof getReflectionById>> | "loading">("loading");

  useEffect(() => {
    if (!id) {
      setEntry(null);
      return;
    }
    setEntry(getReflectionById(id) ?? null);
  }, [id]);

  if (entry === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-1 pt-20 px-6 py-16 text-center">
          <p className="text-muted-foreground">Loading…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!id) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-1 pt-20 px-6 py-16 text-center">
          <p className="text-muted-foreground">Reflection not found.</p>
          <Link href="/dashboard" className="inline-block mt-6 text-sm text-foreground underline">
            Back to Dashboard
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (entry === null) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-1 pt-20 px-6 py-16 text-center">
          <p className="text-muted-foreground">Reflection not found.</p>
          <Link href="/dashboard" className="inline-block mt-6 text-sm text-foreground underline">
            Back to Dashboard
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isCouple = entry.mode === "couple";
  const coupleEntry = isCouple ? (entry as CoupleReflectionEntry) : null;
  const individualEntry = entry.mode === "individual" ? entry : null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />

      <main className="flex-1 pt-20 pb-20 px-6 max-w-[720px] mx-auto w-full">
        <Link href="/dashboard/gallery" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Gallery
        </Link>
        <p className="text-sm text-muted-foreground mt-2">{formatDate(entry.date)}</p>
        <h1 className="font-serif text-2xl md:text-3xl text-foreground mt-4 [font-family:var(--font-serif-display)]">
          {isCouple ? "Couple Reflection" : "Your Reflection"}
        </h1>

        {coupleEntry?.spaceBetweenImage && (
          <>
            <div className="relative mt-6 aspect-square w-full max-h-[min(92vw,560px)] overflow-hidden rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
              <GeneratedCoupleArtImage
                src={coupleEntry.spaceBetweenImage}
                alt="The space between"
                className="absolute inset-0 h-full w-full"
              />
            </div>
            <HowToReadThisVisual
              className="mt-5"
              tags={
                coupleEntry.howToReadTags &&
                (coupleEntry.howToReadTags.round2Tag ||
                  coupleEntry.howToReadTags.round3Tag ||
                  coupleEntry.howToReadTags.round5Tag)
                  ? coupleEntry.howToReadTags
                  : null
              }
            />
          </>
        )}

        <div className="mt-10 animate-luma-fade-in-slow">
          {isCouple && coupleEntry?.conflictFrictionPoints && coupleEntry.conflictFrictionPoints.length > 0 ? (
            <ConflictAnalysisPanel
              points={coupleEntry.conflictFrictionPoints}
              labelA={coupleEntry.nameA?.trim() ? coupleEntry.nameA.trim() : "Person A"}
              labelB={coupleEntry.nameB?.trim() ? coupleEntry.nameB.trim() : "Person B"}
            />
          ) : null}
          <StructuredResultSections
            result={entry.content}
            brutalTruth={entry.brutalTruth}
            shadowInsight={entry.shadowInsight}
            howToReadTags={
              individualEntry?.howToReadTags ? individualEntry.howToReadTags : null
            }
            inSimpleWords={
              individualEntry && Array.isArray(individualEntry.inSimpleWords)
                ? individualEntry.inSimpleWords
                : null
            }
          />
          <DangerousQuestionBlock
            text={entry.dangerousQuestion}
            brutalTruth={entry.brutalTruth}
            emotionalTag={null}
            resultPreview={entry.content}
            mode={isCouple ? "couple" : "individual"}
          />
        </div>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/dashboard/gallery"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:opacity-80"
          >
            Back to Gallery
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/test" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            New reflection
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

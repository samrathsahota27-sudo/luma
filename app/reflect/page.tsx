"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Navigation } from "../../components/navigation"
import { ImageGrid } from "../../components/reflection/image-grid"
import { ResponseInput } from "../../components/reflection/response-input"
import { ProgressIndicator } from "../../components/reflection/progress-indicator"
import { reflectionRounds } from "../../lib/testData"
import { ArrowLeft, Loader2 } from "lucide-react"

type ReflectionPhase = "intro" | "selecting" | "responding" | "generating" | "complete"

export default function ReflectPage() {
  const [phase, setPhase] = useState<ReflectionPhase>("intro")
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0)
  const [selections, setSelections] = useState<UserSelection[]>([])
  const [currentImage, setCurrentImage] = useState<ReflectionImage | null>(null)
  const [currentResponse, setCurrentResponse] = useState("")
  const [reflection, setReflection] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const currentRound = reflectionRounds[currentRoundIndex]
  const roundTitles = reflectionRounds.map(r => r.title)

  const handleImageSelect = useCallback((image: ReflectionImage) => {
    setCurrentImage(image)
    setPhase("responding")
  }, [])

  const handleContinue = useCallback(() => {
    if (currentImage) {
      // Save the current selection
      setSelections(prev => [
        ...prev,
        {
          roundId: currentRound.id,
          imageId: currentImage.id,
          response: currentResponse
        }
      ])

      // Move to next round or generate reflection
      if (currentRoundIndex < reflectionRounds.length - 1) {
        setCurrentRoundIndex(prev => prev + 1)
        setCurrentImage(null)
        setCurrentResponse("")
        setPhase("selecting")
      } else {
        generateReflection()
      }
    }
  }, [currentImage, currentResponse, currentRound.id, currentRoundIndex])

  const generateReflection = async () => {
    setPhase("generating")
    setError(null)

    const finalSelections = [
      ...selections,
      {
        roundId: currentRound.id,
        imageId: currentImage?.id || "",
        response: currentResponse
      }
    ]

    try {
      const response = await fetch("/api/generate-reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          selections: finalSelections,
          rounds: reflectionRounds.map(r => ({
            id: r.id,
            title: r.title,
            theme: r.theme,
            prompt: r.prompt
          }))
        })
      })

      if (!response.ok) {
        throw new Error("Failed to generate reflection")
      }

      const data = await response.json()
      setReflection(data.reflection)
      setPhase("complete")
    } catch (err) {
      console.error("[v0] Error generating reflection:", err)
      setError("Unable to generate your reflection. Please try again.")
      setPhase("selecting")
    }
  }

  const resetExperience = () => {
    setPhase("intro")
    setCurrentRoundIndex(0)
    setSelections([])
    setCurrentImage(null)
    setCurrentResponse("")
    setReflection(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 pb-12">
        {/* Intro Phase */}
        {phase === "intro" && (
          <div className="max-w-2xl mx-auto px-6 py-16 md:py-24 text-center">
            <h1 className="font-serif text-3xl md:text-4xl text-foreground">
              Individual Reflection
            </h1>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              You will move through four rounds of visual selection. Each round 
              presents a grid of symbolic images. Choose the one that feels most 
              resonant, then respond to a brief reflective prompt.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Take your time. There are no right or wrong choices.
            </p>
            <button
              onClick={() => setPhase("selecting")}
              className="mt-10 px-8 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 transition-colors"
            >
              Begin
            </button>
          </div>
        )}

        {/* Selection Phase */}
        {(phase === "selecting" || phase === "responding") && (
          <div className="max-w-5xl mx-auto px-6 py-8">
            {/* Progress */}
            <div className="mb-8">
              <ProgressIndicator
                currentRound={currentRoundIndex + 1}
                totalRounds={reflectionRounds.length}
                roundTitles={roundTitles}
              />
            </div>

            {/* Round Header */}
            <div className="text-center mb-8">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Round {currentRoundIndex + 1}
              </span>
              <h2 className="font-serif text-2xl md:text-3xl mt-2 text-foreground">
                {currentRound.title}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {currentRound.theme}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-sm text-center">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Image Grid */}
            {phase === "selecting" && (
              <div className="animate-in fade-in duration-500">
                <p className="text-center text-sm text-muted-foreground mb-6">
                  Select an image that resonates with you
                </p>
                <ImageGrid
                  images={currentRound.images}
                  onSelect={handleImageSelect}
                  selectedId={currentImage?.id}
                />
              </div>
            )}

            {/* Response Input */}
            {phase === "responding" && currentImage && (
              <div className="max-w-xl mx-auto">
                <div className="mb-8 p-4 bg-secondary/50 rounded-sm">
                  <p className="text-sm text-muted-foreground">
                    You selected: <span className="text-foreground">{currentImage.alt}</span>
                  </p>
                </div>
                <ResponseInput
                  prompt={currentRound.prompt}
                  value={currentResponse}
                  onChange={setCurrentResponse}
                  onContinue={handleContinue}
                />
                <button
                  onClick={() => {
                    setCurrentImage(null)
                    setPhase("selecting")
                  }}
                  className="mt-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Choose a different image
                </button>
              </div>
            )}
          </div>
        )}

        {/* Generating Phase */}
        {phase === "generating" && (
          <div className="max-w-2xl mx-auto px-6 py-24 text-center">
            <Loader2 className="w-8 h-8 mx-auto text-muted-foreground animate-spin" />
            <p className="mt-6 font-serif text-xl text-foreground">
              Gathering your reflection...
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Taking a moment to notice the patterns that emerged
            </p>
          </div>
        )}

        {/* Complete Phase */}
        {phase === "complete" && reflection && (
          <div className="max-w-2xl mx-auto px-6 py-16">
            <div className="text-center mb-12">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Your Reflection
              </span>
              <h2 className="font-serif text-2xl md:text-3xl mt-4 text-foreground">
                What emerged
              </h2>
            </div>

            <div className="prose prose-neutral max-w-none">
              <div className="p-8 bg-card border border-border rounded-sm">
                <p className="font-serif text-lg leading-relaxed text-foreground whitespace-pre-wrap">
                  {reflection}
                </p>
              </div>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={resetExperience}
                className="px-6 py-3 border border-border text-foreground text-sm font-medium rounded-sm hover:bg-secondary transition-colors"
              >
                Begin Again
              </button>
              <Link
                href="/couples"
                className="px-6 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 transition-colors"
              >
                Explore Couple Reflection
              </Link>
            </div>

            <div className="mt-12 p-4 bg-secondary/30 rounded-sm text-center">
              <p className="text-xs text-muted-foreground">
                This reflection is not diagnosis or advice. It is a mirror for your own awareness.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

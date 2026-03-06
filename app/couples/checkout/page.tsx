"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
  const [email, setEmail] = useState("")
  const [partnerEmail, setPartnerEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate emails
    if (!email || !partnerEmail) {
      setError("Please enter both email addresses.")
      setIsLoading(false)
      return
    }

    if (email === partnerEmail) {
      setError("Please enter different email addresses for each partner.")
      setIsLoading(false)
      return
    }

    try {
      // In production, this would redirect to Stripe Checkout
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, partnerEmail })
      })

      if (!response.ok) {
        throw new Error("Unable to create checkout session")
      }

      const data = await response.json()
      
      // Redirect to Stripe (or show success for demo)
      if (data.url) {
        window.location.href = data.url
      } else {
        // Demo mode - show success
        window.location.href = `/couples/success?session=${data.sessionId}`
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 pb-12">
        <div className="max-w-md mx-auto px-6 py-16">
          <Link
            href="/couples"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Couple Reflection
          </Link>

          <h1 className="font-serif text-2xl md:text-3xl text-foreground">
            Start your couple reflection
          </h1>
          <p className="mt-4 text-muted-foreground">
            Enter both email addresses to receive private reflection links.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-foreground mb-2"
              >
                Your email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-border rounded-sm bg-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label 
                htmlFor="partnerEmail" 
                className="block text-sm font-medium text-foreground mb-2"
              >
                Your partner&apos;s email
              </label>
              <input
                id="partnerEmail"
                type="email"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
                placeholder="partner@example.com"
                className="w-full px-4 py-3 border border-border rounded-sm bg-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-sm">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Couple Reflection</span>
                <span className="text-lg font-serif text-foreground">$29</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Continue to Payment"
                )}
              </button>
            </div>
          </form>

          <p className="mt-8 text-xs text-muted-foreground text-center">
            By continuing, you agree to our{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/disclaimer" className="underline hover:text-foreground">
              Disclaimer
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  )
}

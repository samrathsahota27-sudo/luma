"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Loader2, CheckCircle } from "lucide-react"
import { SpeechMicButton } from "@/components/SpeechMicButton"
import { appendTranscriptValue, useSpeechToText } from "@/hooks/useSpeechToText"

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mic = useSpeechToText((transcript) =>
    setFormState((prev) => ({ ...prev, message: appendTranscriptValue(prev.message, transcript) }))
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // In production, this would send to an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubmitted(true)
    } catch {
      setError("Unable to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-20">
        <section className="max-w-3xl mx-auto px-6 py-24">
          <div className="max-w-xl">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Get in Touch
            </span>
            <h1 className="font-serif text-4xl md:text-5xl leading-tight text-foreground mt-4">
              Contact
            </h1>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Questions, feedback, or thoughts about Luma? We&apos;d love to hear from you.
            </p>
          </div>

          <div className="mt-12">
            {isSubmitted ? (
              <div className="p-8 bg-secondary/30 border border-border rounded-sm text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-accent mb-4" />
                <h2 className="font-serif text-xl text-foreground mb-2">
                  Message sent
                </h2>
                <p className="text-muted-foreground">
                  Thank you for reaching out. We&apos;ll respond within a few days.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false)
                    setFormState({ name: "", email: "", subject: "", message: "" })
                  }}
                  className="mt-6 text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label 
                      htmlFor="name" 
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formState.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-border rounded-sm bg-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>
                  
                  <div>
                    <label 
                      htmlFor="email" 
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formState.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-border rounded-sm bg-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label 
                    htmlFor="subject" 
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formState.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border rounded-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  >
                    <option value="">Select a topic</option>
                    <option value="general">General inquiry</option>
                    <option value="feedback">Feedback about the experience</option>
                    <option value="technical">Technical issue</option>
                    <option value="privacy">Privacy question</option>
                    <option value="business">Business or partnership</option>
                  </select>
                </div>

                <div>
                  <label 
                    htmlFor="message" 
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Message
                  </label>
                  <div className="relative">
                    <textarea
                      id="message"
                      name="message"
                      value={formState.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full resize-none rounded-sm border border-border bg-card px-4 py-3 pr-24 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                    <SpeechMicButton
                      isListening={mic.isListening}
                      isSupported={mic.isSupported}
                      disabled={isSubmitting}
                      onToggle={mic.toggle}
                      className="absolute right-3 top-3"
                    />
                  </div>
                  {mic.error ? <p className="mt-2 text-xs text-destructive">{mic.error}</p> : null}
                </div>

                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-sm">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="mt-16 pt-12 border-t border-border">
            <h2 className="font-serif text-xl text-foreground mb-6">
              Other ways to reach us
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">
                  General inquiries
                </h3>
                <a 
                  href="mailto:hello@luma.app" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  hello@luma.app
                </a>
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">
                  Privacy questions
                </h3>
                <a 
                  href="mailto:privacy@luma.app" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  privacy@luma.app
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

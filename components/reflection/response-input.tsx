"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface ResponseInputProps {
  prompt: string
  value: string
  onChange: (value: string) => void
  onContinue: () => void
  canSkip?: boolean
}

export function ResponseInput({ 
  prompt, 
  value, 
  onChange, 
  onContinue,
  canSkip = true 
}: ResponseInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <p className="font-serif text-lg md:text-xl text-foreground leading-relaxed">
        {prompt}
      </p>
      
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Take your time..."
          className={cn(
            "w-full min-h-[120px] p-4 bg-card border rounded-sm resize-none",
            "text-foreground placeholder:text-muted-foreground/50",
            "focus:outline-none transition-all duration-300",
            isFocused 
              ? "border-foreground/30 shadow-sm" 
              : "border-border"
          )}
          aria-label="Your reflection"
        />
        
        <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
          {value.length > 0 && `${value.length} characters`}
        </div>
      </div>
      
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          {canSkip ? "Response is optional but encouraged" : "Please share a brief reflection"}
        </p>
        
        <button
          onClick={onContinue}
          className={cn(
            "px-6 py-2.5 text-sm font-medium rounded-sm transition-all duration-300",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            value.length > 0 || canSkip
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
          disabled={!canSkip && value.length === 0}
        >
          {value.length > 0 ? "Continue" : "Skip for now"}
        </button>
      </div>
    </div>
  )
}

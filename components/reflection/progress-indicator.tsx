"use client"

import { cn } from "@/lib/utils"

interface ProgressIndicatorProps {
  currentRound: number
  totalRounds: number
  roundTitles: string[]
}

export function ProgressIndicator({ 
  currentRound, 
  totalRounds, 
  roundTitles 
}: ProgressIndicatorProps) {
  return (
    <div className="w-full">
      {/* Mobile Progress Bar */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">
            Round {currentRound} of {totalRounds}
          </span>
          <span className="text-xs font-medium text-foreground">
            {roundTitles[currentRound - 1]}
          </span>
        </div>
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-foreground transition-all duration-500 ease-out"
            style={{ width: `${(currentRound / totalRounds) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Desktop Step Indicator */}
      <div className="hidden sm:flex items-center justify-center gap-2">
        {roundTitles.map((title, index) => {
          const roundNumber = index + 1
          const isActive = roundNumber === currentRound
          const isCompleted = roundNumber < currentRound
          
          return (
            <div key={roundNumber} className="flex items-center">
              {index > 0 && (
                <div 
                  className={cn(
                    "w-8 h-px mx-2 transition-colors duration-300",
                    isCompleted ? "bg-foreground" : "bg-border"
                  )}
                />
              )}
              
              <div className="flex flex-col items-center gap-1.5">
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300",
                    isActive && "bg-foreground text-background",
                    isCompleted && "bg-foreground/20 text-foreground",
                    !isActive && !isCompleted && "bg-secondary text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    roundNumber
                  )}
                </div>
                
                <span className={cn(
                  "text-xs transition-colors duration-300",
                  isActive ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  {title}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

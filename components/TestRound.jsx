import { cn } from "@/lib/utils";
import { ImageOption } from "@/components/ImageOption";

export function TestRound({
  round,
  question,
  reflectionLines,
  images,
  selectedIndex,
  onSelectImage,
  textValue,
  onTextChange,
  canProceed,
  onNext,
  showNone,
}) {
  return (
    <>
      <div className="max-w-3xl mx-auto px-6 py-14 md:py-16">
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Round {round}
          </span>
          <h1 className="font-serif text-2xl md:text-3xl mt-3 text-foreground text-balance">
            {question}
          </h1>
        </div>

        <div className="rounded-2xl bg-white/60 shadow-sm p-4 md:p-6">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {images.map((imgName, index) => (
              <ImageOption
                key={imgName}
                src={imgName}
                alt={`Option ${index + 1}`}
                selected={selectedIndex === index}
                onSelect={() => onSelectImage(index)}
              />
            ))}
          </div>

          {showNone && (
            <div className="mt-5 text-center text-xs text-muted-foreground">
              None of these reflect me
            </div>
          )}
        </div>

        <div className="mt-6 bg-white/50 rounded-2xl shadow-sm p-4 md:p-6 text-sm text-muted-foreground space-y-1">
          {reflectionLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        <div className="mt-6">
          <textarea
            className="w-full min-h-[140px] rounded-2xl bg-white/60 shadow-sm px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-y"
            placeholder="Write your thoughts here..."
            value={textValue}
            onChange={(e) => onTextChange(e.target.value)}
          />
        </div>

        <div className="mt-7 flex justify-end">
          <button
            type="button"
            onClick={onNext}
            disabled={!canProceed}
            className={cn(
              "px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-200",
              canProceed
                ? "bg-foreground text-background hover:opacity-90 shadow-sm"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {round < 4 ? "Next" : "See reflection"}
          </button>
        </div>
      </div>

      <div className="sr-only" aria-live="polite">
        Round {round}
      </div>
    </>
  )
}

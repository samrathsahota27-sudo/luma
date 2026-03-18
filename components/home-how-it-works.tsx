"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const steps = [
  {
    num: "1",
    title: "Choose images",
    text: "Pick the images that feel right to you.",
    imageSrc: "/images/s1.jpg",
    imageAlt: "Choosing images",
  },
  {
    num: "2",
    title: "Pause & reflect",
    text: "Notice what drew you in — without overthinking.",
    imageSrc: "/images/s2.jpg",
    imageAlt: "Reflection",
  },
  {
    num: "3",
    title: "See what it reveals",
    text: "Your patterns begin to take shape — gently.",
    imageSrc: "/images/s3.jpg",
    imageAlt: "Insight emerging",
  },
]

export function HomeHowItWorks() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const updateActiveIndex = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.offsetWidth
    if (!cardWidth) return
    const index = Math.round(el.scrollLeft / cardWidth)
    const clamped = Math.max(0, Math.min(index, steps.length - 1))
    setActiveIndex(clamped)
  }, [])

  const scrollToIndex = (index: number) => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.offsetWidth
    el.scrollTo({ left: index * cardWidth, behavior: "smooth" })
  }

  useEffect(() => {
    updateActiveIndex()
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(updateActiveIndex)
    ro.observe(el)
    return () => ro.disconnect()
  }, [updateActiveIndex])

  return (
    <section className="px-6 py-20 md:py-24 bg-[#E8E3D9]/20 border-t border-[#E8E3D9]">
      <div className="max-w-[960px] mx-auto">
        <h2 className="font-serif text-[26px] md:text-[30px] text-center text-[#2F2F2F] [font-family:var(--font-serif-display)] mb-12">
          How it works
        </h2>

        <div
          ref={scrollRef}
          onScroll={updateActiveIndex}
          className="flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth scrollbar-none touch-pan-x"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {steps.map((step, index) => (
            <div
              key={step.num}
              className="flex-shrink-0 w-full min-w-full snap-center"
              style={{ scrollSnapAlign: "center" }}
            >
              <div
                className={`mx-auto max-w-[640px] px-2 md:px-0 transition-transform duration-300 ease-out ${
                  index === activeIndex ? "scale-[1.01]" : "scale-[0.99] opacity-95"
                }`}
              >
                {step.num === "1" || step.num === "2" || step.num === "3" ? (
                  <div className="relative rounded-2xl overflow-hidden bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                    {/* TEXT */}
                    <div className="relative z-10 p-6 text-center">
                      <p className="text-xs tracking-widest text-gray-400 mb-2">
                        STEP {step.num}
                      </p>
                      <h3 className="text-lg font-medium text-gray-900">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-2">
                        {step.text}
                      </p>
                    </div>

                    {/* IMAGE */}
                    <div className="relative h-48 w-full">
                      <img
                        src={step.imageSrc}
                        alt={step.imageAlt}
                        className={
                          step.num === "2"
                            ? "absolute inset-0 w-full h-full object-cover brightness-[0.9] saturate-[0.85]"
                            : step.num === "3"
                              ? "absolute inset-0 w-full h-full object-cover brightness-[0.92] saturate-[0.85] blur-[0.4px]"
                              : "absolute inset-0 w-full h-full object-cover brightness-[0.95] saturate-[0.9]"
                        }
                        loading="lazy"
                        decoding="async"
                      />
                      {/* FADE EFFECT */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white via-white/70 to-transparent" />
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-[24px] bg-white/70 backdrop-blur-sm border border-[#E8E3D9]/70 shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-6 md:p-8">
                    <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 bg-white">
                      <div className="relative z-10 text-center">
                        <p className="text-xs tracking-widest text-gray-400 uppercase">
                          STEP {step.num}
                        </p>
                        <h3 className="text-lg md:text-xl font-medium mt-1 text-[#2F2F2F]">
                          {step.title}
                        </h3>
                        <p className="text-sm md:text-[15px] text-gray-500 mt-2 leading-relaxed max-w-[520px] mx-auto">
                          {step.text}
                        </p>
                      </div>

                      <img
                        src={step.imageSrc}
                        alt=""
                        className="absolute bottom-0 left-0 w-full h-48 object-cover opacity-90 blur-[1px]"
                        loading="lazy"
                        decoding="async"
                      />
                      <div
                        aria-hidden
                        className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-white via-white/80 to-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2.5 mt-8">
          {steps.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollToIndex(index)}
              aria-label={`Go to step ${index + 1}`}
              className={`rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F2F2F]/20 ${
                index === activeIndex
                  ? "w-8 h-2.5 bg-[#2F2F2F]/55"
                  : "w-2.5 h-2.5 bg-[#2F2F2F]/20 hover:bg-[#2F2F2F]/35"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

const CONNECT_RESULT_KEY = "luma_connect_result";

const REVEAL_DELAY_A = 200;
const REVEAL_DELAY_B = 500;
const REVEAL_DELAY_BETWEEN = 900;
const REVEAL_DELAY_TEXT = 1200;

function excerpt(text, maxLen = 200) {
  if (!text || typeof text !== "string") return "";
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.slice(0, maxLen).trim() + "…";
}

export default function ConnectResultPage() {
  const [data, setData] = useState(null);
  const [missing, setMissing] = useState(false);
  const [reveal, setReveal] = useState({
    innerA: false,
    innerB: false,
    spaceBetween: false,
    text: false,
  });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CONNECT_RESULT_KEY);
      if (!raw) {
        setMissing(true);
        return;
      }
      setData(JSON.parse(raw));
    } catch {
      setMissing(true);
    }
  }, []);

  useEffect(() => {
    if (data == null) return;
    const t1 = setTimeout(() => setReveal((r) => ({ ...r, innerA: true })), REVEAL_DELAY_A);
    const t2 = setTimeout(() => setReveal((r) => ({ ...r, innerB: true })), REVEAL_DELAY_B);
    const t3 = setTimeout(() => setReveal((r) => ({ ...r, spaceBetween: true })), REVEAL_DELAY_BETWEEN);
    const t4 = setTimeout(() => setReveal((r) => ({ ...r, text: true })), REVEAL_DELAY_TEXT);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [data]);

  const transition = "transition-all duration-500 ease-out";
  const hidden = "opacity-0 translate-y-4";
  const visibleClass = "opacity-100 translate-y-0";

  if (missing && data === null) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F6F3] text-[#2F2F2F]">
        <Navigation />
        <main className="flex-1 pt-24 pb-20 px-6 flex flex-col items-center justify-center">
          <div className="max-w-[520px] mx-auto text-center space-y-6">
            <h1 className="font-serif text-[22px] text-[#2F2F2F] [font-family:var(--font-serif-display)]">
              No reflection to show
            </h1>
            <p className="text-[#5a5a5a] text-base leading-relaxed">
              Generate a &quot;Space Between&quot; from the invite link your partner sent you.
            </p>
            <Link
              href="/connect"
              className="inline-flex items-center justify-center px-5 py-3 rounded-[12px] bg-[#2F2F2F] text-white text-base font-medium transition-opacity hover:opacity-90"
            >
              Connect Inner Worlds
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const result = data?.result ?? "";
  const reflectionA = data?.reflectionA ?? "";
  const reflectionB = data?.reflectionB ?? "";
  const formattedResult = result ? result.replace(/\n/g, "<br>") : "";

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F3] text-[#2F2F2F]">
      <Navigation />

      <main className="flex-1 pt-24 pb-20 px-6">
        <div className="max-w-[720px] mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-widest text-[#5a5a5a]">
              Connect Inner Worlds
            </span>
            <h1 className="font-serif text-[22px] md:text-[28px] mt-4 text-[#2F2F2F] [font-family:var(--font-serif-display)]">
              The Space Between Us
            </h1>
          </div>

          {/* Inner World A | Inner World B */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div
              className={`rounded-[16px] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-[#E8E3D9] flex flex-col ${transition} ${reveal.innerA ? visibleClass : hidden}`}
            >
              <h2 className="font-serif text-[22px] text-[#2F2F2F] mb-2 [font-family:var(--font-serif-display)]">
                Inner World A
              </h2>
              <p className="text-[#5a5a5a] text-sm leading-relaxed flex-1">
                {excerpt(reflectionA, 220)}
              </p>
            </div>
            <div
              className={`rounded-[16px] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-[#E8E3D9] flex flex-col ${transition} ${reveal.innerB ? visibleClass : hidden}`}
            >
              <h2 className="font-serif text-[22px] text-[#2F2F2F] mb-2 [font-family:var(--font-serif-display)]">
                Inner World B
              </h2>
              <p className="text-[#5a5a5a] text-sm leading-relaxed flex-1">
                {excerpt(reflectionB, 220)}
              </p>
            </div>
          </div>

          {/* The Space Between Us */}
          <div className="flex justify-center mb-10">
            <div
              className={`w-full max-w-xl rounded-[16px] bg-[#E8E3D9]/40 border border-[#E8E3D9] p-6 ${transition} ${reveal.spaceBetween ? visibleClass : hidden}`}
            >
              <h2 className="font-serif text-[22px] text-[#2F2F2F] text-center [font-family:var(--font-serif-display)]">
                The Space Between Us
              </h2>
              <p className="text-[#5a5a5a] text-sm text-center mt-2 leading-relaxed">
                A reflection woven from both inner worlds.
              </p>
            </div>
          </div>

          {/* Couple reflection text */}
          {formattedResult && (
            <div
              className={`mb-10 ${transition} ${reveal.text ? visibleClass : hidden}`}
            >
              <span className="text-xs uppercase tracking-widest text-[#5a5a5a] block mb-4">
                Your reflection
              </span>
              <div className="p-6 md:p-8 rounded-[16px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-[#E8E3D9]">
                <div
                  className="font-serif text-base md:text-lg leading-relaxed text-[#2F2F2F] whitespace-pre-wrap [&>br]:block [&>br]:mb-4 [font-family:var(--font-sans)]"
                  style={{ fontFamily: "var(--font-sans), Inter, system-ui, sans-serif" }}
                  dangerouslySetInnerHTML={{ __html: formattedResult }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/connect"
              className="px-5 py-3 rounded-[12px] border border-[#E8E3D9] text-[#2F2F2F] text-sm font-medium hover:bg-[#f8f6f3] transition-colors"
            >
              Connect again
            </Link>
            <Link
              href="/"
              className="px-5 py-3 rounded-[12px] bg-[#2F2F2F] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

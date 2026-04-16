import { buildGuidingReflection } from "@/lib/guidingReflection";
import { buildDeterministicVariantFallback } from "@/lib/patternVariantCopy";
import { matchPatternVariant } from "@/lib/patternVariants";
import { extractTagSignalsFromSelections, scoreIndividualPatternsTop3 } from "@/lib/patternScoring";
import { derivePatternLabel } from "@/lib/patternLabel";
import { deriveThemeTone } from "@/lib/themeTone";

export type DemoImageChoice = {
  id: string;
  src: string;
  alt: string;
  psychologicalTags: string[];
};

type DemoSelectionPayload = {
  selectedType: "image";
  selectedImageId: number;
  imageId: string;
  tags: string[];
  psychologicalTags: string[];
  text: string;
};

export type DemoInsightResponse = {
  structured: {
    pattern: string;
    description: string;
    theme: { title: string; subtitle: string };
    tone: { title: string; subtitle: string };
    core_line: string;
    reach: string;
    shift: string;
  };
  guidingReflection: string[];
  result: string;
};

export const DEMO_IMAGE_CHOICES: DemoImageChoice[] = [
  {
    id: "demo_r1a",
    src: "r1_a.jpg",
    alt: "Open road through soft morning light",
    psychologicalTags: ["calm", "openness", "shared_peace"],
  },
  {
    id: "demo_r1b",
    src: "r1_b.jpg",
    alt: "Narrow path with heavy shadows",
    psychologicalTags: ["distance", "avoidance", "disconnection"],
  },
  {
    id: "demo_r1c",
    src: "r1_c.jpg",
    alt: "Storm cloud over still water",
    psychologicalTags: ["tension", "instability", "internal_conflict"],
  },
  {
    id: "demo_r2a",
    src: "r2_a.jpg",
    alt: "Person standing alone in mist",
    psychologicalTags: ["distance", "silence", "withdraw"],
  },
  {
    id: "demo_r2b",
    src: "r2_b.jpg",
    alt: "Warm room with open window",
    psychologicalTags: ["openness", "connection", "support"],
  },
  {
    id: "demo_r2d",
    src: "r2_d.jpg",
    alt: "Crowded city lights at night",
    psychologicalTags: ["overthinking", "chaos", "mental_noise"],
  },
  {
    id: "demo_r3a",
    src: "r3_a.jpg",
    alt: "Hands held but slightly apart",
    psychologicalTags: ["closeness", "careful", "control"],
  },
  {
    id: "demo_r3c",
    src: "r3_c.jpg",
    alt: "Two chairs with empty space between",
    psychologicalTags: ["distance", "disconnection", "guarded"],
  },
  {
    id: "demo_r4a",
    src: "r4_a.jpg",
    alt: "Quiet corner with journal and tea",
    psychologicalTags: ["calm", "still", "protection"],
  },
  {
    id: "demo_r4d",
    src: "r4_d.jpg",
    alt: "Crossroads sign in bright sun",
    psychologicalTags: ["clarity", "direction", "uncertain"],
  },
];

const DEMO_ID_SET = new Set(DEMO_IMAGE_CHOICES.map((choice) => choice.id));

export function isValidDemoImageId(id: string): boolean {
  return DEMO_ID_SET.has(id);
}

function buildSelections(selectedImageIds: string[]): Record<number, DemoSelectionPayload> {
  const byId = new Map(DEMO_IMAGE_CHOICES.map((choice) => [choice.id, choice]));
  const stableIds = [...selectedImageIds].sort((a, b) => a.localeCompare(b));

  return stableIds.reduce<Record<number, DemoSelectionPayload>>((acc, imageId, index) => {
    const choice = byId.get(imageId);
    if (!choice) return acc;

    acc[index + 1] = {
      selectedType: "image",
      selectedImageId: index,
      imageId: choice.id,
      tags: choice.psychologicalTags,
      psychologicalTags: choice.psychologicalTags,
      text: "",
    };
    return acc;
  }, {});
}

export function buildDeterministicDemoInsight(selectedImageIds: string[]): DemoInsightResponse {
  const selections = buildSelections(selectedImageIds);
  const signals = extractTagSignalsFromSelections(selections);
  const profile = scoreIndividualPatternsTop3(signals);
  const patternLabel = derivePatternLabel({ signals, selections });
  const variant = matchPatternVariant(profile.primary.id, signals);
  const micro = deriveThemeTone(signals);
  const fallback = buildDeterministicVariantFallback({
    pattern: patternLabel,
    variant,
    theme: micro.theme,
    tone: micro.tone,
  });

  const structured = {
    ...fallback,
    pattern: patternLabel,
    theme: micro.theme,
    tone: micro.tone,
  };

  const guidingReflection = buildGuidingReflection({
    pattern: structured.pattern,
    signals,
  });

  return {
    structured,
    guidingReflection,
    result: [
      `Pattern: "${structured.pattern}"`,
      structured.description,
      "",
      `Theme: ${structured.theme.title} - ${structured.theme.subtitle}`,
      `Tone: ${structured.tone.title} - ${structured.tone.subtitle}`,
      "",
      `One line you'll keep hearing: ${structured.core_line}`,
      `What you reach for: ${structured.reach}`,
      `What shifts it: ${structured.shift}`,
    ].join("\n"),
  };
}

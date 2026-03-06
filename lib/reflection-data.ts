export interface ReflectionRound {
  id: number
  title: string
  theme: string
  prompt: string
  images: ReflectionImage[]
}

export interface ReflectionImage {
  id: string
  src: string
  alt: string
  category: string
}

export interface UserSelection {
  roundId: number
  imageId: string
  response: string
}

// Round configurations with their reflective prompts
export const reflectionRounds: ReflectionRound[] = [
  {
    id: 1,
    title: "Orientation",
    theme: "Where does your attention rest?",
    prompt: "What about this image drew your attention first?",
    images: generateImagesForRound(1, [
      "A winding forest path",
      "An empty sunlit room",
      "A doorway opening to light",
      "A quiet workspace",
      "An open field at dawn",
      "A stone corridor",
      "A window with soft curtains",
      "A garden gate",
      "A still lake shore",
      "An archway in shadow",
      "A reading nook",
      "A mountain vista",
      "A spiral staircase",
      "A greenhouse interior",
      "A minimalist desk",
      "A meadow path",
    ])
  },
  {
    id: 2,
    title: "Tension",
    theme: "What holds unresolved energy?",
    prompt: "What in this scene feels slightly uncomfortable or unresolved?",
    images: generateImagesForRound(2, [
      "A closed door",
      "An unfinished letter",
      "A fork in the road",
      "An empty chair",
      "A storm approaching",
      "A narrow passage",
      "A cluttered table",
      "A locked gate",
      "A distant horizon",
      "A mirror reflection",
      "An abandoned room",
      "A bridge halfway",
      "A flickering candle",
      "A tangled garden",
      "A waiting room",
      "An unread book",
    ])
  },
  {
    id: 3,
    title: "Pace",
    theme: "What rhythm emerges?",
    prompt: "If this space had a rhythm, would it move slowly, quickly, or unevenly?",
    images: generateImagesForRound(3, [
      "A still pond",
      "Waves on rocks",
      "A busy street",
      "A sleeping cat",
      "Wind through grass",
      "A ticking clock",
      "A flowing stream",
      "A frozen moment",
      "Birds in flight",
      "A meditation corner",
      "Rush hour lights",
      "A sunset sky",
      "Rain on windows",
      "A dancer paused",
      "An hourglass",
      "A calm sea",
    ])
  },
  {
    id: 4,
    title: "Direction",
    theme: "What wants to emerge?",
    prompt: "If you stayed here longer, what might begin to change?",
    images: generateImagesForRound(4, [
      "A seedling emerging",
      "Dawn breaking",
      "A door ajar",
      "A path upward",
      "Spring buds",
      "An open window",
      "A compass rose",
      "A turning page",
      "Light through clouds",
      "A rising moon",
      "A ship setting sail",
      "A butterfly emerging",
      "A clearing ahead",
      "A bridge completed",
      "A letter sealed",
      "A new day",
    ])
  }
]

function generateImagesForRound(roundId: number, descriptions: string[]): ReflectionImage[] {
  return descriptions.map((desc, index) => ({
    id: `r${roundId}-img${index + 1}`,
    src: `/images/round${roundId}/${index + 1}.jpg`,
    alt: desc,
    category: descriptions[index]
  }))
}

// Categories for couple reflection images
export const coupleImageCategories = [
  "Bridges",
  "Shared Tables",
  "Parallel Paths",
  "Open Rooms",
  "Doorways",
  "Meeting Points"
]

export const couplePrompts = [
  "What part of this shared space feels most alive?",
  "Where does distance appear?",
  "What seems quietly supportive here?"
]

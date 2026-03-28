/**
 * Local-only one-liners for the 3-click landing teaser (no API).
 * Index is derived from which three images were chosen (order matters).
 */

export const TEASER_IMAGES = [
  { id: 0, src: "/r1_a.jpg", alt: "First reflection choice" },
  { id: 1, src: "/r1_b.jpg", alt: "First reflection choice" },
  { id: 2, src: "/r1_c.jpg", alt: "First reflection choice" },
  { id: 3, src: "/r2_a.jpg", alt: "Second reflection choice" },
  { id: 4, src: "/r2_b.jpg", alt: "Second reflection choice" },
  { id: 5, src: "/r2_c.jpg", alt: "Second reflection choice" },
] as const;

const LINES: string[] = [
  "You overthink what you feel, then struggle to express it.",
  "You rehearse honesty in your head more often than you speak it out loud.",
  "You want to be understood without having to risk being explicit.",
  "You manage other people’s comfort before you name what you need.",
  "You feel deeply, then translate it into something safer for everyone else.",
  "You equate staying calm with staying in control—but something simmers underneath.",
  "You notice everything, then question whether you’re “too much” for saying so.",
  "You wait to be invited into vulnerability instead of stepping in first.",
  "You mistake patience for peace, even when you’re quietly resentful.",
  "You chase clarity because ambiguity feels like a small betrayal.",
  "You protect yourself by anticipating the worst before anyone else does.",
  "You read the room so hard you sometimes lose your own signal in it.",
  "You confuse self-awareness with softness; your edges are still sharp.",
  "You want closeness without the messy parts you can’t rehearse.",
  "You hold space for others, then wonder who holds space for you.",
  "You edit your anger until it sounds reasonable—and then it doesn’t move anything.",
  "You shrink your asks so they won’t be refuted, then feel unseen.",
  "You perform fine so well that people stop checking if it’s true.",
  "You keep score in silence because naming it feels like starting a war.",
  "You want to be chosen without having to reveal how much it matters.",
  "You buffer conflict until it leaks out sideways instead of straight.",
  "You confuse being easygoing with being accommodating—and you’re tired.",
  "You see patterns in everyone but hesitate to pin one on yourself.",
  "You reach for words and land on explanations instead of feelings.",
  "You mistake intensity for truth and quiet for indifference.",
  "You brace for disappointment before the moment even lands.",
  "You narrate your life to stay one step ahead of judgment.",
  "You survive by timing when to be honest—and when to disappear.",
  "You long for depth but default to manners when things get sharp.",
  "You turn insight into armor instead of into change.",
  "You confuse loyalty with never rocking the boat.",
  "You’re fluent in everyone’s story except the one you won’t tell.",
  "You want repair but rehearse the argument alone, forever.",
  "You sense distance early, then over-adjust to pretend it isn’t there.",
  "You crave steadiness but only know how to earn it through effort.",
  "You intellectualize the ache so you don’t have to sit in it raw.",
  "You offer care generously, then resent that it isn’t mirrored.",
  "You confuse clarity with control—and love with certainty.",
  "You pause at the threshold of honesty, afraid it will cost you belonging.",
  "You flinch from neediness while needing more than you admit.",
  "You track fairness in relationships until closeness feels like accounting.",
  "You’d rather be misunderstood as strong than known as uncertain.",
  "You keep your tenderness in draft form, waiting for the right audience.",
  "You turn away first so no one else gets the chance to.",
  "You hear criticism in neutral feedback and swallow your response.",
  "You measure love by endurance, not by how free you feel to speak.",
  "You confuse being self-contained with being whole.",
  "You chase the moment after the feeling—when it’s already rationalized away.",
];

/** Three distinct indices 0–5, in tap order. */
export function resolveTeaserBrutalTruth(i: number, j: number, k: number): string {
  const h = ((i * 53 + j) * 47 + k * 41) >>> 0;
  return LINES[h % LINES.length];
}

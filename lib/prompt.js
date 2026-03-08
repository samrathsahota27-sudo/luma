export function buildPrompt(answers) {
  return `
The user completed a 4-round emotional reflection test.
Here are their answers:

${JSON.stringify(answers, null, 2)}

Generate a 300–400 word emotional reflection structured into 4 sections:

1. Core Pattern Insight (3–4 lines)
2. Gentle Direction (3–4 lines)
3. Emotional Expansion (3–4 lines)
4. Soft Invitation to unlock deeper analysis using Couple Mode (3–4 lines)

Each section must:
- Start with a clear heading
- Use short paragraphs
- Leave a blank line between sections
- Avoid long unbroken blocks of text

Tone:
Insightful, calm, psychologically precise, elegant.
Speak directly to the user in second person.
`;
}


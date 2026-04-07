import type { ReactNode } from "react";

/** JS component — explicit props so default `[]` in .jsx does not become `never[]`. */
export function TestRound(props: Record<string, unknown>): ReactNode;

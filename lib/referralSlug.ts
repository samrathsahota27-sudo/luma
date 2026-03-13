/**
 * Referral link slug: from user name to URL slug and back for display.
 */

export function nameToSlug(name: string | null | undefined): string {
  if (!name || typeof name !== "string") return "friend"
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
  return slug.length > 0 ? slug : "friend"
}

export function slugToDisplayName(slug: string | null | undefined): string {
  if (!slug || typeof slug !== "string") return "A friend"
  const name = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
  return name.length > 0 ? name : "A friend"
}

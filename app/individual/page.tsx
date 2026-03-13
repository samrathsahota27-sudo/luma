import { redirect } from "next/navigation"

/**
 * /individual — canonical URL for starting the individual reflection (used in reminder emails).
 * Redirects to the reflection start page.
 */
export default function IndividualPage() {
  redirect("/test")
}

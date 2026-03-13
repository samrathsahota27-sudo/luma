import { redirect } from "next/navigation";

/**
 * /dashboard/timeline — redirects to the main Timeline page.
 */
export default function DashboardTimelinePage() {
  redirect("/timeline");
}

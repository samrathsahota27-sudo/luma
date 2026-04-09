export function getBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (process.env.NODE_ENV === "production") {
    if (!configured) {
      throw new Error("Missing NEXT_PUBLIC_APP_URL in production");
    }
    return configured.replace(/\/+$/, "");
  }

  return (configured || "http://localhost:3000").replace(/\/+$/, "");
}

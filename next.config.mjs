/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: "/individual", destination: "/reflect", permanent: false },
      { source: "/couples", destination: "/couple", permanent: false },
      { source: "/couples/:path*", destination: "/couple/:path*", permanent: false },
      { source: "/results", destination: "/result/latest", permanent: false },
      { source: "/couple-results", destination: "/couple/result", permanent: false },
    ]
  },
}

export default nextConfig

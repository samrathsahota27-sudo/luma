import type { Metadata } from 'next'
import { Source_Serif_4, Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { MemoryBootstrap } from '@/components/MemoryBootstrap'
import { InactivityReminderBanner } from '@/components/InactivityReminderBanner'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import PWALayout from '@/components/PWALayout'
import { PWAEnhancementBoundary } from '@/components/PWAEnhancementBoundary'
import { PUBLIC_SITE_URL } from '@/lib/site'
import './globals.css'

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: '--font-serif',
  display: 'swap',
});

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: '--font-serif-display',
  display: 'swap',
});

const defaultTitle = 'Luma — Understand yourself through images'
const defaultDescription =
  'Choose images. Get a personalized reflection of your emotional world. Free, no signup required.'
const ogDescription =
  "A 3-minute reflection tool that reveals your inner world through the images you're drawn to."

export const metadata: Metadata = {
  metadataBase: new URL(PUBLIC_SITE_URL),
  title: {
    default: defaultTitle,
    template: '%s | Luma',
  },
  description: defaultDescription,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: defaultTitle,
    description: ogDescription,
    url: PUBLIC_SITE_URL,
    siteName: 'Luma',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Luma — image-based reflection' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: ogDescription,
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${sourceSerif.variable} ${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Luma" />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className="font-sans min-w-0 overflow-x-hidden">
        <PWAEnhancementBoundary fallback={children}>
          <MemoryBootstrap />
          <InactivityReminderBanner />
          <PWALayout>{children}</PWALayout>
          <PWAInstallPrompt />
        </PWAEnhancementBoundary>
        <Analytics />
      </body>
    </html>
  )
}

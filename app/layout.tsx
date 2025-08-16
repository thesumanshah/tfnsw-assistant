import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NSW Train Assistant',
  description: 'Your AI-powered NSW train travel companion',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NSW Train Assistant',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'NSW Train Assistant',
    description: 'Your AI-powered NSW train travel companion',
    type: 'website',
    siteName: 'NSW Train Assistant',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NSW Train Assistant',
    description: 'Your AI-powered NSW train travel companion',
  },
}

export const viewport: Viewport = {
  themeColor: '#20252b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="application-name" content="NSW Train Assistant" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NSW Train Assistant" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#20252b" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="shortcut icon" href="/icons/icon-192.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}

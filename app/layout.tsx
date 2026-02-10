import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { ErrorBoundary } from '@/components/error-boundary'
import { Providers } from './providers'
import { AnalyticsProvider } from '@/components/AnalyticsProvider'
import { cn } from '@/lib/utils'
import { headers } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cofactor Club',
  description: 'The student ambassador network.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const nonce = (await headers()).get('x-nonce') || ''

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background font-sans antialiased")} suppressHydrationWarning>
        <AnalyticsProvider>
          <Providers nonce={nonce}>
            <ErrorBoundary>
              <Navbar />
              <main>{children}</main>
            </ErrorBoundary>
          </Providers>
        </AnalyticsProvider>
      </body>
    </html>
  )
}

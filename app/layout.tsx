import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/shared/Navbar'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { Providers } from './providers'
import { AnalyticsProvider } from '@/components/shared/AnalyticsProvider'
import { headers } from 'next/headers'

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
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-off-white font-serif antialiased" suppressHydrationWarning>
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

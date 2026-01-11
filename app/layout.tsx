import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { ErrorBoundary } from '@/components/error-boundary'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cofactor Club',
  description: 'The student ambassador network.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background font-sans antialiased")} suppressHydrationWarning>
        <ErrorBoundary>
          <Navbar />
          <main>{children}</main>
        </ErrorBoundary>
      </body>
    </html>
  )
}

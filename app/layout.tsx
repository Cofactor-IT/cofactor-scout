import { Merriweather, Rethink_Sans } from 'next/font/google'
import './globals.css'
import type { Metadata } from 'next'
import { SupportWidget } from '@/components/SupportWidget'
import { getServerSession } from 'next-auth'
import { CookieBanner } from '@/components/cookie-consent/Banner'

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-merriweather',
  display: 'swap',
})

const rethinkSans = Rethink_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'], // Adjust weights as needed based on usage
  style: ['normal', 'italic'],
  variable: '--font-rethink-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Cofactor Scout',
  description: 'Discover Research. Connect Investor. Earn Commission',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  return (
    <html lang="en">
      <body className={`${merriweather.variable} ${rethinkSans.variable} antialiased`}>
        {children}
        {session && <SupportWidget />}
        <CookieBanner />
      </body>
    </html>
  )
}

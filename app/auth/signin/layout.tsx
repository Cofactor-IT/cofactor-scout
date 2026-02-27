import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | Cofactor Scout',
  description: 'Sign in to your Cofactor Scout account to manage research submissions and track your earnings.'
}

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children
}

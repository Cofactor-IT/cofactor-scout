import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | Cofactor Scout',
  description: 'Create your Cofactor Scout account to start submitting research leads and earning commission.'
}

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children
}

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center px-4 bg-off-white">
      <h1 className="text-4xl md:text-5xl font-bold font-sans text-navy mb-6 tracking-[-0.005em]">
        Join the Revolution.
      </h1>
      <p className="text-base font-serif text-cool-gray mb-8 max-w-2xl leading-[1.5]">
        Cofactor Club is the exclusive network for student ambassadors.
        Climb the leaderboard, manage the knowledge base, and earn your place.
      </p>
      <div className="flex gap-4">
        <Link href="/leaderboard">
          <Button size="lg">View Leaderboard</Button>
        </Link>
        <Link href="/wiki">
          <Button size="lg" variant="secondary">Explore Wiki</Button>
        </Link>
      </div>
    </div>
  )
}

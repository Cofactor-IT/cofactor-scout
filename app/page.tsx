import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] text-center px-4">
      <h1 className="text-6xl font-black tracking-tight mb-6 bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent">
        Join the Revolution.
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
        Cofactor Club is the exclusive network for student ambassadors.
        Climb the leaderboard, manage the knowledge base, and earn your place.
      </p>
      <div className="flex gap-4">
        <Link href="/leaderboard">
          <Button size="lg" className="h-12 px-8 text-lg">View Leaderboard</Button>
        </Link>
        <Link href="/wiki">
          <Button size="lg" variant="outline" className="h-12 px-8 text-lg">Explore Wiki</Button>
        </Link>
      </div>
    </div>
  )
}

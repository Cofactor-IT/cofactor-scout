import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Home, Search } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#FAFBFC]">
            <Card className="max-w-md w-full p-[2.22vw] text-center">
                <div className="flex flex-col items-center gap-[1.67vw]">
                    <h1 className="text-[#1B2A4A]">404</h1>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FAFBFC] text-[#6B7280]">
                        <Search className="h-8 w-8" />
                    </div>
                    
                    <p className="body text-[#1B2A4A]">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>

                    <div className="flex flex-col gap-3 w-full">
                        <Link href="/">
                            <Button className="w-full">
                                <Home className="mr-2 h-4 w-4" />
                                Go to Homepage
                            </Button>
                        </Link>
                    </div>
                </div>
            </Card>
        </div>
    )
}

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default async function ThankYouPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <Card className="text-center">
                <CardHeader>
                    <CardTitle className="text-3xl">🎉 Thank You!</CardTitle>
                    <CardDescription className="text-lg mt-2">
                        Your edit proposal has been submitted for review.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        An admin will review your contribution soon. If approved, it will be published.
                    </p>
                    <div className="flex justify-center gap-4 pt-4">
                        <Link href={`/wiki/${slug}`}>
                            <Button variant="outline">Back to Page</Button>

                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div >
    )
}

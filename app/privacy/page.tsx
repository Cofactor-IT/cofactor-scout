import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { FileDown, Trash2, Shield, Eye, Clock, Database, Lock } from 'lucide-react'

export const metadata = {
    title: 'Privacy Policy & GDPR Rights',
    description: 'Learn about your data privacy rights and how we handle your personal information'
}

export default async function PrivacyPage() {
    const session = await getServerSession(authOptions)

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">Privacy Policy & GDPR Rights</h1>
                <p className="text-muted-foreground">
                    Your privacy is important to us. Learn about what data we collect, how we use it, and your rights under GDPR.
                </p>
            </div>

            <div className="space-y-6">
                {/* Data Rights Actions */}
                {session?.user && (
                    <Card className="border-primary">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                Your Data Rights
                            </CardTitle>
                            <CardDescription>
                                Exercise your GDPR rights directly from here
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Link href="/api/gdpr/export/request" className="w-full">
                                    <Button variant="outline" className="w-full justify-start">
                                        <FileDown className="h-4 w-4 mr-2" />
                                        Download My Data
                                    </Button>
                                </Link>
                                <Link href="/profile/settings/delete-account" className="w-full">
                                    <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete My Account
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* What Data We Collect */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            What Data We Collect
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold mb-2">Profile Information</h3>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>Name and email address</li>
                                    <li>Bio and personal description</li>
                                    <li>University affiliations</li>
                                    <li>Referral code</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Activity Data</h3>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>Wiki revisions and contributions</li>
                                    <li>Bookmarks and saved content</li>
                                    <li>Referral activity</li>
                                    <li>Power score and achievements</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Preferences</h3>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>Notification settings</li>
                                    <li>Language and timezone</li>
                                    <li>Theme preferences</li>
                                    <li>Public profile settings</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">System Data</h3>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>Login history and security logs</li>
                                    <li>Session information</li>
                                    <li>Feature flags and experiment assignments</li>
                                    <li>Calendar events you create</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* How We Use Your Data */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            How We Use Your Data
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li>
                                <strong>Platform Operation:</strong> To provide and maintain the Cofactor Club platform, including authentication, content delivery, and feature functionality.
                            </li>
                            <li>
                                <strong>Communication:</strong> To send you notifications about your account, content updates, and platform news (based on your preferences).
                            </li>
                            <li>
                                <strong>Referral Program:</strong> To track referrals, calculate power scores, and manage the ambassador program.
                            </li>
                            <li>
                                <strong>Improvement:</strong> To analyze usage patterns and improve our platform (using anonymized data where possible).
                            </li>
                            <li>
                                <strong>Security:</strong> To protect against fraud, abuse, and security threats.
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Data Retention */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Data Retention
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div className="p-4 bg-muted rounded-lg">
                                    <h4 className="font-semibold mb-2">Active Accounts</h4>
                                    <p className="text-muted-foreground">
                                        Data is retained as long as your account is active. You can request deletion at any time.
                                    </p>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <h4 className="font-semibold mb-2">Deleted Accounts</h4>
                                    <p className="text-muted-foreground">
                                        Personal data is anonymized immediately. Some content may be retained in anonymized form.
                                    </p>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <h4 className="font-semibold mb-2">System Logs</h4>
                                    <p className="text-muted-foreground">
                                        Security and audit logs are kept for 90 days, then anonymized and retained for 1 year.
                                    </p>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <h4 className="font-semibold mb-2">Backups</h4>
                                    <p className="text-muted-foreground">
                                        Encrypted backups are retained for 30 days for disaster recovery purposes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Your Rights */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Your GDPR Rights
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid gap-4">
                                <div className="border-l-4 border-primary pl-4">
                                    <h3 className="font-semibold">Right to Access (Article 15)</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        You can request a complete copy of all data we hold about you. 
                                        Use the &quot;Download My Data&quot; button above or contact us.
                                    </p>
                                </div>
                                <div className="border-l-4 border-primary pl-4">
                                    <h3 className="font-semibold">Right to Rectification (Article 16)</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        You can update your profile information anytime in your{' '}
                                        <Link href="/profile/settings" className="text-primary hover:underline">
                                            account settings
                                        </Link>.
                                    </p>
                                </div>
                                <div className="border-l-4 border-primary pl-4">
                                    <h3 className="font-semibold">Right to Erasure (Article 17)</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        You can request complete deletion of your account and data. 
                                        Use the &quot;Delete My Account&quot; button above. We offer both soft 
                                        delete (anonymization) and hard delete (complete removal).
                                    </p>
                                </div>
                                <div className="border-l-4 border-primary pl-4">
                                    <h3 className="font-semibold">Right to Portability (Article 20)</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Your data export is provided in both JSON and CSV formats, 
                                        making it easy to transfer to other services.
                                    </p>
                                </div>
                                <div className="border-l-4 border-primary pl-4">
                                    <h3 className="font-semibold">Right to Object (Article 21)</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        You can opt out of non-essential communications and data processing 
                                        in your notification preferences.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Us</CardTitle>
                        <CardDescription>
                            Questions about your privacy or data rights?
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            If you have any questions about this privacy policy or your data rights, 
                            please contact our Data Protection Officer at{' '}
                            <a href="mailto:privacy@cofactor.world" className="text-primary hover:underline">
                                privacy@cofactor.world
                            </a>
                        </p>
                        <p className="text-sm text-muted-foreground mt-4">
                            Last updated: February 2025
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

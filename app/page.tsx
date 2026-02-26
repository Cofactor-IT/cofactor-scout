import Link from 'next/link'
import Image from 'next/image'
import { Award, UserPlus, Send, SearchCheck, CircleDollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import HeroLogo from '@/public/cofactor-scout-hero-logo.png'
import { CookieConsentTrigger } from '@/components/cookie-consent/Trigger'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative min-h-[500px] md:h-[600px] bg-[#1B2A4A] px-4 md:px-8 lg:px-[120px] py-12 md:py-0">
                <Image
                    src={HeroLogo}
                    alt="Cofactor Scout"
                    width={725}
                    height={92}
                    className="relative md:absolute left-0 md:left-[120px] top-0 md:top-[60px] w-[200px] md:w-[400px] lg:w-[725px] h-auto"
                />

                <h1 className="relative md:absolute left-0 md:left-[120px] top-[30px] md:top-[172px] max-w-full md:max-w-[1600px] text-white mt-1 md:mt-0">
                    Discover Research. Connect Investors. Earn Commission
                </h1>

                <p className="relative md:absolute left-0 md:left-[120px] top-auto md:top-[292px] max-w-full md:max-w-[1600px] body-large text-white mt-16 md:mt-0">
                    Cofactor Scout connects promising university research with venture capital. Find cutting-edge projects in your network, submit them to our team, and earn commission when we facilitate successful matches.
                </p>

                <div className="relative md:absolute left-0 md:left-[120px] top-auto md:top-[430px] flex flex-col md:flex-row gap-4 md:gap-[32px] mt-8 md:mt-0">
                    <Link href="/scout/apply" className="w-full md:w-auto">
                        <Button className="w-full md:w-[280px] h-[56px] md:h-[64px]">
                            Apply to Become a Scout
                        </Button>
                    </Link>

                    <Link href="/auth/signup" className="w-full md:w-auto">
                        <Button className="w-full md:w-[280px] h-[56px] md:h-[64px]">
                            Or sign up as Contributor
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Choose Your Path Section */}
            <section className="relative bg-[#FAFBFC] py-12 md:py-[70px] px-4 md:px-8 lg:px-[120px]">
                <h2 className="mb-8 md:mb-[60px] max-w-full md:max-w-[1400px]">
                    Choose Your Path
                </h2>

                <p className="body-large mb-12 md:mb-[100px] max-w-full md:max-w-[1600px]">
                    Join our community as a Contributor and start submitting leads immediately, or apply to become a verified Scout for priority review and access to our exclusive network.
                </p>

                <div className="flex flex-col lg:flex-row justify-center gap-8 lg:gap-[120px] max-w-full lg:max-w-[1320px] mx-auto">
                    {/* Scout Card */}
                    <Card className="w-full lg:w-[600px] p-8 md:p-[60px] flex flex-col">
                        <Award className="w-[60px] h-[60px] mb-[30px] text-[#C9A84C]" />

                        <h3 className="mb-[10px]">Scout</h3>
                        <p className="caption text-[#6B7280] mb-[30px]">Verified Network</p>

                        <div className="mb-[40px]">
                            <p className="body-bold mb-[20px]">As a Scout:</p>
                            <div className="space-y-[10px] body">
                                <p>✓ Priority review by Cofactor team</p>
                                <p>✓ Green "Scout" badge on all submissions</p>
                                <p>✓ Part of official talent network</p>
                                <p>✓ Higher commission rates</p>
                            </div>
                        </div>

                        <div className="mb-[40px]">
                            <p className="body-bold mb-[10px]">Requires:</p>
                            <ul className="list-disc ml-[30px] body space-y-[10px]">
                                <li>Application</li>
                                <li>Approval</li>
                                <li>Review Process</li>
                            </ul>
                        </div>

                        <div className="mt-auto flex justify-center pb-6 md:pb-[35px]">
                            <Link href="/scout/apply" className="w-full md:w-auto">
                                <Button className="w-full md:w-[240px] h-[56px]">
                                    Apply Now
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    {/* Contributor Card */}
                    <Card className="w-full lg:w-[600px] p-8 md:p-[60px] flex flex-col">
                        <UserPlus className="w-[60px] h-[60px] mb-[30px] text-[#6B7280]" />

                        <h3 className="mb-[10px]">Contributor</h3>
                        <p className="caption text-[#6B7280] mb-[30px]">Open Access</p>

                        <div className="mb-[40px]">
                            <p className="body-bold mb-[20px]">As a Contributor:</p>
                            <div className="space-y-[10px] body">
                                <p>✓ Submit research immediately</p>
                                <p>✓ Gray badge on submissions</p>
                                <p>✓ Standard review timelines</p>
                                <p>✓ Can apply for Scout status later</p>
                            </div>
                        </div>

                        <div className="mt-auto flex justify-center pb-6 md:pb-[35px]">
                            <Link href="/auth/signup" className="w-full md:w-auto">
                                <Button className="w-full md:w-[240px] h-[56px]">
                                    Sign Up
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="bg-white py-12 md:py-[75px] px-4 md:px-8 lg:px-[120px]">
                <h2 className="mb-12 md:mb-[100px] text-center">
                    How Cofactor Works
                </h2>

                <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-[60px] max-w-full md:max-w-[1800px] mx-auto">
                    {/* Step 1 */}
                    <Card className="w-full md:w-[540px] h-auto md:h-[200px] p-6 md:p-[30px] flex flex-col justify-between">
                        <div className="flex flex-col items-center">
                            <Send className="w-[40px] h-[40px] mb-[20px] text-[#0D7377]" />
                            <h4 className="text-[#0D7377]">1. Submit Research</h4>
                        </div>
                        <p className="body text-center">Find promising research in your network</p>
                    </Card>

                    {/* Step 2 */}
                    <Card className="w-full md:w-[540px] h-auto md:h-[200px] p-6 md:p-[30px] flex flex-col justify-between">
                        <div className="flex flex-col items-center">
                            <SearchCheck className="w-[40px] h-[40px] mb-[20px] text-[#0D7377]" />
                            <h4 className="text-[#0D7377]">2. We Review</h4>
                        </div>
                        <p className="body text-center">Our team validates and connects with investors</p>
                    </Card>

                    {/* Step 3 */}
                    <Card className="w-full md:w-[540px] h-auto md:h-[200px] p-6 md:p-[30px] flex flex-col justify-between">
                        <div className="flex flex-col items-center">
                            <CircleDollarSign className="w-[40px] h-[40px] mb-[20px] text-[#0D7377]" />
                            <h4 className="text-[#0D7377]">3. Get Paid</h4>
                        </div>
                        <p className="body text-center">Earn commission on successful matches</p>
                    </Card>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full h-[100px] bg-[#FAFBFC] flex items-center justify-center gap-6">
                <p className="body text-center">
                    <span className="text-[#6B7280]">Already have an account? </span>
                    <Link href="/auth/signin" className="text-[#0D7377] underline hover:text-[#0a5a5d]">
                        Sign in
                    </Link>
                </p>
                <div className="text-[#E5E7EB]">|</div>
                <CookieConsentTrigger />
            </footer>
        </div>
    )
}

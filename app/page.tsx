import Link from 'next/link'
import Image from 'next/image'
import { Award, UserPlus, Send, SearchCheck, CircleDollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import HeroLogo from '@/public/cofactor-scout-hero-logo.png'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative h-[500px] bg-[#1B2A4A] px-[8.33vw]">
                <Image 
                    src={HeroLogo}
                    alt="Cofactor Scout" 
                    width={580} 
                    height={74} 
                    className="absolute left-[8.33vw] top-[60px]" 
                />
                
                <h1 className="absolute left-[8.33vw] top-[154px] max-w-[2640px] text-white" style={{ fontSize: '2.96vw' }}>
                    Discover Research. Connect Investor. Earn Commission
                </h1>
                
                <p className="absolute left-[8.33vw] top-[250px] max-w-[1440px] body-large text-white">
                    Cofactor Scout connects promising university research with venture capital. Find cutting-edge projects in your network, submit them to our team, and earn commission when we facilitate successful matches.
                </p>
                
                <div className="absolute left-[8.33vw] top-[384px] flex gap-8">
                    <Link href="/scout/apply">
                        <Button className="w-[16.67vw] h-[3.89vw]">
                            Apply to Become a Scout
                        </Button>
                    </Link>
                    
                    <Link href="/auth/signup">
                        <Button className="w-[16.67vw] h-[3.89vw]">
                            Or sign up as Contributor
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Choose Your Path Section */}
            <section className="relative bg-[#FAFBFC] py-[4.8vw] px-[8.33vw]">
                <h2 className="mb-[3.3vw]">
                    Choose Your Path
                </h2>
                
                <p className="body-large mb-[7.8vw] max-w-[72.3vw]">
                    Join our community as a Contributor and start submitting leads immediately, or apply to become a verified Scout for priority review and access to our exclusive network.
                </p>
                
                <div className="flex justify-center gap-[8.33vw] max-w-[91.67vw] mx-auto">
                    {/* Scout Card */}
                    <Card className="w-[37.5vw] p-[3.33vw] flex flex-col">
                        <Award className="w-[3.33vw] h-[3.33vw] mb-[1.67vw] text-[#C9A84C]" />
                        
                        <h3 className="mb-[0.56vw]">Scout</h3>
                        <p className="caption text-[#6B7280] mb-[1.67vw]">Verified Network</p>
                        
                        <div className="mb-[2.22vw]">
                            <p className="body-bold mb-[1.11vw]">As a Scout:</p>
                            <div className="space-y-[0.56vw] body">
                                <p>✓ Priority review by Cofactor team</p>
                                <p>✓ Green "Scout" badge on all submissions</p>
                                <p>✓ Part of official talent network</p>
                                <p>✓ Higher commission rates</p>
                            </div>
                        </div>
                        
                        <div className="mb-[2.22vw]">
                            <p className="body-bold mb-[0.56vw]">Requires:</p>
                            <ul className="list-disc ml-[1.67vw] body">
                                <li>Application</li>
                                <li>Approval</li>
                                <li>Review Process</li>
                            </ul>
                        </div>
                        
                        <div className="mt-auto flex justify-center pb-[1.94vw]">
                            <Link href="/scout/apply">
                                <Button className="w-[13.89vw] h-[3.33vw]">
                                    Apply Now
                                </Button>
                            </Link>
                        </div>
                    </Card>
                    
                    {/* Contributor Card */}
                    <Card className="w-[37.5vw] p-[3.33vw] flex flex-col">
                        <UserPlus className="w-[3.33vw] h-[3.33vw] mb-[1.67vw] text-[#6B7280]" />
                        
                        <h3 className="mb-[0.56vw]">Contributor</h3>
                        <p className="caption text-[#6B7280] mb-[1.67vw]">Open Access</p>
                        
                        <div className="mb-[2.22vw]">
                            <p className="body-bold mb-[1.11vw]">As a Contributor:</p>
                            <div className="space-y-[0.56vw] body">
                                <p>✓ Submit research immediately</p>
                                <p>✓ Gray badge on submissions</p>
                                <p>✓ Standard review timelines</p>
                                <p>✓ Can apply for Scout status later</p>
                            </div>
                        </div>
                        
                        <div className="mt-auto flex justify-center pb-[1.94vw]">
                            <Link href="/auth/signup">
                                <Button className="w-[13.89vw] h-[3.33vw]">
                                    Sign Up
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="bg-white py-[4.17vw] px-[8.33vw]">
                <h2 className="mb-[5.56vw] text-center">
                    How Cofactor Works
                </h2>
                
                <div className="flex justify-center gap-[8.33vw] max-w-[91.67vw] mx-auto">
                    {/* Step 1 */}
                    <Card className="w-[25vw] p-[1.67vw]">
                        <div className="flex flex-col items-center mb-[2.22vw]">
                            <Send className="w-[2.22vw] h-[2.22vw] mb-[1.11vw] text-[#0D7377]" />
                            <h4 className="text-[#0D7377]">1. Submit Research</h4>
                        </div>
                        <p className="body text-center">Find promising research in your network</p>
                    </Card>
                    
                    {/* Step 2 */}
                    <Card className="w-[25vw] p-[1.67vw]">
                        <div className="flex flex-col items-center mb-[2.22vw]">
                            <SearchCheck className="w-[2.22vw] h-[2.22vw] mb-[1.11vw] text-[#0D7377]" />
                            <h4 className="text-[#0D7377]">2. We Review</h4>
                        </div>
                        <p className="body text-center">Our team validates and connects with investors</p>
                    </Card>
                    
                    {/* Step 3 */}
                    <Card className="w-[25vw] p-[1.67vw]">
                        <div className="flex flex-col items-center mb-[2.22vw]">
                            <CircleDollarSign className="w-[2.22vw] h-[2.22vw] mb-[1.11vw] text-[#0D7377]" />
                            <h4 className="text-[#0D7377]">3. Get Paid</h4>
                        </div>
                        <p className="body text-center">Earn commission on successful matches</p>
                    </Card>
                </div>
            </section>

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 right-0 w-full h-[100px] bg-[#FAFBFC] flex items-center justify-center z-10">
                <p className="body text-center">
                    <span className="text-[#6B7280]">Already have an account? </span>
                    <Link href="/auth/signin" className="text-[#0D7377] underline hover:text-[#0a5a5d]">
                        Sign in
                    </Link>
                </p>
            </footer>
        </div>
    )
}

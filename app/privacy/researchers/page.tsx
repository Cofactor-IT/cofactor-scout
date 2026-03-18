/**
 * privacy/researchers/page.tsx
 *
 * Article 14 GDPR notice for researchers whose data is processed
 * by Cofactor Scout without their direct registration.
 * Required under GDPR Article 14 when data is obtained from third parties.
 *
 * Version: 1.0
 * Last updated: 17 March 2026
 */

import Link from 'next/link'
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Researcher Privacy Notice | Cofactor Scout',
    description: 'Information for researchers about how Cofactor Scout processes data about them under Article 14 GDPR.'
}

/**
 * Researcher Data Notice page (Article 14 GDPR).
 * Formatted from Confluence v1.0 (March 2026).
 */
export default function ResearcherNoticePage() {
    return (
        <div className="px-4 md:px-8 lg:px-[120px] py-12 md:py-[80px]">
            <div className="max-w-[800px] mx-auto">

                {/* Page header */}
                <h1 className="mb-2">Information about how Cofactor processes your data</h1>
                <p className="caption text-[var(--cool-gray)] mb-2">
                    Last updated: 17 March 2026 &nbsp;&middot;&nbsp; Version 1.0
                </p>
                <p className="caption text-[var(--cool-gray)] mb-12">
                    Applies to: Researchers whose work appears in academic databases
                </p>

                {/* Intro notice */}
                <div className="bg-[var(--off-white)] border border-[var(--light-gray)] p-6 mb-12" style={{ borderRadius: '4px' }}>
                    <p className="body mb-4">
                        <span className="body-bold">This notice is for you if you have not created an account on Cofactor Scout.</span>
                    </p>
                    <p className="body mb-4">
                        If you are a researcher and you have not created an account on Cofactor Scout, this notice explains why we may hold information about you, what that information is, and what you can do about it.
                    </p>
                    <p className="body">
                        If you are a registered Cofactor Scout user, please refer to our{' '}
                        <Link href="/privacy/policy" className="text-[var(--teal)] underline hover:text-[var(--teal-dark)]">
                            full Privacy Policy
                        </Link>{' '}
                        instead.
                    </p>
                </div>

                {/* ============================================
                    WHO WE ARE
                ============================================ */}
                <section className="mb-10">
                    <h2 className="mb-4">Who we are</h2>
                    <p className="body mb-4">
                        Cofactor is a venture capital entity that identifies and evaluates promising university research projects for potential commercial engagement and investment.
                    </p>
                    <p className="body mb-1">
                        <span className="body-bold">Company name:</span> Cofactor
                    </p>
                    <p className="body mb-1">
                        <span className="body-bold">Registered address:</span> 90 Gold St, San Francisco, United States of America
                    </p>
                    <p className="body mb-4">
                        <span className="body-bold">Contact email:</span>{' '}
                        <a href="mailto:privacy@cofactor.world" className="text-[var(--teal)] underline hover:text-[var(--teal-dark)]">
                            privacy@cofactor.world
                        </a>
                    </p>
                    <p className="body mb-2">
                        <span className="body-bold">Our EU Representative</span> — because we are a US company processing data of EU residents, we are required by GDPR Article 27 to designate a representative in the European Union. Our EU Representative is:
                    </p>
                    <p className="body ml-4 mb-4">
                        Ahmed Aizi, Friedrichstr 15, Flensburg, 24937, Schleswig Holstein, Germany<br />
                        <a href="mailto:ahmed.aizi@cofactor.world" className="text-[var(--teal)] underline hover:text-[var(--teal-dark)]">
                            ahmed.aizi@cofactor.world
                        </a>
                    </p>
                    <p className="body">
                        You can contact our EU Representative directly for any questions or requests relating to your personal data.
                    </p>
                </section>

                {/* ============================================
                    WHY DO WE HAVE INFORMATION ABOUT YOU
                ============================================ */}
                <section className="mb-10">
                    <h2 className="mb-4">Why do we have information about you?</h2>
                    <p className="body mb-4">
                        When someone submits a research lead to Cofactor Scout — for example, a colleague, a university technology transfer office, or someone familiar with your work — your name is included in that lead. To assess whether the lead is credible, we retrieve publicly available professional information about you from academic databases.
                    </p>
                    <p className="body">
                        We do this to verify the academic standing of researchers named in leads submitted to us, so that we can make informed decisions about whether to pursue engagement with the research described.
                    </p>
                </section>

                {/* ============================================
                    WHERE DOES YOUR DATA COME FROM
                ============================================ */}
                <section className="mb-10">
                    <h2 className="mb-4">Where does your data come from?</h2>
                    <p className="body mb-4">
                        We do not collect your data directly from you. We retrieve it from the following publicly accessible academic databases and APIs:
                    </p>
                    <ul className="list-disc ml-6 body space-y-2">
                        <li>
                            <span className="body-bold">OpenAlex</span> — open catalogue of academic publications and researcher profiles
                        </li>
                        <li>
                            <span className="body-bold">ORCID</span> — open researcher identifier system (
                            <a
                                href="https://orcid.org"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--teal)] underline hover:text-[var(--teal-dark)]"
                            >
                                orcid.org
                            </a>
                            )
                        </li>
                        <li>
                            <span className="body-bold">Crossref</span> — publication metadata registry
                        </li>
                        <li>
                            <span className="body-bold">PubMed</span> — biomedical literature database operated by the US National Library of Medicine
                        </li>
                        <li>
                            <span className="body-bold">Semantic Scholar</span> — academic paper search operated by the Allen Institute for AI
                        </li>
                        <li>
                            <span className="body-bold">PatentsView</span> — patent data system operated by the US Patent and Trademark Office
                        </li>
                    </ul>
                </section>

                {/* ============================================
                    WHAT INFORMATION DO WE HOLD
                ============================================ */}
                <section className="mb-10">
                    <h2 className="mb-6">What information do we hold about you?</h2>
                    <p className="body mb-4">
                        We limit the information we retrieve to what is necessary for lead validation. This may include:
                    </p>
                    <ul className="list-disc ml-6 body space-y-2 mb-8">
                        <li>Your name</li>
                        <li>Your current institutional affiliation and department</li>
                        <li>Your ORCID identifier (if registered)</li>
                        <li>Your institutional email address (if publicly available in academic databases)</li>
                        <li>Titles of your published academic work</li>
                        <li>Your research field and domain</li>
                        <li>Your citation count and h-index</li>
                    </ul>
                    <p className="body mb-4">We do not retrieve or process:</p>
                    <ul className="list-disc ml-6 body space-y-2">
                        <li>Personal contact details beyond your institutional email</li>
                        <li>Social media profiles</li>
                        <li>Financial information</li>
                        <li>Health or medical information</li>
                        <li>Any information you have not made available through academic publishing channels</li>
                    </ul>
                </section>

                {/* ============================================
                    LEGAL BASIS
                ============================================ */}
                <section className="mb-10">
                    <h2 className="mb-4">What is our legal basis for processing your data?</h2>
                    <p className="body mb-4">
                        We process your data on the basis of <span className="body-bold">legitimate interests</span> under GDPR Article 6(1)(f).
                    </p>
                    <p className="body mb-4">
                        Our legitimate interest is in verifying the credibility of research leads submitted to us, in order to make informed investment decisions. We have carried out a formal Legitimate Interests Assessment (LIA) which concluded that this interest is not overridden by your rights and freedoms, provided we maintain appropriate safeguards — including this notice, an accessible opt-out mechanism, strict data minimisation, and short retention periods.
                    </p>
                    <p className="body">
                        We do not rely on your consent as our legal basis, which means we do not need your permission to process this data — but it also means you have a strong right to object (see below).
                    </p>
                </section>

                {/* ============================================
                    WHAT DO WE DO WITH YOUR DATA
                ============================================ */}
                <section className="mb-10">
                    <h2 className="mb-4">What do we do with your data?</h2>
                    <p className="body mb-4">
                        Your data is used solely to validate the research lead in which you were named. Specifically:
                    </p>
                    <ul className="list-disc ml-6 body space-y-2 mb-8">
                        <li>We assess your academic standing and the credibility of the research described in the lead</li>
                        <li>A member of the Cofactor team reviews the validation output before any decision is made</li>
                        <li>If the lead is credible, Cofactor may decide to pursue engagement with the research — this could ultimately mean someone from Cofactor reaching out to you directly</li>
                    </ul>
                    <p className="body mb-4">Your data is not used for:</p>
                    <ul className="list-disc ml-6 body space-y-2">
                        <li>Marketing or advertising</li>
                        <li>Selling or sharing with third parties outside of what is described in this notice</li>
                        <li>Training AI models</li>
                        <li>Building persistent researcher profiles beyond the evaluation period</li>
                    </ul>
                </section>

                {/* ============================================
                    WHO DO WE SHARE YOUR DATA WITH
                ============================================ */}
                <section className="mb-10">
                    <h2 className="mb-4">Who do we share your data with?</h2>
                    <p className="body mb-4">
                        We share your data only with the following recipients, solely for the purpose of operating the platform:
                    </p>
                    <div className="mb-4 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Recipient</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Safeguard</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Supabase</TableCell>
                                    <TableCell>Database hosting</TableCell>
                                    <TableCell>EU (AWS eu-west-1)</TableCell>
                                    <TableCell>Standard Contractual Clauses</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Vercel</TableCell>
                                    <TableCell>Application hosting</TableCell>
                                    <TableCell>EU (Frankfurt/Dublin)</TableCell>
                                    <TableCell>EU-US Data Privacy Framework</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Anthropic</TableCell>
                                    <TableCell>AI-assisted validation</TableCell>
                                    <TableCell>USA</TableCell>
                                    <TableCell>Standard Contractual Clauses</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Brevo</TableCell>
                                    <TableCell>Email delivery (this notice)</TableCell>
                                    <TableCell>EU (France)</TableCell>
                                    <TableCell>EU-based processing</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                    <p className="body">
                        We do not sell your data. We do not share it with other companies, investors, or third parties beyond those listed above.
                    </p>
                </section>

                {/* ============================================
                    HOW LONG DO WE KEEP YOUR DATA
                ============================================ */}
                <section className="mb-10">
                    <h2 className="mb-4">How long do we keep your data?</h2>
                    <p className="body mb-4">We keep your data for the minimum time necessary:</p>
                    <ul className="list-disc ml-6 body space-y-2 mb-4">
                        <li>
                            <span className="body-bold">Researcher profile data</span> (name, affiliation, publications, metrics) — deleted or anonymised within 30 days of the evaluation being completed
                        </li>
                        <li>
                            <span className="body-bold">Institutional email address</span> — used to send this notice and then retained only as long as necessary to process any response from you
                        </li>
                        <li>
                            <span className="body-bold">Validation output</span> — pseudonymised after evaluation and deleted within 12–24 months
                        </li>
                    </ul>
                    <p className="body">
                        After these periods your data is permanently deleted from our systems. If you submit a removal request (see below), we will delete your data sooner.
                    </p>
                </section>

                {/* ============================================
                    YOUR RIGHTS
                ============================================ */}
                <section className="mb-10">
                    <h2 className="mb-4">Your rights</h2>
                    <p className="body mb-6">
                        As an EU resident, you have the following rights under the GDPR:
                    </p>
                    <ul className="body space-y-4 mb-6">
                        <li>
                            <span className="body-bold">Right to access (Article 15)</span> — you can ask us what information we hold about you and receive a copy of it.
                        </li>
                        <li>
                            <span className="body-bold">Right to rectification (Article 16)</span> — if information we hold about you is inaccurate, you can ask us to correct it.
                        </li>
                        <li>
                            <span className="body-bold">Right to erasure (Article 17)</span> — you can ask us to delete all information we hold about you. We will do so unless we have a compelling reason not to.
                        </li>
                        <li>
                            <span className="body-bold">Right to restriction (Article 18)</span> — you can ask us to pause processing of your data while a dispute is being resolved.
                        </li>
                        <li>
                            <span className="body-bold">Right to object (Article 21)</span> — you have the right to object to us processing your data at any time, on grounds relating to your particular situation. When you object, we must stop processing unless we can demonstrate compelling legitimate grounds. This is your strongest right in this context — we take objections seriously and will cease processing promptly.
                        </li>
                        <li>
                            <span className="body-bold">Right to lodge a complaint</span> — if you are unhappy with how we have handled your data, you have the right to lodge a complaint with your national data protection authority. In Germany this is the Federal Commissioner for Data Protection and Freedom of Information (BfDI) at{' '}
                            <a
                                href="https://bfdi.bund.de"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--teal)] underline hover:text-[var(--teal-dark)]"
                            >
                                bfdi.bund.de
                            </a>
                            . You may also complain to the data protection authority in the EU member state where you live or work.
                        </li>
                    </ul>
                </section>

                {/* ============================================
                    HOW TO EXERCISE YOUR RIGHTS
                ============================================ */}
                <section className="mb-10">
                    <h2 className="mb-4">How to exercise your rights</h2>
                    <p className="body mb-4">
                        You can submit any request — removal, access, objection, correction — using our data subject request form:
                    </p>
                    <div className="mb-6">
                        <Link
                            href="/privacy/request"
                            className="inline-block button bg-[var(--teal)] text-white hover:bg-[var(--teal-dark)] transition-colors rounded-full shadow-[0px_2px_4px_rgba(13,115,119,0.2)]"
                        >
                            Submit a request
                        </Link>
                    </div>
                    <p className="body mb-4">
                        You can also contact our EU Representative directly:{' '}
                        <a href="mailto:ahmed.aizi@cofactor.world" className="text-[var(--teal)] underline hover:text-[var(--teal-dark)]">
                            ahmed.aizi@cofactor.world
                        </a>
                    </p>
                    <p className="body">
                        We will respond to all requests within one month of receipt, as required by GDPR Article 12. For complex requests we may extend this by a further two months — if so, we will let you know.
                    </p>
                </section>

                {/* ============================================
                    AUTOMATED PROCESSING
                ============================================ */}
                <section className="mb-10">
                    <h2 className="mb-4">Automated processing and human review</h2>
                    <p className="body">
                        We use AI-assisted tools to help validate research leads. This involves automated analysis of your academic data. However, a member of the Cofactor team always reviews the AI output before any decision is made. No decision affecting you is made solely by automated means.
                    </p>
                </section>

                {/* ============================================
                    CHANGES TO THIS NOTICE
                ============================================ */}
                <section className="mb-10">
                    <h2 className="mb-4">Changes to this notice</h2>
                    <p className="body">
                        If we materially change how we process researcher data, we will update this notice and revise the &ldquo;last updated&rdquo; date at the top. If we have your email address, we will notify you directly of material changes.
                    </p>
                </section>

                {/* ============================================
                    CONTACT US
                ============================================ */}
                <section className="mb-10">
                    <h2 className="mb-4">Contact us</h2>
                    <p className="body mb-1">
                        <span className="body-bold">Email:</span>{' '}
                        <a href="mailto:privacy@cofactor.world" className="text-[var(--teal)] underline hover:text-[var(--teal-dark)]">
                            privacy@cofactor.world
                        </a>
                    </p>
                    <p className="body mb-1">
                        <span className="body-bold">EU Representative:</span>{' '}
                        <a href="mailto:ahmed.aizi@cofactor.world" className="text-[var(--teal)] underline hover:text-[var(--teal-dark)]">
                            ahmed.aizi@cofactor.world
                        </a>
                    </p>
                    <p className="body">
                        <span className="body-bold">Post:</span> 90 Gold St, San Francisco, CA 94111, United States of America
                    </p>
                </section>

            </div>
        </div>
    )
}

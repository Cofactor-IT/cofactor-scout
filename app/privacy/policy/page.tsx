/**
 * privacy/policy/page.tsx
 *
 * Privacy Policy for Cofactor Scout.
 * Explains data collection, use, retention, and user rights under GDPR.
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
    title: 'Privacy Policy | Cofactor Scout',
    description: 'The Cofactor Scout Privacy Policy — how we collect, use, store, and protect your personal data.'
}

/**
 * Privacy Policy page.
 * Formatted from Confluence v1.0 (March 2026).
 */
export default function PrivacyPolicyPage() {
    return (
        <div className="px-4 md:px-8 lg:px-[120px] py-12 md:py-[80px]">
            <div className="max-w-[800px] mx-auto">

                {/* Page header */}
                <h1 className="mb-2">Privacy Policy</h1>
                <p className="caption text-[var(--cool-gray)] mb-12">
                    Last updated: 17 March 2026 &nbsp;&middot;&nbsp; Version 1.0
                </p>

                {/* ============================================
                    1. INTRODUCTION
                ============================================ */}
                <section className="mb-10">
                    <h2 className="mb-4">1. Introduction</h2>
                    <p className="body mb-4">
                        Cofactor (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;) operates Cofactor Scout, a platform that identifies and evaluates promising university research projects for potential commercial engagement and investment. This Privacy Policy explains how we collect, use, store, and protect personal data when you use Cofactor Scout, and what rights you have in relation to that data.
                    </p>
                    <p className="body mb-4">This policy applies to:</p>
                    <ul className="list-disc ml-6 body space-y-2 mb-4">
                        <li><span className="body-bold">Contributors</span> — individuals who submit research leads to the platform</li>
                        <li><span className="body-bold">Scouts</span> — vetted Contributors with elevated platform access</li>
                        <li><span className="body-bold">Visitors</span> — anyone who visits scout.cofactor.world without creating an account</li>
                    </ul>
                    <p className="body mb-4">
                        If you are a researcher whose data we hold but who has not registered on the platform, please refer to our separate{' '}
                        <Link href="/privacy/researchers" className="text-[var(--teal)] underline hover:text-[var(--teal-dark)]">
                            Researcher Data Notice
                        </Link>{' '}
                        instead.
                    </p>
                    <p className="body">
                        We are committed to handling your personal data responsibly and in accordance with the EU General Data Protection Regulation (GDPR) (EU) 2016/679.
                    </p>
                </section>

                {/* ============================================
                    2. WHO WE ARE
                ============================================ */}
                <section className="mb-10">
                    <h2 className="mb-4">2. Who we are</h2>
                    <p className="body mb-4">
                        <span className="body-bold">Controller:</span> Cofactor, 90 Gold St, San Francisco, CA 94111, United States of America
                    </p>
                    <p className="body mb-2">
                        <span className="body-bold">EU Representative:</span> Because we are a US company processing data of EU residents, we have designated an EU Representative under GDPR Article 27:
                    </p>
                    <p className="body mb-4 ml-4">
                        Ahmed Aizi, Friedrichstr 15, Flensburg, 24937, Schleswig Holstein, Germany<br />
                        <a href="mailto:ahmed.aizi@cofactor.world" className="text-[var(--teal)] underline hover:text-[var(--teal-dark)]">
                            ahmed.aizi@cofactor.world
                        </a>
                    </p>
                    <p className="body mb-4">
                        <span className="body-bold">Privacy contact:</span>{' '}
                        <a href="mailto:privacy@cofactor.world" className="text-[var(--teal)] underline hover:text-[var(--teal-dark)]">
                            privacy@cofactor.world
                        </a>
                    </p>
                    <p className="body">
                        You can contact either us or our EU Representative with any questions or requests relating to your personal data.
                    </p>
                </section>

                {/* ============================================
                    3. WHAT DATA WE COLLECT AND WHY
                ============================================ */}
                <section className="mb-10">
                    <h2 className="mb-6">3. What data we collect and why</h2>

                    {/* 3.1 Account registration */}
                    <h3 className="mb-4">3.1 Account registration and authentication</h3>
                    <p className="body mb-4">
                        When you create an account on Cofactor Scout, we collect:
                    </p>
                    <div className="mb-6 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Purpose</TableHead>
                                    <TableHead>Legal basis</TableHead>
                                    <TableHead>Retention</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Full name</TableCell>
                                    <TableCell>Identifying you on the platform</TableCell>
                                    <TableCell>Contract — Art 6(1)(b)</TableCell>
                                    <TableCell>Account duration + 12 months</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Email address</TableCell>
                                    <TableCell>Account login, communications</TableCell>
                                    <TableCell>Contract — Art 6(1)(b)</TableCell>
                                    <TableCell>Account duration + 12 months</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Password (hashed)</TableCell>
                                    <TableCell>Secure authentication</TableCell>
                                    <TableCell>Contract — Art 6(1)(b)</TableCell>
                                    <TableCell>Account duration + 12 months</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Institutional affiliation</TableCell>
                                    <TableCell>Platform functionality, lead context</TableCell>
                                    <TableCell>Contract — Art 6(1)(b)</TableCell>
                                    <TableCell>Account duration + 12 months</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Account creation date</TableCell>
                                    <TableCell>Platform administration</TableCell>
                                    <TableCell>Contract — Art 6(1)(b)</TableCell>
                                    <TableCell>Account duration + 12 months</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                    <p className="body mb-4">
                        We currently support email and password registration. We may add additional sign-in methods (such as OAuth providers) in the future — if we do, this policy will be updated to reflect any additional data collection.
                    </p>
                    <p className="body mb-8">
                        Passwords are never stored in plaintext. We use bcrypt hashing to store password credentials securely.
                    </p>

                    {/* 3.2 Research lead submissions */}
                    <h3 className="mb-4">3.2 Research lead submissions</h3>
                    <p className="body mb-4">When you submit a research lead, we collect:</p>
                    <div className="mb-8 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Purpose</TableHead>
                                    <TableHead>Legal basis</TableHead>
                                    <TableHead>Retention</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Lead content (project description, researcher names, institution)</TableCell>
                                    <TableCell>Core platform function</TableCell>
                                    <TableCell>Contract — Art 6(1)(b)</TableCell>
                                    <TableCell>24–36 months post-evaluation</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Submission timestamp</TableCell>
                                    <TableCell>Platform administration, audit trail</TableCell>
                                    <TableCell>Contract — Art 6(1)(b)</TableCell>
                                    <TableCell>24–36 months post-evaluation</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Submitter identity</TableCell>
                                    <TableCell>Linking leads to Contributors</TableCell>
                                    <TableCell>Contract — Art 6(1)(b)</TableCell>
                                    <TableCell>24–36 months post-evaluation</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                    {/* 3.3 Platform usage and security */}
                    <h3 className="mb-4">3.3 Platform usage and security</h3>
                    <div className="mb-8 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Purpose</TableHead>
                                    <TableHead>Legal basis</TableHead>
                                    <TableHead>Retention</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Session tokens</TableCell>
                                    <TableCell>Maintaining your logged-in session</TableCell>
                                    <TableCell>Contract — Art 6(1)(b)</TableCell>
                                    <TableCell>Session duration / 24 hours</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Login timestamps and events</TableCell>
                                    <TableCell>Security monitoring, fraud prevention</TableCell>
                                    <TableCell>Legitimate interests — Art 6(1)(f)</TableCell>
                                    <TableCell>6–12 months</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Audit log entries (actions taken, resources accessed)</TableCell>
                                    <TableCell>Security, accountability, compliance</TableCell>
                                    <TableCell>Legitimate interests — Art 6(1)(f)</TableCell>
                                    <TableCell>12–24 months</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>User ID, role (sent to Sentry on server-side errors)</TableCell>
                                    <TableCell>Error diagnosis and platform stability</TableCell>
                                    <TableCell>Legitimate interests — Art 6(1)(f)</TableCell>
                                    <TableCell>90 days (Sentry free plan retention)</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                    {/* 3.4 Marketing communications */}
                    <h3 className="mb-4">3.4 Marketing communications</h3>
                    <p className="body mb-4">If you opt in to receive updates and communications from Cofactor, we collect:</p>
                    <div className="mb-4 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Purpose</TableHead>
                                    <TableHead>Legal basis</TableHead>
                                    <TableHead>Retention</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Email address</TableCell>
                                    <TableCell>Sending marketing communications</TableCell>
                                    <TableCell>Consent — Art 6(1)(a)</TableCell>
                                    <TableCell>Until consent withdrawn</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Consent timestamp and version</TableCell>
                                    <TableCell>Demonstrating valid consent</TableCell>
                                    <TableCell>Legal obligation — Art 6(1)(c)</TableCell>
                                    <TableCell>Duration of processing + applicable limitation period</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                    <p className="body mb-8">
                        You can withdraw your consent and unsubscribe at any time by clicking the unsubscribe link in any email or by updating your account settings. Withdrawal of consent does not affect the lawfulness of processing before withdrawal.
                    </p>

                    {/* 3.5 Website analytics */}
                    <h3 className="mb-4">3.5 Website analytics</h3>
                    <p className="body mb-4">
                        We use Plausible Analytics to understand how visitors use Cofactor Scout. Plausible does not use cookies, does not collect personal data, and does not generate persistent identifiers. IP addresses are hashed with a daily-rotating salt and never stored. This processing does not require a cookie consent banner under the ePrivacy Directive.
                    </p>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Purpose</TableHead>
                                    <TableHead>Legal basis</TableHead>
                                    <TableHead>Retention</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Aggregated page views and referral sources</TableCell>
                                    <TableCell>Understanding platform usage</TableCell>
                                    <TableCell>Legitimate interests — Art 6(1)(f)</TableCell>
                                    <TableCell>12 months</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </section>

                {/* ============================================
                    4. COOKIES
                ============================================ */}
                <section className="mb-10">
                    <h2 className="mb-4">4. Cookies</h2>
                    <p className="body mb-4">We use only the following cookies on Cofactor Scout:</p>
                    <div className="mb-4 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cookie</TableHead>
                                    <TableHead>Purpose</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Retention</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>sb-[project-ref]-auth-token</TableCell>
                                    <TableCell>Maintaining your authenticated session (Supabase)</TableCell>
                                    <TableCell>Strictly necessary</TableCell>
                                    <TableCell>Session / 24 hours</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                    <p className="body mb-4">
                        We do not use advertising cookies, tracking cookies, or any non-essential cookies. No cookie consent banner is required because the only cookie we set is strictly necessary for the service you have requested.
                    </p>
                    <p className="body">
                        If we add any non-essential cookies in the future, we will update this policy and implement a cookie consent mechanism before doing so.
                    </p>
                </section>

                {/* ============================================
                    5. WHO WE SHARE YOUR DATA WITH
                ============================================ */}
                <section className="mb-10">
                    <h2 className="mb-4">5. Who we share your data with</h2>
                    <p className="body mb-4">
                        We share your data only with the following third-party processors, who act under our instruction and are bound by Data Processing Agreements:
                    </p>
                    <div className="mb-4 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Processor</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Transfer safeguard</TableHead>
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
                                    <TableCell>Application hosting and delivery</TableCell>
                                    <TableCell>EU (Frankfurt/Dublin)</TableCell>
                                    <TableCell>EU-US Data Privacy Framework + SCCs</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Brevo (Sendinblue SAS)</TableCell>
                                    <TableCell>Email delivery</TableCell>
                                    <TableCell>EU (France)</TableCell>
                                    <TableCell>EU-based processing</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Anthropic</TableCell>
                                    <TableCell>AI-assisted research lead validation</TableCell>
                                    <TableCell>USA</TableCell>
                                    <TableCell>Standard Contractual Clauses</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Plausible Analytics</TableCell>
                                    <TableCell>Website analytics</TableCell>
                                    <TableCell>EU</TableCell>
                                    <TableCell>EU-based processing</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Sentry</TableCell>
                                    <TableCell>Error monitoring and crash reporting</TableCell>
                                    <TableCell>USA</TableCell>
                                    <TableCell>Standard Contractual Clauses</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                    <p className="body">
                        We do not sell your personal data. We do not share your data with advertisers, data brokers, or any third party not listed above. If we add new processors in the future, we will update this policy.
                    </p>
                </section>

                {/* ============================================
                    6. INTERNATIONAL DATA TRANSFERS
                ============================================ */}
                <section className="mb-10">
                    <h2 className="mb-4">6. International data transfers</h2>
                    <p className="body mb-4">
                        Cofactor is incorporated in the United States. Some of our processors are also based in the United States (Vercel, Anthropic). Transfers of personal data from the EU/EEA to the United States are subject to GDPR Chapter V.
                    </p>
                    <p className="body mb-4">We rely on the following transfer mechanisms:</p>
                    <ul className="list-disc ml-6 body space-y-2 mb-4">
                        <li><span className="body-bold">Vercel</span> — certified under the EU-US Data Privacy Framework (DPF)</li>
                        <li><span className="body-bold">Anthropic</span> — Standard Contractual Clauses (EU Commission Decision 2021/914, Modules 2 and 3), with UK Addendum</li>
                    </ul>
                    <p className="body">
                        We also implement supplementary technical measures including encryption in transit (TLS 1.3), encryption at rest (AES-256), and pseudonymisation of personal data before transfer to US-based AI processors where possible.
                    </p>
                </section>

                {/* ============================================
                    7. AUTOMATED DECISION-MAKING AND PROFILING
                ============================================ */}
                <section className="mb-10">
                    <h2 className="mb-4">7. Automated decision-making and profiling</h2>
                    <p className="body mb-4">
                        Cofactor Scout uses AI-assisted tools to validate research leads. This involves automated analysis of information about researchers named in submitted leads. We want to be transparent about how this works:
                    </p>
                    <ul className="list-disc ml-6 body space-y-2 mb-4">
                        <li>The AI analyses publicly available academic data about the named researcher</li>
                        <li>A member of the Cofactor team always reviews the AI output before any decision is made</li>
                        <li>No decision that significantly affects any individual is made solely by automated means</li>
                    </ul>
                    <p className="body mb-4">
                        For registered users of the platform (Contributors and Scouts), we do not carry out automated profiling or make automated decisions about your account standing or access.
                    </p>
                    <p className="body">
                        If we change how automated processing works in a way that affects registered users, we will update this policy and notify you.
                    </p>
                </section>

                {/* ============================================
                    8. YOUR RIGHTS
                ============================================ */}
                <section className="mb-10">
                    <h2 className="mb-4">8. Your rights</h2>
                    <p className="body mb-6">
                        As an EU/EEA resident, you have the following rights under the GDPR. You can exercise any of these rights by submitting a request at{' '}
                        <Link href="/privacy/request" className="text-[var(--teal)] underline hover:text-[var(--teal-dark)]">
                            scout.cofactor.world/privacy/request
                        </Link>{' '}
                        or by emailing{' '}
                        <a href="mailto:privacy@cofactor.world" className="text-[var(--teal)] underline hover:text-[var(--teal-dark)]">
                            privacy@cofactor.world
                        </a>.
                    </p>
                    <ul className="body space-y-4 mb-6">
                        <li>
                            <span className="body-bold">Right of access (Article 15)</span> — you can request a copy of the personal data we hold about you and information about how we process it.
                        </li>
                        <li>
                            <span className="body-bold">Right to rectification (Article 16)</span> — if any data we hold about you is inaccurate or incomplete, you can ask us to correct it.
                        </li>
                        <li>
                            <span className="body-bold">Right to erasure (Article 17)</span> — you can ask us to delete your personal data. We will do so unless we have a legal obligation or overriding legitimate ground to retain it.
                        </li>
                        <li>
                            <span className="body-bold">Right to restriction (Article 18)</span> — you can ask us to pause processing of your data in certain circumstances, for example while you contest its accuracy.
                        </li>
                        <li>
                            <span className="body-bold">Right to data portability (Article 20)</span> — where we process your data on the basis of contract or consent, and by automated means, you can ask us to provide your data in a structured, commonly used, machine-readable format.
                        </li>
                        <li>
                            <span className="body-bold">Right to object (Article 21)</span> — where we process your data on the basis of legitimate interests, you have the right to object at any time on grounds relating to your particular situation. We must stop processing unless we can demonstrate compelling legitimate grounds.
                        </li>
                        <li>
                            <span className="body-bold">Right not to be subject to automated decision-making (Article 22)</span> — you have the right not to be subject to decisions based solely on automated processing that produce legal or similarly significant effects. As described in Section 7, we always apply human review before any such decision is made.
                        </li>
                        <li>
                            <span className="body-bold">Right to withdraw consent</span> — where we rely on consent as our legal basis (marketing emails), you can withdraw consent at any time without affecting the lawfulness of processing before withdrawal.
                        </li>
                    </ul>
                    <p className="body">
                        We will respond to all rights requests within one month of receipt. For complex or multiple requests we may extend this by a further two months — if so, we will notify you within the first month.
                    </p>
                </section>

                {/* ============================================
                    9. RIGHT TO COMPLAIN
                ============================================ */}
                <section className="mb-10">
                    <h2 className="mb-4">9. Right to complain</h2>
                    <p className="body mb-4">
                        If you are unhappy with how we have handled your personal data, you have the right to lodge a complaint with a supervisory authority. You may complain to:
                    </p>
                    <ul className="list-disc ml-6 body space-y-2 mb-4">
                        <li>The data protection authority in the EU member state where you live or work</li>
                        <li>
                            The German Federal Commissioner for Data Protection and Freedom of Information (BfDI), as the authority for our EU Representative&apos;s jurisdiction:{' '}
                            <a
                                href="http://bfdi.bund.de"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--teal)] underline hover:text-[var(--teal-dark)]"
                            >
                                bfdi.bund.de
                            </a>
                        </li>
                    </ul>
                    <p className="body">
                        We would always appreciate the opportunity to address your concerns directly before you contact a supervisory authority — please reach out to{' '}
                        <a href="mailto:privacy@cofactor.world" className="text-[var(--teal)] underline hover:text-[var(--teal-dark)]">
                            privacy@cofactor.world
                        </a>{' '}
                        first if you are comfortable doing so.
                    </p>
                </section>

                {/* ============================================
                    10. DATA SECURITY
                ============================================ */}
                <section className="mb-10">
                    <h2 className="mb-4">10. Data security</h2>
                    <p className="body mb-4">
                        We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, loss, or destruction, including:
                    </p>
                    <ul className="list-disc ml-6 body space-y-2 mb-4">
                        <li>Encryption of all data in transit using TLS 1.3</li>
                        <li>Encryption of all data at rest using AES-256</li>
                        <li>Field-level encryption for sensitive personal data fields</li>
                        <li>Password hashing using bcrypt</li>
                        <li>Role-based access controls with principle of least privilege</li>
                        <li>Comprehensive audit logging of all data access</li>
                        <li>Multi-factor authentication for all internal team members</li>
                        <li>Serverless functions and database hosted within the EU/EEA</li>
                    </ul>
                    <p className="body">
                        In the event of a personal data breach that is likely to result in high risk to your rights and freedoms, we will notify you without undue delay in accordance with GDPR Article 34.
                    </p>
                </section>

                {/* ============================================
                    11. CHILDREN'S DATA
                ============================================ */}
                <section className="mb-10">
                    <h2 className="mb-4">11. Children&apos;s data</h2>
                    <p className="body">
                        Cofactor Scout is intended for use by professionals aged 18 and over. We do not knowingly collect personal data from anyone under the age of 18. If you believe we have inadvertently collected data from a minor, please contact{' '}
                        <a href="mailto:privacy@cofactor.world" className="text-[var(--teal)] underline hover:text-[var(--teal-dark)]">
                            privacy@cofactor.world
                        </a>{' '}
                        and we will delete it promptly.
                    </p>
                </section>

                {/* ============================================
                    12. RESEARCHERS
                ============================================ */}
                <section className="mb-10">
                    <h2 className="mb-4">12. Researchers — data we hold about you without your registration</h2>
                    <p className="body">
                        If you are a researcher whose data we process but who has not created an account on Cofactor Scout, please see our dedicated{' '}
                        <Link href="/privacy/researchers" className="text-[var(--teal)] underline hover:text-[var(--teal-dark)]">
                            Researcher Data Notice
                        </Link>{' '}
                        which explains what data we hold, why, and how to request its removal.
                    </p>
                </section>

                {/* ============================================
                    13. CHANGES TO THIS POLICY
                ============================================ */}
                <section className="mb-10">
                    <h2 className="mb-4">13. Changes to this policy</h2>
                    <p className="body mb-4">
                        We may update this Privacy Policy from time to time. When we make material changes, we will:
                    </p>
                    <ul className="list-disc ml-6 body space-y-2">
                        <li>Update the &ldquo;last updated&rdquo; date at the top of this page</li>
                        <li>Notify registered users by email if the changes materially affect how we process their data</li>
                        <li>Where required by law, seek fresh consent before processing data in a new way</li>
                    </ul>
                </section>

                {/* ============================================
                    14. CONTACT US
                ============================================ */}
                <section className="mb-10">
                    <h2 className="mb-4">14. Contact us</h2>
                    <p className="body mb-2">
                        For any questions, concerns, or rights requests relating to this Privacy Policy:
                    </p>
                    <p className="body mb-1">
                        <span className="body-bold">Email:</span>{' '}
                        <a href="mailto:privacy@cofactor.world" className="text-[var(--teal)] underline hover:text-[var(--teal-dark)]">
                            privacy@cofactor.world
                        </a>
                    </p>
                    <p className="body mb-4">
                        <span className="body-bold">Post:</span> 90 Gold St, San Francisco, CA 94111, United States of America
                    </p>
                    <p className="body">
                        <span className="body-bold">EU Representative:</span> Ahmed Aizi, Friedrichstr 15, Flensburg, 24937, Schleswig Holstein, Germany &mdash;{' '}
                        <a href="mailto:ahmed.aizi@cofactor.world" className="text-[var(--teal)] underline hover:text-[var(--teal-dark)]">
                            ahmed.aizi@cofactor.world
                        </a>
                    </p>
                </section>

            </div>
        </div>
    )
}

import React from 'react';
import { ShieldAlert, FileText, Mail, Info, Zap, WifiOff } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

const ObfuscatedEmail = ({ className }: { className?: string }) => (
    <a
        href="#"
        onClick={(e) => {
            e.preventDefault();
            window.location.href = `mailto:creatorkithub.org` + `@` + `gmail.com`;
        }}
        className={className || "text-blue-400 hover:text-blue-300"}
    >
        creatorkithub.org<span>&#64;</span>gmail.com
    </a>
);

const PageWrapper = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 p-6 md:p-12 font-sans selection:bg-zinc-800">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
            <a href="/" className="self-start mb-8 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                Back to Hub
            </a>

            <div className="w-full bg-zinc-950/50 p-8 md:p-12 rounded-3xl border border-zinc-800 shadow-xl">
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-zinc-800">
                    <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-700">
                        <Icon size={32} className="text-zinc-400" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-zinc-100 tracking-tight">{title}</h1>
                </div>

                <article className="space-y-6 text-zinc-300 max-w-none leading-relaxed">
                    {children}
                </article>
            </div>
        </div>
    </div>
);

export const PrivacyPolicy = () => {
    useSEO({
        title: 'Privacy Policy | Creator Kit Hub',
        description: 'Read the privacy policy for Creator Kit Hub.',
        canonical: '/privacy-policy'
    });
    return (
        <PageWrapper title="Privacy Policy" icon={ShieldAlert}>
            <p className="font-bold text-zinc-400 mb-8">Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

            <p>At Creator Kit Hub ("we," "our," or "us"), available from creatorkithub.local, one of our main priorities is the privacy of our visitors. This Privacy Policy document outlines the types of information collected and recorded by our platform and how we use it.</p>
            <p>If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <ObfuscatedEmail />.</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Information We Collect</h2>
            <p>We collect information to provide better services to our users. This includes:</p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                <li><strong>Log Files:</strong> Like most web tools, we follow a standard procedure of using log files. This includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and number of clicks. These are not linked to any personally identifiable information.</li>
                <li><strong>User-Submitted Data:</strong> We process the files or data you upload to our web tool solely to execute the conversion or download request. All file processing occurs 100% locally on your client machine inside your browser sandbox. Your data is <strong>never uploaded to or stored on any external servers</strong>.</li>
                <li><strong>Cookies and Web Beacons:</strong> We and our third-party partners use cookies to store information about visitors' preferences and to optimize user experiences.</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Google AdSense and Third-Party Advertising</h2>
            <p>We use Google AdSense to serve advertisements on our website.</p>
            <p>Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our site or other sites on the Internet.</p>
            <p>Users may opt out of personalized advertising by visiting Google's Ads Settings or by managing preferences via our on-site consent banner. Our privacy policy does not apply to other advertisers or websites. We advise you to consult the respective Privacy Policies of these third-party ad servers for more detailed information.</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">3. General Data Protection Regulation (GDPR) Compliance</h2>
            <p>If you are a resident of the European Economic Area (EEA) or the United Kingdom (UK), you have specific data protection rights. We act as a "Data Controller" of your information in limited scenarios, and Google AdSense acts as a vendor/controller for ad personalization.</p>
            <p>Under GDPR, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                <li>Access, update, or delete the information we have on you.</li>
                <li>Object to or restrict the processing of your personal data.</li>
                <li>Withdraw your consent at any time through our Consent Management Platform (CMP) banner displayed on our website.</li>
            </ul>
            <p>We do not serve personalized ads to European users unless explicit consent is granted through our Google-certified CMP banner.</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">4. United States State Privacy Laws (CCPA / CPRA)</h2>
            <p>If you reside in the United States (including California, Virginia, Colorado, Connecticut, Utah, and others), you are protected by state-specific privacy acts.</p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                <li><strong>Right to Know and Delete:</strong> You have the right to request that we disclose what personal information we collect and request its deletion.</li>
                <li><strong>Do Not Sell or Share My Personal Info:</strong> We do not directly sell your personal data. However, the use of third-party tracking cookies by Google AdSense for personalized advertising may be considered "selling" or "sharing" under US state laws.</li>
            </ul>
            <p>You can exercise your right to opt out of this sharing by clicking the <button className="text-blue-400 hover:underline font-medium" onClick={(e) => {
                e.preventDefault();
                try {
                    if ((window as any).googlefc && (window as any).googlefc.callbackQueue) {
                        (window as any).googlefc.callbackQueue.push(() => {
                            (window as any).googlefc.showRevocationMessage();
                        });
                    } else {
                        window.dispatchEvent(new Event('show-consent-banner'));
                    }
                } catch (err) {
                    window.dispatchEvent(new Event('show-consent-banner'));
                }
            }}>"Do Not Sell or Share My Personal Information"</button> link located in our website's footer or via our privacy preference center.</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">5. Children's Information</h2>
            <p>We do not knowingly collect any Personal Identifiable Information from children under the age of 13 (or under 16 in the EU). If you think your child provided this kind of information on our website, please contact us immediately, and we will promptly remove it.</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">6. Changes to This Privacy Policy</h2>
            <p>We may update our Privacy Policy from time to time. We advise you to review this page periodically for any changes. Changes are effective immediately after they are posted on this page.</p>

            <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
                <h3 className="text-emerald-400 font-bold mb-2">Absolute Privacy Guarantee</h3>
                <p className="text-zinc-400 text-sm m-0">In addition to the policies above, we guarantee that all major file conversions and transformations run entirely in your local browser memory. Files are never uploaded to our servers.</p>
            </div>
        </PageWrapper>
    );
};

export const TermsOfService = () => {
    useSEO({
        title: 'Terms of Service | Creator Kit Hub',
        description: 'Read the terms of service for Creator Kit Hub.',
        canonical: '/terms-of-service'
    });
    return (
        <PageWrapper title="Terms of Service" icon={FileText}>
            <p className="font-bold text-zinc-400 mb-8">Last Updated: July 14, 2026</p>

            <p>Please read these Terms of Service ("Terms") carefully before using the Creator Kit Hub web application ("Service"). By accessing or using our website, you agree to be bound by these Terms.</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Acceptance and Use of Service</h2>
            <p>Creator Kit Hub provides free-to-use, browser-based tools including Social Media Safe-Zone, LocalPDF Studio, Universal Image Converter, A11y Color Scorecard, PrivaShield EXIF Stripper, CryptoAudit Analyzer, Offline Encryption Vault, Palette Swatch Extractor, Focus & Ledger Tracker, Word Counter & Tone Analyzer, Lorem Context Builder, and SVG Vector Tracer. You agree to use these tools only for lawful purposes.</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Free-of-Charge & "As-Is" Provision</h2>
            <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                <li><strong>No Costs:</strong> All current tools are provided to you completely free of charge.</li>
                <li><strong>Disclaimer of Warranties:</strong> Our tools are provided on an "As-Is" and "As-Available" basis. While we strive to implement high-utility and accurate local scripts (such as file hashing and PDF splitting), Creator Kit Hub makes no absolute guarantees regarding the uninterrupted accuracy, reliability, or completeness of the processed outputs.</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Limitation of Liability</h2>
            <p>Because all file transformations, password checks, and visual operations execute strictly on your own device's hardware and local browser sandbox, Creator Kit Hub, its developers, and affiliates shall not be held liable for any local system slowdowns, data loss, browser crashes, or accidental omissions resulting from the use of our software tools.</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Intellectual Property</h2>
            <p>The visual layout, designs, interface branding, and original source code configurations of Creator Kit Hub are the intellectual property of the website owner. You may not copy, replicate, or redistribute our application framework or branding materials without explicit written permission.</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">5. Third-Party Advertisements</h2>
            <p>This Service displays advertisements managed by Google AdSense. Your interactions with advertisements, third-party promotional links, or external services found through our site are governed solely by the terms and privacy practices of those respective third parties.</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">6. Termination of Access</h2>
            <p>We reserve the right to modify, suspend, or discontinue any aspect of our free tool suite at any time, without prior notice or liability.</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">7. Governing Law</h2>
            <p>These Terms shall be governed and construed in accordance with the laws of your local jurisdiction, without regard to its conflict of law provisions.</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">8. Contact Information</h2>
            <p>For any legal inquiries, reporting of system bugs, or usage questions, please reach out to us at: <ObfuscatedEmail />.</p>
        </PageWrapper>
    );
};

export const ContactUs = () => {
    useSEO({
        title: 'Contact Us | Creator Kit Hub',
        description: 'Get in touch with Creator Kit Hub support.',
        canonical: '/contact-us'
    });
    return (
        <PageWrapper title="Contact Us" icon={Mail}>
            <h2>Get In Touch</h2>
            <p>If you have any questions about our localized data models, feature requests for the Hub, or any standard support inquiries, please reach out.</p>

            <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
                <h3 className="text-zinc-100 font-bold mb-2">Direct Support Channel</h3>
                <ObfuscatedEmail className="text-blue-400 hover:text-blue-300 transition-colors text-lg sm:text-xl font-mono break-all" />
            </div>


        </PageWrapper>
    );
};

export const AboutUs = () => {
    useSEO({
        title: 'About Us | Creator Kit Hub',
        description: 'Learn about the privacy-first web tools available at Creator Kit Hub.',
        canonical: '/about-us'
    });
    return (
        <PageWrapper title="About Creator Kit Hub" icon={Info}>
            <p className="text-xl text-zinc-300 leading-relaxed mb-12">
                Welcome to <strong>Creator Kit Hub</strong> - the ultimate privacy-first workspace built for modern creators, designers, developers, and digital professionals.
            </p>

            <p className="mb-12">
                We believe that optimizing your day-to-day visual assets, PDFs, and digital files shouldn't mean sacrificing your data security. That is why we built a unified suite of high-utility tools that execute 100% inside your local web browser.
            </p>

            <h2 className="flex items-center gap-2 mt-12 mb-8">
                <Zap size={24} className="text-blue-400" />
                Why Choose Creator Kit Hub?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12 not-prose">
                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-4">
                        <ShieldAlert size={24} />
                    </div>
                    <h3 className="text-white font-bold mb-2">Absolute Privacy</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">Your documents, images, and passwords never leave your computer. We have zero backend servers, meaning your files are never uploaded or stored.</p>
                </div>

                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                    <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4">
                        <Zap size={24} />
                    </div>
                    <h3 className="text-white font-bold mb-2">Blazing Fast</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">By leveraging modern browser APIs and local computing power, your files are processed instantly without cloud upload latency or delays.</p>
                </div>

                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                    <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-4">
                        <WifiOff size={24} />
                    </div>
                    <h3 className="text-white font-bold mb-2">Works Offline</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">Once the site loads initially, you can completely disconnect from the internet and every single tool within the suite will continue running seamlessly.</p>
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center mt-12">
                <p className="text-lg text-zinc-300 font-medium m-0">
                    We are dedicated to building free, clean, and ad-supported software utilities that prioritize user data integrity above everything else.
                </p>
            </div>
        </PageWrapper>
    );
};

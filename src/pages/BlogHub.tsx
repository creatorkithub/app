const articles = [
    {
        title: 'Why Tone Analysis is Essential for Effective Digital Communication',
        description: 'Words carry weight, but context dictates meaning. Discover how emotional intelligence in writing and local sentiment analysis can radically alter your professional and personal digital footprints.',
        href: '/blog/tone-analyzer-guide',
        date: 'Sep 12, 2026',
        readTime: '9 min read',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
        ),
        color: 'text-purple-400',
        bg: 'bg-purple-500/10 hover:bg-purple-500/20',
        border: 'border-purple-500/20'
    },
    {
        title: 'The Ultimate Guide to Universal Image Conversion: Preserving Quality and Privacy',
        description: 'Formats like HEIC and WebP rule the modern web, but interoperability still demands a solid image converter. Here is why doing it locally protects your privacy while delivering superior quality.',
        href: '/blog/universal-image-converter-guide',
        date: 'Sep 12, 2026',
        readTime: '9 min read',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-5" /><path d="M9 8V2" /><path d="M15 8V2" /><path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /><path d="M22 22H2l10-10" /></svg>
        ),
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
        border: 'border-emerald-500/20'
    },
    {
        title: 'Mastering Social Media Video Dimensions: A Deep Dive into Safe Zones',
        description: 'Avoid critical editing errors by flawlessly designing within UI and comment overlay safe zones for TikTok, Reels, and Shorts.',
        href: '/blog/safe-zone-guide',
        date: 'Sep 11, 2026',
        readTime: '9 min read',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
        ),
        color: 'text-orange-400',
        bg: 'bg-orange-500/10 hover:bg-orange-500/20',
        border: 'border-orange-500/20'
    },
    {
        title: 'Password Security in 2026: Why Local Auditing is the Future',
        description: 'Test and audit your master passwords locally with true cryptographic entropy analysis directly inside your secure browser.',
        href: '/blog/crypto-audit-guide',
        date: 'Sep 11, 2026',
        readTime: '9 min read',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
        ),
        color: 'text-purple-400',
        bg: 'bg-purple-500/10 hover:bg-purple-500/20',
        border: 'border-purple-500/20'
    },
    {
        title: 'The Hidden Threat in Your Photos: A Complete Guide to EXIF Data Stripping',
        description: 'Understand how EXIF location tags leak your exact GPS coordinates and how to securely scrub them 100% locally offline.',
        href: '/blog/privashield-guide',
        date: 'Sep 11, 2026',
        readTime: '10 min read',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
        ),
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
        border: 'border-indigo-500/20'
    },
    {
        title: 'The Complete Guide to Web Accessibility and Color Contrast',
        description: 'Ensure every user can smoothly navigate your content by adhering to high contrast design guidelines and verifiable color accessibility.',
        href: '/blog/a11y-scorecard-guide',
        date: 'Sep 11, 2026',
        readTime: '9 min read',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m14.31 8 5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16 3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94" /></svg>
        ),
        color: 'text-rose-400',
        bg: 'bg-rose-500/10 hover:bg-rose-500/20',
        border: 'border-rose-500/20'
    },
    {
        title: 'From Raster to Vector: The Power of SVG Tracing in Modern Web Design',
        description: 'Scalability is the pillar of digital responsiveness. Discover how leveraging offline SVG tracing natively upgrades your rasterized images into infinitely scalable mathematical vectors.',
        href: '/blog/svg-tracing-techniques',
        date: 'Sep 9, 2026',
        readTime: '9 min read',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l7.586 7.586" /><circle cx="11" cy="11" r="2" /></svg>
        ),
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
        border: 'border-emerald-500/20'
    },
    {
        title: 'Data Privacy in the Digital Age: Understanding Client-Side Text Encryption',
        description: 'Sending passwords or API keys over instant messaging apps is incredibly risky. Learn how zero-knowledge client-side encryption safely bridges the communication gap.',
        href: '/blog/text-encryption-privacy',
        date: 'Sep 9, 2026',
        readTime: '9 min read',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
        ),
        color: 'text-rose-400',
        bg: 'bg-rose-500/10 hover:bg-rose-500/20',
        border: 'border-rose-500/20'
    },
    {
        title: 'Color Extraction Magic: Building Harmonious Palettes directly from Images',
        description: 'Designing a beautiful UI often starts with a solitary piece of inspiration photography. Learn how to algorithmically extract dominant and harmonious hex codes.',
        href: '/blog/color-theory-web-design',
        date: 'Sep 9, 2026',
        readTime: '9 min read',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a9.971 9.971 0 0 0 6.643-2.5l-1.393-2.41a9.971 9.971 0 0 1-5.25.91" /><path d="M21 16.5a9.971 9.971 0 0 0 .91-5.25l-2.41 1.393a9.971 9.971 0 0 1-2.5 6.643" /><path d="M18.643 5.357a9.971 9.971 0 0 0-6.643-2.5l1.393 2.41A9.971 9.971 0 0 1 18.643 4.357" /><path d="M11.5 2a9.971 9.971 0 0 0-5.25.91l2.41 1.393a9.971 9.971 0 0 1 6.643 2.5" /><path d="M5.357 5.357a9.971 9.971 0 0 0-2.5 6.643l2.41-1.393a9.971 9.971 0 0 1 .91-5.25" /><path d="M2.91 11.5a9.971 9.971 0 0 0 .91 5.25l1.393-2.41a9.971 9.971 0 0 1 2.5-6.643" /><circle cx="12" cy="12" r="9" /></svg>
        ),
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
        border: 'border-indigo-500/20'
    },
    {
        title: 'The Art of Lorem Ipsum: How to Use Mock Text for Better UI Design Prototyping',
        description: 'Using real copy during early layout phases heavily biases spatial assessment. Discover why utilizing robust offline dummy text generators deeply enhances structural wireframing.',
        href: '/blog/mastering-typography',
        date: 'Sep 9, 2026',
        readTime: '9 min read',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" /></svg>
        ),
        color: 'text-blue-400',
        bg: 'bg-blue-500/10 hover:bg-blue-500/20',
        border: 'border-blue-500/20'
    },
    {
        title: 'Mastering Digital Productivity with Stickynotes on Windows',
        description: 'In an age of endless digital distraction, simple offline tools like screen stickynotes are the key to true focus. Discover how integrating minimalist tools can radically improve your daily desktop workflow.',
        href: '/blog/mastering-productivity',
        date: 'Sep 8, 2026',
        readTime: '7 min read',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" /></svg>
        ),
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
        border: 'border-emerald-500/20'
    },
    {
        title: 'The Comprehensive Guide to CreatorKitHub Tools',
        description: 'Our ultimate guide to maximizing your offline, client-side digital workflows. Explore how each tool inside the Hub is engineered to guarantee 100% privacy while radically speeding up productivity.',
        href: '/blog/creator-kit-guide',
        date: 'Sep 8, 2026',
        readTime: '8 min read',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m20.66 7-8.91 5.96a2 2 0 0 1-2.24 0L.59 7" /><path d="M21 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7" /></svg>
        ),
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
        border: 'border-indigo-500/20'
    },
    {
        title: 'Why Offline Client-Side Web Tools Matter for Privacy',
        description: 'Discover how strictly processing your data inside the browser guarantees absolute privacy and security compared to cloud-based solutions.',
        href: '/blog/why-offline-tools-matter',
        date: 'Sep 7, 2026',
        readTime: '6 min read',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
        ),
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
        border: 'border-indigo-500/20'
    },
    {
        title: 'The Ultimate Guide to PDF Security and Metadata Scrubbing',
        description: 'Learn the hidden dangers within your PDFs. We explore the critical importance of digital hygiene, watermark stamping, and complete metadata sanitation limit.',
        href: '/blog/pdf-security-best-practices',
        date: 'Sep 7, 2026',
        readTime: '5 min read',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M12 18v-6" /><path d="m9 15 3 3 3-3" /></svg>
        ),
        color: 'text-rose-400',
        bg: 'bg-rose-500/10 hover:bg-rose-500/20',
        border: 'border-rose-500/20'
    }
];

import { useState } from 'react';

export default function BlogHub({ onNavigate }: { onNavigate: (path: string) => void }) {
    const [currentPage, setCurrentPage] = useState(1);
    const blogsPerPage = 10;
    const totalPages = Math.ceil(articles.length / blogsPerPage);
    const indexOfLastBlog = currentPage * blogsPerPage;
    const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
    const currentBlogs = articles.slice(indexOfFirstBlog, indexOfLastBlog);

    return (
        <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-8 font-sans selection:bg-zinc-500/30 overflow-y-auto w-full">
            <div className="max-w-5xl mx-auto h-full flex flex-col pt-8">
                <header className="mb-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500 mb-4 tracking-tight pb-2">
                            Creator Kit Hub Blog
                        </h1>
                        <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
                            Deep dives, security insights, and comprehensive guides curated to elevate your digital workflows and maximize offline efficiency.
                        </p>
                    </div>
                    <button
                        onClick={() => onNavigate('/')}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all font-medium whitespace-nowrap"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                        Back to Hub
                    </button>
                </header>

                <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentBlogs.map((article, i) => (
                        <article
                            key={i}
                            className="group cursor-pointer rounded-2xl bg-[#18181b] border border-zinc-800 hover:border-zinc-700 hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 overflow-hidden flex flex-col h-full relative"
                            onClick={(e) => {
                                e.preventDefault();
                                onNavigate(article.href);
                            }}
                        >
                            <div className="p-8 flex-1 flex flex-col">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 border ${article.bg} ${article.color} ${article.border} transition-colors`}>
                                    {article.icon}
                                </div>
                                <h2 className="text-2xl font-bold text-zinc-100 mb-4 leading-tight group-hover:text-blue-400 transition-colors">
                                    {article.title}
                                </h2>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-8 flex-1">
                                    {article.description}
                                </p>
                                <div className="flex items-center justify-between text-xs font-medium text-zinc-500 uppercase tracking-widest mt-auto border-t border-zinc-800 pt-6">
                                    <span>{article.date}</span>
                                    <span className="flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                                        {article.readTime}
                                    </span>
                                </div>
                            </div>
                            <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/10 rounded-2xl pointer-events-none transition-colors"></div>
                        </article>
                    ))}
                </main>

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-12 pb-8">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-6 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 transition-all font-medium flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            Previous
                        </button>
                        <span className="text-zinc-500 font-medium tracking-wide text-sm flex-shrink-0">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-6 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 transition-all font-medium flex items-center gap-2"
                        >
                            Next
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

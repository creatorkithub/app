import { Monitor, Layers, Wand2, FileText, Lock, Palette, Timer, Type, FileCode } from 'lucide-react';
import { useRef, useState, type MouseEvent, useEffect } from 'react';
import { useSEO } from '../hooks/useSEO';

function HubCard({ t, isActive, themeColor, onSelectTool, href }: any) {
    const cardRef = useRef<HTMLElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <article
            ref={cardRef}
            key={t.id}
            onMouseMove={handleMouseMove}
            className="h-full flex relative group rounded-2xl overflow-hidden"
        >
            {/* The interactive localized cursor spotlight */}
            <div
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10"
                style={{
                    background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.06), transparent 40%)`
                }}
            />
            {/* Soft border spotlight */}
            <div
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 mix-blend-overlay z-10"
                style={{
                    background: `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.4), transparent 40%)`
                }}
            />

            <a
                href={href}
                onClick={(e) => {
                    if (isActive) {
                        e.preventDefault();
                        onSelectTool(t.id);
                    } else {
                        e.preventDefault();
                    }
                }}
                className={`relative z-20 w-full text-left p-6 rounded-2xl border transition-all duration-300 block bg-zinc-950/40 backdrop-blur-sm ${isActive ? `border-zinc-800 focus:border-zinc-700 md:border-zinc-800/80 hover:border-zinc-700 hover:shadow-2xl hover:shadow-${themeColor}-500/5 cursor-pointer` : 'border-zinc-800 focus:border-zinc-700 md:border-zinc-800/50 cursor-not-allowed opacity-60'}`}
                aria-label={`Open ${t.title}`}
                title={isActive ? `Open ${t.title}` : 'Coming soon'}
            >
                <div className={`p-4 rounded-xl bg-zinc-900/60 inline-block mb-6 shadow-inner ${t.color}`}>
                    <t.icon size={28} className={isActive ? 'group-hover:scale-110 transition-transform' : ''} aria-hidden="true" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-zinc-100 mb-3 group-hover:text-white transition-colors">{t.title}</h2>
                <p className="text-sm text-zinc-400 leading-relaxed min-h-[60px] group-hover:text-zinc-300 transition-colors">
                    {t.description}
                </p>

                {!isActive && (
                    <div className="mt-8 inline-flex items-center text-[10px] font-semibold uppercase tracking-wider text-zinc-500 bg-zinc-900/80 px-3 py-1.5 rounded-full border border-zinc-800">
                        Coming Soon
                    </div>
                )}
            </a>
        </article>
    );
}

export default function Hub({ onSelectTool }: { onSelectTool: (toolId: string) => void }) {
    const tools = [
        {
            id: 'safe-zone',
            title: 'Social Media Safe-Zone',
            description: 'Visual layout optimizer & safe-zone compositor for IG, TikTok, YouTube & Ads.',
            icon: Monitor,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/50'
        },
        {
            id: 'local-pdf',
            title: 'LocalPDF Studio',
            description: 'Process, convert, split, merge, and modify PDFs 100% inside your browser.',
            icon: FileText,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10 border-orange-500/20 hover:border-orange-500/50'
        },
        {
            id: 'image-converter',
            title: 'Universal Image Converter',
            description: 'Convert HEIC, PSD, TIFF, and standard images to any format entirely client-side.',
            icon: Layers,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/50'
        },
        {
            id: 'a11y-scorecard',
            title: 'A11y Color Scorecard',
            description: 'Evaluate color contrast ratios strictly against automated WCAG AA & AAA frameworks.',
            icon: Wand2,
            color: 'text-rose-400',
            bg: 'bg-rose-500/10 border-rose-500/20 hover:border-rose-500/50'
        },
        {
            id: 'privashield',
            title: 'PrivaShield EXIF Stripper',
            description: 'Deep audit and losslessly destroy embedded GPS & camera metadata traces locally.',
            icon: Wand2,
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/50'
        },
        {
            id: 'crypto-audit',
            title: 'CryptoAudit Analyzer',
            description: 'Zxcvbn-powered offline password evaluator & gigabyte chunked file integrity hasher.',
            icon: Wand2,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10 border-purple-500/20 hover:border-purple-500/50'
        },
        {
            id: 'text-encryption',
            title: 'Offline Encryption Vault',
            description: 'AES-256 client-side encryption for secure local text and password hashing.',
            icon: Lock,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10 border-orange-500/20 hover:border-orange-500/50'
        },
        {
            id: 'palette-extractor',
            title: 'Palette Swatch Extractor',
            description: 'Locally detect dominant K-means clusters from images for UI design usage.',
            icon: Palette,
            color: 'text-pink-400',
            bg: 'bg-pink-500/10 border-pink-500/20 hover:border-pink-500/50'
        },
        {
            id: 'pomodoro-tracker',
            title: 'Focus & Ledger Tracker',
            description: 'Track deep-work sessions securely within browser storage via a local Pomodoro ledger.',
            icon: Timer,
            color: 'text-rose-400',
            bg: 'bg-rose-500/10 border-rose-500/20 hover:border-rose-500/50'
        },
        {
            id: 'tone-analyzer',
            title: 'Word Counter & Tone',
            description: 'Process drafts locally for sentence density, Coleman-Liau reading age, and emotion.',
            icon: Type,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-500/50'
        },
        {
            id: 'lorem-builder',
            title: 'Lorem Context Builder',
            description: 'Generate dynamic dummy paragraphs embedded with Tech, Legal, or Medical vocabulary.',
            icon: FileCode,
            color: 'text-fuchsia-400',
            bg: 'bg-fuchsia-500/10 border-fuchsia-500/20 hover:border-fuchsia-500/50'
        },
        {
            id: 'svg-tracer',
            title: 'SVG Vector Tracer',
            description: 'Trace raw pixels into fully scalable, infinitely sharp SVG vectors using threshold mapping.',
            icon: Layers,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10 border-purple-500/20 hover:border-purple-500/50'
        }
    ];

    useSEO(
        'Creator Kit Hub - Client-Side App Suite',
        'A free, 100% offline suite of web tools for creators - process PDFs, convert images, and more.',
        '/'
    );

    useEffect(() => {
        // Inject JSON-LD Structured Data for the hub
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Creator Kit Hub",
            "url": "https://creatorkithub.org",
            "description": "Privacy-first, universally client-side creator tools including PDF Studio, Image Converter, and Social Media Safe Zones.",
            "applicationCategory": "BrowserApplication",
            "operatingSystem": "All",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            }
        };

        let script = document.querySelector('#json-ld-hub');
        if (!script) {
            script = document.createElement('script');
            script.id = 'json-ld-hub';
            script.setAttribute('type', 'application/ld+json');
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(structuredData);

        return () => {
            if (script && script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    return (
        <main className="min-h-screen bg-[#09090b] text-white p-8 font-sans selection:bg-blue-500/30 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-12">

                <header className="space-y-4 pt-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        Creator Studio
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-500 bg-clip-text text-transparent">
                        Creator Kit Hub
                    </h1>
                    <p className="text-zinc-400 text-lg md:text-xl max-w-2xl leading-relaxed">
                        Creator Kit Hub offers a comprehensive, completely free, and 100% offline suite of web tools tailored for modern creators. Securely process PDFs, convert high-resolution images, generate precise social media safe zones, and much more-all localized directly in your browser.
                    </p>
                </header>

                <nav aria-label="Available Tool Suites">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                        {tools.map(t => {
                            const isActive = true; // All 13 tools are now active
                            const themeColor = t.id === 'safe-zone' ? 'blue' :
                                t.id === 'image-converter' ? 'emerald' :
                                    t.id === 'a11y-scorecard' ? 'rose' :
                                        t.id === 'privashield' ? 'indigo' :
                                            t.id === 'crypto-audit' ? 'purple' :
                                                t.id === 'palette-extractor' ? 'pink' :
                                                    t.id === 'pomodoro-tracker' ? 'rose' :
                                                        t.id === 'tone-analyzer' ? 'cyan' :
                                                            t.id === 'lorem-builder' ? 'fuchsia' :
                                                                t.id === 'svg-tracer' ? 'purple' : 'orange';

                            const href = t.id === 'local-pdf' ? '/pdf-toolkit' :
                                t.id === 'safe-zone' ? '/social-media-safe-zone-overlay' :
                                    t.id === 'image-converter' ? '/universal-image-converter' :
                                        t.id === 'a11y-scorecard' ? '/a11y-scorecard' :
                                            t.id === 'privashield' ? '/privashield' :
                                                t.id === 'crypto-audit' ? '/crypto-audit' :
                                                    t.id === 'text-encryption' ? '/text-encryption' :
                                                        t.id === 'palette-extractor' ? '/palette-extractor' :
                                                            t.id === 'pomodoro-tracker' ? '/pomodoro-tracker' :
                                                                t.id === 'tone-analyzer' ? '/tone-analyzer' :
                                                                    t.id === 'lorem-builder' ? '/lorem-builder' :
                                                                        t.id === 'svg-tracer' ? '/svg-tracer' : '#';

                            return (
                                <HubCard
                                    key={t.id}
                                    t={t}
                                    isActive={isActive}
                                    themeColor={themeColor}
                                    href={href}
                                    onSelectTool={onSelectTool}
                                />
                            );
                        })}
                    </div>
                </nav>

                <section className="pt-8 pb-12 mt-12 mb-8 border-t border-zinc-800/60">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-100 mb-4 tracking-tight">Why Choose Creator Kit Hub?</h2>
                        <p className="text-zinc-400 text-lg leading-relaxed max-w-4xl mx-auto">
                            Creator Kit Hub is meticulously engineered to provide an unparalleled suite of <strong className="text-zinc-200">client-side web tools</strong> for digital creators, developers, and designers.
                            Unlike traditional online utilities that mandate uploading your sensitive files to external servers, our platform operates 100% offline directly within your browser.
                            This ensures absolute privacy, instantaneous processing speeds, and zero reliance on internet connectivity.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 hover:bg-zinc-900/60 transition-all duration-300">
                            <h3 className="text-zinc-100 font-bold mb-3 text-lg">Uncompromising Privacy</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">Every tool, from the LocalPDF Studio to the Universal Image Converter, executes natively in your browser using modern WebAssembly and JavaScript APIs. Your data never leaves your device.</p>
                        </div>
                        <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 hover:bg-zinc-900/60 transition-all duration-300">
                            <h3 className="text-zinc-100 font-bold mb-3 text-lg">Lightning Fast Performance</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">By eliminating server round-trips, processing latency is virtually zero. Convert heavy images, split massive PDFs, and calculate accessibility ratios instantly without waiting for network transfers.</p>
                        </div>
                        <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 hover:bg-zinc-900/60 transition-all duration-300">
                            <h3 className="text-zinc-100 font-bold mb-3 text-lg">100% Offline Capability</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">Once loaded, Creator Kit Hub functions entirely without an internet connection. Our Progressive Web App (PWA) architecture ensures your workflow remains uninterrupted anywhere, anytime.</p>
                        </div>
                    </div>
                </section>


            </div>
        </main>
    );
}

import React, { useState } from 'react';
import { Menu, X, Monitor, FileText, Layers, Wand2, Lock, Palette, Timer, Type, FileCode } from 'lucide-react';

export const Navbar = ({ navigate }: { navigate: (path: string) => void }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);

    const tools = [
        { id: '/social-media-safe-zone-overlay', title: 'Social Media Safe-Zone', icon: Monitor },
        { id: '/pdf-toolkit', title: 'LocalPDF Studio', icon: FileText },
        { id: '/universal-image-converter', title: 'Universal Image Converter', icon: Layers },
        { id: '/a11y-scorecard', title: 'A11y Color Scorecard', icon: Wand2 },
        { id: '/privashield', title: 'PrivaShield EXIF Stripper', icon: Wand2 },
        { id: '/crypto-audit', title: 'CryptoAudit Analyzer', icon: Wand2 },
        { id: '/text-encryption', title: 'Offline Encryption Vault', icon: Lock },
        { id: '/palette-extractor', title: 'Palette Swatch Extractor', icon: Palette },
        { id: '/pomodoro-tracker', title: 'Focus & Ledger Tracker', icon: Timer },
        { id: '/tone-analyzer', title: 'Word Counter & Tone', icon: Type },
        { id: '/lorem-builder', title: 'Lorem Context Builder', icon: FileCode },
        { id: '/svg-tracer', title: 'SVG Vector Tracer', icon: Layers }
    ];

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/about-us', label: 'About' },
        { path: '/contact-us', label: 'Contact' },
        { path: '/privacy-policy', label: 'Privacy' },
    ];

    const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
        e.preventDefault();
        navigate(path);
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="w-full bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800/80 sticky top-0 z-[100]">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo/Brand */}
                    <a href="/" onClick={(e) => handleNavigate(e, '/')} className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        </div>
                        <span className="font-bold text-zinc-100 tracking-tight group-hover:text-white transition-colors">Creator Kit Hub</span>
                    </a>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        <a href="/" onClick={(e) => handleNavigate(e, '/')} className="px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/50">Home</a>

                        {/* Tools Dropdown */}
                        <div className="relative group/dropdown">
                            <button
                                className="px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/50 flex items-center gap-1"
                            >
                                Top Tools
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><path d="m6 9 6 6 6-6" /></svg>
                            </button>
                            <div className="absolute top-full left-0 mt-1 w-64 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-200 transform origin-top-left scale-95 group-hover/dropdown:scale-100">
                                <div className="bg-[#18181b]/95 backdrop-blur-2xl border border-zinc-800 rounded-xl p-2 shadow-2xl flex flex-col gap-1 max-h-[75vh] overflow-y-auto custom-scrollbar">
                                    {tools.map(t => (
                                        <a
                                            key={t.id}
                                            href={t.id}
                                            onClick={(e) => handleNavigate(e, t.id)}
                                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:bg-zinc-800/80 hover:text-white transition-colors"
                                        >
                                            <t.icon size={16} className="text-zinc-500" />
                                            {t.title}
                                        </a>
                                    ))}
                                    <div className="border-t border-zinc-800/60 my-1"></div>
                                    <a href="/" onClick={(e) => handleNavigate(e, '/')} className="px-3 py-2 text-xs font-semibold text-blue-400 hover:bg-blue-500/10 rounded-lg text-center transition-colors">
                                        View All Tools &rarr;
                                    </a>
                                </div>
                            </div>
                        </div>

                        <a href="/about-us" onClick={(e) => handleNavigate(e, '/about-us')} className="px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/50">About</a>
                        <a href="/contact-us" onClick={(e) => handleNavigate(e, '/contact-us')} className="px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/50">Contact</a>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl transition-colors"
                            aria-label="Toggle Menu"
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            <div className={`md:hidden absolute top-full left-0 w-full transition-all duration-300 ${isMobileMenuOpen ? 'max-h-[85vh] overflow-y-auto custom-scrollbar border-b border-zinc-800 shadow-2xl opacity-100' : 'max-h-0 overflow-hidden opacity-0'}`}>
                <div className="bg-[#09090b]/95 backdrop-blur-2xl px-4 py-4 flex flex-col gap-2 relative">
                    {navLinks.map(link => (
                        <a
                            key={link.path}
                            href={link.path}
                            onClick={(e) => handleNavigate(e, link.path)}
                            className="block px-4 py-3 rounded-xl text-sm font-bold text-zinc-300 hover:text-white hover:bg-zinc-800/50 border border-transparent transition-colors"
                        >
                            {link.label}
                        </a>
                    ))}
                    <div className="mt-2 pt-2 border-t border-zinc-800">
                        <button
                            onClick={() => setIsMobileToolsOpen(!isMobileToolsOpen)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
                        >
                            <span>Top Tools</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isMobileToolsOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
                        </button>

                        <div className={`overflow-hidden transition-all duration-300 ${isMobileToolsOpen ? 'max-h-[1000px] mt-2' : 'max-h-0'}`}>
                            {tools.map(t => (
                                <a
                                    key={t.id}
                                    href={t.id}
                                    onClick={(e) => handleNavigate(e, t.id)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/30 transition-colors ml-2"
                                >
                                    <t.icon size={16} />
                                    {t.title}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

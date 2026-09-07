import { useState, useEffect } from 'react';
import { FileText, Wand2, Layers, Lock, Palette, Timer, Type, Monitor } from 'lucide-react';

const ALL_TOOLS = [
    {
        path: '/pdf-toolkit',
        title: 'Client-Side PDF Studio',
        desc: 'Merge, split, watermark, and manipulate your sensitive PDFs directly in-browser. No uploads required.',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        hoverBorder: 'hover:border-blue-500/40',
        icon: FileText
    },
    {
        path: '/privashield',
        title: 'PrivaShield Extractor',
        desc: 'Instantly strip out hidden EXIF metadata and GPS locations from your photos before sharing them online.',
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/20',
        hoverBorder: 'hover:border-indigo-500/40',
        icon: Wand2
    },
    {
        path: '/image-converter',
        title: 'Universal Image Converter',
        desc: 'Convert massive WebP, JPG, or PNG files instantly. Zero external processing and absolutely no data caps.',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        hoverBorder: 'hover:border-emerald-500/40',
        icon: Layers
    },
    {
        path: '/text-encryption',
        title: 'Offline Encryption Vault',
        desc: 'Encrypt and decrypt sensitive text messages using military-grade AES encryption entirely offline.',
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
        hoverBorder: 'hover:border-orange-500/40',
        icon: Lock
    },
    {
        path: '/palette-extractor',
        title: 'Palette Swatch Extractor',
        desc: 'Automatically extract harmonious color palettes from your uploaded images using local browser processing.',
        color: 'text-pink-400',
        bg: 'bg-pink-500/10',
        border: 'border-pink-500/20',
        hoverBorder: 'hover:border-pink-500/40',
        icon: Palette
    },
    {
        path: '/pomodoro-tracker',
        title: 'Focus & Ledger Tracker',
        desc: 'Boost your productivity with an offline Pomodoro timer. Focus blocks, quick breaks, zero distractions.',
        color: 'text-violet-400',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/20',
        hoverBorder: 'hover:border-violet-500/40',
        icon: Timer
    },
    {
        path: '/tone-analyzer',
        title: 'Word Counter & Tone',
        desc: 'Count words, characters, and analyze the tone of your text passages directly in your web browser.',
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        hoverBorder: 'hover:border-cyan-500/40',
        icon: Type
    },
    {
        path: '/social-media-safe-zone-overlay',
        title: 'Safe-Zone Overlay',
        desc: 'Preview your videos with TikTok, Reels, and Shorts UI overlays to ensure your content is never blocked.',
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
        hoverBorder: 'hover:border-rose-500/40',
        icon: Monitor
    }
];

export const BlogSidebar = ({ onNavigate }: { onNavigate: (path: string) => void }) => {
    const [tools, setTools] = useState<typeof ALL_TOOLS>([]);

    useEffect(() => {
        // Randomize array and pick 3 tools on mount
        const shuffled = [...ALL_TOOLS].sort(() => 0.5 - Math.random());
        setTools(shuffled.slice(0, 3));
    }, []);

    return (
        <aside className="w-full lg:w-[340px] flex-shrink-0 flex flex-col gap-6 lg:sticky lg:top-8 self-start pt-12 lg:pt-0">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 flex items-center gap-2">
                <svg className="text-emerald-500" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Try Free Offline Tools
            </h3>

            {tools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                    <div
                        key={index}
                        onClick={() => onNavigate(tool.path)}
                        className={`group cursor-pointer bg-[#141416] p-5 rounded-2xl border border-zinc-800 ${tool.hoverBorder} hover:bg-[#18181b] transition-all flex flex-col`}
                    >
                        <div className={`w-10 h-10 rounded-lg ${tool.bg} ${tool.border} ${tool.color} flex items-center justify-center mb-4`}>
                            <Icon size={20} strokeWidth={2.5} />
                        </div>
                        <h4 className={`text-zinc-100 font-bold mb-2 group-hover:${tool.color} transition-colors`}>{tool.title}</h4>
                        <p className="text-zinc-400 text-sm leading-relaxed">{tool.desc}</p>
                    </div>
                );
            })}
        </aside>
    );
};

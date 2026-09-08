import { useState } from 'react';

const allArticles = [
    {
        title: 'The Comprehensive Guide to CreatorKitHub Tools',
        href: '/blog/creator-kit-guide',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m20.66 7-8.91 5.96a2 2 0 0 1-2.24 0L.59 7" /><path d="M21 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7" /></svg>
        ),
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
        border: 'border-indigo-500/20'
    },
    {
        title: 'Mastering Digital Productivity with Stickynotes on Windows',
        href: '/blog/mastering-productivity',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" /></svg>
        ),
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
        border: 'border-emerald-500/20'
    },
    {
        title: 'The Ultimate Guide to PDF Security and Metadata Scrubbing',
        href: '/blog/pdf-security-best-practices',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M12 18v-6" /><path d="m9 15 3 3 3-3" /></svg>
        ),
        color: 'text-rose-400',
        bg: 'bg-rose-500/10 hover:bg-rose-500/20',
        border: 'border-rose-500/20'
    },
    {
        title: 'Why Offline Client-Side Web Tools Matter for Privacy',
        href: '/blog/why-offline-tools-matter',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
        ),
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
        border: 'border-indigo-500/20'
    }
];

export function BlogFooter({ tags, currentPath, onNavigate }: { tags: string[], currentPath: string, onNavigate: (path: string) => void }) {
    const [reaction, setReaction] = useState<string | null>(null);

    const recommended = allArticles.filter(a => a.href !== currentPath).slice(0, 2);

    return (
        <div className="mt-16 pt-10 border-t border-zinc-800 flex flex-col gap-10">
            {/* Tags Section */}
            <div>
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <span key={tag} className="px-4 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-xs font-semibold text-zinc-300">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Reactions */}
            <div>
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">What did you think?</h3>
                <div className="flex flex-wrap gap-3">
                    {['👍 Helpful', '💡 Insightful', '🤯 Mindblown'].map((r) => (
                        <button
                            key={r}
                            onClick={() => setReaction(r)}
                            className={`px-5 py-2.5 rounded-xl border font-bold text-sm transition-all flex border-zinc-800
                                ${reaction === r ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-[#18181b] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Up Next */}
            <div>
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Read Next</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {recommended.map((article, i) => (
                        <div
                            key={i}
                            onClick={() => onNavigate(article.href)}
                            className="group cursor-pointer rounded-2xl bg-[#18181b] border border-zinc-800 hover:border-zinc-700 hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 p-5 flex items-start gap-4 relative overflow-hidden"
                        >
                            <div className={`w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center border ${article.bg} ${article.color} ${article.border}`}>
                                {article.icon}
                            </div>
                            <div className="flex flex-col">
                                <h4 className="text-sm font-bold text-zinc-100 group-hover:text-blue-400 transition-colors leading-snug">
                                    {article.title}
                                </h4>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

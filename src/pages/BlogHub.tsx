

const articles = [
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

export default function BlogHub({ onNavigate }: { onNavigate: (path: string) => void }) {
    return (
        <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-8 font-sans selection:bg-zinc-500/30 overflow-y-auto w-full">
            <div className="max-w-5xl mx-auto h-full flex flex-col pt-8">
                <header className="mb-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500 mb-4 tracking-tight">
                            Creator Kit Blog
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
                    {articles.map((article, i) => (
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
            </div>
        </div>
    );
}

export function AuthorBio() {
    return (
        <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-2xl mt-12 w-full">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shrink-0 border-2 border-indigo-500/30">
                <img
                    // Because CreatorKitHub emphasizes privacy and no tracking, a local avatar or a default gradient can be used. 
                    // Assuming no avatar was provided, using a stylish default or initials:
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%236366f1' /%3E%3Cstop offset='100%25' stop-color='%23a855f7' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23g)'/%3E%3Ctext x='50' y='53' font-family='sans-serif' font-size='42' font-weight='bold' fill='%23ffffff' text-anchor='middle' dominant-baseline='middle'%3EBN%3C/text%3E%3C/svg%3E"
                    alt="Balachandar Nadar Avatar"
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-zinc-100 mb-2">About the Author</h3>
                <p className="text-[#a1a1aa] leading-relaxed mb-4">
                    <strong className="text-zinc-200 font-semibold">Balachandar Nadar</strong> is the developer behind CreatorKitHub. They specialize in building privacy-first, zero-login utility apps designed to escape cloud fatigue and return control of data back to the user's local machine.
                </p>
                <div className="flex items-center gap-4">
                    <a
                        href="https://www.linkedin.com/in/balachandar-nadar"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                        aria-label="Balachandar Nadar on LinkedIn"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                        Connect on LinkedIn
                    </a>
                </div>
            </div>
        </div>
    );
}

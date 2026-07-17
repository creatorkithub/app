import React from 'react';

export const Footer = () => {
    return (
        <footer className="w-full bg-[#09090b] border-t border-zinc-800/50 py-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col items-center md:items-start text-zinc-500 text-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            <span className="font-bold text-zinc-300">Creator Kit Hub</span>
                        </div>
                        <p>© {new Date().getFullYear()} Creator Kit Hub. All rights reserved.</p>
                        <p className="mt-1 text-xs px-2 py-0.5 bg-zinc-900 rounded-lg border border-zinc-800">100% Client-Side Processing • No Cloud Servers</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-2 text-sm font-medium text-zinc-400">
                        <a href="/about-us" className="hover:text-zinc-200 transition-colors">About</a>
                        <a href="/privacy-policy" className="hover:text-zinc-200 transition-colors">Privacy Policy</a>
                        <a href="/terms-of-service" className="hover:text-zinc-200 transition-colors">Terms of Service</a>
                        <a href="/contact-us" className="hover:text-zinc-200 transition-colors">Contact</a>
                        <button
                            className="google-privacy-options hover:text-zinc-200 transition-colors text-xs opacity-80 border-t border-zinc-800 md:border-none pt-2 md:pt-0 w-full md:w-auto text-center md:text-left mt-2 md:mt-0"
                            onClick={(e) => {
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
                            }}
                        >
                            Do Not Sell or Share My Personal Information
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

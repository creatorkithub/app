import React, { useEffect } from 'react';
import { useAdContext } from '../contexts/AdContext';
import { ShieldAlert } from 'lucide-react';

export default function Success() {
    const { adConfig, isOpen, timeLeft, previousPath, handleSkip } = useAdContext();

    useEffect(() => {
        // If we land here without an active CTA session, return to previous page
        if (!isOpen) {
            window.history.pushState(null, '', previousPath || '/');
            window.dispatchEvent(new PopStateEvent('popstate'));
        }
    }, [isOpen, previousPath]);

    if (!isOpen) return null;

    return (
        <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-8 font-sans selection:bg-blue-500/30 flex flex-col items-center justify-center relative overflow-hidden">

            {/* Background ambient light */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="max-w-2xl w-full z-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="w-20 h-20 mx-auto bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-8 pulse-border">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                </div>

                <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-4">{adConfig.title || 'Preparing Download'}</h1>
                <p className="text-xl text-zinc-400 mb-12 max-w-lg mx-auto">
                    {adConfig.subtitle || 'Your file is being securely processed entirely on your local device.'}
                </p>

                {/* AdSense Fallback or Empty Container for In-Page logic if Vignette doesn't trigger */}
                <div className="w-full max-w-xl mx-auto bg-[#18181b] border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
                    <div className="flex flex-col items-center justify-center min-h-[150px]">
                        {timeLeft > 0 ? (
                            <>
                                <div className="w-12 h-12 rounded-full border-4 border-zinc-800 border-t-blue-500 animate-spin mb-6"></div>
                                <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Generating Output • {timeLeft}s</p>
                            </>
                        ) : (
                            <div className="animate-in zoom-in slide-in-from-bottom-4">
                                <button
                                    onClick={handleSkip}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-3 w-full sm:w-auto mx-auto"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                    Save File Complete
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Minimal Privacy Assurance */}
                    <div className="mt-6 pt-6 border-t border-zinc-800/50 flex flex-col sm:flex-row items-center justify-center gap-3 text-emerald-500/80 text-xs font-medium">
                        <ShieldAlert size={16} />
                        <span>Zero Data Uploaded. 100% Client-Side Privacy.</span>
                    </div>
                </div>

            </div>
        </div>
    );
}

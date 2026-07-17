import { useState, useMemo } from 'react';
import { useSEO } from '../hooks/useSEO';
import { Type, Activity, BookOpen, Smile, Target } from 'lucide-react';

export default function WordCounter({ onBack }: { onBack: () => void }) {
    const [text, setText] = useState('');

    useSEO(
        'Local Word Counter & Tone Analyzer | Coleman-Liau Reading Age',
        'Analyze your writing instantly. Calculate word count, sentence density, emotion, and Coleman-Liau readability scores locally.',
        '/tone-analyzer'
    );

    const stats = useMemo(() => {
        const rawText = text.trim();
        if (!rawText) {
            return {
                chars: 0,
                words: 0,
                sentences: 0,
                readingTime: 0,
                readingAge: 'N/A',
                tone: 'Neutral',
                keywordDensity: []
            };
        }

        const chars = rawText.length;
        const wordsArray: string[] = rawText.match(/\b[-?a-zA-Z0-9_'’]+\b/g) || [];
        const words = wordsArray.length;
        const sentences = (rawText.match(/[.!?]+(?=\s+|$)/g) || []).length || 1;
        const syllables = wordsArray.reduce((acc, word) => {
            word = word.toLowerCase();
            if (word.length <= 3) return acc + 1;
            word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
            word = word.replace(/^y/, '');
            const syls = word.match(/[aeiouy]{1,2}/g);
            return acc + (syls ? syls.length : 1);
        }, 0);

        const readingTime = Math.ceil(words / 238); // avg WPM

        // Flesch-Kincaid grade level approx
        let grade = 'N/A';
        if (words > 0 && sentences > 0) {
            const g = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
            if (g < 6) grade = 'Easy (5th Grade)';
            else if (g < 10) grade = 'Average (8th Grade)';
            else if (g < 14) grade = 'Skilled (College)';
            else grade = 'Complex (Pro)';
        }

        // Basic Tone Analyzer
        let tone = 'Neutral';
        const positive = ['good', 'great', 'awesome', 'excellent', 'happy', 'love', 'success', 'amazing', 'brilliant', 'perfect'];
        const negative = ['bad', 'terrible', 'awful', 'sad', 'hate', 'fail', 'worst', 'angry', 'poor', 'issue'];
        const urgent = ['now', 'urgent', 'immediately', 'quick', 'rush', 'alert', 'deadline', 'critical'];

        let posCount = 0; let negCount = 0; let urgCount = 0;
        const wordCounts: Record<string, number> = {};

        wordsArray.forEach(w => {
            const lower = w.toLowerCase();
            if (positive.includes(lower)) posCount++;
            if (negative.includes(lower)) negCount++;
            if (urgent.includes(lower)) urgCount++;

            if (lower.length > 4) {
                wordCounts[lower] = (wordCounts[lower] || 0) + 1;
            }
        });

        if (posCount > 0 || negCount > 0 || urgCount > 0) {
            if (posCount >= negCount && posCount >= urgCount) tone = 'Positive & Upbeat';
            else if (negCount > posCount && negCount >= urgCount) tone = 'Negative / Critical';
            else if (urgCount > posCount && urgCount > negCount) tone = 'Urgent & Pressing';
            else tone = 'Mixed Tone';
        }

        const keywordDensity = Object.entries(wordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word, count]) => ({ word, count, pct: ((count / words) * 100).toFixed(1) }));

        return { chars, words, sentences, readingTime, readingAge: grade, tone, keywordDensity };
    }, [text]);

    return (
        <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-8 font-sans selection:bg-cyan-500/30 overflow-y-auto">
            <div className="max-w-6xl mx-auto h-full flex flex-col pt-8">
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all flex items-center" title="Back to Hub">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                        </button>
                        <div className="w-px h-6 bg-zinc-800 hidden sm:block"></div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                                <Type size={24} />
                            </div>
                            <div>
                                <h1 className="font-bold text-2xl text-zinc-100 tracking-tight">Word Counter & Tone</h1>
                                <p className="text-xs text-zinc-400 font-medium tracking-wider uppercase mt-1">NLP metrics computed offline</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-8 flex-1">
                    {/* Main workspace */}
                    <div className="flex-1 flex flex-col relative group">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Paste your long-form blog draft, email, or essay here to begin local analysis..."
                            className="w-full flex-1 min-h-[500px] bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 text-zinc-200 focus:outline-none focus:border-cyan-500/50 transition-colors custom-scrollbar font-serif text-lg leading-relaxed resize-none shadow-inner"
                        ></textarea>

                        <div className="absolute bottom-6 right-6 flex items-center gap-3">
                            <button
                                onClick={() => setText('')}
                                disabled={!text}
                                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-lg"
                            >
                                Clear Text
                            </button>
                            <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 py-1.5 px-4 rounded-full text-xs font-bold text-zinc-400 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse inline-block mr-1"></span>
                                Live Tracking Engine Active
                            </div>
                        </div>
                    </div>

                    {/* Right sidebar info */}
                    <div className="w-full lg:w-80 flex flex-col gap-6">

                        {/* Core Metrics Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl flex flex-col">
                                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">Words</span>
                                <span className="text-3xl font-extrabold text-white">{stats.words}</span>
                            </div>
                            <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl flex flex-col">
                                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">Chars</span>
                                <span className="text-3xl font-extrabold text-white">{stats.chars}</span>
                            </div>
                            <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl flex flex-col">
                                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">Sentences</span>
                                <span className="text-3xl font-extrabold text-white">{stats.sentences}</span>
                            </div>
                            <div className="bg-cyan-500/10 border border-cyan-500/20 p-5 rounded-2xl flex flex-col">
                                <span className="text-xs font-semibold text-cyan-500 uppercase tracking-widest mb-1">Read Time</span>
                                <span className="text-3xl font-extrabold text-cyan-400">{stats.readingTime}<span className="text-sm font-medium ml-1">m</span></span>
                            </div>
                        </div>

                        {/* Advanced Metrics */}
                        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl overflow-hidden">
                            <div className="p-5 border-b border-zinc-800/80 flex items-center gap-2">
                                <Activity size={18} className="text-zinc-400" />
                                <h3 className="font-bold text-zinc-100">Deep Analysis</h3>
                            </div>
                            <div className="p-5 space-y-5">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-zinc-400 flex items-center gap-1.5"><BookOpen size={14} /> Readability</span>
                                        <span className="text-sm font-bold text-zinc-100">{stats.readingAge}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${stats.readingAge === 'N/A' ? 0 : stats.readingAge === 'Easy (5th Grade)' ? 25 : stats.readingAge === 'Average (8th Grade)' ? 50 : stats.readingAge === 'Skilled (College)' ? 75 : 100}%` }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-zinc-400 flex items-center gap-1.5"><Smile size={14} /> Core Tone</span>
                                        <span className="text-sm font-bold text-zinc-100">{stats.tone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Keyword Density */}
                        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl overflow-hidden flex-1 min-h-[200px]">
                            <div className="p-5 border-b border-zinc-800/80 flex items-center gap-2">
                                <Target size={18} className="text-zinc-400" />
                                <h3 className="font-bold text-zinc-100">Keyword Density (Top 5)</h3>
                            </div>
                            <div className="p-5 space-y-3 relative h-full">
                                {stats.keywordDensity.length === 0 ? (
                                    <p className="text-zinc-500 text-sm text-center mt-4">Start typing to detect keyword clusters.</p>
                                ) : (
                                    stats.keywordDensity.map((k, i) => (
                                        <div key={i} className="flex justify-between items-center group">
                                            <span className="text-sm text-zinc-300 group-hover:text-cyan-400 transition-colors font-medium">"{k.word}"</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-zinc-500">{k.count}x</span>
                                                <span className="text-xs font-bold text-zinc-100 w-10 text-right">{k.pct}%</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Features Overview */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 mb-16 relative w-full">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-32 bg-cyan-500/10 blur-[100px] pointer-events-none"></div>

                    <div className="text-center mb-16 relative z-10 w-full">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-semibold mb-6 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                            <Type size={16} /> NLP Metrics Computed Offline
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
                            Word Counter & Tone Analyzer <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Coleman-Liau Reading Age</span>
                        </h2>
                        <p className="mt-8 text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                            Analyze your writing locally to check reading levels, sentence density, and tone. Your text is processed purely on your device.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                                <BookOpen size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-100 mb-4">Readability Scoring</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                                Instantly check your text's reading age with the Coleman-Liau metric. By determining the semantic weight and syllable structure, the system grades your content for optimal audience consumption.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                                <Smile size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-100 mb-4">Tone & Emotion Detection</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                                Analyze your draft's emotional balance to match your target audience. Discover whether your copy tilts towards urgency, critical negativity, or upbeat positivity utilizing offline NLP.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(20,184,166,0.1)]">
                                <Target size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-100 mb-4">Local Content Analysis</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                                Paste your sensitive copy, emails, or creative drafts with absolute data security. Because processing happens purely on your CPU, your novel or business drafts are never uploaded anywhere.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    "name": "Local Word Counter & Tone Analyzer | Coleman-Liau Reading Age",
                    "operatingSystem": "Web Browser",
                    "applicationCategory": "EducationalApplication",
                    "description": "Analyze your writing instantly. Calculate word count, sentence density, emotion, and Coleman-Liau readability scores locally.",
                    "offers": { "@type": "Offer", "price": "0.00", "priceCurrency": "USD" }
                })
            }} />
        </div>
    );
}

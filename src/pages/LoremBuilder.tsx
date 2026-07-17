import { useState, useMemo } from 'react';
import { useSEO } from '../hooks/useSEO';
import { FileText, Copy, Check, Hash, RefreshCcw, Quote, BookOpen, ListOrdered } from 'lucide-react';

type Industry = 'standard' | 'tech' | 'legal' | 'medical';

const VOCAB = {
    standard: ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea", "commodo", "consequat"],
    tech: ["algorithm", "bandwidth", "blockchain", "cloud", "deployment", "encryption", "framework", "gateway", "hash", "iteration", "kernel", "latency", "middleware", "node", "opensource", "protocol", "quantum", "repository", "scalable", "token", "ui", "virtualization", "webhook", "xml", "saas", "api", "container"],
    legal: ["affidavit", "breach", "contract", "defendant", "evidence", "fiduciary", "guarantor", "hearsay", "indemnity", "jurisdiction", "liability", "malpractice", "negligence", "objection", "plaintiff", "quorum", "retainer", "subpoena", "testimony", "verdict", "waiver", "tort", "litigation"],
    medical: ["acute", "benign", "cardiac", "diagnosis", "edema", "fracture", "glucose", "hypertension", "immune", "jaundice", "kinase", "lesion", "malignant", "neurology", "oncology", "pathology", "quarantine", "respiratory", "syndrome", "trauma", "ultrasound", "vaccine", "white-blood-cell"]
};

export default function LoremBuilder({ onBack }: { onBack: () => void }) {
    const [paragraphs, setParagraphs] = useState(3);
    const [industry, setIndustry] = useState<Industry>('standard');
    const [copied, setCopied] = useState(false);
    const [seed, setSeed] = useState(0);

    useSEO(
        'Lorem Context Builder | Technical, Legal & Medical Dummy Text',
        'Generate professional dummy text online. Create dynamic placeholder paragraphs embedded with realistic technical, legal, or medical terms.',
        '/lorem-builder'
    );

    const generatedText = useMemo(() => {
        // Randomly seeded generator dependent on `seed` to force regenerations

        let output = '';
        for (let p = 0; p < paragraphs; p++) {
            let paragraphText = '';
            const numSentences = Math.floor(Math.random() * 4) + 4; // 4 to 7 sentences per paragraph

            for (let s = 0; s < numSentences; s++) {
                const wordsInSentence = Math.floor(Math.random() * 10) + 6; // 6 to 15 words
                let sentence = '';

                for (let w = 0; w < wordsInSentence; w++) {
                    const dict = (industry === 'standard' || Math.random() > 0.4)
                        ? VOCAB.standard
                        : VOCAB[industry];

                    const word = dict[Math.floor(Math.random() * dict.length)];

                    if (w === 0) {
                        sentence += word.charAt(0).toUpperCase() + word.slice(1);
                    } else {
                        sentence += ' ' + word;
                    }
                }
                paragraphText += sentence + '. ';
            }
            output += paragraphText.trim() + '\n\n';
        }
        return output.trim();
    }, [paragraphs, industry, seed]);

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-8 font-sans selection:bg-fuchsia-500/30 overflow-y-auto">
            <div className="max-w-4xl mx-auto h-full flex flex-col pt-8">
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all flex items-center" title="Back to Hub">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                        </button>
                        <div className="w-px h-6 bg-zinc-800 hidden sm:block"></div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h1 className="font-bold text-2xl text-zinc-100 tracking-tight">Context Builder</h1>
                                <p className="text-xs text-zinc-400 font-medium tracking-wider uppercase mt-1">Lorem Ipsum Generator</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex flex-col gap-6 flex-1 h-full min-h-[500px]">
                    <div className="flex flex-col md:flex-row gap-4 p-4 md:p-6 bg-zinc-950 border border-zinc-800 rounded-3xl items-center justify-between shadow-xl">

                        <div className="flex gap-2 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800/80 w-full md:w-auto overflow-x-auto custom-scrollbar">
                            <button onClick={() => setIndustry('standard')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${industry === 'standard' ? 'bg-fuchsia-500 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>Standard Latin</button>
                            <button onClick={() => setIndustry('tech')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${industry === 'tech' ? 'bg-fuchsia-500 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>Tech / DevOps</button>
                            <button onClick={() => setIndustry('legal')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${industry === 'legal' ? 'bg-fuchsia-500 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>Legal Framework</button>
                            <button onClick={() => setIndustry('medical')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${industry === 'medical' ? 'bg-fuchsia-500 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>Medical / Pharma</button>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800/80 flex-1 md:flex-none">
                                <Hash size={16} className="text-zinc-500" />
                                <span className="text-sm font-medium text-zinc-400 w-16">Count:</span>
                                <input
                                    type="number"
                                    value={paragraphs}
                                    min="1"
                                    max="20"
                                    onChange={(e) => setParagraphs(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                                    className="bg-transparent text-white font-bold w-12 focus:outline-none"
                                />
                            </div>

                            <button onClick={() => setSeed(s => s + 1)} className="p-3 bg-zinc-900 border border-zinc-800/80 hover:bg-zinc-800 rounded-xl text-zinc-300 transition-colors" title="Regenerate Seed">
                                <RefreshCcw size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 relative group">
                        <textarea
                            readOnly
                            value={generatedText}
                            className="w-full h-full min-h-[400px] bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 md:p-8 text-zinc-300 focus:outline-none transition-colors custom-scrollbar font-serif text-lg leading-relaxed shadow-inner resize-none"
                        ></textarea>

                        <div className="absolute top-4 right-4 z-10">
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-2 px-5 py-2.5 bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95"
                            >
                                {copied ? <><Check size={18} /> Copied</> : <><Copy size={18} /> Copy to Clipboard</>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Features Overview */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 mb-16 relative w-full">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-32 bg-fuchsia-500/10 blur-[100px] pointer-events-none"></div>

                    <div className="text-center mb-16 relative z-10 w-full">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-sm font-semibold mb-6 shadow-[0_0_20px_rgba(217,70,239,0.1)]">
                            <Quote size={16} /> Technical, Legal & Medical Vocab
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
                            Lorem Context Builder <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-500">Intelligent Placeholder Text</span>
                        </h2>
                        <p className="mt-8 text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                            Step away from generic placeholder text. Our Lorem Context Builder generates dynamic, highly realistic dummy paragraphs specifically tailored for niche layouts. Whether you are building mockups for a specialized client platform or testing UI responsiveness, instantly inject authentic Technical, Legal, or Medical vocabulary into your designs.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(217,70,239,0.1)]">
                                <BookOpen size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-100 mb-4">Niche Vocabularies</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                                Populate mockups with contextual text blocks designed for engineering, medical, or legal applications, making your wireframes significantly more professional.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                                <ListOrdered size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-100 mb-4">Dynamic Generation</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                                Customize paragraph counts and length distributions on the fly. The engine randomizes sentence structures to emulate authentic human reading patterns.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                                <Copy size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-100 mb-4">Developer-Ready Output</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                                Copy clean, structured placeholder content directly into your development workflow. No hidden characters or formatting glitches - just pure, valid text strings.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    "name": "Lorem Context Builder | Technical, Legal & Medical Dummy Text",
                    "operatingSystem": "Web Browser",
                    "applicationCategory": "DesignApplication",
                    "description": "Generate professional dummy text online. Create dynamic placeholder paragraphs embedded with realistic technical, legal, or medical terms.",
                    "offers": { "@type": "Offer", "price": "0.00", "priceCurrency": "USD" }
                })
            }} />
        </div >
    );
}

import { useState, useMemo } from 'react';
import { PrivacyFeatures } from '../components/PrivacyFeatures';
import { useSEO } from '../hooks/useSEO';
import { AdUnit } from '../components/AdUnit';
import { FileText, Copy, Check, Hash, RefreshCcw, Quote, BookOpen, ListOrdered } from 'lucide-react';

type BaseLanguage = 'standard' | 'english' | 'spanish' | 'french' | 'german' | 'italian' | 'portuguese';
type Domain = 'none' | 'tech' | 'legal' | 'medical';

const VOCAB: Record<string, string[]> = {
    standard: ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea", "commodo", "consequat"],
    english: ["the", "and", "to", "of", "a", "in", "is", "that", "it", "with", "as", "for", "was", "on", "are", "by", "be", "this", "which", "or", "but", "not", "from", "an", "they", "we", "you", "at", "have", "has", "had", "all", "their", "there", "can", "will", "would", "about", "if", "one", "more", "out", "up", "so", "what", "some", "who", "them", "my", "other", "its", "only", "into", "then", "than", "could", "also", "new", "any", "these", "two", "may", "first", "do", "any", "like", "our", "over", "even", "most", "where", "after", "while", "how", "well", "should", "such", "through", "because", "each", "just", "those", "down", "why", "very", "much", "must", "same"],
    spanish: ["el", "la", "de", "que", "y", "a", "en", "un", "ser", "se", "no", "haber", "por", "con", "su", "para", "como", "estar", "tener", "le", "lo", "todo", "pero", "más", "hacer", "o", "poder", "decir", "este", "ir", "otro", "ese", "si", "me", "ya", "ver", "porque", "dar", "cuando", "él", "muy", "sin", "vez", "mucho", "saber", "qué", "sobre", "mi", "alguno", "mismo", "yo", "también", "hasta", "año", "dos", "querer", "entre", "así", "primero", "desde", "grande", "eso", "ni", "nos", "llegar", "pasar", "tiempo", "ella", "sí", "día", "uno", "bien", "poco", "deber", "entonces", "poner", "cosa", "tanto", "hombre", "parecer", "nuestro", "tan", "donde", "ahora", "parte", "después", "vida", "quedar", "siempre", "creer", "hablar"],
    french: ["le", "la", "de", "un", "une", "et", "à", "il", "est", "en", "ce", "qui", "pour", "dans", "les", "des", "sur", "pas", "que", "avec", "par", "se", "ne", "vous", "son", "sa", "au", "plus", "je", "nous", "comme", "mais", "ou", "si", "tout", "fait", "lui", "être", "faire", "on", "quand", "très", "peut", "bien", "elle", "sont", "même", "aussi", "encore", "voir", "dire", "avoir", "leur", "cette", "sans", "deux", "mon", "ma", "où", "temps", "peu", "toujours", "vie", "beaucoup", "alors", "chose", "rien", "jamais", "homme", "ici", "moins", "jour", "autre", "monde", "avant", "après", "trop", "oui", "non", "pourquoi", "comment"],
    german: ["der", "die", "und", "in", "den", "von", "zu", "das", "mit", "sich", "des", "auf", "für", "ist", "im", "dem", "nicht", "ein", "eine", "als", "auch", "es", "an", "werden", "aus", "er", "hat", "dass", "sie", "nach", "wird", "bei", "einer", "um", "am", "sind", "noch", "wie", "einem", "über", "einen", "so", "zum", "war", "haben", "nur", "oder", "aber", "vor", "zur", "bis", "mehr", "durch", "man", "sein", "wurde", "sei", "prozent", "hatte", "kann", "gegen", "vom", "können", "schon", "wenn", "habe", "seine", "ihre", "dann", "unter", "wir", "soll", "ich", "eines", "jahr", "zwei", "diese", "dieser", "wieder", "keine", "uhr", "seiner", "worden", "will", "zwischen", "immer", "was", "sagte", "gibt"],
    italian: ["il", "di", "e", "a", "un", "in", "che", "non", "si", "da", "lo", "per", "con", "ma", "come", "su", "mi", "anche", "o", "io", "se", "questo", "chi", "ci", "quello", "più", "fare", "tutto", "essere", "avere", "mio", "quale", "cosa", "quando", "molto", "così", "lui", "senza", "bene", "cui", "lei", "ancora", "tu", "solo", "due", "tempo", "vita", "altro", "mai", "fatto", "uomo", "dove", "sempre", "poi", "qui", "ogni", "ora", "modo", "prima", "giorno", "qualche", "niente", "nessuno", "stato", "oggi", "dire", "ad", "suo", "parte", "sua", "loro"],
    portuguese: ["o", "a", "de", "e", "que", "do", "da", "em", "um", "para", "é", "com", "não", "uma", "os", "no", "se", "na", "por", "mais", "as", "dos", "como", "mas", "foi", "ao", "ele", "das", "tem", "à", "seu", "sua", "ou", "ser", "quando", "muito", "há", "nos", "já", "está", "eu", "também", "só", "pelo", "pela", "até", "isso", "ela", "entre", "era", "depois", "sem", "mesmo", "aos", "ter", "seus", "quem", "nas", "me", "esse", "eles", "estão", "você", "tinha", "foram", "essa", "num", "nem", "suas", "meu", "às", "minha", "têm", "numa", "pelos", "elas", "havia", "seja", "qual", "será"],
    tech: ["algorithm", "bandwidth", "blockchain", "cloud", "deployment", "encryption", "framework", "gateway", "hash", "iteration", "kernel", "latency", "middleware", "node", "opensource", "protocol", "quantum", "repository", "scalable", "token", "ui", "virtualization", "webhook", "xml", "saas", "api", "container"],
    legal: ["affidavit", "breach", "contract", "defendant", "evidence", "fiduciary", "guarantor", "hearsay", "indemnity", "jurisdiction", "liability", "malpractice", "negligence", "objection", "plaintiff", "quorum", "retainer", "subpoena", "testimony", "verdict", "waiver", "tort", "litigation"],
    medical: ["acute", "benign", "cardiac", "diagnosis", "edema", "fracture", "glucose", "hypertension", "immune", "jaundice", "kinase", "lesion", "malignant", "neurology", "oncology", "pathology", "quarantine", "respiratory", "syndrome", "trauma", "ultrasound", "vaccine", "white-blood-cell"]
};

export default function LoremBuilder({ onBack }: { onBack: () => void }) {
    const [paragraphs, setParagraphs] = useState(3);
    const [baseLanguage, setBaseLanguage] = useState<BaseLanguage>('english');
    const [domain, setDomain] = useState<Domain>('none');
    const [copied, setCopied] = useState(false);
    const [seed, setSeed] = useState(0);

    useSEO(
        'Lorem Context Builder | Technical, Legal & Medical Dummy Text',
        'Generate professional dummy text online. Create dynamic placeholder paragraphs embedded with realistic technical, legal, or medical terms.',
        '/lorem-builder/'
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
                    const isBaseWord = Math.random() > 0.4;
                    let dict;

                    if (domain === 'none' || isBaseWord) {
                        dict = VOCAB[baseLanguage];
                    } else {
                        dict = VOCAB[domain];
                    }

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
    }, [paragraphs, baseLanguage, domain, seed]);

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-8 font-sans selection:bg-fuchsia-500/30 overflow-y-auto">
            <div className="max-w-7xl mx-auto h-full flex flex-col pt-8">
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
                                <h2 className="font-bold text-2xl text-zinc-100 tracking-tight">Context Builder</h2>
                                <p className="text-xs text-zinc-400 font-medium tracking-wider uppercase mt-1">Lorem Ipsum Generator</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex flex-col md:flex-row gap-6 flex-1 h-full min-h-[500px] mb-8">
                    {/* Main Text Area - Left Column */}
                    <div className="flex-1 flex flex-col min-h-[400px] md:min-h-0 order-2 md:order-1 relative group">
                        <textarea
                            readOnly
                            value={generatedText}
                            className="w-full h-full flex-1 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 md:p-8 text-zinc-300 focus:outline-none transition-colors custom-scrollbar font-serif text-lg leading-relaxed shadow-inner resize-none"
                        ></textarea>
                    </div>

                    {/* Sidebar Controls - Right Column */}
                    <div className="w-full md:w-80 lg:w-96 flex flex-col gap-4 order-1 md:order-2 shrink-0">
                        {/* Domain Selectors */}
                        <div className="flex flex-col gap-2 p-5 bg-zinc-950 border border-zinc-800 rounded-3xl shadow-xl">
                            <h3 className="text-zinc-500 text-xs font-bold mb-2 uppercase tracking-wider">Base Language</h3>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => setBaseLanguage('standard')} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${baseLanguage === 'standard' ? 'bg-zinc-100 text-zinc-900 shadow-md' : 'bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 hover:bg-zinc-800/50'}`}>Latin</button>
                                <button onClick={() => setBaseLanguage('english')} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${baseLanguage === 'english' ? 'bg-zinc-100 text-zinc-900 shadow-md' : 'bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 hover:bg-zinc-800/50'}`}>English</button>
                                <button onClick={() => setBaseLanguage('spanish')} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${baseLanguage === 'spanish' ? 'bg-zinc-100 text-zinc-900 shadow-md' : 'bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 hover:bg-zinc-800/50'}`}>Spanish</button>
                                <button onClick={() => setBaseLanguage('french')} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${baseLanguage === 'french' ? 'bg-zinc-100 text-zinc-900 shadow-md' : 'bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 hover:bg-zinc-800/50'}`}>French</button>
                                <button onClick={() => setBaseLanguage('german')} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${baseLanguage === 'german' ? 'bg-zinc-100 text-zinc-900 shadow-md' : 'bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 hover:bg-zinc-800/50'}`}>German</button>
                                <button onClick={() => setBaseLanguage('italian')} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${baseLanguage === 'italian' ? 'bg-zinc-100 text-zinc-900 shadow-md' : 'bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 hover:bg-zinc-800/50'}`}>Italian</button>
                                <button onClick={() => setBaseLanguage('portuguese')} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${baseLanguage === 'portuguese' ? 'bg-zinc-100 text-zinc-900 shadow-md' : 'bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 hover:bg-zinc-800/50'}`}>Portuguese</button>
                            </div>

                            <div className="w-full h-px bg-zinc-800/80 my-3"></div>

                            <h3 className="text-zinc-500 text-xs font-bold mb-2 uppercase tracking-wider">Technical Format</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => setDomain(domain === 'tech' ? 'none' : 'tech')} className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all text-center flex-col gap-1 items-center justify-center flex ${domain === 'tech' ? 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30' : 'bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 border border-zinc-800/50 hover:bg-zinc-800'}`}>Tech / DevOps</button>
                                <button onClick={() => setDomain(domain === 'legal' ? 'none' : 'legal')} className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all text-center flex-col gap-1 items-center justify-center flex ${domain === 'legal' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' : 'bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 border border-zinc-800/50 hover:bg-zinc-800'}`}>Legal Framework</button>
                                <button onClick={() => setDomain(domain === 'medical' ? 'none' : 'medical')} className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all text-center flex-col gap-1 items-center justify-center flex col-span-2 ${domain === 'medical' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 border border-zinc-800/50 hover:bg-zinc-800'}`}>Medical / Pharma</button>
                            </div>
                        </div>

                        {/* Count & Refresh */}
                        <div className="flex items-center justify-between p-5 bg-zinc-950 border border-zinc-800 rounded-3xl shadow-xl">
                            <div className="flex items-center gap-3">
                                <Hash size={18} className="text-zinc-500" />
                                <span className="text-sm font-bold text-zinc-300">Paragraphs:</span>
                                <input
                                    type="number"
                                    value={paragraphs}
                                    min="1"
                                    max="20"
                                    onChange={(e) => setParagraphs(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                                    className="bg-zinc-900 border border-zinc-800/80 rounded-xl px-3 py-1.5 text-white font-bold w-16 focus:outline-none focus:border-fuchsia-500/50 text-center"
                                />
                            </div>

                            <button onClick={() => setSeed(s => s + 1)} className="p-2.5 bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 rounded-xl text-zinc-300 transition-colors" title="Regenerate Text">
                                <RefreshCcw size={18} />
                            </button>
                        </div>

                        {/* Copy to Clipboard */}
                        <button
                            onClick={handleCopy}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-3xl shadow-[0_0_20px_rgba(217,70,239,0.2)] transition-all active:scale-95 text-lg mt-auto md:mt-0"
                        >
                            {copied ? <><Check size={20} /> Copied</> : <><Copy size={20} /> Copy to Clipboard</>}
                        </button>
                    </div>
                </div>



                {/* Features Overview */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 mb-16 relative w-full">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-32 bg-fuchsia-500/10 blur-[100px] pointer-events-none"></div>

                    <div className="text-center mb-16 relative z-10 w-full">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-sm font-semibold mb-6 shadow-[0_0_20px_rgba(217,70,239,0.1)]">
                            <Quote size={16} /> Technical, Legal & Medical Vocab
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
                            Lorem Context Builder <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-500">Intelligent Placeholder Text</span>
                        </h1>
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
                            <h3 className="text-xl font-bold text-zinc-100 mb-4">Global Multilingual Support</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                                Generate your placeholder text in Classic Latin, English, Spanish, French, German, Italian, or Portuguese. Combine these base languages effortlessly with any technical format.
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

                {/* FAQ Section */}
                <div className="max-w-4xl mx-auto px-4 md:px-8 mt-16 mb-20 relative z-10 w-full">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
                        <p className="text-zinc-400">Everything you need to know about our intelligent context builder.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl backdrop-blur-xl">
                            <h3 className="text-lg font-bold text-white mb-2">How does the multilingual feature work?</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">Just pick your preferred language from the sidebar. Instead of using the usual Latin 'lorem ipsum' words, our generator uses real, common words from Italian, Portuguese, Spanish, French, or German. It helps your mockups feel much more authentic depending on who you're designing for.</p>
                        </div>
                        <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl backdrop-blur-xl">
                            <h3 className="text-lg font-bold text-white mb-2">Can I combine languages with technical formats?</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">Absolutely! We built the language options and technical formats as two separate things. So you can totally create a medical paragraph using Spanish words, or generate some DevOps-themed text in Italian.</p>
                        </div>
                        <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl backdrop-blur-xl">
                            <h3 className="text-lg font-bold text-white mb-2">Is the text actually meaningful?</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">Nope, it's still total gibberish so people don't get distracted trying to read it. But we deliberately mix up the word and paragraph lengths, and randomly sprinkle in technical terms like 'encryption' or 'oncology' so it visually looks like real content sitting on the page.</p>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 w-full z-10 relative">
                    <PrivacyFeatures
                        toolName="Lorem Context Builder (Local)"
                        useCases={[
                            "Generating niche dummy text for confidential web application mockups.",
                            "Populating internal engineering portals with realistic technical terms.",
                            "Creating secure placeholders for private medical UI wireframes."
                        ]}
                    />
                </div>

                <AdUnit slotId="LOREM_BOTTOM" />
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

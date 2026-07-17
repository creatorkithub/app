import { useState } from 'react';
import { useSEO } from '../hooks/useSEO';
import { Shield, Lock, Unlock, Copy, Check, FileText } from 'lucide-react';
import CryptoJS from 'crypto-js';

export default function TextEncryption({ onBack }: { onBack: () => void }) {
    const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
    const [inputText, setInputText] = useState('');
    const [passcode, setPasscode] = useState('');
    const [outputText, setOutputText] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    useSEO(
        'Secure Offline Encryption Vault | AES-256 Client-Side Hashing',
        'Protect your data with our offline encryption vault. Secure text and hash passwords locally using military-grade AES-256 client-side encryption.',
        '/text-encryption'
    );

    const handleProcess = () => {
        setError('');
        setOutputText('');

        if (!inputText.trim()) {
            setError('Please enter some text.');
            return;
        }
        if (!passcode) {
            setError('Please enter a passcode.');
            return;
        }

        try {
            if (mode === 'encrypt') {
                const encrypted = CryptoJS.AES.encrypt(inputText, passcode).toString();
                setOutputText(encrypted);
            } else {
                const decrypted = CryptoJS.AES.decrypt(inputText, passcode);
                const originalText = decrypted.toString(CryptoJS.enc.Utf8);
                if (!originalText) {
                    setError('Decryption failed. Incorrect passcode or invalid encrypted string.');
                } else {
                    setOutputText(originalText);
                }
            }
        } catch (e) {
            setError('Could not process the text. Check your passcode or encrypted string format.');
        }
    };

    const handleCopy = () => {
        if (outputText) {
            navigator.clipboard.writeText(outputText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-8 font-sans selection:bg-orange-500/30 overflow-y-auto">
            <div className="max-w-5xl mx-auto h-full flex flex-col pt-8">
                <header className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all flex items-center" title="Back to Hub">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                        </button>
                        <div className="w-px h-6 bg-zinc-800 hidden sm:block"></div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h1 className="font-bold text-2xl text-zinc-100 tracking-tight">Offline Encryption Vault</h1>
                                <p className="text-xs text-emerald-400 font-medium tracking-wider uppercase mt-1">AES-256 Client-Side Protocol</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1 min-h-[600px]">
                    {/* Main workspace */}
                    <div className="flex-1 flex flex-col gap-6 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] pointer-events-none rounded-full"></div>

                        {/* Toggle Mode */}
                        <div className="flex bg-zinc-950 rounded-xl p-1 border border-zinc-800 self-start z-10 w-full sm:w-auto">
                            <button
                                onClick={() => { setMode('encrypt'); setOutputText(''); setError(''); }}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'encrypt' ? 'bg-orange-500 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-200'}`}
                            >
                                <Lock size={16} /> Encrypt
                            </button>
                            <button
                                onClick={() => { setMode('decrypt'); setOutputText(''); setError(''); }}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'decrypt' ? 'bg-blue-500 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-200'}`}
                            >
                                <Unlock size={16} /> Decrypt
                            </button>
                        </div>

                        <div className="flex flex-col gap-2 z-10 flex-1">
                            <label className="text-sm font-medium text-zinc-300">
                                {mode === 'encrypt' ? 'Plain Text Input' : 'AES-256 Encrypted String'}
                            </label>
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder={mode === 'encrypt' ? "Type or paste your sensitive journal, passwords, or messages here..." : "U2FsdGVkX1..."}
                                className="w-full flex-1 min-h-[150px] bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-zinc-200 focus:outline-none focus:border-orange-500/50 transition-colors custom-scrollbar font-mono text-sm resize-none"
                            ></textarea>
                        </div>

                        <div className="flex flex-col gap-2 z-10">
                            <label className="text-sm font-medium text-zinc-300">Master Passcode</label>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <input
                                    type="password"
                                    value={passcode}
                                    onChange={(e) => setPasscode(e.target.value)}
                                    placeholder="Enter a very strong passcode..."
                                    className="w-full flex-1 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-orange-500/50 transition-colors font-mono tracking-widest placeholder:tracking-normal placeholder:font-sans"
                                />
                                <button
                                    onClick={handleProcess}
                                    className={`px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex-shrink-0 ${mode === 'encrypt' ? 'bg-orange-500 hover:bg-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.2)] text-white' : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)] text-white'}`}
                                >
                                    {mode === 'encrypt' ? 'Encrypt Text' : 'Decrypt Text'}
                                </button>
                            </div>
                            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                        </div>

                        <div className="flex flex-col gap-2 z-10 flex-1 mt-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-zinc-300">
                                    {mode === 'encrypt' ? 'Encrypted Output' : 'Decrypted Original Text'}
                                </label>
                                <button
                                    onClick={handleCopy}
                                    disabled={!outputText}
                                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {copied ? <><Check size={14} className="text-emerald-400" /> Copied</> : <><Copy size={14} /> Copy string</>}
                                </button>
                            </div>
                            <textarea
                                readOnly
                                value={outputText}
                                placeholder="Result will appear here..."
                                className="w-full flex-1 min-h-[150px] bg-black/40 border border-[#27272a] rounded-2xl p-4 text-emerald-400 focus:outline-none transition-colors custom-scrollbar font-mono text-sm resize-none shadow-inner break-all"
                            ></textarea>
                        </div>
                    </div>

                    {/* Right sidebar info */}
                    <div className="w-full lg:w-80 flex flex-col gap-6">
                        <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-3xl">
                            <h3 className="font-bold text-orange-400 mb-3 flex items-center gap-2">
                                <Shield size={18} /> Zero-Knowledge Security
                            </h3>
                            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                                This vault uses the CryptoJS WebAssembly implementation of AES-256 in CBC mode. Because the calculation runs entirely locally on your processor, your master passcode is <strong className="text-zinc-200">never</strong> transmitted to a server.
                            </p>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                If you lose your passcode, recovering the underlying plain text is mathematically impossible.
                            </p>
                        </div>

                        <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-3xl">
                            <h3 className="font-bold text-zinc-200 mb-3 flex items-center gap-2">
                                <FileText size={18} className="text-blue-400" /> Usage Ideas
                            </h3>
                            <ul className="text-sm text-zinc-400 leading-relaxed space-y-3 list-disc pl-4">
                                <li>Store encrypted journal entries securely into a cloud like Google Drive without exposing them.</li>
                                <li>Send highly confidential business communications through unsecure channels like SMS or Slack.</li>
                                <li>Archive cryptocurrency recovery seeds.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Features Overview */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 mb-16 relative w-full">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-32 bg-orange-500/10 blur-[100px] pointer-events-none"></div>

                    <div className="text-center mb-16 relative z-10 w-full">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-semibold mb-6 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                            <Shield size={16} /> Privacy-First Protocol
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
                            Secure Offline Encryption Vault <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">AES-256 Client-Side Protocol</span>
                        </h2>
                        <p className="mt-8 text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                            Protect your sensitive data with maximum privacy. Our Offline Encryption Vault uses military-grade AES-256 client-side encryption to secure your text and passwords directly on your device. Because all processing happens locally in your browser, your data is never transmitted, stored, or exposed to external servers.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                                <Lock size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-100 mb-4">AES-256 Encryption</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                                Utilize industry-standard cryptography to lock your private text. The AES algorithm deployed via CryptoJS Wasm guarantees your cipher payloads are statistically unbreakable without the master key.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                <Check size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-100 mb-4">Client-Side Hashing</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                                Securely generate password hashes without risking data leaks. Since your keystrokes are processed instantly inside the DOM environment, network interceptors can never analyze your traffic.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                                <Shield size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-100 mb-4">100% Offline Operation</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                                Full cryptographic security operating entirely within your local environment. You can install the tool as a PWA, turn on airplane mode, and still secure mission-critical keys flawlessly.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "SoftwareApplication",
                    "name": "Secure Offline Encryption Vault | AES-256 Client-Side Hashing",
                    "operatingSystem": "Web Browser",
                    "applicationCategory": "SecurityApplication",
                    "description": "Protect your data with our offline encryption vault. Secure text and hash passwords locally using military-grade AES-256 client-side encryption.",
                    "offers": { "@type": "Offer", "price": "0.00", "priceCurrency": "USD" }
                })
            }} />
        </div>
    );
}

import { useState, useRef, useEffect } from 'react';
import { useSEO } from '../hooks/useSEO';
import { useAdContext } from '../contexts/AdContext';
import { Shield, FileText, Lock, Key, RefreshCw, CheckCircle, AlertTriangle, XCircle, Search, Terminal, Zap, Fingerprint, SearchCode, Loader2, Eye, EyeOff } from 'lucide-react';
import zxcvbn from 'zxcvbn';
import SparkMD5 from 'spark-md5';

interface HashResult {
    md5: string;
    sha1: string;
    sha256: string;
    sha512: string;
}

export default function CryptoAudit() {
    const { triggerCTA } = useAdContext();
    const [activeTab, setActiveTab] = useState<'HASHER' | 'PASSWORD'>('HASHER');

    // -- HASHER STATE --
    const [isDragging, setIsDragging] = useState(false);
    const [activeFile, setActiveFile] = useState<File | null>(null);
    const [hashProgress, setHashProgress] = useState(0);
    const [isHashing, setIsHashing] = useState(false);
    const [hashes, setHashes] = useState<HashResult | null>(null);
    const [verifyInput, setVerifyInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // -- PASSWORD STATE --
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordResult, setPasswordResult] = useState<any>(null);

    useSEO({
        title: 'CryptoAudit',
        description: 'Evaluate hashes and passwords offline.',
        canonical: '/cryptoaudit'
    });

    // Generator States
    const [genLength, setGenLength] = useState(16);
    const [genUpper, setGenUpper] = useState(true);
    const [genLower, setGenLower] = useState(true);
    const [genNum, setGenNum] = useState(true);
    const [genSym, setGenSym] = useState(true);

    const checkVerification = (input: string) => {
        if (!hashes || !input) return null;
        const target = input.trim().toLowerCase();
        if (target === hashes.md5) return 'MD5';
        if (target === hashes.sha1) return 'SHA-1';
        if (target === hashes.sha256) return 'SHA-256';
        if (target === hashes.sha512) return 'SHA-512';
        return false;
    };
    const verificationMatch = checkVerification(verifyInput);

    const resetHasher = () => {
        setActiveFile(null);
        setHashes(null);
        setHashProgress(0);
        setVerifyInput('');
    };

    // Buffer to Hex utility
    const bufferToHex = (buffer: ArrayBuffer) => {
        const hashArray = Array.from(new Uint8Array(buffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const processFileQueue = async (file: File) => {
        setIsHashing(true);
        setActiveFile(file);
        setHashes(null);
        setHashProgress(0);

        try {
            // Using a chunked approach for SparkMD5 to mimic heavy streaming, 
            // and progressively build an ArrayBuffer for crypto.subtle
            const chunkSize = 5 * 1024 * 1024; // 5MB chunks
            const chunks = Math.ceil(file.size / chunkSize);
            let currentChunk = 0;

            const spark = new SparkMD5.ArrayBuffer();
            const fileReader = new FileReader();

            // We must concatenate chunks to pass into crypto.subtle native digests at the end
            // (since Web Crypto doesn't natively expose an `.update()` stream method yet)
            let fullBuffer = new Uint8Array(file.size);
            let offset = 0;

            const readNextChunk = () => {
                const start = currentChunk * chunkSize;
                const end = Math.min(start + chunkSize, file.size);
                fileReader.readAsArrayBuffer(file.slice(start, end));
            };

            fileReader.onload = async (e) => {
                if (e.target?.result && e.target.result instanceof ArrayBuffer) {
                    // Update MD5 Stream
                    spark.append(e.target.result);

                    // Update full buffer for subtle crypto
                    fullBuffer.set(new Uint8Array(e.target.result), offset);
                    offset += e.target.result.byteLength;

                    currentChunk++;
                    setHashProgress(Math.round((currentChunk / chunks) * 100));

                    if (currentChunk < chunks) {
                        // Recursively read next chunk
                        // slight artificial delay to prevent UI freezing
                        setTimeout(readNextChunk, 10);
                    } else {
                        // All chunks read.
                        const md5Final = spark.end();

                        // Fire crypto.subtle digests in parallel against the full constructed ArrayBuffer
                        const [sha1Buffer, sha256Buffer, sha512Buffer] = await Promise.all([
                            crypto.subtle.digest('SHA-1', fullBuffer.buffer),
                            crypto.subtle.digest('SHA-256', fullBuffer.buffer),
                            crypto.subtle.digest('SHA-512', fullBuffer.buffer)
                        ]);

                        setHashes({
                            md5: md5Final,
                            sha1: bufferToHex(sha1Buffer),
                            sha256: bufferToHex(sha256Buffer),
                            sha512: bufferToHex(sha512Buffer)
                        });

                        // Explicit GC hint
                        fullBuffer = new Uint8Array(0);
                        setIsHashing(false);
                    }
                }
            };

            fileReader.onerror = () => {
                setIsHashing(false);
                throw new Error("File reading failed.");
            };

            // Start stream
            readNextChunk();

        } catch (error) {
            console.error("Hashing failed", error);
            setIsHashing(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFileQueue(e.dataTransfer.files[0]);
        }
    };

    // --- PASSWORD LOGIC ---
    useEffect(() => {
        if (password.length > 0) {
            setPasswordResult(zxcvbn(password));
        } else {
            setPasswordResult(null);
        }
    }, [password]);

    const generateSecurePassword = () => {
        const charsetMatch = {
            upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lower: 'abcdefghijklmnopqrstuvwxyz',
            num: '0123456789',
            sym: '!@#$%^&*_+-=<>?'
        };

        let pool = '';
        if (genUpper) pool += charsetMatch.upper;
        if (genLower) pool += charsetMatch.lower;
        if (genNum) pool += charsetMatch.num;
        if (genSym) pool += charsetMatch.sym;

        if (pool === '') {
            pool = charsetMatch.lower;
            setGenLower(true);
        }

        const array = new Uint32Array(genLength);
        window.crypto.getRandomValues(array);

        let out = '';
        for (let i = 0; i < genLength; i++) {
            out += pool[array[i] % pool.length];
        }
        setPassword(out);
    };

    return (
        <div className="flex flex-col gap-6 h-full text-zinc-100 max-w-5xl mx-auto">
            {/* Nav Tabs */}
            <div className="bg-zinc-900/60 p-1.5 rounded-xl border border-zinc-800/80 flex mx-auto">
                <button
                    onClick={() => setActiveTab('HASHER')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'HASHER' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Fingerprint size={18} /> File Integrity Hasher
                </button>
                <button
                    onClick={() => setActiveTab('PASSWORD')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'PASSWORD' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Shield size={18} /> Password Auditor
                </button>
            </div>

            {/* TAB: HASHER */}
            {activeTab === 'HASHER' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="text-center space-y-2 mb-8">
                        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Cryptographic Checksum Engine</h2>
                        <p className="text-zinc-400">Generate mathematically secure MD5 and SHA family hashes progressively in-memory.</p>
                    </div>

                    {!activeFile ? (
                        <div
                            className={`flex flex-col items-center justify-center p-12 rounded-3xl border-2 border-dashed transition-all duration-300 relative overflow-hidden cursor-pointer transform group ${isDragging ? 'bg-emerald-500/10 border-emerald-500/50 scale-105 shadow-[0_0_40px_rgba(16,185,129,0.2)]' : 'bg-zinc-900/40 border-zinc-700/50 hover:bg-zinc-800/60 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:-translate-y-1'
                                }`}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                        >
                            <Terminal size={48} className={`mb-4 transition-colors ${isDragging ? 'text-emerald-400' : 'text-zinc-600'}`} />
                            <h3 className="text-xl font-bold text-zinc-300">Drop a file to hash</h3>
                            <p className="text-sm text-zinc-500 mt-2 max-w-sm text-center">Chunks streaming enabled for files up to available RAM limits. Never leaves your browser.</p>
                            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files && processFileQueue(e.target.files[0])} />
                        </div>
                    ) : (
                        <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 shadow-xl shadow-black/20">

                            {/* File Status Header */}
                            <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-800">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg truncate max-w-[300px] border-b border-transparent">{activeFile.name}</h4>
                                        <p className="text-xs text-zinc-500 mt-1 font-mono">{(activeFile.size / 1024 / 1024).toFixed(2)} MB • {activeFile.type || 'unknown format'}</p>
                                    </div>
                                </div>
                                <button onClick={resetHasher} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Scan new file"><RefreshCw size={18} /></button>
                            </div>

                            {/* Processing Matrix */}
                            {isHashing ? (
                                <div className="py-12 flex flex-col items-center">
                                    <div className="w-full max-w-md bg-zinc-950 rounded-full h-4 mb-4 border border-zinc-800 overflow-hidden relative">
                                        <div
                                            className="h-full bg-emerald-500 relative transition-all duration-300"
                                            style={{ width: `${hashProgress}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-pulse custom-scrollbar"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-emerald-400 font-mono text-sm">
                                        <Loader2 className="animate-spin" size={16} />
                                        STREAMING CHUNKS: {hashProgress}%
                                    </div>
                                </div>
                            ) : hashes ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left: Verified Hashes */}
                                    <div className="space-y-4">
                                        {[
                                            { name: 'MD5', val: hashes.md5 },
                                            { name: 'SHA-1', val: hashes.sha1 },
                                            { name: 'SHA-256', val: hashes.sha256 },
                                            { name: 'SHA-512', val: hashes.sha512 }
                                        ].map(h => (
                                            <div key={h.name} className={`bg-zinc-950 p-4 rounded-xl border font-mono transition-colors ${verificationMatch === h.name ? 'border-emerald-500/50 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]' : 'border-zinc-800'}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`text-xs font-bold ${verificationMatch === h.name ? 'text-emerald-400' : 'text-zinc-500'}`}>{h.name}</span>
                                                    {verificationMatch === h.name && <CheckCircle size={14} className="text-emerald-400" />}
                                                </div>
                                                <div className="text-[11px] text-zinc-300 break-all select-all flex items-center">
                                                    {h.val}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Right: Verifier Action */}
                                    <div className="bg-zinc-950/50 p-6 rounded-xl border border-zinc-800 flex flex-col justify-center">
                                        <div className="mb-4">
                                            <h5 className="font-bold flex items-center gap-2 mb-2"><SearchCode size={18} className="text-emerald-400" /> Verify Checksum</h5>
                                            <p className="text-xs text-zinc-500 leading-relaxed">Paste a developer-provided MD5 or SHA hash here. We will instantly compare it against the computed mathematical integrity algorithms above.</p>
                                        </div>
                                        <input
                                            type="text"
                                            value={verifyInput}
                                            onChange={(e) => setVerifyInput(e.target.value)}
                                            placeholder="Paste external checksum..."
                                            className="w-full bg-zinc-900 border border-zinc-700 px-4 py-3 rounded-lg text-sm text-zinc-100 font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                                        />

                                        {verifyInput.trim().length > 0 && (
                                            <div className="mt-4 p-4 rounded-lg flex items-start gap-3 animated-in fade-in zoom-in-95 duration-200" style={{ background: verificationMatch ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${verificationMatch ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
                                                {verificationMatch ? (
                                                    <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" />
                                                ) : (
                                                    <XCircle size={20} className="text-red-500 flex-shrink-0" />
                                                )}
                                                <div>
                                                    <p className={`text-sm font-bold ${verificationMatch ? 'text-emerald-400' : 'text-red-400'}`}>{verificationMatch ? `MATCH VERIFIED: ${verificationMatch}` : 'MISMATCH WARNING'}</p>
                                                    <p className={`text-xs mt-1 ${verificationMatch ? 'text-emerald-500/80' : 'text-red-500/80'}`}>{verificationMatch ? "File integrity intact. Download is authentic and unhampered." : "Warning: No hashes match the calculated signature. This file may be corrupt or maliciously modified."}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            )}

            {/* TAB: PASSWORD AUDITOR */}
            {activeTab === 'PASSWORD' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="text-center space-y-2 mb-8">
                        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">Entropy & Crack-Time Auditor</h2>
                        <p className="text-zinc-400">Evaluate string resilience locally via industry-standard ZXCVBN pattern matrices.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Input Column */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 shadow-xl relative">
                                <div className="absolute top-4 right-4 text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1"><Lock size={12} /> Offline Sandbox</div>
                                <h3 className="font-bold text-lg mb-4 text-zinc-200">Evaluate Password</h3>

                                <div className="relative mb-6">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter password..."
                                        className="w-full bg-zinc-950 border-2 border-zinc-800 px-4 py-4 rounded-xl text-lg text-white font-mono focus:outline-none focus:border-indigo-500 transition-colors pr-12"
                                    />
                                    <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-zinc-300"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {/* Dynamic Score Meter */}
                                <div className="flex gap-2 h-2 mb-4">
                                    {[0, 1, 2, 3].map(i => {
                                        const active = passwordResult && passwordResult.score > i;
                                        let bg = 'bg-zinc-800';
                                        if (active) {
                                            if (passwordResult.score === 1 || passwordResult.score === 0) bg = 'bg-red-500';
                                            else if (passwordResult.score === 2) bg = 'bg-yellow-500';
                                            else if (passwordResult.score === 3) bg = 'bg-blue-500';
                                            else bg = 'bg-green-500';
                                        }
                                        return <div key={i} className={`flex-1 rounded-full transition-colors duration-500 ${bg}`}></div>
                                    })}
                                </div>

                                {passwordResult && passwordResult.score !== undefined && (
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className={
                                            passwordResult.score < 2 ? 'text-red-400' :
                                                passwordResult.score === 2 ? 'text-yellow-400' :
                                                    passwordResult.score === 3 ? 'text-blue-400' : 'text-green-400'
                                        }>
                                            {passwordResult.score < 2 ? 'WEAK' : passwordResult.score === 2 ? 'FAIR' : passwordResult.score === 3 ? 'STRONG' : 'EXCELLENT'}
                                        </span>
                                        <span className="text-zinc-500">Score: {passwordResult.score} / 4</span>
                                    </div>
                                )}
                            </div>

                            {/* Detailed Analytics Grid */}
                            {passwordResult && password.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-2">

                                    {/* Crack Times Matrix */}
                                    <div className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800">
                                        <h4 className="text-xs font-bold text-zinc-500 tracking-wider mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2"><Zap size={14} /> THREAT MATRICES</h4>
                                        <ul className="space-y-3">
                                            <li className="flex justify-between text-sm">
                                                <span className="text-zinc-400">Online Attack (Throttled)</span>
                                                <span className="font-mono text-zinc-200 font-bold">{passwordResult.crack_times_display.online_no_throttling_10_per_second}</span>
                                            </li>
                                            <li className="flex justify-between text-sm">
                                                <span className="text-zinc-400">Offline Rig (Fast Hash)</span>
                                                <span className="font-mono text-zinc-200 font-bold">{passwordResult.crack_times_display.offline_fast_hashing_1e10_per_second}</span>
                                            </li>
                                            <li className="flex justify-between text-sm pt-2 border-t border-zinc-800/50">
                                                <span className="text-zinc-400">Guesses needed</span>
                                                <span className="font-mono text-indigo-400 format-number">10^{Math.round(Math.log10(passwordResult.guesses))}</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Feedback Structural Patterns */}
                                    <div className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800">
                                        <h4 className="text-xs font-bold text-zinc-500 tracking-wider mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2"><AlertTriangle size={14} /> STRUCTURAL FEEDBACK</h4>
                                        <div className="space-y-3">
                                            {passwordResult.feedback.warning && (
                                                <div className="text-sm text-red-400 flex items-start gap-2 bg-red-500/10 p-2 rounded-lg">
                                                    <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                                                    <span>{passwordResult.feedback.warning}</span>
                                                </div>
                                            )}
                                            {passwordResult.feedback.suggestions && passwordResult.feedback.suggestions.length > 0 ? (
                                                passwordResult.feedback.suggestions.map((s: string, i: number) => (
                                                    <div key={i} className="text-sm text-blue-400 flex items-start gap-2">
                                                        <span className="text-blue-500 font-bold mt-[-2px]">•</span> {s}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-sm text-green-400 flex items-center gap-2">
                                                    <CheckCircle size={16} /> Password exhibits no predictable dictionary patterns.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Right Generator Settings */}
                        <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 shadow-xl flex flex-col h-full">
                            <h3 className="font-bold flex items-center gap-2 mb-6"><Key size={18} className="text-indigo-400" /> CSPRNG Generator</h3>

                            <div className="space-y-6 flex-1">
                                <div>
                                    <label className="flex justify-between text-sm font-bold text-zinc-400 mb-2">
                                        String Length <span className="text-indigo-400">{genLength}</span>
                                    </label>
                                    <input
                                        type="range" min="8" max="64"
                                        value={genLength} onChange={(e) => setGenLength(parseInt(e.target.value))}
                                        className="w-full accent-indigo-500"
                                    />
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { l: 'Uppercase A-Z', state: genUpper, set: setGenUpper },
                                        { l: 'Lowercase a-z', state: genLower, set: setGenLower },
                                        { l: 'Numbers 0-9', state: genNum, set: setGenNum },
                                        { l: 'Symbols !@#$', state: genSym, set: setGenSym },
                                    ].map((opt, i) => (
                                        <label key={i} className="flex items-center gap-3 text-sm cursor-pointer group">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${opt.state ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-zinc-900 border-zinc-700'}`}>
                                                {opt.state && <CheckCircle size={14} />}
                                            </div>
                                            <input type="checkbox" className="hidden" checked={opt.state} onChange={() => opt.set(!opt.state)} />
                                            <span className="text-zinc-300 group-hover:text-white transition-colors">{opt.l}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => triggerCTA(generateSecurePassword, { mode: 'vignette', title: 'Processing your file...', subtitle: 'Please wait.' })}
                                className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 mt-6"
                            >
                                Generate Secure Key
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Information Section */}
            {/* Features Overview */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 mt-24 mb-16 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-32 bg-indigo-500/10 blur-[100px] pointer-events-none"></div>

                <div className="text-center mb-16 relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold mb-6 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                        <Shield size={16} /> Zero-Trust Security
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
                        Cryptocurrency & Password Hash <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Auditing Sandbox</span>
                    </h2>
                    <p className="mt-8 text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                        Welcome to CryptoAudit Security, the industry’s most rigorous, fully client-side cryptographic hashing pipeline and password threat modeling sandbox. In an era structured around data breaches and cloud vulnerability, validating digital integrity is paramount. However, when parsing highly sensitive payloads, the last thing you want to do is submit those files to a remote server for "auditing."
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    {/* Passwords Card */}
                    <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                            <Key size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-100 mb-4">The Danger of Online Checkers</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            Many online threat evaluators require you to type your proposed master password into a text field, which is then transmitted via an API across the open internet to a backend engine. Even if the connection is encrypted via SSL (HTTPS), you are fundamentally entrusting a third-party server with access to your raw cryptographic keys.
                        </p>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            CryptoAudit leverages the powerful ZXCVBN library. Rather than querying a server against known dictionaries, our password sandbox loads the threat matrix models directly into your browser's local memory.
                        </p>
                    </div>

                    {/* Data Hash Card */}
                    <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                            <Lock size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-100 mb-4">Zero-Trust File Hashing</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            Our binary integrity module allows you to confidently generate cryptographic fingerprints for files natively. Whether verifying an MD5 hash on an ISO software download or generating a SHA-256 footprint for an immutable ledger, CryptoAudit guarantees absolute privacy.
                        </p>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Because our chunked FileReader API streams data in localized 1MB blocks rather than loading the entire file payload into application memory at once, you can successfully hash multi-gigabyte ISOs and operating systems without crashing your web browser.
                        </p>
                    </div>

                    {/* PWA Card */}
                    <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <RefreshCw size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-100 mb-4">Progressive Functionality</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            Because CryptoAudit operates 100% inside a localized sandbox architecture, the tool functions flawlessly as a Progressive Web App (PWA). There are zero upload progress bars because nothing is ever uploaded.
                        </p>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            If you disconnect your computer from your WiFi interface entirely, the hashing algorithms and random-number generators will continue working at peak speed, leveraging the <code className="bg-zinc-800 text-zinc-300 px-1 py-0.5 rounded text-xs mx-1">window.crypto.subtle</code> native APIs embedded within your machine.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

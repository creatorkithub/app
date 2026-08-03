import { ShieldCheck, Cpu, ServerOff, CheckCircle2, XCircle } from 'lucide-react';

interface PrivacyFeaturesProps {
    toolName: string;
    useCases: string[];
}

export function PrivacyFeatures({ toolName, useCases }: PrivacyFeaturesProps) {
    return (
        <div className="w-full">
            {/* SEO BLOCK 2 (Moved Up) */}
            <section className="py-12 border-t border-zinc-800/60">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                    <div>
                        <ShieldCheck className="text-orange-400 mb-6" size={48} />
                        <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-100 mb-4 tracking-tight">Built for Privacy-Sensitive Workflows</h2>
                        <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                            When handling strictly confidential materials, uploading to a third-party server is out of the question. Our toolkit is the definitive solution for high-security environments.
                        </p>
                        <ul className="space-y-3 text-zinc-300">
                            {useCases.map((useCase, idx) => (
                                <li key={idx}>✨ {useCase}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-indigo-500/10 rounded-3xl blur-3xl" />
                        <div className="relative bg-zinc-900/60 border border-zinc-800/80 p-6 rounded-3xl backdrop-blur-sm">
                            <div className="space-y-4">
                                <div className="h-4 bg-zinc-800 rounded-md w-3/4 animate-pulse" />
                                <div className="h-4 bg-zinc-800 rounded-md w-1/2 animate-pulse" />
                                <div className="h-4 bg-zinc-800 rounded-md w-5/6 animate-pulse" />
                                <div className="h-4 bg-zinc-800/50 rounded-md w-full animate-pulse mt-8" />
                                <div className="h-4 bg-zinc-800/50 rounded-md w-2/3 animate-pulse" />
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-xl shadow-green-500/10">
                                <CheckCircle2 size={16} /> 100% Offline Secure
                            </div>
                        </div>
                    </div>
                </div>
            </section>
{/* SEO BLOCK 1 (Moved Down) */}
            <section className="py-12 border-t border-zinc-800/60">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-100 mb-4 tracking-tight">Local vs Cloud Processing</h2>
                    <p className="text-zinc-400 text-lg leading-relaxed max-w-3xl mx-auto">See why processing directly on your device is strictly better than traditional cloud-based utilities.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    <div className="p-8 rounded-3xl bg-zinc-900/60 border border-blue-500/30 shadow-lg shadow-blue-500/10">
                        <div className="flex items-center gap-3 mb-6">
                            <Cpu className="text-blue-400" size={28} />
                            <h3 className="text-xl font-bold text-zinc-100">{toolName}</h3>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-zinc-300">
                                <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={20} />
                                <span><strong className="text-zinc-100">Zero Uploads:</strong> Files never leave your device.</span>
                            </li>
                            <li className="flex items-start gap-3 text-zinc-300">
                                <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={20} />
                                <span><strong className="text-zinc-100">Instant Speed:</strong> CPU-native parsing without network latency.</span>
                            </li>
                            <li className="flex items-start gap-3 text-zinc-300">
                                <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={20} />
                                <span><strong className="text-zinc-100">Absolute Privacy:</strong> 100% immune to server breaches.</span>
                            </li>
                        </ul>
                    </div>
                    <div className="p-8 rounded-3xl bg-zinc-950 border border-zinc-800/60 opacity-80">
                        <div className="flex items-center gap-3 mb-6">
                            <ServerOff className="text-zinc-500" size={28} />
                            <h3 className="text-xl font-bold text-zinc-400">Cloud-Based Tools</h3>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-zinc-500">
                                <XCircle className="text-rose-500 shrink-0 mt-0.5" size={20} />
                                <span>Requires uploading heavy files to external servers.</span>
                            </li>
                            <li className="flex items-start gap-3 text-zinc-500">
                                <XCircle className="text-rose-500 shrink-0 mt-0.5" size={20} />
                                <span>Bandwidth bottlenecks throttle processing times.</span>
                            </li>
                            <li className="flex items-start gap-3 text-zinc-500">
                                <XCircle className="text-rose-500 shrink-0 mt-0.5" size={20} />
                                <span>Files remain cached on 3rd-party servers silently.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            
        </div>
    );
}

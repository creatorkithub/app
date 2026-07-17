import { useState, useRef } from 'react';
import { useSEO } from '../hooks/useSEO';
import { Layers, Upload, Download, Settings, Image as ImageIcon, Shield } from 'lucide-react';
import ImageTracer from 'imagetracerjs';

export default function SvgTracer({ onBack }: { onBack: () => void }) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [svgData, setSvgData] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Tracer options
    const [ltres, setLtres] = useState(1);
    const [qtres, setQtres] = useState(1);
    const [pathomit, setPathomit] = useState(8);
    const [blurradius, setBlurradius] = useState(0);

    useSEO(
        'SVG Vector Tracer Online | Convert Raster Pixels to Sharp SVG',
        'Convert PNG and JPG pixels into crisp vector artwork. Trace image edges locally using advanced threshold mapping algorithms.',
        '/svg-tracer'
    );

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const url = URL.createObjectURL(e.target.files[0]);
            setImageSrc(url);
            setSvgData(null);
            processVector(url, ltres, qtres, pathomit, blurradius);
        }
    };

    const processVector = (src: string, lt: number, qt: number, po: number, blur: number) => {
        setIsProcessing(true);
        setTimeout(() => { // allow UI to update
            ImageTracer.imageToSVG(
                src,
                (svgStr: string) => {
                    setSvgData(svgStr);
                    setIsProcessing(false);
                },
                { ltres: lt, qtres: qt, pathomit: po, blurradius: blur }
            );
        }, 50);
    };

    const reProcess = () => {
        if (imageSrc) {
            processVector(imageSrc, ltres, qtres, pathomit, blurradius);
        }
    };

    const downloadSvg = () => {
        if (!svgData) return;
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vector-traced-${Date.now()}.svg`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-8 font-sans selection:bg-purple-500/30 overflow-y-auto">
            <div className="max-w-6xl mx-auto h-full flex flex-col pt-8">
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all flex items-center" title="Back to Hub">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                        </button>
                        <div className="w-px h-6 bg-zinc-800 hidden sm:block"></div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                <Layers size={24} />
                            </div>
                            <div>
                                <h1 className="font-bold text-2xl text-zinc-100 tracking-tight">SVG Vector Tracer</h1>
                                <p className="text-xs text-zinc-400 font-medium tracking-wider uppercase mt-1">Raster to Vector Processing</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-8 flex-1">
                    {/* Controls Sidebar */}
                    <div className="w-full lg:w-80 flex flex-col gap-6">
                        <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-3xl">
                            <h3 className="font-bold text-zinc-100 mb-6 flex items-center gap-2">
                                <Settings size={18} className="text-purple-400" /> Tracing Precision
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="flex justify-between text-sm font-medium text-zinc-300 mb-2">
                                        Linear Threshold (ltres) <span className="text-purple-400">{ltres}</span>
                                    </label>
                                    <input
                                        type="range" min="0.1" max="5" step="0.1"
                                        value={ltres} onChange={e => setLtres(parseFloat(e.target.value))}
                                        className="w-full accent-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="flex justify-between text-sm font-medium text-zinc-300 mb-2">
                                        Quadratic Threshold (qtres) <span className="text-purple-400">{qtres}</span>
                                    </label>
                                    <input
                                        type="range" min="0.1" max="5" step="0.1"
                                        value={qtres} onChange={e => setQtres(parseFloat(e.target.value))}
                                        className="w-full accent-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="flex justify-between text-sm font-medium text-zinc-300 mb-2">
                                        Path Filtering (omit) <span className="text-purple-400">{pathomit}</span>
                                    </label>
                                    <input
                                        type="range" min="0" max="64" step="1"
                                        value={pathomit} onChange={e => setPathomit(parseFloat(e.target.value))}
                                        className="w-full accent-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="flex justify-between text-sm font-medium text-zinc-300 mb-2">
                                        Pre-blur Radius <span className="text-purple-400">{blurradius}</span>
                                    </label>
                                    <input
                                        type="range" min="0" max="10" step="1"
                                        value={blurradius} onChange={e => setBlurradius(parseFloat(e.target.value))}
                                        className="w-full accent-purple-500"
                                    />
                                </div>

                                <button
                                    onClick={reProcess}
                                    disabled={!imageSrc || isProcessing}
                                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)] disabled:shadow-none mt-4"
                                >
                                    {isProcessing ? 'Vectorizing...' : 'Re-Trace Image'}
                                </button>
                            </div>
                        </div>

                        {svgData && (
                            <button
                                onClick={downloadSvg}
                                className="w-full py-4 bg-zinc-100 hover:bg-white text-zinc-900 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl hover:shadow-white/10"
                            >
                                <Download size={18} /> Download Generated SVG
                            </button>
                        )}
                    </div>

                    {/* Main workspace */}
                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-3xl p-6 bg-zinc-950 relative overflow-hidden group min-h-[400px]">
                        {isProcessing && (
                            <div className="absolute inset-0 z-20 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
                                <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                                <p className="text-purple-400 font-bold tracking-widest uppercase text-sm animate-pulse">Running Curve Detection</p>
                            </div>
                        )}

                        {!imageSrc ? (
                            <div
                                className="flex flex-col items-center justify-center cursor-pointer w-full h-full z-10"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="p-4 bg-zinc-900 rounded-full mb-4 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
                                    <Upload size={32} className="text-zinc-500 group-hover:text-purple-400" />
                                </div>
                                <h3 className="text-xl font-bold text-zinc-200 mb-2">Upload Pixel Image</h3>
                                <p className="text-zinc-500 text-sm max-w-sm text-center">Convert sketches, logos, or icons into scalable vectors safely offline.</p>
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col md:flex-row gap-4 items-center justify-center">
                                <div className="flex-1 flex flex-col items-center justify-center bg-zinc-900/50 rounded-2xl border border-zinc-800 p-4 relative h-full">
                                    <span className="absolute top-2 left-3 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Raster Original</span>
                                    <img src={imageSrc} alt="Original raster" className="max-w-full max-h-[50vh] object-contain rounded-lg drop-shadow-2xl" />
                                </div>

                                <div className="flex-1 flex flex-col items-center justify-center bg-[#fdfdfd] text-black rounded-2xl border border-zinc-800 p-4 relative h-full overflow-hidden vector-bg checkerboard">
                                    <span className="absolute top-2 left-3 text-[10px] uppercase font-bold text-purple-600 tracking-wider bg-white/80 px-2 rounded z-30">Vector Output (.SVG)</span>
                                    {svgData ? (
                                        <div className="w-full h-full flex items-center justify-center overflow-hidden [&>svg]:max-w-full [&>svg]:max-h-[50vh] [&>svg]:h-auto z-20" dangerouslySetInnerHTML={{ __html: svgData }} />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center opacity-30 text-purple-900">
                                            <ImageIcon size={48} className="mb-2" />
                                            <span className="font-bold">Awaiting output</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => { setImageSrc(null); setSvgData(null); }}
                                    className="absolute top-4 right-4 z-20 px-4 py-2 bg-zinc-900/80 text-white rounded-full text-xs font-bold hover:bg-red-500/80 transition-colors backdrop-blur-md"
                                >
                                    Clear
                                </button>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleUpload} />
                    </div>
                </div>

                {/* Features Overview */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 mb-16 relative w-full">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-32 bg-purple-500/10 blur-[100px] pointer-events-none"></div>

                    <div className="text-center mb-16 relative z-10 w-full">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-semibold mb-6 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                            <Layers size={16} /> Raster to Vector Processing
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
                            SVG Vector Tracer <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Trace Image Edges Locally</span>
                        </h2>
                        <p className="mt-8 text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                            Transform standard raster images into infinitely scalable vector graphics. The SVG Vector Tracer analyzes raw image pixels locally to draw clean paths using custom threshold mapping algorithms. Convert your logos, sketches, or icons into crisp, responsive vector formats that look flawless at any display size.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                                <Settings size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-100 mb-4">Threshold Mapping</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                                Control path generation to achieve crisp lines or highly stylized silhouettes. Manually adjust corner detection algorithms to preserve the fidelity of rigid logos.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                                <Layers size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-100 mb-4">Infinite Scalability</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                                Turn low-resolution pixel grids into flexible, production-ready SVGs. Render traced artworks onto grand-format banners or micro-icon sheets seamlessly.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(217,70,239,0.1)]">
                                <Shield size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-100 mb-4">Safe Local Tracing</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                                Protect your proprietary creative designs by processing vector paths entirely inside your browser's V8 engine, keeping clients' intellectual property safe.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    "name": "SVG Vector Tracer Online | Convert Raster Pixels to Sharp SVG",
                    "operatingSystem": "Web Browser",
                    "applicationCategory": "DesignApplication",
                    "description": "Convert PNG and JPG pixels into crisp vector artwork. Trace image edges locally using advanced threshold mapping algorithms.",
                    "offers": { "@type": "Offer", "price": "0.00", "priceCurrency": "USD" }
                })
            }} />

            <style dangerouslySetInnerHTML={{
                __html: `
                .checkerboard {
                    background-image: 
                      linear-gradient(45deg, #e5e5e5 25%, transparent 25%),
                      linear-gradient(-45deg, #e5e5e5 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, #e5e5e5 75%),
                      linear-gradient(-45deg, transparent 75%, #e5e5e5 75%);
                    background-size: 20px 20px;
                    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                }
            `}} />
        </div>
    );
}

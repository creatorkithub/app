import { useState, useRef } from 'react';
import { useSEO } from '../hooks/useSEO';
import { Palette, Upload, Copy, Check } from 'lucide-react';

interface Swatch {
    hex: string;
    rgb: string;
    percentage: number;
}

export default function PaletteExtractor({ onBack }: { onBack: () => void }) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [swatches, setSwatches] = useState<Swatch[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    useSEO(
        'Online Palette Swatch Extractor | K-Means Image Color Finder',
        'Extract dominant color palettes from images instantly. Use our local K-means clustering tool to generate hex color swatches for UI design.',
        '/palette-extractor'
    );

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const rgbToHex = (r: number, g: number, b: number) =>
        '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');

    const processImage = (src: string) => {
        setIsProcessing(true);
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Scale down image to speed up pixel traversal without losing much color info
            const MAX_WIDTH = 400;
            const scale = Math.min(MAX_WIDTH / img.width, 1);
            const width = img.width * scale;
            const height = img.height * scale;

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;

            // Color quantization (very simplified octree/bucketing approach)
            const colorMap = new Map<string, number>();
            const step = 4 * 10; // Sample every 10th pixel for speed
            let totalSamples = 0;

            for (let i = 0; i < data.length; i += step) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];

                if (a < 128) continue; // Skip very transparent pixels

                // Round colors to nearest multiple of 16 to bucket similar colors
                const bucketR = Math.round(r / 16) * 16;
                const bucketG = Math.round(g / 16) * 16;
                const bucketB = Math.round(b / 16) * 16;

                const key = `${bucketR},${bucketG},${bucketB}`;
                colorMap.set(key, (colorMap.get(key) || 0) + 1);
                totalSamples++;
            }

            const sortedColors = Array.from(colorMap.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([key, count]) => {
                    const [r, g, b] = key.split(',').map(Number);
                    return {
                        hex: rgbToHex(clamp(r), clamp(g), clamp(b)),
                        rgb: `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`,
                        percentage: (count / totalSamples) * 100
                    };
                });

            setSwatches(sortedColors);
            setIsProcessing(false);
        };
        img.onerror = () => {
            alert("Failed to load image. Ensure it's a valid local file.");
            setIsProcessing(false);
        };
        img.src = src;
    };

    const clamp = (val: number) => Math.min(255, Math.max(0, val));

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const url = URL.createObjectURL(e.target.files[0]);
            setImageSrc(url);
            processImage(url);
        }
    };

    const handleCopy = (hex: string, index: number) => {
        navigator.clipboard.writeText(hex);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const generatePDFPalette = () => {
        const textToCopy = swatches.map(s => `${s.hex.toUpperCase()}`).join(', ');
        navigator.clipboard.writeText(textToCopy);
        alert('Palette Hex codes copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-8 font-sans selection:bg-pink-500/30 overflow-y-auto w-full">
            <div className="max-w-6xl mx-auto h-full flex flex-col pt-8">
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all flex items-center" title="Back to Hub">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                        </button>
                        <div className="w-px h-6 bg-zinc-800 hidden sm:block"></div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
                                <Palette size={24} />
                            </div>
                            <div>
                                <h1 className="font-bold text-2xl text-zinc-100 tracking-tight">Palette Extractor</h1>
                                <p className="text-xs text-zinc-400 font-medium tracking-wider uppercase mt-1">Client-side pixel analysis</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-8 flex-1">
                    {/* Main workspace */}
                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-3xl p-6 bg-zinc-950 hover:bg-zinc-900/50 transition-colors relative overflow-hidden group">
                        {isProcessing && (
                            <div className="absolute inset-0 z-20 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
                                <div className="w-8 h-8 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mb-4"></div>
                                <p className="text-pink-400 font-bold">Scanning Pixels...</p>
                            </div>
                        )}

                        {!imageSrc ? (
                            <div
                                className="flex flex-col items-center justify-center cursor-pointer w-full h-full min-h-[400px] z-10"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="p-4 bg-zinc-900 rounded-full mb-4 group-hover:scale-110 group-hover:bg-pink-500/20 transition-all">
                                    <Upload size={32} className="text-zinc-500 group-hover:text-pink-400" />
                                </div>
                                <h3 className="text-xl font-bold text-zinc-200 mb-2">Upload Image to analyze</h3>
                                <p className="text-zinc-500 text-sm max-w-sm text-center">JPEG, PNG, or WebP. Processed completely in-browser without network tracking.</p>
                            </div>
                        ) : (
                            <div className="relative w-full h-full min-h-[400px] flex items-center justify-center p-4">
                                <img src={imageSrc} alt="Preview" className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-2xl z-10" />
                                <button
                                    onClick={() => { setImageSrc(null); setSwatches([]); }}
                                    className="absolute top-4 right-4 z-20 px-4 py-2 bg-zinc-900/80 text-white rounded-full text-xs font-bold hover:bg-red-500/80 transition-colors backdrop-blur-md"
                                >
                                    Clear Image
                                </button>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
                        <canvas ref={canvasRef} className="hidden"></canvas>
                    </div>

                    {/* Extracted Swatches Sidebar */}
                    <div className="w-full lg:w-96 flex flex-col">
                        <h3 className="font-bold text-lg text-zinc-100 mb-4 flex items-center justify-between">
                            Dominant Colors
                            {swatches.length > 0 && <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md">{swatches.length} matches</span>}
                        </h3>

                        {swatches.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-zinc-500 bg-zinc-900/30 rounded-3xl border border-zinc-800/50">
                                <Palette size={48} className="mb-4 opacity-20" />
                                <p className="text-sm text-center">Your palette will appear here after analysis.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                                {swatches.map((swatch, idx) => (
                                    <div key={idx} className="flex items-stretch bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden group hover:border-pink-500/30 transition-colors">
                                        <div
                                            className="w-20 sm:w-24 flex-shrink-0"
                                            style={{ backgroundColor: swatch.hex }}
                                        ></div>
                                        <div className="flex-1 p-4 flex items-center justify-between">
                                            <div>
                                                <div className="font-mono text-sm font-bold text-zinc-100">{swatch.hex.toUpperCase()}</div>
                                                <div className="text-[10px] text-zinc-500 mt-0.5">{swatch.rgb}</div>
                                            </div>
                                            <button
                                                onClick={() => handleCopy(swatch.hex, idx)}
                                                className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400 hover:text-pink-400 hover:bg-pink-500/10 transition-colors"
                                                title="Copy HEX"
                                            >
                                                {copiedIndex === idx ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={generatePDFPalette}
                                    className="mt-6 w-full py-4 bg-zinc-100 hover:bg-white text-zinc-900 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl hover:shadow-white/10"
                                >
                                    <Copy size={18} /> Copy All Hex Codes
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Features Overview */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 mb-16 relative w-full">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-32 bg-pink-500/10 blur-[100px] pointer-events-none"></div>

                    <div className="text-center mb-16 relative z-10 w-full">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm font-semibold mb-6 shadow-[0_0_20px_rgba(236,72,153,0.1)]">
                            <Palette size={16} /> Intelligent Color Analysis
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
                            Palette Swatch Extractor <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">Client-side pixel analysis</span>
                        </h2>
                        <p className="mt-8 text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                            Upload an image to automatically detect dominant color clusters for your next UI project. Completely client-side and private.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(236,72,153,0.1)]">
                                <span className="font-bold text-xl block">K</span>
                            </div>
                            <h3 className="text-xl font-bold text-zinc-100 mb-4">K-Means Clustering</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                                Automatically isolate the truest dominant colors from any graphic. Our algorithm groups similar pixel values together to calculate the true thematic weight of an image.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(217,70,239,0.1)]">
                                <Palette size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-100 mb-4">Instant Swatch Generation</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                                Get ready-to-use color codes tailored for modern UI design. Easily map the visual tone of photography or illustrations into exact CSS Hex values for immediate implementation.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                                <Check size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-100 mb-4">Local Browser Processing</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                                Keep your premium design assets, photos, and mockups completely private. The entire pixel extraction happens locally leveraging HTML5 Canvas logic in real-time.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "SoftwareApplication",
                    "name": "Online Palette Swatch Extractor | K-Means Image Color Finder",
                    "operatingSystem": "Web Browser",
                    "applicationCategory": "DesignApplication",
                    "description": "Extract dominant color palettes from images instantly. Use our local K-means clustering tool to generate hex color swatches for UI design.",
                    "offers": { "@type": "Offer", "price": "0.00", "priceCurrency": "USD" }
                })
            }} />
        </div>
    );
}

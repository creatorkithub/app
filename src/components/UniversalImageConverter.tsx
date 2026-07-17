import { useState, useRef, useEffect } from 'react';
import { useSEO } from '../hooks/useSEO';
import { useAdContext } from '../contexts/AdContext';
import { Upload, X, Loader2, Download, Settings, Image as ImageIcon, CheckCircle, Zap, Shield, WifiOff } from 'lucide-react';
import JSZip from 'jszip';
import heic2any from 'heic2any';
import * as UTIF from 'utif';
import { readPsd } from 'ag-psd';

interface ProcessedFile {
    id: string;
    originalFile: File;
    name: string;
    status: 'pending' | 'processing' | 'success' | 'failed';
    progress: number;
    resultBlob?: Blob;
    resultUrl?: string;
    errorMsg?: string;
}

export default function UniversalImageConverter() {
    const { triggerCTA } = useAdContext();
    const [files, setFiles] = useState<ProcessedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [mode, setMode] = useState<'TO_JPG' | 'JPG_TO_OTHER'>('TO_JPG');
    const [targetFormat, setTargetFormat] = useState<'png' | 'webp' | 'gif'>('png');
    const [quality, setQuality] = useState(90);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useSEO({
        title: 'Universal Image Converter',
        description: 'Convert arrays of images completely offline.',
        canonical: '/image-converter'
    });

    const handleFiles = (newFiles: FileList | File[]) => {
        const validExtensions = ['png', 'jpg', 'jpeg', 'webp', 'heic', 'psd', 'tif', 'tiff', 'gif'];
        const added = Array.from(newFiles)
            .filter(f => {
                const ext = f.name.split('.').pop()?.toLowerCase() || '';
                return validExtensions.includes(ext);
            })
            .map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                originalFile: file,
                name: file.name,
                status: 'pending' as const,
                progress: 0,
            }));

        setFiles(prev => [...prev, ...added]);
    };

    const removeFile = (id: string) => {
        setFiles(prev => {
            const file = prev.find(f => f.id === id);
            if (file?.resultUrl) URL.revokeObjectURL(file.resultUrl);
            return prev.filter(f => f.id !== id);
        });
    };

    const clearAll = () => {
        files.forEach(f => {
            if (f.resultUrl) URL.revokeObjectURL(f.resultUrl);
        });
        setFiles([]);
    };

    const processFiles = async () => {
        setIsProcessing(true);

        const currentFiles = [...files];

        for (let i = 0; i < currentFiles.length; i++) {
            if (currentFiles[i].status === 'success') continue; // Skip already done

            setFiles(prev => prev.map(f => f.id === currentFiles[i].id ? { ...f, status: 'processing', progress: 10 } : f));

            try {
                const file = currentFiles[i].originalFile;
                const ext = file.name.split('.').pop()?.toLowerCase() || '';

                let sourceCanvas = document.createElement('canvas');
                let sourceCtx = sourceCanvas.getContext('2d');

                if (ext === 'psd') {
                    const buffer = await file.arrayBuffer();
                    const psd = readPsd(buffer);
                    if (psd.canvas) {
                        sourceCanvas = psd.canvas as HTMLCanvasElement;
                    } else {
                        throw new Error("Failed to render PSD layers");
                    }
                }
                else if (ext === 'heic') {
                    const blobRes = await heic2any({ blob: file, toType: 'image/jpeg', quality: 1 });
                    const blob = Array.isArray(blobRes) ? blobRes[0] : blobRes;
                    const img = new Image();
                    img.src = URL.createObjectURL(blob);
                    await new Promise(r => img.onload = r);
                    sourceCanvas.width = img.width;
                    sourceCanvas.height = img.height;
                    sourceCtx?.drawImage(img, 0, 0);
                    URL.revokeObjectURL(img.src);
                }
                else if (ext === 'tif' || ext === 'tiff') {
                    const buffer = await file.arrayBuffer();
                    const ifds = UTIF.decode(buffer);
                    UTIF.decodeImage(buffer, ifds[0]);
                    const rgba = UTIF.toRGBA8(ifds[0]);
                    sourceCanvas.width = ifds[0].width;
                    sourceCanvas.height = ifds[0].height;
                    const imgData = new ImageData(new Uint8ClampedArray(rgba), sourceCanvas.width, sourceCanvas.height);
                    sourceCtx?.putImageData(imgData, 0, 0);
                }
                else {
                    const img = new Image();
                    img.src = URL.createObjectURL(file);
                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = () => reject(new Error("Corrupted or unsupported format"));
                    });
                    sourceCanvas.width = img.width;
                    sourceCanvas.height = img.height;
                    sourceCtx?.drawImage(img, 0, 0);
                    URL.revokeObjectURL(img.src);
                }

                setFiles(prev => prev.map(f => f.id === currentFiles[i].id ? { ...f, progress: 60 } : f));

                const exportCanvas = document.createElement('canvas');
                exportCanvas.width = sourceCanvas.width;
                exportCanvas.height = sourceCanvas.height;
                const exportCtx = exportCanvas.getContext('2d');

                exportCtx!.fillStyle = "#ffffff";
                exportCtx!.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
                exportCtx!.drawImage(sourceCanvas, 0, 0);

                const mimeType = mode === 'TO_JPG' ? 'image/jpeg' : `image/${targetFormat}`;
                const compressionQuality = quality / 100;

                setFiles(prev => prev.map(f => f.id === currentFiles[i].id ? { ...f, progress: 90 } : f));

                const resultBlob = await new Promise<Blob>((resolve, reject) => {
                    exportCanvas.toBlob(b => {
                        if (b) resolve(b);
                        else reject(new Error("Canvas toBlob failed"));
                    }, mimeType, compressionQuality);
                });

                const resultUrl = URL.createObjectURL(resultBlob);

                setFiles(prev => prev.map(f => f.id === currentFiles[i].id ? {
                    ...f,
                    status: 'success',
                    progress: 100,
                    resultBlob: resultBlob,
                    resultUrl: resultUrl
                } : f));
            } catch (err: any) {
                setFiles(prev => prev.map(f => f.id === currentFiles[i].id ? {
                    ...f,
                    status: 'failed',
                    progress: 0,
                    errorMsg: err.message || 'Conversion failed'
                } : f));
            }
        }

        setIsProcessing(false);
    };

    const downloadAll = async () => {
        const successfulFiles = files.filter(f => f.status === 'success' && f.resultBlob);
        if (successfulFiles.length === 0) return;

        if (successfulFiles.length === 1) {
            // Single download
            const file = successfulFiles[0];
            const link = document.createElement('a');
            link.href = file.resultUrl!;
            // construct new name based on mode
            const ext = mode === 'TO_JPG' ? 'jpg' : targetFormat;
            link.download = file.name.replace(/\.[^/.]+$/, "") + `_converted.${ext}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } else {
            // Zip download
            const zip = new JSZip();
            const ext = mode === 'TO_JPG' ? 'jpg' : targetFormat;

            successfulFiles.forEach(f => {
                const newName = f.name.replace(/\.[^/.]+$/, "") + `_converted.${ext}`;
                zip.file(newName, f.resultBlob!);
            });

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Converted_Images_${Date.now()}.zip`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        }
    };

    const hasPending = files.some(f => f.status === 'pending');
    const hasSuccess = files.some(f => f.status === 'success');

    return (
        <div className="flex flex-col gap-12 text-zinc-100 h-full">
            <div className="flex flex-col md:flex-row gap-6 h-full">
                {/* Queue & Dropzone */}
                <div className="flex-1 flex flex-col min-w-0 bg-zinc-900/50 rounded-2xl border border-zinc-800/80 overflow-hidden relative">
                    {files.length === 0 ? (
                        <div
                            className={`flex-1 flex flex-col items-center justify-center p-8 transition-all duration-300 transform group ${isDragging ? 'bg-orange-500/10 border-orange-500/50 border-2 border-dashed scale-[1.02] shadow-[0_0_40px_rgba(249,115,22,0.2)]' : 'border-2 border-dashed border-zinc-800/80 hover:border-orange-500/50 hover:bg-zinc-800/60 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] cursor-pointer'
                                }`}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                handleFiles(e.dataTransfer.files);
                            }}
                        >
                            <div className="p-4 bg-zinc-800 rounded-2xl mb-4 group hover:bg-orange-500/20 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="w-8 h-8 text-zinc-400 group-hover:text-orange-400 transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Upload Files</h3>
                            <p className="text-zinc-500 text-sm text-center max-w-sm mb-4">
                                Drag and drop standard imagery, HEIC, TIFF, or PSD files arrays here to batch convert.
                            </p>

                            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-full text-xs font-medium border border-green-500/20 mb-6 shadow-inner">
                                <CheckCircle size={14} />
                                100% Private. Processed locally, never uploaded.
                            </div>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
                            >
                                Browse Files
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,.heic,.psd,.tif,.tiff" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col p-4 relative"
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
                            }}
                        >
                            {isDragging && (
                                <div className="absolute inset-0 z-50 rounded-2xl border-2 border-orange-500 border-dashed bg-orange-500/10 pointer-events-none flex items-center justify-center">
                                    <p className="text-orange-400 font-bold text-xl px-6 py-3 bg-zinc-900 rounded-xl shadow-lg">Drop images to append</p>
                                </div>
                            )}
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-zinc-200">Queue ({files.length})</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isProcessing}
                                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-lg text-sm font-medium flex items-center gap-2"
                                    >
                                        <Upload size={14} /> Add More
                                    </button>
                                    <button
                                        onClick={clearAll}
                                        disabled={isProcessing}
                                        className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50 rounded-lg text-sm font-medium"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto min-h-0 pr-2 custom-scrollbar space-y-2">
                                {files.map(f => (
                                    <div key={f.id} className="bg-zinc-950 rounded-xl p-3 flex items-center gap-3 border border-zinc-800/50">
                                        <div className="h-10 w-10 bg-zinc-900 rounded-lg flex items-center justify-center text-zinc-500 flex-shrink-0">
                                            {f.status === 'success' && f.resultUrl ? (
                                                <img src={f.resultUrl} className="w-full h-full object-cover rounded-lg" alt="" />
                                            ) : (
                                                <ImageIcon size={18} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <p className="font-medium text-sm text-zinc-200 truncate pr-4">{f.name}</p>
                                                {f.status === 'success' && <span className="text-xs text-green-400 font-medium">Done</span>}
                                                {f.status === 'failed' && <span className="text-xs text-red-400 font-medium truncate">Failed</span>}
                                            </div>
                                            {f.status === 'processing' ? (
                                                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${f.progress}%` }}></div>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-zinc-500">{(f.originalFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => removeFile(f.id)}
                                            disabled={isProcessing}
                                            className="p-2 text-zinc-500 hover:text-red-400 disabled:opacity-50 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,.heic,.psd,.tif,.tiff" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
                        </div>
                    )}
                </div>

                {/* Settings Panel */}
                <div className="w-full md:w-80 bg-zinc-900/50 rounded-2xl border border-zinc-800/80 p-6 flex flex-col">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Settings size={20} className="text-orange-400" /> Convert Settings
                    </h3>

                    <div className="space-y-6 flex-1">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Operation Mode</label>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => setMode('TO_JPG')}
                                    className={`py-2 px-3 text-sm font-medium rounded-lg border text-left transition-colors ${mode === 'TO_JPG' ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' : 'border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                                        }`}
                                >
                                    Everything to JPG
                                </button>
                                <button
                                    onClick={() => setMode('JPG_TO_OTHER')}
                                    className={`py-2 px-3 text-sm font-medium rounded-lg border text-left transition-colors ${mode === 'JPG_TO_OTHER' ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' : 'border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                                        }`}
                                >
                                    Convert JPG to target format
                                </button>
                            </div>
                        </div>

                        <div className={mode === 'TO_JPG' ? 'opacity-50 pointer-events-none' : ''}>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Target Format</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['png', 'webp', 'gif'] as const).map(fmt => (
                                    <button
                                        key={fmt}
                                        onClick={() => setTargetFormat(fmt)}
                                        className={`py-2 text-sm uppercase font-medium rounded-lg border transition-colors ${targetFormat === fmt ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' : 'border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                                            }`}
                                    >
                                        {fmt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="block text-sm font-medium text-zinc-400">Quality / Compression</label>
                                <span className="text-xs font-bold text-orange-400">{quality}%</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="100"
                                value={quality}
                                onChange={(e) => setQuality(Number(e.target.value))}
                                className="w-full accent-orange-500"
                            />
                            <p className="text-xs text-zinc-500 mt-2">Applies to JPG and WEBP encoding.</p>
                        </div>
                    </div>

                    {hasPending ? (
                        <button
                            onClick={processFiles}
                            disabled={isProcessing}
                            className="mt-8 w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                        >
                            {isProcessing ? (
                                <><Loader2 className="animate-spin" size={20} /> Processing...</>
                            ) : (
                                <><ImageIcon size={20} /> Convert All</>
                            )}
                        </button>
                    ) : hasSuccess ? (
                        <button
                            onClick={() => triggerCTA(downloadAll, { mode: 'vignette', title: 'Processing your file...', subtitle: 'Please wait.' })}
                            className="mt-8 w-full py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                        >
                            <Download size={20} /> Download Batch
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Features Overview */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 mb-16 relative w-full">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-32 bg-orange-500/10 blur-[100px] pointer-events-none"></div>

                <div className="text-center mb-16 relative z-10 w-full">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-semibold mb-6 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                        <ImageIcon size={16} /> Digital Imagery Workstation
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
                        Universal Image Converter <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">100% Client-Side Transcoder</span>
                    </h2>
                    <p className="mt-8 text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                        Welcome to the Universal Image Converter, an enterprise-grade digital imagery manipulation powerhouse that runs exclusively within the confines of your own desktop or mobile browser. Say goodbye to the era of slowly uploading gigantic proprietary TIFF scans or bulky Photoshop PSD layouts to an unstable web server just to get a lightweight thumbnail.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                        <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                            <Shield size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-100 mb-4">Why Native Processing Triumphs</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            Legacy file conversion utilities essentially act as middle-men. You hand over your sensitive personal photos, the external server transcodes it using software like ImageMagick, and you download the result. This structure is inherently dangerous for unreleased agency assets.
                        </p>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Our converter leverages the HTML5 Canvas API in absolute tandem with bleeding-edge JavaScript polyfills and WebAssembly to reconstruct file headers on your own device.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                            <Zap size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-100 mb-4">Rasterizing PSD & HEIC Locally</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            The most impressive feat of our offline ecosystem is its ability to destruct proprietary vectors natively. Apple's HEIC format has long frustrated users, but our specialized decoding buffers deconstruct those HEIC files locally in milliseconds.
                        </p>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Similarly, instead of firing up a heavy desktop suite, our converter instantly rasterizes the flat layers of Adobe Photoshop (PSD) compositions inside your browser memory cache.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <WifiOff size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-100 mb-4">Unrestricted Offline Conversion</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            The entire Universal Image Converter pipeline is offline-first. As a fully integrated Progressive Web Application (PWA), you can batch-transcode hundreds of large-format files simultaneously while completely isolated from the internet.
                        </p>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            The conversion speed is constrained purely by the strength of your device processor because we eliminate all upload latency from the algorithmic loop.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

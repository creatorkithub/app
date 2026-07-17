import { useState, useRef, useEffect } from 'react';
import { useSEO } from '../hooks/useSEO';
import { useAdContext } from '../contexts/AdContext';
import { X, Shield, MapPin, Camera, Clock, AlertTriangle, CheckCircle, Loader2, Download, Settings2, Ghost, Lock, Zap } from 'lucide-react';
import ExifReader from 'exifreader';
import JSZip from 'jszip';

interface PrivaFile {
    id: string;
    originalFile: File;
    name: string;
    size: number;
    status: 'pending' | 'scrubbing' | 'clean' | 'error';
    metadata: any | null;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
    cleanUrl?: string;
    cleanBlob?: Blob;
}

export default function PrivaShield() {
    const { triggerCTA } = useAdContext();
    const [files, setFiles] = useState<PrivaFile[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [scrubMethod, setScrubMethod] = useState<'LOSSLESS' | 'CANVAS'>('LOSSLESS');
    const [activeTab, setActiveTab] = useState<'LOCATION' | 'CAMERA' | 'TIMELINE'>('LOCATION');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useSEO({
        title: 'PrivaShield EXIF Editor',
        description: 'Remove EXIF data offline instantly.',
        canonical: '/privashield'
    });

    const checkMetadata = async (file: File): Promise<{ meta: any, risk: 'LOW' | 'MEDIUM' | 'HIGH' }> => {
        try {
            const buffer = await file.arrayBuffer();
            const tags = ExifReader.load(buffer);
            let rawRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

            // Check for severe markers
            if (tags['GPSLatitude'] || tags['GPSLongitude']) {
                rawRisk = 'HIGH';
            } else if (
                tags['Model'] ||
                tags['Make'] ||
                tags['SerialNumber'] ||
                tags['DateTimeOriginal'] ||
                tags['Software'] ||
                tags['Creator'] ||
                tags['Artist']
            ) {
                rawRisk = 'MEDIUM';
            }

            return { meta: tags, risk: rawRisk };
        } catch (err) {
            // Failed to parse means it likely has no EXIF or a stripped header.
            return { meta: null, risk: 'LOW' };
        }
    };

    const handleFiles = async (newFiles: FileList | File[]) => {
        const validExtensions = ['png', 'jpg', 'jpeg', 'webp'];
        const validFiles = Array.from(newFiles).filter(f => validExtensions.includes(f.name.split('.').pop()?.toLowerCase() || ''));

        for (const file of validFiles) {
            const id = Math.random().toString(36).substring(2, 9);
            // Append as pending
            setFiles(prev => [...prev, {
                id,
                originalFile: file,
                name: file.name,
                size: file.size,
                status: 'pending',
                metadata: null,
                riskLevel: 'UNKNOWN'
            }]);

            // Async parse metadata immediately
            const { meta, risk } = await checkMetadata(file);
            setFiles(prev => prev.map(f => f.id === id ? { ...f, metadata: meta, riskLevel: risk } : f));

            // Auto focus if it's the first file
            setActiveId(prev => prev || id);
        }
    };

    const removeFile = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setFiles(prev => {
            const file = prev.find(f => f.id === id);
            if (file?.cleanUrl) URL.revokeObjectURL(file.cleanUrl);
            const next = prev.filter(f => f.id !== id);
            if (activeId === id) setActiveId(next.length > 0 ? next[0].id : null);
            return next;
        });
    };

    const performLosslessScrub = async (file: File): Promise<Blob> => {
        const arrayBuffer = await file.arrayBuffer();
        const dataView = new DataView(arrayBuffer);
        const uint8Array = new Uint8Array(arrayBuffer);

        if (dataView.getUint16(0) !== 0xFFD8) {
            throw new Error("Not a valid JPEG");
        }

        const cleanChunks: Uint8Array[] = [];
        let offset = 2; // Skip FFD8

        // Start block
        cleanChunks.push(new Uint8Array([0xFF, 0xD8]));

        while (offset < dataView.byteLength) {
            if (dataView.getUint8(offset) !== 0xFF) {
                // If not FF, we're likely in the image scan data; break and copy the rest
                break;
            }

            const marker = dataView.getUint16(offset);
            if (marker === 0xFFDA) {
                // Start of image data, break and copy remainder
                break;
            }

            const length = dataView.getUint16(offset + 2);

            // 0xFFE1 (APP1) is EXIF. 0xFFE2-FFE0 is also APP segments. We can strip E1 specifically, or generally APP segments.
            // Let's strip APP1 (EXIF) and APP13 (IPTC/Photoshop) to be safe.
            if (marker === 0xFFE1 /* EXIF/XMP */ || marker === 0xFFE2 || marker === 0xFFE0 || marker === 0xFFED /* Photoshop */) {
                // Skip marker
            } else {
                // Keep marker
                cleanChunks.push(uint8Array.slice(offset, offset + 2 + length));
            }
            offset += 2 + length;
        }

        // Add the rest of the file
        cleanChunks.push(uint8Array.slice(offset));

        // Calculate total size and combine
        let totalLen = 0;
        cleanChunks.forEach(c => totalLen += c.length);
        const unified = new Uint8Array(totalLen);
        let ptr = 0;
        cleanChunks.forEach(c => {
            unified.set(c, ptr);
            ptr += c.length;
        });

        return new Blob([unified], { type: 'image/jpeg' });
    };

    const performCanvasScrub = async (file: File): Promise<Blob> => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.src = url;
        await new Promise((r, reject) => { img.onload = r; img.onerror = reject; });
        URL.revokeObjectURL(url);

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);

        return await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(blob => {
                if (blob) resolve(blob);
                else reject(new Error("Canvas Export Failed"));
            }, file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.95);
        });
    };

    const processFiles = async () => {
        setIsProcessing(true);
        const currentFiles = [...files];

        for (let i = 0; i < currentFiles.length; i++) {
            if (currentFiles[i].status === 'clean') continue;

            setFiles(prev => prev.map(f => f.id === currentFiles[i].id ? { ...f, status: 'scrubbing' } : f));

            try {
                const targetFile = currentFiles[i].originalFile;
                const ext = targetFile.name.split('.').pop()?.toLowerCase();

                let resultBlob: Blob;

                // Lossless only realistically works reliably on standard JPEGs via our APP1 block parser.
                // For PNGs/Webp, Canvas scrub is significantly safer as a universal hammer.
                if (scrubMethod === 'LOSSLESS' && (ext === 'jpg' || ext === 'jpeg')) {
                    resultBlob = await performLosslessScrub(targetFile);
                } else {
                    resultBlob = await performCanvasScrub(targetFile);
                }

                // Verify the result is clean
                const verifyCheck = await checkMetadata(new File([resultBlob], 'check.jpg'));
                if (verifyCheck.risk !== 'LOW') {
                    throw new Error("Stripping failed to remove metadata completely.");
                }

                const cleanUrl = URL.createObjectURL(resultBlob);

                setFiles(prev => prev.map(f => f.id === currentFiles[i].id ? {
                    ...f,
                    status: 'clean',
                    cleanBlob: resultBlob,
                    cleanUrl: cleanUrl,
                    riskLevel: 'LOW',
                    metadata: null
                } : f));
            } catch (err: any) {
                setFiles(prev => prev.map(f => f.id === currentFiles[i].id ? { ...f, status: 'error' } : f));
            }
        }
        setIsProcessing(false);
    };

    const downloadAll = async () => {
        const cleanFiles = files.filter(f => f.status === 'clean' && f.cleanBlob);
        if (cleanFiles.length === 0) return;

        if (cleanFiles.length === 1) {
            const f = cleanFiles[0];
            const link = document.createElement('a');
            link.href = f.cleanUrl!;
            link.download = f.name.replace(/\.[^/.]+$/, "") + "_clean" + f.name.substring(f.name.lastIndexOf('.'));
            link.click();
        } else {
            const zip = new JSZip();
            cleanFiles.forEach(f => {
                zip.file(f.name.replace(/\.[^/.]+$/, "") + "_clean" + f.name.substring(f.name.lastIndexOf('.')), f.cleanBlob!);
            });
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `PrivaShield_Cleaned_${Date.now()}.zip`;
            link.click();
            URL.revokeObjectURL(url);
        }
    };

    const activeFileData = files.find(f => f.id === activeId);

    // Extract precise GPS variables from active file if present
    const parseGpsCoords = (tags: any) => {
        if (!tags || !tags['GPSLatitude'] || !tags['GPSLongitude']) return null;
        try {
            const lat = tags['GPSLatitude'].description;
            const lng = tags['GPSLongitude'].description;
            return { lat, lng };
        } catch { return null; }
    };

    const activeGps = parseGpsCoords(activeFileData?.metadata);

    return (
        <div className="flex flex-col gap-12 text-zinc-100 h-full">
            <div className="flex flex-col lg:flex-row gap-6 h-full">
                {/* Left Queue / Inspector */}
                <div className="w-full lg:w-1/2 flex flex-col gap-6 h-[80vh]">
                    {/* Dropzone & Queue Container */}
                    <div
                        className={`flex-shrink-0 min-h-[140px] flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all duration-300 transform group relative overflow-hidden cursor-pointer ${isDragging ? 'bg-indigo-500/10 border-indigo-500/50 scale-[1.02] shadow-[0_0_40px_rgba(99,102,241,0.2)]' : files.length > 0 ? 'bg-zinc-900 border-zinc-800' : 'bg-transparent border-zinc-700/50 hover:border-indigo-500/50 hover:bg-zinc-800/60 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] hover:-translate-y-1'
                            }`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}
                    >
                        {files.length === 0 ? (
                            <div className="flex flex-col items-center pointer-events-none text-center">
                                <Shield size={36} className="text-zinc-600 mb-3" />
                                <h3 className="text-lg font-bold">Drop files to Audit</h3>
                                <p className="text-sm text-zinc-500 max-w-sm mt-1">Accepts JPG, PNG, WEBP. Your files are processed entirely in memory.</p>
                                <button onClick={() => fileInputRef.current?.click()} className="mt-4 pointer-events-auto px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium">Browse Files</button>
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col absolute inset-0 p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-semibold text-zinc-300">File Audit Queue ({files.length})</h3>
                                    <button onClick={() => fileInputRef.current?.click()} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">+ Add Files</button>
                                </div>
                                <div className="flex-1 overflow-y-auto min-h-0 space-y-2 custom-scrollbar pr-2">
                                    {files.map(f => (
                                        <div
                                            key={f.id}
                                            onClick={() => setActiveId(f.id)}
                                            className={`p-3 rounded-xl border flex flex-col justify-center cursor-pointer transition-colors relative ${activeId === f.id ? 'bg-indigo-500/10 border-indigo-500/40' : 'bg-zinc-950/50 border-zinc-800/80 hover:bg-zinc-800/50'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium truncate pr-4">{f.name}</p>
                                                <div className="flex items-center gap-3">
                                                    {f.status === 'clean' && <CheckCircle size={16} className="text-green-500" />}
                                                    {f.riskLevel === 'HIGH' && f.status !== 'clean' && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>}
                                                    {f.riskLevel === 'MEDIUM' && f.status !== 'clean' && <div className="w-2 h-2 rounded-full bg-yellow-500"></div>}
                                                    {f.riskLevel === 'LOW' && f.status !== 'clean' && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                                                    <X size={16} className="text-zinc-500 hover:text-red-400" onClick={(e) => removeFile(f.id, e)} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" multiple accept=".jpg,.jpeg,.png,.webp" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
                    </div>

                    {/* Audit Inspector Panel */}
                    <div className="flex-1 bg-zinc-900/40 rounded-2xl border border-zinc-800/80 overflow-hidden flex flex-col">
                        <div className="bg-zinc-900/80 px-4 pt-4 border-b border-zinc-800 flex gap-4">
                            <button onClick={() => setActiveTab('LOCATION')} className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'LOCATION' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}><MapPin size={16} /> Location</button>
                            <button onClick={() => setActiveTab('CAMERA')} className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'CAMERA' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}><Camera size={16} /> Camera</button>
                            <button onClick={() => setActiveTab('TIMELINE')} className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'TIMELINE' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}><Clock size={16} /> Timeline</button>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                            {!activeFileData ? (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                                    <Ghost size={32} className="mb-2 opacity-50" />
                                    <p>Select a file to deep-scan metadata</p>
                                </div>
                            ) : activeFileData.metadata && Object.keys(activeFileData.metadata).length > 0 ? (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    {activeTab === 'LOCATION' && (
                                        <>
                                            {activeFileData.metadata['GPSLatitude'] || activeFileData.metadata['GPSLongitude'] ? (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900">
                                                        <span className="block text-xs font-bold text-zinc-500 mb-1">LATITUDE</span>
                                                        <span className="font-mono text-indigo-400">{activeFileData.metadata['GPSLatitude']?.description}</span>
                                                    </div>
                                                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900">
                                                        <span className="block text-xs font-bold text-zinc-500 mb-1">LONGITUDE</span>
                                                        <span className="font-mono text-indigo-400">{activeFileData.metadata['GPSLongitude']?.description}</span>
                                                    </div>
                                                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900">
                                                        <span className="block text-xs font-bold text-zinc-500 mb-1">ALTITUDE </span>
                                                        <span className="font-mono text-zinc-300">{activeFileData.metadata['GPSAltitude']?.description || 'N/A'}</span>
                                                    </div>
                                                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900">
                                                        <span className="block text-xs font-bold text-zinc-500 mb-1">DIRECTION</span>
                                                        <span className="font-mono text-zinc-300">{activeFileData.metadata['GPSImgDirection']?.description || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center text-green-400 bg-green-500/10 rounded-xl border border-green-500/20">
                                                    <CheckCircle className="mx-auto mb-2 opacity-80" />
                                                    <p className="font-medium">No GPS data found</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    {activeTab === 'CAMERA' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {[
                                                { k: 'Make', l: 'BRAND MAKE' },
                                                { k: 'Model', l: 'DEF MODEL' },
                                                { k: 'LensModel', l: 'LENS GLASS' },
                                                { k: 'FNumber', l: 'APERTURE' },
                                                { k: 'ExposureTime', l: 'SHUTTER' },
                                                { k: 'ISOSpeedRatings', l: 'ISO SENSITIVITY' },
                                            ].map((t, i) => (
                                                <div key={i} className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 flex flex-col justify-center">
                                                    <span className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">{t.l}</span>
                                                    <span className="font-mono text-zinc-300">{activeFileData.metadata[t.k]?.description || '--'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {activeTab === 'TIMELINE' && (
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900">
                                                <span className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">ORIGINAL CAPTURE TIMESTAMP</span>
                                                <span className="font-mono text-yellow-400">{activeFileData.metadata['DateTimeOriginal']?.description || '--'}</span>
                                            </div>
                                            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900">
                                                <span className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">DIGITIZED TIMESTAMP</span>
                                                <span className="font-mono text-zinc-300">{activeFileData.metadata['DateTimeDigitized']?.description || '--'}</span>
                                            </div>
                                            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900">
                                                <span className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">SOFTWARE / PROCESSOR</span>
                                                <span className="font-mono text-zinc-300">{activeFileData.metadata['Software']?.description || '--'}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-green-400 animate-in zoom-in-95 duration-500">
                                    <Shield size={48} className="mb-4 opacity-80" />
                                    <h4 className="text-lg font-bold">100% Clean Image</h4>
                                    <p className="text-zinc-500 text-sm mt-2">Zero EXIF, GPS, or identifying tags were detected.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Risk / Strip Control */}
                <div className="w-full lg:w-1/2 flex flex-col gap-6">

                    {/* Scorecard */}
                    <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 relative overflow-hidden">
                        <h2 className="text-xl font-bold mb-6 text-zinc-200">Live Privacy Profiler</h2>

                        {activeFileData ? (
                            <div className="flex gap-6 items-center">
                                <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
                                    {/* SVG Gauge Background */}
                                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                                        <circle cx="64" cy="64" r="56" stroke="CurrentColor" strokeWidth="12" fill="none" className="text-zinc-800" />
                                        <circle
                                            cx="64" cy="64" r="56" stroke="CurrentColor" strokeWidth="12" fill="none"
                                            strokeDasharray="351.8"
                                            strokeDashoffset={activeFileData.status === 'clean' ? '0' : activeFileData.riskLevel === 'HIGH' ? '0' : activeFileData.riskLevel === 'MEDIUM' ? '175.9' : '351.8'}
                                            className={`transition-all duration-1000 ease-out ${activeFileData.status === 'clean' ? 'text-green-500' : activeFileData.riskLevel === 'HIGH' ? 'text-red-500' : activeFileData.riskLevel === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500'}`}
                                        />
                                    </svg>

                                    <div className="text-center z-10 flex flex-col items-center">
                                        {activeFileData.status === 'clean' ? (
                                            <><Shield className="text-green-500" /> <span className="text-[10px] font-bold text-green-500 tracking-wider">CLEAN</span> </>
                                        ) : activeFileData.riskLevel === 'HIGH' ? (
                                            <><AlertTriangle className="text-red-500" /> <span className="text-[10px] font-bold text-red-500 tracking-wider">HIGH RISK</span> </>
                                        ) : activeFileData.riskLevel === 'MEDIUM' ? (
                                            <><AlertTriangle className="text-yellow-500" /> <span className="text-[10px] font-bold text-yellow-500 tracking-wider">MED RISK</span> </>
                                        ) : (
                                            <><Shield className="text-green-500" /> <span className="text-[10px] font-bold text-green-500 tracking-wider">SECURE</span> </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    {activeFileData.status === 'clean' ? (
                                        <p className="text-zinc-400 leading-relaxed">This file has been fully scrubbed and processed through our privacy layer. It is safe to share globally.</p>
                                    ) : activeFileData.riskLevel === 'HIGH' ? (
                                        <p className="text-red-400 font-medium leading-relaxed">WARNING: Exact GPS coordinates are currently embedded inside the raw EXIF block. Sharing this raw photo will broadcast your physical location.</p>
                                    ) : activeFileData.riskLevel === 'MEDIUM' ? (
                                        <p className="text-yellow-400 font-medium leading-relaxed">CAUTION: Unique hardware serial numbers, phone models, or precise capture timestamps are embedded and could be used for fingerprinting.</p>
                                    ) : (
                                        <p className="text-green-400 font-medium leading-relaxed">Safe. We could not find any standard tracking vectors in the source header.</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="py-10 text-center text-zinc-600">Select a file to generate its privacy profile.</div>
                        )}
                    </div>

                    {/* Map Preview */}
                    {activeGps && activeFileData?.status !== 'clean' && (
                        <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800/80 overflow-hidden relative group">
                            <div className="absolute top-4 left-4 z-10 bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-bold font-mono shadow-xl border border-white/20 backdrop-blur-md">
                                LOCATION EXPOSED
                            </div>
                            {/* Static OpenStreetMap embedding via iframe for visual demonstration of GPS leak */}
                            <iframe
                                width="100%"
                                height="200"
                                style={{ border: 0, opacity: 0.8, filter: 'grayscale(100%) invert(90%) hue-rotate(180deg)' }}
                                loading="lazy"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(activeGps.lng) - 0.01}%2C${parseFloat(activeGps.lat) - 0.01}%2C${parseFloat(activeGps.lng) + 0.01}%2C${parseFloat(activeGps.lat) + 0.01}&layer=mapnik&marker=${activeGps.lat}%2C${activeGps.lng}`}
                            ></iframe>
                        </div>
                    )}

                    {/* Config & Scrub Actions */}
                    <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 mt-auto">
                        <h3 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider flex items-center gap-2"><Settings2 size={16} /> Scrub Engine settings</h3>

                        <div className="flex bg-zinc-950 border border-zinc-800 p-1 rounded-xl mb-6">
                            <button
                                onClick={() => setScrubMethod('LOSSLESS')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${scrubMethod === 'LOSSLESS' ? 'bg-indigo-500 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Lossless Binary Purge
                            </button>
                            <button
                                onClick={() => setScrubMethod('CANVAS')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${scrubMethod === 'CANVAS' ? 'bg-indigo-500 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Canvas Max Scrub
                            </button>
                        </div>

                        <p className="text-xs text-zinc-500 mb-6 px-2">
                            {scrubMethod === 'LOSSLESS' ? 'Safely extracts the EXIF APP1 hex block from the array buffer, leaving compressed pixel headers 100% untouched.' : 'Draws the image onto an uncompressed canvas and exports a completely fresh blob structure (Safest for PNG/WEBP).'}
                        </p>

                        {files.some(f => f.status === 'clean') && !files.some(f => f.status !== 'clean') ? (
                            <button
                                onClick={() => triggerCTA(downloadAll, { mode: 'vignette', title: 'Processing your file...', subtitle: 'Please wait.' })}
                                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                            >
                                <Download size={20} /> Download Secured Package
                            </button>
                        ) : (
                            <button
                                disabled={isProcessing || files.length === 0}
                                onClick={() => triggerCTA(processFiles, { mode: 'vignette', title: 'Processing your file...', subtitle: 'Please wait.' })}
                                className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                            >
                                {isProcessing ? <><Loader2 className="animate-spin" size={20} /> SCRUBBING DATA BLOCKS...</> : <><Shield size={20} /> INITIATE PRIVACY SHIELD</>}
                            </button>
                        )}
                    </div>

                </div>

            </div>

            {/* Features Overview */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 relative w-full mb-16">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-32 bg-indigo-500/10 blur-[100px] pointer-events-none"></div>

                <div className="text-center mb-16 relative z-10 w-full">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold mb-6 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                        <Ghost size={16} /> Privacy Profiler
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
                        Examine & Strip Photographic <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">EXIF Metadata Locally</span>
                    </h2>
                    <p className="mt-8 text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                        Welcome to PrivaShield, your first tier of defense against involuntary digital tracking. Every time you snap a photograph with a modern smartphone, DSLR, or tablet, the physical file captures drastically more information than simply color matrices. Embedded silently within the raw header of your image are Exchangeable Image File Format (EXIF) tags, IPTC data, and XMP nodes.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                            <MapPin size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-100 mb-4">Hidden Geometry Overlays</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            Depending on your device configurations, localized metadata can include exact GPS coordinates, detailed hardware serial numbers, camera lens configurations, and precise timestamps.
                        </p>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            When you casually upload a photograph to social networks, you unknowingly broadcast your physical home address, exact travel timeline, and the specific high-value hardware model resting in your pocket.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                            <Zap size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-100 mb-4">Client-Side Purge Engine</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            If you wish to sanitize your assets prior to distribution, our Scrub Engine completely strips all tracking metadata permanently. We offer two distinct modes of execution depending on your file requirements.
                        </p>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Lossless Binary Purge mathematically extracts the specific APP1 metadata block from the array buffer while leaving pixel headers untouched. Canvas mode physically redraws the file natively via HTML5 canvas protocols.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                        <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(236,72,153,0.1)]">
                            <Lock size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-100 mb-4">Total Offline Capability</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            Most commercial metadata editors require you to upload your images to third-party endpoints, which ironically exposes your sensitive location files to unverified web hosts.
                        </p>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            PrivaShield fundamentally avoids this by utilizing a Service Worker cache architecture. Turn off your router interface immediately and the application will still effortlessly sanitize gigabytes of photography natively.
                        </p>
                    </div>
                </div>
            </div>
        </div >
    );
}

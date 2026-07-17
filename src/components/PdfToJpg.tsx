import { useState, useRef } from 'react';
import { useAdContext } from '../contexts/AdContext';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { Upload, FileArchive, Loader2, Download, Settings, FileImageIcon } from 'lucide-react';

interface ExtractedImage {
    pageNum: number;
    blob: Blob | null; // null if still rendering
}

export default function PdfToJpg() {
    const { triggerCTA } = useAdContext();
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState<{ current: number, total: number } | null>(null);
    const [extractQuality, setExtractQuality] = useState('1.0'); // 0.1 to 1.0
    const [scaleFactor, setScaleFactor] = useState('3.0'); // Base multiplier for resolution

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = (newFiles: FileList | File[]) => {
        const file = Array.from(newFiles).find(f => f.type === 'application/pdf');
        if (file) {
            setFile(file);
        } else {
            alert('Please select a PDF file.');
        }
    };

    const clearAll = () => {
        setFile(null);
        setProgress(null);
    };

    const runExtraction = async () => {
        if (!file) return;
        setIsProcessing(true);
        setProgress({ current: 0, total: 100 });

        try {
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
            const pdf = await loadingTask.promise;

            const numPages = pdf.numPages;
            setProgress({ current: 0, total: numPages });

            const zip = new JSZip();
            const imagesFolder = zip.folder("Extracted_Pages");

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                // The viewport scale determines the pixel density (resolution) of the extracted image
                const viewport = page.getViewport({ scale: parseFloat(scaleFactor) });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                if (context) {
                    await page.render({ canvasContext: context, viewport }).promise;

                    const blob = await new Promise<Blob | null>((resolve) =>
                        canvas.toBlob(resolve, 'image/jpeg', parseFloat(extractQuality))
                    );

                    if (blob && imagesFolder) {
                        // e.g "Page_01.jpg"
                        imagesFolder.file(`Page_${i.toString().padStart(numPages.toString().length, '0')}.jpg`, blob);
                    }
                }
                setProgress({ current: i, total: numPages });
            }

            setProgress(null);

            // Build ZIP
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${file.name.replace('.pdf', '')}_Images.zip`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => URL.revokeObjectURL(url), 1000);

        } catch (e) {
            console.error(e);
            alert('Failed to extract images from PDF.');
        } finally {
            setIsProcessing(false);
            setProgress(null);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 h-full">
            <div className="flex-1 flex flex-col min-w-0 bg-zinc-900/50 rounded-2xl border border-zinc-800/80 overflow-hidden relative">
                {!file ? (
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
                        <h3 className="text-xl font-bold mb-2">Upload a PDF</h3>
                        <p className="text-zinc-500 text-sm text-center max-w-sm mb-4">
                            Convert every page of your PDF into high-quality JPGs packaged in a single ZIP.
                        </p>

                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-full text-xs font-medium border border-green-500/20 mb-6 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            100% Private. Processed locally, never uploaded.
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
                    </div>
                ) : (
                    <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center bg-gradient-to-b from-transparent to-zinc-900/40">
                        <div className="p-8 bg-zinc-900 rounded-3xl border border-zinc-700/50 shadow-2xl flex flex-col items-center max-w-sm w-full relative group text-center">

                            {!isProcessing && (
                                <button
                                    onClick={clearAll}
                                    className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-xl transition-all"
                                    title="Clear file"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                </button>
                            )}

                            {progress ? (
                                <>
                                    <div className="p-4 bg-orange-500/10 rounded-2xl mb-6 shadow-inner border border-orange-500/20">
                                        <FileImageIcon size={56} className="text-orange-400 animate-pulse" />
                                    </div>
                                    <h4 className="font-bold text-xl text-zinc-100 truncate w-full px-4 mb-2">Extracting...</h4>
                                    <div className="px-3 py-1 bg-zinc-800 rounded-full border border-zinc-700 mb-6">
                                        <p className="text-zinc-400 text-sm font-medium">Page {progress.current} of {progress.total}</p>
                                    </div>
                                    <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className="h-full bg-orange-500 transition-all duration-300"
                                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                        ></div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="p-4 bg-orange-500/10 rounded-2xl mb-6 shadow-inner border border-orange-500/20">
                                        <FileArchive size={56} className="text-orange-400 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <h4 className="font-bold text-xl text-zinc-100 truncate w-full px-4 mb-2">{file.name}</h4>
                                    <div className="px-3 py-1 bg-zinc-800 rounded-full border border-zinc-700">
                                        <p className="text-zinc-400 text-sm font-medium">Ready for extraction</p>
                                    </div>
                                </>
                            )}

                        </div>
                    </div>
                )}</div>

            <div className="w-full md:w-80 bg-zinc-900/50 rounded-2xl border border-zinc-800/80 p-6 flex flex-col">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Settings size={20} className="text-orange-400" /> Export settings
                </h3>

                <div className="space-y-6 flex-1">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-zinc-400">Image Quality</label>
                            <span className="text-xs font-bold text-zinc-300">{Math.round(parseFloat(extractQuality) * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="1.0"
                            step="0.05"
                            value={extractQuality}
                            onChange={e => setExtractQuality(e.target.value)}
                            disabled={!file || isProcessing}
                            className="w-full accent-orange-500"
                        />
                        <p className="text-xs text-zinc-500 mt-1">Lower quality reduces JPEG file size.</p>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-zinc-400">Resolution Scale</label>
                            <span className="text-xs font-bold text-zinc-300">{scaleFactor}x</span>
                        </div>
                        <input
                            type="range"
                            min="1.0"
                            max="4.0"
                            step="0.5"
                            value={scaleFactor}
                            onChange={e => setScaleFactor(e.target.value)}
                            disabled={!file || isProcessing}
                            className="w-full accent-orange-500"
                        />
                        <p className="text-xs text-zinc-500 mt-1">Higher scale dramatically increases sharpness and final dimensions.</p>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-zinc-800 text-xs text-zinc-500 leading-relaxed mb-6">
                    A ZIP archive containing sequential JPG images of all pages will be generated locally. Process times depend heavily on page count and resolution scale.
                </div>

                <button
                    onClick={() => triggerCTA(runExtraction, { mode: 'vignette', title: 'Processing your file...', subtitle: 'Please wait.' })}
                    disabled={isProcessing || !file}
                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                >
                    {isProcessing ? (
                        <><Loader2 className="animate-spin" size={20} /> Processing...</>
                    ) : (
                        <><Download size={20} /> Extract to ZIP</>
                    )}
                </button>
            </div>
        </div>
    );
}

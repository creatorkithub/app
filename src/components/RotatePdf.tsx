import { useState, useRef } from 'react';
import { useAdContext } from '../contexts/AdContext';
import { PDFDocument, degrees } from 'pdf-lib';
import { sanitizePdfMeta } from '../lib/sanitize';
import * as pdfjsLib from 'pdfjs-dist';
import { Upload, FileText, Loader2, Download, RotateCw } from 'lucide-react';

interface PageItem {
    id: string;
    index: number;
    rotation: number;
    previewUrl: string;
}

export default function RotatePdf() {
    const { triggerCTA } = useAdContext();
    const [file, setFile] = useState<File | null>(null);
    const [pages, setPages] = useState<PageItem[]>([]);
    const [originalDoc, setOriginalDoc] = useState<PDFDocument | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadPdfFile = async (f: File) => {
        setIsProcessing(true);
        try {
            const arrayBuffer = await f.arrayBuffer();
            const doc = await PDFDocument.load(arrayBuffer);
            setOriginalDoc(doc);

            const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
            const pdf = await loadingTask.promise;

            const numPages = pdf.numPages;
            const newPages: PageItem[] = [];

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.0 });
                const scale = 250 / viewport.height;
                const scaledViewport = page.getViewport({ scale });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = scaledViewport.width;
                canvas.height = scaledViewport.height;

                if (context) {
                    await page.render({ canvasContext: context, viewport: scaledViewport }).promise;

                    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp'));
                    if (blob) {
                        newPages.push({
                            id: Math.random().toString(36).substr(2, 9),
                            index: i - 1,
                            rotation: 0,
                            previewUrl: URL.createObjectURL(blob)
                        });
                    }
                }
            }

            setPages(newPages);
            setFile(f);
        } catch (e) {
            console.error(e);
            alert('Failed to parse PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFiles = (newFiles: FileList | File[]) => {
        const file = Array.from(newFiles).find(f => f.type === 'application/pdf');
        if (file) {
            loadPdfFile(file);
        } else {
            alert('Please select a PDF file.');
        }
    };

    const clearAll = () => {
        pages.forEach(p => URL.revokeObjectURL(p.previewUrl));
        setPages([]);
        setFile(null);
        setOriginalDoc(null);
    };

    const rotateAll = () => {
        setPages(prev => prev.map(p => ({ ...p, rotation: (p.rotation + 90) % 360 })));
    };

    const rotatePage = (id: string) => {
        setPages(prev => prev.map(p => p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
    };

    const applyRotationAndGenerate = async () => {
        if (!originalDoc || !file) return;
        setIsProcessing(true);

        try {
            const newPdf = await PDFDocument.create();
            const copiedPages = await newPdf.copyPages(originalDoc, pages.map(p => p.index));

            copiedPages.forEach((page, i) => {
                // pdf-lib's getRotation returns angle objects. 
                // We add our new rotation to the existing rotation if any.
                const currentRot = page.getRotation().angle;
                page.setRotation(degrees(currentRot + pages[i].rotation));
                newPdf.addPage(page);
            });

            sanitizePdfMeta(newPdf);
            const modifiedPdfBytes = await newPdf.save();
            const blob = new Blob([modifiedPdfBytes as any], { type: 'application/pdf' });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Rotated_${file.name}`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (e) {
            console.error(e);
            alert('Failed to rotate document.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-zinc-900/50 rounded-2xl border border-zinc-800/80 overflow-hidden">
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
                        Rotate individual pages or the entire document effortlessly.
                    </p>

                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-full text-xs font-medium border border-green-500/20 mb-6 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        100% Private. Processed locally, never uploaded.
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
                    {isProcessing && (
                        <div className="flex items-center gap-2 text-orange-400 mt-4">
                            <Loader2 size={16} className="animate-spin" /> Analyzing PDF...
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex flex-col h-full p-4 overflow-hidden">
                    <div className="flex justify-between items-center mb-6 flex-shrink-0 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/20">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-100">{file.name}</h3>
                                <p className="text-xs text-zinc-500 font-medium">{pages.length} Pages</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={rotateAll}
                                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors border border-zinc-700/50"
                            >
                                <RotateCw size={16} /> Rotate All
                            </button>
                            <button
                                onClick={clearAll}
                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors border border-red-500/20"
                                title="Clear document"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                            <div className="w-px h-6 bg-zinc-800 mx-1"></div>
                            <button
                                onClick={() => triggerCTA(applyRotationAndGenerate, { mode: 'vignette', title: 'Processing your file...', subtitle: 'Please wait.' })}
                                disabled={isProcessing}
                                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all border border-orange-400/50"
                            >
                                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                Download PDF
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pt-4 pb-12">
                            {pages.map((page, index) => (
                                <div key={page.id} className="relative group flex flex-col items-center">
                                    <div className="w-full aspect-[1/1.4] bg-zinc-800 rounded-xl flex items-center justify-center p-2 border-2 border-transparent hover:border-orange-500/30 transition-all overflow-hidden relative">
                                        <img
                                            src={page.previewUrl}
                                            alt={`Page ${index + 1}`}
                                            className="max-h-full max-w-full object-contain shadow-sm transition-transform duration-300"
                                            style={{ transform: `rotate(${page.rotation}deg)` }}
                                            draggable={false}
                                        />

                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                            <button
                                                onClick={() => rotatePage(page.id)}
                                                className="p-3 bg-zinc-900/90 text-orange-400 hover:text-orange-300 hover:bg-zinc-800 rounded-full shadow-xl transform group-hover:scale-110 transition-all border border-zinc-700/50"
                                                title="Rotate Page"
                                            >
                                                <RotateCw size={24} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-center">
                                        <span className="text-xs font-bold text-zinc-400 bg-zinc-800/80 px-2 py-1 rounded-md">Page {index + 1}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

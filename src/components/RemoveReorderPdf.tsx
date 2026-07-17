import { useState, useRef, useEffect } from 'react';
import { useAdContext } from '../contexts/AdContext';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { Upload, X, Loader2, Download, Trash2, GripVertical } from 'lucide-react';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PageThumbnail {
    id: string; // unique string for rendering keys
    pageIndex: number; // original 0-based page index from the PDF
    previewUrl: string;
}

export default function RemoveReorderPdf() {
    const { triggerCTA } = useAdContext();
    const [file, setFile] = useState<File | null>(null);
    const [pages, setPages] = useState<PageThumbnail[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [draggedId, setDraggedId] = useState<string | null>(null);

    const loadPdfFile = async (f: File) => {
        setIsProcessing(true);
        try {
            const arrayBuffer = await f.arrayBuffer();

            // Load in pdf-lib for later export
            const loadedPdf = await PDFDocument.load(arrayBuffer);
            setPdfDoc(loadedPdf);

            // Load in pdfjs for thumbnails
            const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
            const pdf = await loadingTask.promise;

            const numPages = pdf.numPages;
            const newPages: PageThumbnail[] = [];

            // Render all pages to canvases and create blobs
            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.0 });
                // We want max height of ~300px for thumbnail for better performance
                const scale = 300 / viewport.height;
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
                            pageIndex: i - 1, // 0-based
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
        setPdfDoc(null);
    };

    const removePage = (idToRemove: string) => {
        setPages(prev => {
            const page = prev.find(p => p.id === idToRemove);
            if (page) URL.revokeObjectURL(page.previewUrl);
            return prev.filter(p => p.id !== idToRemove);
        });
    };

    const handleDragStart = (id: string) => setDraggedId(id);
    const handleDragOver = (e: React.DragEvent) => e.preventDefault();
    const handleDrop = (targetId: string) => {
        if (!draggedId || draggedId === targetId) return;

        setPages(prev => {
            const updated = [...prev];
            const draggedIndex = updated.findIndex(i => i.id === draggedId);
            const targetIndex = updated.findIndex(i => i.id === targetId);

            const [draggedItem] = updated.splice(draggedIndex, 1);
            updated.splice(targetIndex, 0, draggedItem);
            return updated;
        });
        setDraggedId(null);
    };

    const exportPdf = async () => {
        if (!pdfDoc || pages.length === 0) return;
        setIsProcessing(true);

        try {
            const newPdf = await PDFDocument.create();

            // pdfDoc is the original PDF loaded. We need to copy pages.
            // pages array contains objects with original pageIndex, sorted as the user desires.
            const pageIndicesToCopy = pages.map(p => p.pageIndex);

            const copiedPages = await newPdf.copyPages(pdfDoc, pageIndicesToCopy);
            copiedPages.forEach(p => newPdf.addPage(p));

            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Modified_${file?.name || 'document.pdf'}`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (e) {
            console.error(e);
            alert('Failed to generate modified PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-zinc-900/50 rounded-2xl border border-zinc-800/80">
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
                        Drag and drop a PDF file here to safely preview, delete, and reorganize individual pages.
                    </p>

                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-full text-xs font-medium border border-green-500/20 mb-6 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        100% Private. Processed locally, never uploaded.
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
                    {isProcessing && (
                        <div className="flex items-center gap-2 text-orange-400 mt-4">
                            <Loader2 size={16} className="animate-spin" /> Rendering...
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex flex-col h-full p-4 overflow-hidden">
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <div>
                            <h3 className="font-semibold text-zinc-200">{file.name}</h3>
                            <p className="text-sm text-zinc-500">{pages.length} Pages</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={clearAll}
                                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => triggerCTA(exportPdf, { mode: 'vignette', title: 'Processing your file...', subtitle: 'Please wait.' })}
                                disabled={isProcessing || pages.length === 0}
                                className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-lg text-sm font-bold flex items-center gap-2"
                            >
                                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                Export
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {pages.map((page, index) => (
                                <div
                                    key={page.id}
                                    draggable
                                    onDragStart={() => handleDragStart(page.id)}
                                    onDragOver={handleDragOver}
                                    onDrop={() => handleDrop(page.id)}
                                    className="group relative bg-zinc-800 rounded-xl overflow-hidden cursor-move border-2 border-transparent hover:border-orange-500/50 transition-colors flex flex-col aspect-[1/1.4]"
                                >
                                    <div className="flex-1 p-2 bg-white flex items-center justify-center">
                                        <img src={page.previewUrl} alt={`Page ${page.pageIndex + 1}`} className="max-h-full object-contain shadow-sm" draggable={false} />
                                    </div>
                                    <div className="bg-zinc-900 border-t border-zinc-800 p-2 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-zinc-400">
                                            <GripVertical size={14} className="opacity-50" />
                                            <span className="text-xs font-bold text-zinc-300">Pg {index + 1}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => removePage(page.id)}
                                        className="absolute top-2 right-2 p-1.5 bg-zinc-900/90 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-lg opacity-0 group-hover:opacity-100 transition-all border border-zinc-800 backdrop-blur"
                                        title="Remove Page"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

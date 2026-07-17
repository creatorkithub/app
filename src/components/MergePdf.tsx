import { useState, useRef } from 'react';
import { useAdContext } from '../contexts/AdContext';
import { PDFDocument } from 'pdf-lib';
import { sanitizePdfMeta } from '../lib/sanitize';
import { Upload, X, Loader2, Download, Layers, GripVertical, FileText } from 'lucide-react';

interface PdfFileItem {
    id: string;
    file: File;
    pageCount: number | null; // null while loading info
    size: number;
    pdfBytes: ArrayBuffer | null;
}

export default function MergePdf() {
    const { triggerCTA } = useAdContext();
    const [files, setFiles] = useState<PdfFileItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isMerging, setIsMerging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [draggedId, setDraggedId] = useState<string | null>(null);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const addFiles = async (newFiles: FileList | File[]) => {
        const validFiles = Array.from(newFiles).filter(f => f.type === 'application/pdf');

        const newItems: PdfFileItem[] = validFiles.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            size: file.size,
            pageCount: null,
            pdfBytes: null
        }));

        setFiles(prev => [...prev, ...newItems]);

        // Load metadata asynchronously
        for (const item of newItems) {
            try {
                const arrayBuffer = await item.file.arrayBuffer();
                const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
                setFiles(current => current.map(f => {
                    if (f.id === item.id) {
                        return { ...f, pageCount: doc.getPageCount(), pdfBytes: arrayBuffer };
                    }
                    return f;
                }));
            } catch (e) {
                console.error(`Failed to load ${item.file.name}`, e);
            }
        }
    };

    const removeFile = (idToRemove: string) => {
        setFiles(prev => prev.filter(f => f.id !== idToRemove));
    };

    const clearAll = () => {
        setFiles([]);
    };

    const handleDragStart = (id: string) => setDraggedId(id);
    const handleDragOver = (e: React.DragEvent) => e.preventDefault();
    const handleDrop = (targetId: string) => {
        if (!draggedId || draggedId === targetId) return;

        setFiles(prev => {
            const updated = [...prev];
            const draggedIndex = updated.findIndex(i => i.id === draggedId);
            const targetIndex = updated.findIndex(i => i.id === targetId);

            const [draggedItem] = updated.splice(draggedIndex, 1);
            updated.splice(targetIndex, 0, draggedItem);
            return updated;
        });
        setDraggedId(null);
    };

    const performMerge = async () => {
        if (files.length < 2) {
            alert('Please add at least 2 PDF files to merge.');
            return;
        }

        const unready = files.find(f => f.pdfBytes === null);
        if (unready) {
            alert('Please wait for all files to finish loading.');
            return;
        }

        setIsMerging(true);

        try {
            const mergedPdf = await PDFDocument.create();

            for (const item of files) {
                if (!item.pdfBytes) continue;
                const sourceDoc = await PDFDocument.load(item.pdfBytes);
                const copiedPages = await mergedPdf.copyPages(sourceDoc, sourceDoc.getPageIndices());
                copiedPages.forEach(p => mergedPdf.addPage(p));
            }

            sanitizePdfMeta(mergedPdf);
            const pdfBytes = await mergedPdf.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Merged_${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (e) {
            console.error(e);
            alert('Failed to merge documents.');
        } finally {
            setIsMerging(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 h-full">
            {/* Split/Merge left side: List */}
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
                            addFiles(e.dataTransfer.files);
                        }}
                    >
                        <div className="p-4 bg-zinc-800 rounded-2xl mb-4 group hover:bg-orange-500/20 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <Layers className="w-8 h-8 text-zinc-400 group-hover:text-orange-400 transition-colors" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Merge PDFs</h3>
                        <p className="text-zinc-500 text-sm text-center max-w-sm mb-4">
                            Drop multiple PDFs to combine them into one seamless document.
                        </p>

                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-full text-xs font-medium border border-green-500/20 mb-6 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            100% Private. Processed locally, never uploaded.
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
                        >
                            Select Files
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" multiple accept="application/pdf" onChange={(e) => e.target.files && addFiles(e.target.files)} />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col p-4 overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-semibold text-zinc-200">Documents ({files.length})</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium flex items-center gap-2"
                                >
                                    <Upload size={14} /> Add More
                                </button>
                                <button
                                    onClick={clearAll}
                                    className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-medium"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                            {files.map((item, index) => (
                                <div
                                    key={item.id}
                                    draggable
                                    onDragStart={() => handleDragStart(item.id)}
                                    onDragOver={handleDragOver}
                                    onDrop={() => handleDrop(item.id)}
                                    className="group flex items-center bg-zinc-800 border border-zinc-700/50 p-3 rounded-xl cursor-move transition-all hover:bg-zinc-750 hover:border-orange-500/50"
                                >
                                    <div className="mr-3 text-zinc-500 cursor-grab active:cursor-grabbing">
                                        <GripVertical size={20} />
                                    </div>
                                    <div className="p-2 bg-zinc-900 rounded-lg mr-4 text-orange-400">
                                        <FileText size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm text-zinc-200 truncate">{item.file.name}</h4>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500 font-medium">
                                            <span>{formatSize(item.size)}</span>
                                            <span>•</span>
                                            {item.pageCount === null ? (
                                                <span className="flex items-center gap-1 text-orange-400"><Loader2 size={10} className="animate-spin" /> Loading..</span>
                                            ) : (
                                                <span>{item.pageCount} Pages</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="font-bold text-lg text-zinc-700 mx-4 w-6 text-right">
                                        {index + 1}
                                    </div>
                                    <button
                                        onClick={() => removeFile(item.id)}
                                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" multiple accept="application/pdf" onChange={(e) => e.target.files && addFiles(e.target.files)} />
                    </div>
                )}
            </div>

            {/* Merge Action Panel */}
            <div className="w-full md:w-80 bg-zinc-900/50 rounded-2xl border border-zinc-800/80 p-6 flex flex-col">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Layers size={20} className="text-orange-400" /> Export settings
                </h3>

                <div className="flex-1">
                    <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-zinc-400">Total Documents:</span>
                            <span className="font-bold text-zinc-200">{files.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-400">Total Pages:</span>
                            <span className="font-bold text-zinc-200">
                                {files.reduce((acc, curr) => acc + (curr.pageCount || 0), 0)}
                            </span>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-zinc-500 text-center mb-4">
                    Files are merged in a sequential top-bottom timeline order locally via client-side processing.
                </p>

                <button
                    onClick={() => triggerCTA(performMerge, { mode: 'vignette', title: 'Processing your file...', subtitle: 'Please wait.' })}
                    disabled={files.length < 2 || isMerging || files.some(f => f.pdfBytes === null)}
                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                >
                    {isMerging ? (
                        <><Loader2 className="animate-spin" size={20} /> Merging...</>
                    ) : (
                        <><Download size={20} /> Pack & Download</>
                    )}
                </button>
            </div>
        </div>
    );
}

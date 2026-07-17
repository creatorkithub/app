import { useState, useRef } from 'react';
import { useAdContext } from '../contexts/AdContext';
import { PDFDocument, PageSizes } from 'pdf-lib';
import { Upload, X, Loader2, Download, Settings } from 'lucide-react';

interface SelectedImage {
    id: string;
    file: File;
    previewUrl: string;
}

export default function ImageToPdf() {
    const { triggerCTA } = useAdContext();
    const [images, setImages] = useState<SelectedImage[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'Fit'>('A4');
    const [orientation, setOrientation] = useState<'Portrait' | 'Landscape'>('Portrait');
    const [margin, setMargin] = useState<'None' | 'Small' | 'Large'>('None');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = (newFiles: FileList | File[]) => {
        const validFiles = Array.from(newFiles).filter(f => f.type.startsWith('image/'));
        const newImages = validFiles.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            previewUrl: URL.createObjectURL(file)
        }));
        setImages(prev => [...prev, ...newImages]);
    };

    const removeImage = (idToRemove: string) => {
        setImages(prev => {
            const img = prev.find(i => i.id === idToRemove);
            if (img) URL.revokeObjectURL(img.previewUrl);
            return prev.filter(i => i.id !== idToRemove);
        });
    };

    const clearAll = () => {
        images.forEach(img => URL.revokeObjectURL(img.previewUrl));
        setImages([]);
    };

    // Basic HTML5 Drag & Drop sorting
    const [draggedId, setDraggedId] = useState<string | null>(null);

    const handleDragStart = (id: string) => setDraggedId(id);
    const handleDragOver = (e: React.DragEvent) => e.preventDefault();
    const handleDrop = (targetId: string) => {
        if (!draggedId || draggedId === targetId) return;

        setImages(prev => {
            const updated = [...prev];
            const draggedIndex = updated.findIndex(i => i.id === draggedId);
            const targetIndex = updated.findIndex(i => i.id === targetId);

            const [draggedItem] = updated.splice(draggedIndex, 1);
            updated.splice(targetIndex, 0, draggedItem);
            return updated;
        });
        setDraggedId(null);
    };

    // Converter util for WebP -> PNG to support pdf-lib
    const getImageBytesAndType = async (file: File): Promise<{ bytes: Uint8Array, isPng: boolean }> => {
        if (file.type === 'image/jpeg' || file.type === 'image/png') {
            const arrayBuffer = await file.arrayBuffer();
            return { bytes: new Uint8Array(arrayBuffer), isPng: file.type === 'image/png' };
        }

        // Convert WebP or others to PNG via canvas
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) ctx.drawImage(img, 0, 0);
                canvas.toBlob(async (blob) => {
                    if (blob) {
                        const buf = await blob.arrayBuffer();
                        resolve({ bytes: new Uint8Array(buf), isPng: true });
                    }
                }, 'image/png');
            };
            img.src = URL.createObjectURL(file);
        });
    };

    const generatePDF = async () => {
        if (images.length === 0) return;
        setIsProcessing(true);

        try {
            const pdfDoc = await PDFDocument.create();

            for (const imgItem of images) {
                const { bytes, isPng } = await getImageBytesAndType(imgItem.file);

                const embeddingFunction = isPng ? pdfDoc.embedPng(bytes) : pdfDoc.embedJpg(bytes);
                const imageResolved = await embeddingFunction;
                const imgDims = imageResolved.scale(1);

                let targetWidth, targetHeight;

                if (pageSize === 'Fit') {
                    targetWidth = imgDims.width;
                    targetHeight = imgDims.height;
                } else {
                    const dims = pageSize === 'A4' ? PageSizes.A4 : PageSizes.Letter;
                    targetWidth = orientation === 'Portrait' ? dims[0] : dims[1];
                    targetHeight = orientation === 'Portrait' ? dims[1] : dims[0];
                }

                const page = pdfDoc.addPage([targetWidth, targetHeight]);

                let marginPt = 0;
                if (margin === 'Small') marginPt = 20;
                if (margin === 'Large') marginPt = 40;

                const availWidth = targetWidth - marginPt * 2;
                const availHeight = targetHeight - marginPt * 2;

                const scaleFactor = Math.min(
                    availWidth / imgDims.width,
                    availHeight / imgDims.height,
                    1 // don't scale up past 100% unless we force to fit? actually let's scale to fit if it's larger. But if we want it to fit perfectly:
                );

                // Wait, if it's smaller, maybe we center it. Let's scale up or down to fit within margin
                const drawScale = Math.min(availWidth / imgDims.width, availHeight / imgDims.height);

                const drawWidth = imgDims.width * drawScale;
                const drawHeight = imgDims.height * drawScale;

                page.drawImage(imageResolved, {
                    x: targetWidth / 2 - drawWidth / 2,
                    y: targetHeight / 2 - drawHeight / 2,
                    width: drawWidth,
                    height: drawHeight,
                });
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `LocalPDF_${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);

        } catch (e) {
            console.error(e);
            alert('Failed to generate PDF. Make sure images are valid.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 h-full">
            {/* Dropzone & Preview */}
            <div className="flex-1 flex flex-col min-w-0 bg-zinc-900/50 rounded-2xl border border-zinc-800/80 overflow-hidden relative">
                {images.length === 0 ? (
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
                        <h3 className="text-xl font-bold mb-2">Upload Images</h3>
                        <p className="text-zinc-500 text-sm text-center max-w-sm mb-4">
                            Drag and drop your JPG, PNG, or WebP images here to convert them into a single continuous PDF document.
                        </p>

                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-full text-xs font-medium border border-green-500/20 mb-6 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            100% Private. Processed locally, never uploaded.
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
                        >
                            Browse Files
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
                    </div>
                ) : (
                    <div
                        className={`flex-1 flex flex-col p-4 relative transition-colors ${isDragging ? 'bg-orange-500/5' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                handleFiles(e.dataTransfer.files);
                            }
                        }}
                    >
                        {isDragging && (
                            <div className="absolute inset-0 z-50 rounded-2xl border-2 border-orange-500 border-dashed bg-orange-500/10 pointer-events-none flex items-center justify-center">
                                <p className="text-orange-400 font-bold text-xl px-6 py-3 bg-zinc-900 rounded-xl shadow-lg">Drop images here to append</p>
                            </div>
                        )}
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-zinc-200">Images ({images.length})</h3>
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

                        <div className="flex-1 overflow-y-auto min-h-0 pr-2 custom-scrollbar">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {images.map((img, index) => (
                                    <div
                                        key={img.id}
                                        draggable
                                        onDragStart={() => handleDragStart(img.id)}
                                        onDragOver={handleDragOver}
                                        onDrop={() => handleDrop(img.id)}
                                        className="group relative aspect-square bg-zinc-800 rounded-xl overflow-hidden cursor-move border-2 border-transparent hover:border-orange-500/50 transition-colors"
                                    >
                                        <img src={img.previewUrl} alt="preview" className="w-full h-full object-cover" />
                                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-md mb-2">
                                            {index + 1}
                                        </div>
                                        <button
                                            onClick={() => removeImage(img.id)}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
                    </div>
                )}
            </div>

            {/* Settings Panel */}
            <div className="w-full md:w-80 bg-zinc-900/50 rounded-2xl border border-zinc-800/80 p-6 flex flex-col">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Settings size={20} className="text-orange-400" /> Page Settings
                </h3>

                <div className="space-y-6 flex-1">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Page Size</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['A4', 'Letter', 'Fit'].map(size => (
                                <button
                                    key={size}
                                    onClick={() => setPageSize(size as any)}
                                    className={`py-2 text-sm font-medium rounded-lg border transition-colors ${pageSize === size ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' : 'border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={pageSize === 'Fit' ? 'opacity-50 pointer-events-none' : ''}>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Orientation</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Portrait', 'Landscape'].map(ori => (
                                <button
                                    key={ori}
                                    onClick={() => setOrientation(ori as any)}
                                    className={`py-2 text-sm font-medium rounded-lg border transition-colors ${orientation === ori ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' : 'border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                                        }`}
                                >
                                    {ori}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={pageSize === 'Fit' ? 'opacity-50 pointer-events-none' : ''}>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Image Margin</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['None', 'Small', 'Large'].map(m => (
                                <button
                                    key={m}
                                    onClick={() => setMargin(m as any)}
                                    className={`py-2 text-sm font-medium rounded-lg border transition-colors ${margin === m ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' : 'border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                                        }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => triggerCTA(generatePDF, { mode: 'vignette', title: 'Processing your file...', subtitle: 'Please wait.' })}
                    disabled={images.length === 0 || isProcessing}
                    className="mt-8 w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                    {isProcessing ? (
                        <><Loader2 className="animate-spin" size={20} /> Compiling...</>
                    ) : (
                        <><Download size={20} /> Generate PDF</>
                    )}
                </button>
            </div>
        </div>
    );
}

import { useState, useRef } from 'react';
import { useAdContext } from '../contexts/AdContext';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { sanitizePdfMeta } from '../lib/sanitize';
import { Upload, FileText, Loader2, Settings, Hash } from 'lucide-react';

export default function PdfStamper() {
    const { triggerCTA } = useAdContext();
    const [file, setFile] = useState<File | null>(null);
    const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
    const [pageCount, setPageCount] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const [template, setTemplate] = useState('Page {page} of {total}');
    const [verticalPlacement, setVerticalPlacement] = useState<'Header' | 'Center' | 'Footer'>('Footer');
    const [horizontalPlacement, setHorizontalPlacement] = useState<'Left' | 'Center' | 'Right'>('Center');
    const [fontSize, setFontSize] = useState('10');
    const [color, setColor] = useState('#000000');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadPdfFile = async (f: File) => {
        setIsProcessing(true);
        try {
            const arrayBuffer = await f.arrayBuffer();
            const loadedPdf = await PDFDocument.load(arrayBuffer);
            setPageCount(loadedPdf.getPageCount());
            setPdfBytes(arrayBuffer);
            setFile(f);
        } catch (e) {
            console.error(e);
            alert('Failed to parse PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFiles = (newFiles: FileList | File[]) => {
        const selectedFile = Array.from(newFiles).find(f => f.type === 'application/pdf');
        if (selectedFile) {
            loadPdfFile(selectedFile);
        } else {
            alert('Please select a PDF file.');
        }
    };

    const clearAll = () => {
        setFile(null);
        setPageCount(0);
        setPdfBytes(null);
    };

    const applyStamps = async () => {
        if (!pdfBytes || !file) return;
        setIsProcessing(true);

        try {
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const numPages = pdfDoc.getPageCount();

            const r = parseInt(color.slice(1, 3), 16) / 255 || 0;
            const g = parseInt(color.slice(3, 5), 16) / 255 || 0;
            const b = parseInt(color.slice(5, 7), 16) / 255 || 0;
            const textColor = rgb(r, g, b);

            const size = parseInt(fontSize, 10);

            for (let i = 0; i < numPages; i++) {
                const page = pdfDoc.getPage(i);
                const { width, height } = page.getSize();

                const text = template
                    .replace(/{page}/g, String(i + 1))
                    .replace(/{total}/g, String(numPages));

                const textWidth = helveticaFont.widthOfTextAtSize(text, size);
                const textHeight = helveticaFont.heightAtSize(size);

                let y = 40;
                if (verticalPlacement === 'Header') {
                    y = height - 40 - textHeight;
                } else if (verticalPlacement === 'Center') {
                    y = height / 2 - textHeight / 2;
                }

                let x = width / 2 - textWidth / 2;
                if (horizontalPlacement === 'Left') {
                    x = 40;
                } else if (horizontalPlacement === 'Right') {
                    x = width - 40 - textWidth;
                }

                page.drawText(text, {
                    x,
                    y,
                    size,
                    font: helveticaFont,
                    color: textColor,
                });
            }

            sanitizePdfMeta(pdfDoc);
            const modifiedPdfBytes = await pdfDoc.save();
            const blob = new Blob([modifiedPdfBytes as any], { type: 'application/pdf' });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Stamped_${file.name}`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (e) {
            console.error(e);
            alert('Failed to stamp PDF.');
        } finally {
            setIsProcessing(false);
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
                            Dynamically stamp page numbers or headers sequentially across all pages of your documents.
                        </p>

                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-full text-xs font-medium border border-green-500/20 mb-6 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            100% Private. Processed locally, never uploaded.
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
                        {isProcessing && (
                            <div className="flex items-center gap-2 text-orange-400 mt-4">
                                <Loader2 size={16} className="animate-spin" /> Loading PDF...
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center bg-gradient-to-b from-transparent to-zinc-900/40">
                        <div className="p-8 bg-zinc-900 rounded-3xl border border-zinc-700/50 shadow-2xl flex flex-col items-center max-w-sm w-full relative group">
                            <button
                                onClick={clearAll}
                                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-xl transition-all"
                                title="Clear file"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>

                            <div className="p-4 bg-orange-500/10 rounded-2xl mb-6 shadow-inner border border-orange-500/20">
                                <FileText size={56} className="text-orange-400" />
                            </div>
                            <h4 className="font-bold text-xl text-center text-zinc-100 truncate w-full px-4 mb-2">{file.name}</h4>
                            <div className="px-3 py-1 bg-zinc-800 rounded-full border border-zinc-700">
                                <p className="text-zinc-400 text-sm font-medium">{pageCount} Pages Loaded</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="w-full md:w-80 bg-zinc-900/50 rounded-2xl border border-zinc-800/80 p-6 flex flex-col">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Settings size={20} className="text-orange-400" /> Stamper Setup
                </h3>

                <div className="space-y-6 flex-1">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Pattern Template</label>
                        <input
                            type="text"
                            value={template}
                            onChange={e => setTemplate(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-sm font-bold text-zinc-200 focus:outline-none focus:border-orange-500 transition-colors"
                            disabled={!file}
                        />
                        <p className="text-xs text-zinc-500 mt-2">Use <code className="text-orange-400">{"{page}"}</code> and <code className="text-orange-400">{"{total}"}</code></p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Vertical Placement</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['Header', 'Center', 'Footer'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setVerticalPlacement(p as 'Header' | 'Center' | 'Footer')}
                                    disabled={!file}
                                    className={`py-2 text-xs font-bold uppercase rounded-lg border transition-colors ${verticalPlacement === p ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' : 'border-zinc-800 text-zinc-400 hover:bg-zinc-800'} disabled:opacity-50`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Horizontal Placement</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['Left', 'Center', 'Right'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setHorizontalPlacement(p as 'Left' | 'Center' | 'Right')}
                                    disabled={!file}
                                    className={`py-2 text-xs font-bold uppercase rounded-lg border transition-colors ${horizontalPlacement === p ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' : 'border-zinc-800 text-zinc-400 hover:bg-zinc-800'} disabled:opacity-50`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Color</label>
                        <div className="flex items-center gap-3">
                            <label
                                className="relative w-10 h-10 rounded-lg cursor-pointer flex-shrink-0 border border-zinc-700 hover:border-orange-500 transition-colors shadow-sm overflow-hidden"
                                style={{ backgroundColor: color }}
                            >
                                <input
                                    type="color"
                                    value={color}
                                    onChange={e => setColor(e.target.value)}
                                    disabled={!file}
                                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer disabled:cursor-not-allowed"
                                />
                            </label>
                            <div className="flex-1 grid grid-cols-4 gap-2">
                                {[
                                    { c: '#000000', label: 'Black' },
                                    { c: '#6b7280', label: 'Gray' },
                                    { c: '#ef4444', label: 'Red' },
                                    { c: '#3b82f6', label: 'Blue' }
                                ].map(({ c, label }) => (
                                    <button
                                        key={c}
                                        onClick={() => setColor(c)}
                                        disabled={!file}
                                        className={`py-2 text-[10px] font-bold uppercase rounded-lg border transition-colors ${color === c ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' : 'border-zinc-800 text-zinc-400 hover:bg-zinc-800'} disabled:opacity-50`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-zinc-400">Size: {fontSize}px</label>
                        </div>
                        <input
                            type="range"
                            min="8"
                            max="72"
                            step="2"
                            value={fontSize}
                            onChange={e => setFontSize(e.target.value)}
                            disabled={!file}
                            className="w-full accent-orange-500"
                        />
                    </div>
                </div>

                <button
                    onClick={() => triggerCTA(applyStamps, { mode: 'vignette', title: 'Processing your file...', subtitle: 'Please wait.' })}
                    disabled={isProcessing || !file || template.trim() === ''}
                    className="mt-6 w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                >
                    {isProcessing ? (
                        <><Loader2 className="animate-spin" size={20} /> Stamping...</>
                    ) : (
                        <><Hash size={20} /> Apply Stamps</>
                    )}
                </button>
            </div>
        </div >
    );
}

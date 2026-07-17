import { useState, useRef } from 'react';
import { useAdContext } from '../contexts/AdContext';
import { PDFDocument } from 'pdf-lib';
import { Upload, FileText, Loader2, Tag, Shield, CheckCircle2 } from 'lucide-react';

export default function PdfMetaSanitizer() {
    const { triggerCTA } = useAdContext();
    const [file, setFile] = useState<File | null>(null);
    const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [metadata, setMetadata] = useState<Record<string, string>>({});
    const [isSanitized, setIsSanitized] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadPdfFile = async (f: File) => {
        setIsProcessing(true);
        try {
            const arrayBuffer = await f.arrayBuffer();
            const loadedPdf = await PDFDocument.load(arrayBuffer, { updateMetadata: false });

            setMetadata({
                title: loadedPdf.getTitle() || '',
                author: loadedPdf.getAuthor() || '',
                subject: loadedPdf.getSubject() || '',
                creator: loadedPdf.getCreator() || '',
                producer: loadedPdf.getProducer() || '',
                keywords: (loadedPdf.getKeywords() || '').toString(),
            });

            setPdfBytes(arrayBuffer);
            setFile(f);
            setIsSanitized(false);
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
        setPdfBytes(null);
        setMetadata({});
        setIsSanitized(false);
    };

    const sanitizeMetadata = async () => {
        if (!pdfBytes || !file) return;
        setIsProcessing(true);

        try {
            const pdfDoc = await PDFDocument.load(pdfBytes);

            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
            pdfDoc.setSubject('');
            pdfDoc.setKeywords([]);
            pdfDoc.setProducer('LocalPDF Studio');
            pdfDoc.setCreator('LocalPDF Studio');

            // Force date to epoch to strip real timestamps
            const epoch = new Date('1970-01-01T00:00:00Z');
            pdfDoc.setCreationDate(epoch);
            pdfDoc.setModificationDate(epoch);

            const modifiedPdfBytes = await pdfDoc.save();
            const blob = new Blob([modifiedPdfBytes as any], { type: 'application/pdf' });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Sanitized_${file.name}`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => URL.revokeObjectURL(url), 100);
            setIsSanitized(true);
            setMetadata({
                title: '',
                author: '',
                subject: '',
                creator: 'LocalPDF Studio',
                producer: 'LocalPDF Studio',
                keywords: ''
            });

        } catch (e) {
            console.error(e);
            alert('Failed to sanitize PDF.');
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
                            Wipe hidden authorship, title metadata, creator tags, and modification dates to protect your privacy.
                        </p>

                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-full text-xs font-medium border border-green-500/20 mb-6 shadow-inner">
                            <Shield size={14} />
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

                            <div className={`p-4 rounded-2xl mb-6 shadow-inner border transition-colors ${isSanitized ? 'bg-green-500/10 border-green-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
                                {isSanitized ? <CheckCircle2 size={56} className="text-green-400" /> : <Shield size={56} className="text-orange-400" />}
                            </div>
                            <h4 className="font-bold text-xl text-center text-zinc-100 truncate w-full px-4 mb-2">{file.name}</h4>
                            <div className={`px-3 py-1 rounded-full border ${isSanitized ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                                <p className="text-sm font-medium">{isSanitized ? 'Metadata Sanitized' : 'Metadata Detected'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="w-full md:w-80 bg-zinc-900/50 rounded-2xl border border-zinc-800/80 p-6 flex flex-col">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Tag size={20} className="text-orange-400" /> Embedded Details
                </h3>

                <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {['title', 'author', 'subject', 'creator', 'producer'].map((key) => {
                        const val = metadata[key];
                        return (
                            <div key={key} className="bg-zinc-800/30 p-3 rounded-xl border border-zinc-800">
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">{key}</label>
                                <div className="text-sm text-zinc-200 truncate" title={val || 'None'}>
                                    {val ? (
                                        <span className={isSanitized ? 'line-through opacity-50' : ''}>{val}</span>
                                    ) : (
                                        <span className="text-zinc-600 italic">None</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button
                    onClick={() => triggerCTA(sanitizeMetadata, { mode: 'vignette', title: 'Processing your file...', subtitle: 'Please wait.' })}
                    disabled={isProcessing || !file || isSanitized}
                    className="mt-6 w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                >
                    {isProcessing ? (
                        <><Loader2 className="animate-spin" size={20} /> Sanitizing...</>
                    ) : isSanitized ? (
                        <><CheckCircle2 size={20} /> Sanitized successfully</>
                    ) : (
                        <><Shield size={20} /> Clean & Download</>
                    )}
                </button>
            </div>
        </div>
    );
}

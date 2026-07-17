import { useState, useRef } from 'react';
import { useAdContext } from '../contexts/AdContext';
import { PDFDocument } from 'pdf-lib';
import { sanitizePdfMeta } from '../lib/sanitize';
import JSZip from 'jszip';
import { Upload, FileText, Loader2, Download, Settings, Scissors } from 'lucide-react';

type SplitMode = 'individual' | 'range' | 'custom';

export default function SplitExtractPdf() {
    const { triggerCTA } = useAdContext();
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState<number>(0);
    const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [splitMode, setSplitMode] = useState<SplitMode>('individual');
    const [startPage, setStartPage] = useState<string>('1');
    const [endPage, setEndPage] = useState<string>('');
    const [customRange, setCustomRange] = useState<string>('');

    const loadPdfFile = async (f: File) => {
        setIsProcessing(true);
        try {
            const arrayBuffer = await f.arrayBuffer();
            const loadedPdf = await PDFDocument.load(arrayBuffer);
            setPageCount(loadedPdf.getPageCount());
            setPdfBytes(arrayBuffer);
            setEndPage(loadedPdf.getPageCount().toString());
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
        setFile(null);
        setPageCount(0);
        setPdfBytes(null);
    };

    const parseCustomRange = (rangeStr: string, maxPages: number): number[][] => {
        // e.g. "1-3, 5, 8-10"
        const groups = rangeStr.split(',').map(s => s.trim()).filter(Boolean);
        const result: number[][] = [];

        for (const group of groups) {
            if (group.includes('-')) {
                const parts = group.split('-');
                const start = parseInt(parts[0], 10);
                const end = parseInt(parts[1] || parts[0], 10);
                if (!isNaN(start) && !isNaN(end) && start > 0 && end <= maxPages && start <= end) {
                    const seq = [];
                    for (let i = start; i <= end; i++) seq.push(i - 1);
                    result.push(seq);
                }
            } else {
                const val = parseInt(group, 10);
                if (!isNaN(val) && val > 0 && val <= maxPages) {
                    result.push([val - 1]);
                }
            }
        }
        return result;
    };

    const performSplit = async () => {
        if (!pdfBytes || !file) return;
        setIsProcessing(true);

        try {
            const sourceDoc = await PDFDocument.load(pdfBytes);
            const totalPages = sourceDoc.getPageCount();

            if (splitMode === 'individual') {
                const zip = new JSZip();
                for (let i = 0; i < totalPages; i++) {
                    const newPdf = await PDFDocument.create();
                    const [copiedPage] = await newPdf.copyPages(sourceDoc, [i]);
                    newPdf.addPage(copiedPage);
                    sanitizePdfMeta(newPdf);
                    const bytes = await newPdf.save();
                    zip.file(`${file.name.replace('.pdf', '')}_page_${i + 1}.pdf`, bytes);
                }
                const zipBlob = await zip.generateAsync({ type: 'blob' });
                downloadBlob(zipBlob, `${file.name.replace('.pdf', '')}_split.zip`);

            } else if (splitMode === 'range') {
                const start = parseInt(startPage, 10);
                const end = parseInt(endPage, 10);

                if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
                    alert('Invalid page range.');
                    setIsProcessing(false);
                    return;
                }

                const newPdf = await PDFDocument.create();
                const indicesToCopy = [];
                for (let i = start; i <= end; i++) indicesToCopy.push(i - 1);

                const copiedPages = await newPdf.copyPages(sourceDoc, indicesToCopy);
                copiedPages.forEach(p => newPdf.addPage(p));
                sanitizePdfMeta(newPdf);
                const bytes = await newPdf.save();
                const blob = new Blob([bytes as any], { type: 'application/pdf' });
                downloadBlob(blob, `${file.name.replace('.pdf', '')}_pages_${start}-${end}.pdf`);

            } else if (splitMode === 'custom') {
                const groups = parseCustomRange(customRange, totalPages);
                if (groups.length === 0) {
                    alert('Invalid custom range format.');
                    setIsProcessing(false);
                    return;
                }

                if (groups.length === 1) {
                    // Single PDF generated
                    const newPdf = await PDFDocument.create();
                    const copiedPages = await newPdf.copyPages(sourceDoc, groups[0]);
                    copiedPages.forEach(p => newPdf.addPage(p));
                    sanitizePdfMeta(newPdf);
                    const bytes = await newPdf.save();
                    const blob = new Blob([bytes as any], { type: 'application/pdf' });
                    // naming
                    const ranges = customRange.replace(/ /g, '_').replace(/,/g, '&');
                    downloadBlob(blob, `${file.name.replace('.pdf', '')}_custom_${ranges}.pdf`);
                } else {
                    // Multiple groups, ZIP them
                    const zip = new JSZip();
                    for (let i = 0; i < groups.length; i++) {
                        const indices = groups[i];
                        const newPdf = await PDFDocument.create();
                        const copiedPages = await newPdf.copyPages(sourceDoc, indices);
                        copiedPages.forEach(p => newPdf.addPage(p));
                        sanitizePdfMeta(newPdf);
                        const bytes = await newPdf.save();

                        const rangeName = `${indices[0] + 1}${indices.length > 1 ? `-${indices[indices.length - 1] + 1}` : ''}`;
                        zip.file(`${file.name.replace('.pdf', '')}_group_${i + 1}_(${rangeName}).pdf`, bytes);
                    }
                    const zipBlob = await zip.generateAsync({ type: 'blob' });
                    downloadBlob(zipBlob, `${file.name.replace('.pdf', '')}_custom_groups.zip`);
                }
            }

        } catch (e) {
            console.error(e);
            alert('An error occurred during splitting.');
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 100);
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
                        Drag and drop a PDF file here to extract specific ranges or split it effortlessly.
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
                <div className="flex flex-col md:flex-row h-full">
                    <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-zinc-800/80">
                        <div className="p-8 bg-zinc-800/50 rounded-2xl border border-zinc-700/50 flex flex-col items-center max-w-sm w-full relative overflow-hidden group">
                            <FileText size={64} className="text-orange-400/50 mb-4 group-hover:scale-110 transition-transform" />
                            <h4 className="font-bold text-xl text-center text-zinc-100 truncate w-full px-4">{file.name}</h4>
                            <p className="text-zinc-400 mt-2 font-medium">{pageCount} Pages • Document loaded</p>

                            <button onClick={clearAll} className="mt-6 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors w-full">
                                Replace File
                            </button>
                        </div>
                    </div>

                    <div className="w-full md:w-96 p-6 flex flex-col bg-zinc-950/30">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Settings size={20} className="text-orange-400" /> Splitting Options
                        </h3>

                        <div className="space-y-6 flex-1">
                            <label className="flex flex-col gap-3 p-4 rounded-xl border cursor-pointer transition-all hover:bg-zinc-800/50 ${splitMode === 'individual' ? 'bg-orange-500/10 border-orange-500/50' : 'border-zinc-800'}">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <input type="radio" name="splitMode" checked={splitMode === 'individual'} onChange={() => setSplitMode('individual')} className="w-4 h-4 text-orange-500 bg-zinc-900 border-zinc-700 focus:ring-orange-500" />
                                        <span className="font-bold text-zinc-200">Individual Pages</span>
                                    </div>
                                </div>
                                <p className="text-xs text-zinc-500 ml-7">Extract every page into a separate PDF file. Downloaded automatically as a ZIP archive.</p>
                            </label>

                            <label className="flex flex-col gap-3 p-4 rounded-xl border cursor-pointer transition-all hover:bg-zinc-800/50 ${splitMode === 'range' ? 'bg-orange-500/10 border-orange-500/50' : 'border-zinc-800'}">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <input type="radio" name="splitMode" checked={splitMode === 'range'} onChange={() => setSplitMode('range')} className="w-4 h-4 text-orange-500 bg-zinc-900 border-zinc-700 focus:ring-orange-500" />
                                        <span className="font-bold text-zinc-200">Specific Range</span>
                                    </div>
                                </div>

                                {splitMode === 'range' && (
                                    <div className="ml-7 flex items-center gap-2 mt-2">
                                        <input type="number" min="1" max={pageCount.toString()} value={startPage} onChange={e => setStartPage(e.target.value)} className="w-20 px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-center focus:outline-none focus:border-orange-500" placeholder="Start" />
                                        <span className="text-zinc-500">to</span>
                                        <input type="number" min="1" max={pageCount.toString()} value={endPage} onChange={e => setEndPage(e.target.value)} className="w-20 px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-center focus:outline-none focus:border-orange-500" placeholder="End" />
                                    </div>
                                )}
                            </label>

                            <label className="flex flex-col gap-3 p-4 rounded-xl border cursor-pointer transition-all hover:bg-zinc-800/50 ${splitMode === 'custom' ? 'bg-orange-500/10 border-orange-500/50' : 'border-zinc-800'}">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <input type="radio" name="splitMode" checked={splitMode === 'custom'} onChange={() => setSplitMode('custom')} className="w-4 h-4 text-orange-500 bg-zinc-900 border-zinc-700 focus:ring-orange-500" />
                                        <span className="font-bold text-zinc-200">Custom Split</span>
                                    </div>
                                </div>

                                {splitMode === 'custom' && (
                                    <div className="ml-7 mt-2 space-y-2">
                                        <input type="text" value={customRange} onChange={e => setCustomRange(e.target.value)} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-orange-500" placeholder="e.g. 1-3, 5, 8-10" />
                                        <p className="text-[10px] text-zinc-500 leading-tight">Separate distinct ranges with commas. Will output ZIP if multiple ranges provided.</p>
                                    </div>
                                )}
                            </label>

                        </div>

                        <button
                            onClick={() => triggerCTA(performSplit, { mode: 'vignette', title: 'Processing your file...', subtitle: 'Please wait.' })}
                            disabled={isProcessing}
                            className="mt-6 w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                        >
                            {isProcessing ? (
                                <><Loader2 className="animate-spin" size={20} /> Processing...</>
                            ) : (
                                <><Scissors size={20} /> Extract</>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

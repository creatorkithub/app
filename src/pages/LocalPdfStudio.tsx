import { useState, useEffect } from 'react';
import { useSEO } from '../hooks/useSEO';
import { ArrowLeft, FileText, Image as ImageIcon, Scissors, Layers, Plus, Download, Trash2, GripVertical, Type, RefreshCw, FileArchive, Tag, Hash, Grid, Menu, X } from 'lucide-react';
import ImageToPdf from '../components/ImageToPdf';
import RemoveReorderPdf from '../components/RemoveReorderPdf';
import SplitExtractPdf from '../components/SplitExtractPdf';
import MergePdf from '../components/MergePdf';
import WatermarkPdf from '../components/WatermarkPdf';
import RotatePdf from '../components/RotatePdf';
import PdfToJpg from '../components/PdfToJpg';
import PdfMetaSanitizer from '../components/PdfMetaSanitizer';
import PdfStamper from '../components/PdfStamper';
import ToolFAQ from '../components/ToolFAQ';

const ALL_TOOLS_LIST = [
    { id: 'image-to-pdf', icon: ImageIcon, label: 'Image to PDF' },
    { id: 'remover', icon: Trash2, label: 'Remove Pages' },
    { id: 'splitter', icon: Scissors, label: 'Split PDF' },
    { id: 'merger', icon: Layers, label: 'Merge PDFs' },
    { id: 'rotate', icon: RefreshCw, label: 'Rotate' },
    { id: 'pdf-to-jpg', icon: FileArchive, label: 'PDF to JPG' },
    { id: 'watermark', icon: Type, label: 'Watermark' },
    { id: 'sanitizer', icon: Tag, label: 'Meta Sanitizer' },
    { id: 'stamper', icon: Hash, label: 'Stamp Page Number' }
];

export default function LocalPdfStudio({ onBack, initialTool }: { onBack: () => void, initialTool?: string }) {
    const validTabs = ['image-to-pdf', 'remover', 'splitter', 'merger', 'watermark', 'rotate', 'pdf-to-jpg', 'sanitizer', 'stamper', 'all-tools'];
    const [activeTab, setActiveTab] = useState<'image-to-pdf' | 'remover' | 'splitter' | 'merger' | 'watermark' | 'rotate' | 'pdf-to-jpg' | 'sanitizer' | 'stamper' | 'all-tools'>(() => {
        if (initialTool && validTabs.includes(initialTool)) return initialTool as any;
        const savedTab = localStorage.getItem('localPdfStudioTab');
        return (savedTab as any) || 'image-to-pdf';
    });

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useSEO(
        'LocalPDF Studio | 100% Client-Side PDF Tools',
        'Securely merge, split, stamp, and convert PDF documents entirely in your browser memory. Zero file uploads.',
        '/pdf-toolkit'
    );

    useEffect(() => {
        localStorage.setItem('localPdfStudioTab', activeTab);
        // Silently update the URL bar so it is copyable without forcing scroll reset
        window.history.replaceState(null, '', '/pdf-toolkit/' + activeTab);
    }, [activeTab]);
    return (
        <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-blue-500/30 flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800/80 shadow-sm overflow-visible">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 min-h-[64px] py-3 flex items-center justify-between gap-4 md:gap-6 relative">
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        <button
                            onClick={onBack}
                            className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all flex items-center"
                            title="Back to Hub"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="w-px h-6 bg-zinc-800 hidden sm:block"></div>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
                                <FileText size={18} />
                            </div>
                            <span className="font-bold text-lg text-zinc-100 tracking-tight hidden sm:inline-block">LocalPDF Studio</span>
                        </div>
                    </div>

                    {/* Desktop Horizontal Tabs */}
                    <div className="hidden md:flex items-center gap-1.5 overflow-x-auto custom-scrollbar flex-1 min-w-0 justify-start py-2 pr-4 snap-x snap-mandatory">
                        {ALL_TOOLS_LIST.slice(0, 6).map(tab => {
                            const isTabActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap snap-start flex-shrink-0 ${isTabActive
                                        ? 'bg-zinc-100 text-zinc-900 shadow-sm'
                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                                        }`}
                                >
                                    <tab.icon size={16} className={isTabActive ? 'text-zinc-900' : ''} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Desktop 'More' Tools Dropdown */}
                    <div className="relative group flex-shrink-0 z-50 hidden md:block">
                        <button
                            onClick={() => setActiveTab('all-tools')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap shadow-sm ${['all-tools', 'watermark', 'sanitizer', 'stamper'].includes(activeTab)
                                ? 'bg-zinc-100 text-zinc-900 border border-zinc-200'
                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 bg-zinc-900/50 border border-zinc-800'
                                }`}
                        >
                            <Grid size={16} className={['all-tools', 'watermark', 'sanitizer', 'stamper'].includes(activeTab) ? 'text-zinc-900' : ''} />
                            <span className="hidden sm:inline-block">All PDF Tools</span>
                            <span className="sm:hidden">More</span>
                        </button>
                        <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] origin-top-right transform group-hover:scale-100 scale-95">
                            <div className="bg-[#18181b]/95 backdrop-blur-2xl border border-zinc-800 rounded-2xl p-2 w-60 shadow-2xl flex flex-col gap-1 ring-1 ring-white/5">
                                {ALL_TOOLS_LIST.slice(6, 9).map(tab => {
                                    const isTabActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={(e) => { e.stopPropagation(); setActiveTab(tab.id as any); }}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isTabActive ? 'bg-orange-500/15 text-orange-400' : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                                                }`}
                                        >
                                            <div className={`p-1.5 flex items-center justify-center rounded-lg ${isTabActive ? 'bg-transparent text-orange-400' : 'bg-zinc-800 text-zinc-400'}`}>
                                                <tab.icon size={16} />
                                            </div>
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Hamburger Toggle */}
                    <div className="md:hidden flex-shrink-0 z-50 flex items-center gap-2">
                        <button
                            onClick={() => setActiveTab('all-tools')}
                            className={`p-2 rounded-xl text-sm font-medium transition-all shadow-sm ${activeTab === 'all-tools' ? 'bg-orange-500/20 text-orange-400' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'}`}
                        >
                            <Grid size={20} />
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all shadow-sm flex items-center gap-2"
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Sandwich Navigation Menu Dropdown */}
                <div className={`md:hidden absolute top-full left-0 w-full overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-[80vh] border-b border-zinc-800 shadow-2xl opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="bg-[#09090b]/95 backdrop-blur-2xl p-4 flex flex-col gap-1 overflow-y-auto w-full custom-scrollbar">
                        {ALL_TOOLS_LIST.map(tab => {
                            const isTabActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id as any); setIsMobileMenuOpen(false); }}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all w-full text-left ${isTabActive ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-transparent'}`}
                                >
                                    <tab.icon size={18} className={isTabActive ? 'text-orange-400' : 'text-zinc-500'} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* Main Content Workspace */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col min-h-0">
                {activeTab === 'image-to-pdf' && <ImageToPdf />}
                {activeTab === 'remover' && <RemoveReorderPdf />}
                {activeTab === 'splitter' && <SplitExtractPdf />}
                {activeTab === 'merger' && <MergePdf />}
                {activeTab === 'all-tools' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
                            <button onClick={() => setActiveTab('watermark')} className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 hover:border-orange-500/50 hover:bg-zinc-900 transition-all group text-left shadow-2xl">
                                <div className="p-4 bg-orange-500/10 rounded-2xl inline-block mb-6 shadow-inner border border-orange-500/20 group-hover:scale-110 transition-transform">
                                    <Type size={32} className="text-orange-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-100 mb-3">Watermark</h3>
                                <p className="text-zinc-400 leading-relaxed text-sm">Embed text overlay drafts across all the pages of your document to protect originality.</p>
                            </button>
                            <button onClick={() => setActiveTab('sanitizer')} className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 hover:border-orange-500/50 hover:bg-zinc-900 transition-all group text-left shadow-2xl">
                                <div className="p-4 bg-orange-500/10 rounded-2xl inline-block mb-6 shadow-inner border border-orange-500/20 group-hover:scale-110 transition-transform">
                                    <Tag size={32} className="text-orange-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-100 mb-3">Meta Sanitizer</h3>
                                <p className="text-zinc-400 leading-relaxed text-sm">Scrub internal authorship, hidden titles, and creation metadata for complete privacy.</p>
                            </button>
                            <button onClick={() => setActiveTab('stamper')} className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 hover:border-orange-500/50 hover:bg-zinc-900 transition-all group text-left shadow-2xl">
                                <div className="p-4 bg-orange-500/10 rounded-2xl inline-block mb-6 shadow-inner border border-orange-500/20 group-hover:scale-110 transition-transform">
                                    <Hash size={32} className="text-orange-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-100 mb-3">Stamp Page Number</h3>
                                <p className="text-zinc-400 leading-relaxed text-sm">Dynamically inject sequential page numbers logically across headers and footers.</p>
                            </button>
                        </div>
                    </div>
                )}
                {activeTab === 'watermark' && <WatermarkPdf />}
                {activeTab === 'sanitizer' && <PdfMetaSanitizer />}
                {activeTab === 'stamper' && <PdfStamper />}
                {activeTab === 'rotate' && <RotatePdf />}
                {activeTab === 'pdf-to-jpg' && <PdfToJpg />}
            </main>

            {/* Dynamic FAQ / Settings guide based on Active Tool */}
            {activeTab !== 'all-tools' && (
                <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 w-full z-10 relative">
                    <ToolFAQ activeTab={activeTab} />
                </div>
            )}

            {/* Features Overview */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 mb-16 relative w-full">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-32 bg-rose-500/10 blur-[100px] pointer-events-none"></div>

                <div className="text-center mb-16 relative z-10 w-full">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold mb-6 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                        <FileText size={16} /> Privacy-First PDF Toolkit
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
                        Complete Privacy-Focused <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-red-500">Local PDF Editor</span>
                    </h2>
                    <p className="mt-8 text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                        Welcome to LocalPDF Studio, an advanced, browser-native productivity suite designed to handle all of your PDF manipulation needs flawlessly without ever compromising your privacy. Unlike traditional cloud-based PDF editors that require you to upload your sensitive financial documents, legal contracts, or personal records to a remote server, our architecture guarantees that every single file operation occurs locally.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                            <Layers size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-100 mb-4">Client-Side PDF Engine</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            By utilizing modern HTML5 structures and WebAssembly execution, LocalPDF Studio loads our extremely potent processing algorithms strictly in your RAM memory allocation.
                        </p>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            When you drop a PDF into the editor or try to extract pages and apply encryptions, all bytes are iterated purely within the boundaries of your physical hardware environment.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                        <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                            <FileArchive size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-100 mb-4">Instantaneous Execution</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            Because we completely circumvent standard server-upload requirements, file sizes become irrelevant for performance latency. Edit huge architectural blueprints easily.
                        </p>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            The moment you conclude modifying a document and hit "Merge" or "Split", the reconstructed byte-array buffer immediately initializes a download command natively to your hard drive.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                        <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                            <Plus size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-100 mb-4">Offline Reliability (PWA)</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            Have to sign NDAs during the flight? Creator Kit Hub operates essentially as an offline Progressive Web Application layout module.
                        </p>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            If you load this page and sever your internet pathways entirely, LocalPDF Studio will continue to parse, merge, and split PDF documents at full speeds from entirely within a dark network cache.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

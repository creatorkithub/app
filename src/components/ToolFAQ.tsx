import { FileText, HelpCircle, ShieldCheck, Zap } from 'lucide-react';

interface ToolFAQProps {
    activeTab: 'image-to-pdf' | 'remover' | 'splitter' | 'merger' | 'watermark' | 'rotate' | 'pdf-to-jpg' | 'sanitizer' | 'stamper' | 'all-tools';
}

export default function ToolFAQ({ activeTab }: ToolFAQProps) {
    if (activeTab === 'all-tools') return null;

    const renderContent = () => {
        switch (activeTab) {
            case 'image-to-pdf':
                return (
                    <>
                        <h2 className="text-2xl font-bold text-zinc-100 mb-4 flex items-center gap-2">
                            <FileText className="text-orange-400" /> How to Convert Images to PDF
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
                                <p><strong>1. Upload your files:</strong> Drag and drop your JPG, PNG, or WebP images into the dropzone. You can upload multiple files at once.</p>
                                <p><strong>2. Arrange the order:</strong> If your images are out of sequence, simply click and drag them around the preview grid to reorder them before rendering.</p>
                                <p><strong>3. Configure page settings:</strong> Use the right-hand panel to select whether your PDF should match common printer sizes (A4 or Letter) or if the document should auto-fit exactly to your image dimensions.</p>
                                <p><strong>4. Generate:</strong> Click "Generate PDF". The file is compiled instantly in your browser memory and downloaded directly to your hard drive.</p>
                            </div>
                            <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 mt-4 md:mt-0">
                                <h3 className="font-bold text-zinc-200 mb-3 flex items-center gap-2">
                                    <HelpCircle size={18} className="text-blue-400" /> Frequently Asked Questions
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-zinc-300 font-semibold text-sm">Why do my images look stretched?</h4>
                                        <p className="text-zinc-500 text-xs mt-1">If you select A4 or Letter, we proportionally scale your images to fit within those dimensions. If the aspect ratio differs significantly, consider changing the "Image Margin" to "Small" to prevent edge-cropping, or choose "Fit" page size.</p>
                                    </div>
                                    <div>
                                        <h4 className="text-zinc-300 font-semibold text-sm">Are my photos uploaded to a server?</h4>
                                        <p className="text-zinc-500 text-xs mt-1">Absolutely not. This entire toolkit uses WebAssembly to process files strictly via your local CPU/RAM. Your private photos never touch an external server.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 'remover':
                return (
                    <>
                        <h2 className="text-2xl font-bold text-zinc-100 mb-4 flex items-center gap-2">
                            <FileText className="text-emerald-400" /> How to Remove Pages from a PDF
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
                                <p><strong>1. Load the document:</strong> Select the PDF file you wish to edit. The tool will parse the document entirely locally.</p>
                                <p><strong>2. Select pages to delete:</strong> Hover over any page thumbnail and click the red trash icon to mark it for deletion. You can also use the grid to visually reorder pages if needed.</p>
                                <p><strong>3. Apply changes:</strong> Once you've removed the unwanted pages, click "Save Changes". A clean, new PDF file will be generated and downloaded instantly, without the deleted content.</p>
                            </div>
                            <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 mt-4 md:mt-0">
                                <h3 className="font-bold text-zinc-200 mb-3 flex items-center gap-2">
                                    <HelpCircle size={18} className="text-blue-400" /> Frequently Asked Questions
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-zinc-300 font-semibold text-sm">Can I recover deleted pages?</h4>
                                        <p className="text-zinc-500 text-xs mt-1">Because the process happens locally without overwriting your source file, your original PDF remains completely untouched on your device. The output is saved as a brand new file.</p>
                                    </div>
                                    <div>
                                        <h4 className="text-zinc-300 font-semibold text-sm">Does this remove bookmarks or links?</h4>
                                        <p className="text-zinc-500 text-xs mt-1">Extracting or deleting pages will retain the base content of the remaining pages, but complex document-wide outlines (like table of contents bookmarks) may not update automatically.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 'splitter':
                return (
                    <>
                        <h2 className="text-2xl font-bold text-zinc-100 mb-4 flex items-center gap-2">
                            <FileText className="text-indigo-400" /> How to Split or Extract PDF Pages
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
                                <p><strong>1. Choose your file:</strong> Upload a multi-page PDF into the safe local environment.</p>
                                <p><strong>2. Define the extraction logic:</strong> You can either use the visual grid to manually click and highlight the pages you want to keep, or use the range input box.</p>
                                <p><strong>3. Input range format:</strong> Type <code>1-5, 8, 11-13</code> to extract exactly those specific blocks of pages into a new document. Commas separate distinct selections, and hyphens define continuous ranges.</p>
                                <p><strong>4. Export:</strong> Hit "Extract Selected Pages" to create a new, trimmed PDF immediately.</p>
                            </div>
                            <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 mt-4 md:mt-0">
                                <h3 className="font-bold text-zinc-200 mb-3 flex items-center gap-2">
                                    <HelpCircle size={18} className="text-blue-400" /> Frequently Asked Questions
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-zinc-300 font-semibold text-sm">What happens if I try to extract a page that doesn't exist?</h4>
                                        <p className="text-zinc-500 text-xs mt-1">The built-in parser will automatically ignore out-of-bounds page requests, ensuring your final document is produced without generating fatal errors.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 'merger':
                return (
                    <>
                        <h2 className="text-2xl font-bold text-zinc-100 mb-4 flex items-center gap-2">
                            <FileText className="text-rose-400" /> How to Merge Multiple PDFs
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
                                <p><strong>1. Queue your documents:</strong> Drag and drop two or more PDF files into the tool.</p>
                                <p><strong>2. Set the sequence:</strong> Click and drag the file cards to arrange them in the exact order you want them stitched together. The file in position "1" will act as the beginning of the final document.</p>
                                <p><strong>3. Merge:</strong> Click the merge button. The engine will read the byte structures of all listed PDFs and append them sequentially.</p>
                            </div>
                            <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 mt-4 md:mt-0">
                                <h3 className="font-bold text-zinc-200 mb-3 flex items-center gap-2">
                                    <HelpCircle size={18} className="text-blue-400" /> Frequently Asked Questions
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-zinc-300 font-semibold text-sm">Is there a file size limit for merging?</h4>
                                        <p className="text-zinc-500 text-xs mt-1">Because everything processes on your device locally via RAM, the only limit is your browser's memory allocation (typically 2GB to 4GB). Most users can easily merge hundreds of pages instantaneously.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 'rotate':
                return (
                    <>
                        <h2 className="text-2xl font-bold text-zinc-100 mb-4 flex items-center gap-2">
                            <FileText className="text-amber-400" /> How to Rotate a PDF permanently
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
                                <p>Sometimes, scanners will flip pages upside down, making documents incredibly difficult to read. This tool lets you fix the internal dictionary rotation flags of a PDF.</p>
                                <p><strong>Batch Rotation:</strong> Click the "Rotate All" button in the header toolbar. Every page in your thumbnail grid will rotate 90 degrees clockwise simultaneously.</p>
                                <p><strong>Targeted Rotation:</strong> Hover over any individual page thumbnail and click the circular arrow icon to independently adjust its orientation.</p>
                                <p><strong>Finalizing:</strong> Once the visual preview looks correct, click "Download PDF" to save the orientation metadata permanently.</p>
                            </div>
                            <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 mt-4 md:mt-0">
                                <h3 className="font-bold text-zinc-200 mb-3 flex items-center gap-2">
                                    <HelpCircle size={18} className="text-blue-400" /> Frequently Asked Questions
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-zinc-300 font-semibold text-sm">Does rotating reduce the quality of my document?</h4>
                                        <p className="text-zinc-500 text-xs mt-1">No. We do not re-encode or compress the text or images. We merely update the structural orientation parameters (`/Rotate`), preserving 100% of the original visual fidelity.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 'pdf-to-jpg':
                return (
                    <>
                        <h2 className="text-2xl font-bold text-zinc-100 mb-4 flex items-center gap-2">
                            <FileText className="text-purple-400" /> How to convert PDF pages to JPGs
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
                                <p><strong>1. Upload a PDF:</strong> Open any PDF containing vectors, text, or embedded scans.</p>
                                <p><strong>2. Engine Processing:</strong> Once uploaded, our WebAssembly engine automatically begins rasterizing (converting into flat pixels) every single page using an internal high-resolution virtual canvas.</p>
                                <p><strong>3. Bundle Download:</strong> After parsing completes, click "Download All as ZIP." Your browser will compile all the generated JPG files into a single, organized ZIP archive and download it directly.</p>
                            </div>
                            <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 mt-4 md:mt-0">
                                <h3 className="font-bold text-zinc-200 mb-3 flex items-center gap-2">
                                    <HelpCircle size={18} className="text-blue-400" /> Frequently Asked Questions
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-zinc-300 font-semibold text-sm">Why did processing take a few seconds?</h4>
                                        <p className="text-zinc-500 text-xs mt-1">To ensure crisp conversion quality, we simulate a moderately high-dpi viewport. Converting complex vector mathematics into static JPG pixels requires heavy CPU computation directly inside your browser tab.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 'watermark':
                return (
                    <>
                        <h2 className="text-2xl font-bold text-zinc-100 mb-4 flex items-center gap-2">
                            <FileText className="text-cyan-400" /> How to Watermark your PDFs
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
                                <p><strong>1. Choose your document:</strong> Upload the report, contract, or image you want to protect.</p>
                                <p><strong>2. Configure the text:</strong> Type your watermark message (e.g., "CONFIDENTIAL", "DRAFT"). Use the sliders to adjust the font scale and text opacity until it perfectly balances readability without obstructing the underlying data.</p>
                                <p><strong>3. Stamp & Secure:</strong> The text is drawn directly over all pages at a 45-degree angle. Download the stamped version.</p>
                            </div>
                            <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 mt-4 md:mt-0">
                                <h3 className="font-bold text-zinc-200 mb-3 flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-emerald-400" /> Privacy & Security Insights
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-zinc-300 font-semibold text-sm">Can the watermark be easily removed?</h4>
                                        <p className="text-zinc-500 text-xs mt-1">The watermark is embedded directly onto the page canvas layer. While advanced PDF editors might theoretically isolate individual text blocks, typical end-users will be completely unable to selectively erase this translucent overlay.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 'sanitizer':
                return (
                    <>
                        <h2 className="text-2xl font-bold text-zinc-100 mb-4 flex items-center gap-2">
                            <FileText className="text-gray-400" /> How to Sanitize PDF Metadata
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
                                <p>Internal metadata can leak personally identifiable information without your knowledge when distributing files.</p>
                                <p><strong>What it removes:</strong> This tool strips out the Author, Creator Application, internal Titles, Subject tags, and Producer information.</p>
                                <p><strong>How to use:</strong> Simply load a PDF file and instantly hit the "Sanitize & Download" button. The engine parses the data dictionary, sets all tracking strings to blank, and repackages the archive silently.</p>
                            </div>
                            <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 mt-4 md:mt-0">
                                <h3 className="font-bold text-zinc-200 mb-3 flex items-center gap-2">
                                    <Zap size={18} className="text-yellow-400" /> Important Considerations
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-zinc-300 font-semibold text-sm">Does this remove visible sensitive text?</h4>
                                        <p className="text-zinc-500 text-xs mt-1">No. This tool sanitizes structural, hidden metadata only. If your actual document openly lists your SSN or personal address in the paragraphs, you will need a redaction tool instead.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 'stamper':
                return (
                    <>
                        <h2 className="text-2xl font-bold text-zinc-100 mb-4 flex items-center gap-2">
                            <FileText className="text-lime-400" /> How to Stamp Page Numbers
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
                                <p><strong>1. Upload file:</strong> Load the PDF missing sequential numbering.</p>
                                <p><strong>2. Configure positioning:</strong> Select whether you want the numbers placed in the Header or Footer, and choose Left, Center, or Right alignments.</p>
                                <p><strong>3. Execution:</strong> The engine automatically iterates through the array length of your document pages, dynamically incrementing the count and embedding standard text blocks precisely at your designated coordinates.</p>
                            </div>
                            <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 mt-4 md:mt-0">
                                <h3 className="font-bold text-zinc-200 mb-3 flex items-center gap-2">
                                    <HelpCircle size={18} className="text-blue-400" /> Frequently Asked Questions
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-zinc-300 font-semibold text-sm">Will this cover up existing footer text?</h4>
                                        <p className="text-zinc-500 text-xs mt-1">It might. The numbers are drawn roughly 30 pixels away from the edge of the page. If your document already possesses dense text right on the absolute boundary, the stamped number will overlap it.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-zinc-950/50 p-6 md:p-10 rounded-3xl border border-zinc-800/80 shadow-2xl backdrop-blur-sm">
            {renderContent()}
        </div>
    );
}

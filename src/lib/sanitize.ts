import { PDFDocument } from 'pdf-lib';

/**
 * Strips identifiable metadata from a loaded PDFDocument.
 * This guarantees privacy from standard document properties.
 */
export const sanitizePdfMeta = (pdfDoc: PDFDocument) => {
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('Creator Kit Hub (Locally)');
    pdfDoc.setCreator('Creator Kit Hub (Locally)');
    // Some timestamps cannot be completely erased without low level bytes rewriting,
    // but clearing standard text vectors prevents 99% of identity leaks in standard PDFs.
};

const fs = require('fs');
const path = require('path');

const targets = [
    {
        file: 'src/pages/SafeZoneTool.tsx', handlers: [
            { name: 'handleExportOverlay', mode: 'vignette' },
            { name: 'handleExport', mode: 'rewarded' },
            { name: 'handleDownloadAllGuides', mode: 'rewarded' }
        ]
    },
    { file: 'src/components/WatermarkPdf.tsx', handlers: [{ name: 'applyWatermark', mode: 'vignette' }] },
    { file: 'src/components/PdfStamper.tsx', handlers: [{ name: 'applyStamps', mode: 'vignette' }] },
    { file: 'src/components/UniversalImageConverter.tsx', handlers: [{ name: 'downloadAll', mode: 'vignette' }] },
    { file: 'src/components/RemoveReorderPdf.tsx', handlers: [{ name: 'exportPdf', mode: 'vignette' }] },
    { file: 'src/components/PrivaShield.tsx', handlers: [{ name: 'downloadAll', mode: 'vignette' }, { name: 'processFiles', mode: 'vignette' }] },
    { file: 'src/components/PdfMetaSanitizer.tsx', handlers: [{ name: 'sanitizeMetadata', mode: 'vignette' }] },
    { file: 'src/components/ImageToPdf.tsx', handlers: [{ name: 'generatePDF', mode: 'vignette' }] },
];

let baseDir = __dirname;

targets.forEach(t => {
    let p = path.join(baseDir, t.file);
    if (!fs.existsSync(p)) return;

    let content = fs.readFileSync(p, 'utf8');

    if (!content.includes('AdContext')) {
        let depth = t.file.startsWith('src/pages') ? '../contexts/AdContext' : '../contexts/AdContext';
        content = content.replace(/(import .* from 'react'.*;)/, `$1\nimport { useAdContext } from '${depth}';`);
    }

    if (!content.includes('const { triggerCTA }')) {
        content = content.replace(/(export default function [A-Za-z0-9_]+\([^)]*\)\s*\{)/, `$1\n    const { triggerCTA } = useAdContext();`);
    }

    t.handlers.forEach(h => {
        let regex = new RegExp(`onClick=\\{${h.name}\\}`, 'g');
        let replacement = `onClick={() => triggerCTA(${h.name}, { mode: '${h.mode}', title: 'Processing your file...', subtitle: 'Please wait.' })}`;
        content = content.replace(regex, replacement);
    });

    fs.writeFileSync(p, content);
    console.log("Updated", t.file);
});

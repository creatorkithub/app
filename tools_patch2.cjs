const fs = require('fs');
const path = require('path');

const targets = [
    { file: 'src/components/SplitExtractPdf.tsx', handlers: [{ name: 'performSplit', mode: 'vignette' }] },
    { file: 'src/components/MergePdf.tsx', handlers: [{ name: 'performMerge', mode: 'vignette' }] },
    { file: 'src/components/RotatePdf.tsx', handlers: [{ name: 'applyRotationAndGenerate', mode: 'vignette' }] },
    { file: 'src/components/PdfToJpg.tsx', handlers: [{ name: 'runExtraction', mode: 'vignette' }] },
    { file: 'src/components/A11yScorecard.tsx', handlers: [{ name: 'generateCSS', mode: 'vignette' }] },
    { file: 'src/components/CryptoAudit.tsx', handlers: [{ name: 'generateSecurePassword', mode: 'vignette' }] },
];

let baseDir = __dirname;

targets.forEach(t => {
    let p = path.join(baseDir, t.file);
    if (!fs.existsSync(p)) return;

    let content = fs.readFileSync(p, 'utf8');

    if (!content.includes('AdContext')) {
        let depth = t.file.startsWith('src/pages') ? '../contexts/AdContext' : '../contexts/AdContext';
        content = content.replace(/(import .*react['"];?)/, `$1\nimport { useAdContext } from '${depth}';`);
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

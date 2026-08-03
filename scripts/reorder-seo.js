import fs from 'fs';
import path from 'path';

const filesToProcess = [];
const dirs = ['src/components', 'src/pages'];
dirs.forEach(dir => {
    fs.readdirSync(dir).forEach(file => {
        if (file.endsWith('.tsx') && file !== 'PrivacyFeatures.tsx' && file !== 'AdUnit.tsx' && file !== 'ToolFAQ.tsx' && !file.includes('PdfStudio')) {
            filesToProcess.push(path.join(dir, file));
        }
    });
});
filesToProcess.push(path.resolve('src/pages/LocalPdfStudio.tsx'));

filesToProcess.forEach(file => {
    let src = fs.readFileSync(file, 'utf8');

    const seoStartMatch = src.match(/{?\/\*\s*(?:Features Overview|Information Section)\s*\*\/}?\s*<div/);
    if (!seoStartMatch) {
        console.log(`Skipping ${file}, no SEO block found.`);
        return;
    }
    const seoIndex = seoStartMatch.index;

    const privacyStartMatch = src.match(/<div [^>]*z-10 relative[^>]*>[\s\r\n]*<PrivacyFeatures/);
    let privacyIndex = -1;
    let privacyEndIndex = -1;
    if (privacyStartMatch) {
        privacyIndex = privacyStartMatch.index;
        const afterPrivacyStart = src.indexOf('</div>', privacyIndex + 50);
        if (afterPrivacyStart !== -1) {
            privacyEndIndex = afterPrivacyStart + 6;
        }
    }

    const faqStartMatch = src.match(/{?\/\*\s*Dynamic FAQ[\s\S]*?<ToolFAQ[\s\S]*?<\/div>\r?\n?\s*}\)/);
    let faqIndex = -1;
    let faqEndIndex = -1;
    if (faqStartMatch) {
        faqIndex = faqStartMatch.index;
        faqEndIndex = faqIndex + faqStartMatch[0].length;
    }

    const adUnitMatch = src.match(/<AdUnit slotId="[^"]*"\s*\/>/);
    let adIndex = -1;
    let adEndIndex = -1;
    if (adUnitMatch) {
        adIndex = adUnitMatch.index;
        adEndIndex = adIndex + adUnitMatch[0].length;
    }

    // Only extract if they are BEFORE the SEO block
    let extracts = [];
    if (faqIndex !== -1 && faqIndex < seoIndex) extracts.push({ s: faqIndex, e: faqEndIndex, text: src.substring(faqIndex, faqEndIndex) });
    if (privacyIndex !== -1 && privacyIndex < seoIndex) extracts.push({ s: privacyIndex, e: privacyEndIndex, text: src.substring(privacyIndex, privacyEndIndex) });
    if (adIndex !== -1 && adIndex < seoIndex) extracts.push({ s: adIndex, e: adEndIndex, text: src.substring(adIndex, adEndIndex) });

    if (extracts.length === 0) {
        console.log(`Skipping ${file}, already properly ordered.`);
        return;
    }

    extracts.sort((a, b) => b.s - a.s);

    let modifiedSrc = src;

    let orderedBlocks = [];
    if (extracts.find(e => e.s === faqIndex)) orderedBlocks.push(extracts.find(e => e.s === faqIndex).text);
    if (extracts.find(e => e.s === privacyIndex)) orderedBlocks.push(extracts.find(e => e.s === privacyIndex).text);
    if (extracts.find(e => e.s === adIndex)) orderedBlocks.push(extracts.find(e => e.s === adIndex).text);

    let blocksCombined = '\r\n\r\n            ' + orderedBlocks.join('\r\n\r\n            ');

    extracts.forEach(ex => {
        modifiedSrc = modifiedSrc.substring(0, ex.s) + modifiedSrc.substring(ex.e);
    });

    const newEndMatch = modifiedSrc.match(/\r?\n\s*\);\r?\n}/);
    if (newEndMatch) {
        // Find local last div
        let lastDivIndex = modifiedSrc.lastIndexOf('</div>', newEndMatch.index);
        if (lastDivIndex !== -1) {
            let finalSrc = modifiedSrc.substring(0, lastDivIndex) + blocksCombined + '\r\n        ' + modifiedSrc.substring(lastDivIndex);
            fs.writeFileSync(file, finalSrc);
            console.log(`Successfully reordered ${file}`);
        } else {
            console.log(`Skipping ${file}, could not find closing root div`);
        }
    } else {
        console.log(`Skipping ${file}, component end ); } not found.`);
    }
});

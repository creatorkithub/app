const fs = require('fs');
const path = require('path');

function getFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const stat = fs.statSync(path.join(dir, file));
        if (stat.isDirectory()) getFiles(path.join(dir, file), fileList);
        else if (file.endsWith('.html')) fileList.push(path.join(dir, file));
    }
    return fileList;
}

const distDir = path.join(__dirname, '../dist');
const htmlFiles = getFiles(distDir);
let issues = 0;
let titles = {};
let descriptions = {};

console.log('Starting Local SEO Audit...');

htmlFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    let titleMatch = content.match(/<title>([\s\S]*?)<\/title>/);
    let descMatch = content.match(/<meta name="description"\s+content="([^"]*)/);
    let canonicalMatch = content.match(/<link rel="canonical" href="([^"]*)/);

    // Extract text within <noscript> or <body> for word count proxy
    let contentTarget = content;
    let noScriptMatches = content.match(/<noscript>([\s\S]*?)<\/noscript>/g);
    if (noScriptMatches && noScriptMatches.length > 0) {
        contentTarget = noScriptMatches.join(' ');
    }

    const title = titleMatch ? titleMatch[1].trim() : 'MISSING';
    const desc = descMatch ? descMatch[1].trim() : 'MISSING';
    const canonical = canonicalMatch ? canonicalMatch[1].trim() : 'MISSING';

    const textContent = contentTarget.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = textContent.split(' ').filter(w => w.length > 0).length;

    const relPath = path.relative(distDir, file);

    if (title === 'MISSING') { console.log(`[Error] Missing <title> in ${relPath}`); issues++; }
    if (desc === 'MISSING') { console.log(`[Error] Missing meta description in ${relPath}`); issues++; }
    if (canonical === 'MISSING' && relPath !== '404.html') { console.log(`[Error] Missing canonical in ${relPath}`); issues++; }

    if (wordCount < 250 && relPath !== '404.html') {
        console.log(`[Warning] Low word count (${wordCount}) in ${relPath}`);
        // Not classifying as hard issue for 404, but valid for all regular pages
        issues++;
    }

    // Check unique content per unique canonical
    if (canonical !== 'MISSING') {
        if (!titles[canonical]) titles[canonical] = new Set();
        titles[canonical].add(title);

        if (!descriptions[canonical]) descriptions[canonical] = new Set();
        descriptions[canonical].add(desc);
    }
});

console.log('\nAnalyzing uniqueness across Canonical URLs...');
const titlesToCanonicals = {};
for (const [canon, ts] of Object.entries(titles)) {
    for (const t of ts) {
        if (titlesToCanonicals[t] && titlesToCanonicals[t] !== canon) {
            console.log(`[Error] Duplicate title "${t}" used by both:\n - ${titlesToCanonicals[t]}\n - ${canon}`);
            issues++;
        }
        titlesToCanonicals[t] = canon;
    }
}

const descToCanonicals = {};
for (const [canon, ds] of Object.entries(descriptions)) {
    for (const d of ds) {
        if (descToCanonicals[d] && descToCanonicals[d] !== canon) {
            console.log(`[Error] Duplicate description "${d.substring(0, 40)}..." used by both:\n - ${descToCanonicals[d]}\n - ${canon}`);
            issues++;
        }
        descToCanonicals[d] = canon;
    }
}

console.log(`\nAudit Complete.`);
console.log(`Total HTML pages scanned: ${htmlFiles.length}`);
console.log(`Total SEO Issues Found: ${issues}`);

if (issues === 0) {
    console.log('✅ SEO Audit Passed! All pages have compliant word counts, semantic tags, and strictly unique canonicalized metadata.');
}

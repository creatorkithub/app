import fs from 'fs';
import path from 'path';

const filesToProcess = [];
const dirs = ['src/components', 'src/pages'];
dirs.forEach(dir => {
    fs.readdirSync(dir).forEach(file => {
        if (file.endsWith('.tsx') && !['Hub.tsx', 'LegalPages.tsx', 'Success.tsx', 'PrivacyFeatures.tsx', 'AdUnit.tsx', 'ToolFAQ.tsx'].includes(file)) {
            filesToProcess.push(path.join(dir, file));
        }
    });
});

filesToProcess.forEach(file => {
    let src = fs.readFileSync(file, 'utf8');

    let modified = false;

    // Step 1: Downgrade all current <h1 to <h2
    if (src.includes('<h1')) {
        src = src.replace(/<h1\b/g, '<h2');
        src = src.replace(/<\/h1>/g, '</h2>');
        modified = true;
    }

    // Step 2: Upgrade the specific SEO block title from <h2 to <h1
    // The target is typically:
    // <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
    // Some might have slightly different classes, but they always start with `<h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight`
    const targetRegex = /<h2\s+className="text-4xl\s+md:text-5xl\s+font-extrabold\s+text-white\s+tracking-tight[^>]*>/;
    const match = src.match(targetRegex);

    if (match) {
        // We only replace the FIRST match (there should only be one)
        const matchedString = match[0];
        const upgradedString = matchedString.replace('<h2', '<h1');

        // Find the index of this match to replace its specific closing tag
        const matchIndex = match.index;
        const prefix = src.substring(0, matchIndex);
        const postfix = src.substring(matchIndex + matchedString.length);

        // The nearest </h2> after this match should be the one to replace
        const closingIndex = postfix.indexOf('</h2>');

        if (closingIndex !== -1) {
            const newPostfix = postfix.substring(0, closingIndex) + '</h1>' + postfix.substring(closingIndex + 5);
            src = prefix + upgradedString + newPostfix;
            modified = true;
        }
    } else {
        console.log(`Warning: SEO target H2 not found in ${file}`);
    }

    if (modified) {
        fs.writeFileSync(file, src);
        console.log(`Optimized headers in ${file}`);
    }
});

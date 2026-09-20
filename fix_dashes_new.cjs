const fs = require('fs');
const path = require('path');

function replaceEmDashes(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const f of files) {
        let dirPath = path.join(dir, f);
        if (dirPath.includes('node_modules') || dirPath.includes('.git') || dirPath.includes('dist')) continue;
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            replaceEmDashes(dirPath);
        } else if (f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.cjs') || f.endsWith('.js') || f.endsWith('.txt') || f.endsWith('.md')) {
            try {
                let content = fs.readFileSync(dirPath, 'utf8');
                let updated = content.replace(/—/g, '-').replace(/&#8212;/g, '-');
                if (updated !== content) {
                    fs.writeFileSync(dirPath, updated);
                    console.log('Replaced em-dashes in: ' + dirPath);
                }
            } catch (e) {
                // skip
            }
        }
    }
}
replaceEmDashes(path.join(__dirname, 'src'));
replaceEmDashes(path.join(__dirname, 'public'));
console.log('Em-dash replacement completed successfully.');

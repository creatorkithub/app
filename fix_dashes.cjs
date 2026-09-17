const fs = require('fs');
const path = require('path');

function replaceEmDashes(dir) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (dirPath.includes('node_modules') || dirPath.includes('.git')) return;
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            replaceEmDashes(dirPath);
        } else if (f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.cjs') || f.endsWith('.txt') || f.endsWith('.md')) {
            let content = fs.readFileSync(dirPath, 'utf8');
            let updated = content.replace(/ - /g, ' - ');
            if (updated !== content) {
                fs.writeFileSync(dirPath, updated);
                console.log('Replaced em-dashes in: ' + dirPath);
            }
        }
    });
}
replaceEmDashes('./src');
replaceEmDashes('./public');
replaceEmDashes('./');

// Also inject the LLMS records manually since it's just appending
const llmsPath = path.join(__dirname, 'public', 'llms.txt');
let llmsContent = fs.readFileSync(llmsPath, 'utf-8');
const appendingRecords = `
- [Beyond Cookies: Browser Fingerprinting](https://creatorkithub.org/blog/browser-fingerprinting/): Explore how aggressive browser fingerprinting tracks users, and how strictly local processing creates an anonymous workspace.
- [The Evolution of the Canvas API](https://creatorkithub.org/blog/canvas-api-manipulation/): Discover how HTML5 Canvas combined with WebAssembly engines bypassed the traditional server model, enabling heavy offline image manipulations natively.`;

if (!llmsContent.includes('Browser Fingerprinting')) {
    llmsContent = llmsContent.replace('## Full Context', appendingRecords.trim() + '\n\n## Full Context');
    fs.writeFileSync(llmsPath, llmsContent);
    console.log('Updated public/llms.txt');
}

const llmsFullPath = path.join(__dirname, 'public', 'llms-full.txt');
let llmsFullContent = fs.readFileSync(llmsFullPath, 'utf-8');
const fullAppends = `
**Browser Fingerprinting: How Offline Client-Side Execution Defeats Tracking**
The era of clearing cookies is over. Explore how aggressive browser fingerprinting tracks users, and how strictly local processing creates an anonymous workspace.

**The Evolution of the Canvas API: Engineering Complex Image Manipulation Offline**
Discover how HTML5 Canvas combined with WebAssembly engines bypassed the traditional server model, enabling heavy offline image manipulations natively.
`;
if (!llmsFullContent.includes('Browser Fingerprinting')) {
    llmsFullContent = llmsFullContent.replace('### Productivity Utilities', '### Productivity Utilities' + fullAppends);
    fs.writeFileSync(llmsFullPath, llmsFullContent);
    console.log('Updated public/llms-full.txt');
}

console.log('Done');

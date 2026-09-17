const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function processFiles() {
    walkDir('./src', (filePath) => {
        if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

        let content = fs.readFileSync(filePath, 'utf-8');
        let originalContent = content;

        // Replace internal href attributes (like href="/blog" -> href="/blog/")
        // Make sure it doesn't match external URLs or already trailing slashed URLs
        content = content.replace(/href="(\/[a-zA-Z0-9-][a-zA-Z0-9-\/]*[^/])"/g, 'href="$1/"');

        // Similar for onClick={() => navigate('/blog')}
        content = content.replace(/navigate\('(\/[a-zA-Z0-9-][a-zA-Z0-9-\/]*[^/])'\)/g, 'navigate(\'$1/\')');
        content = content.replace(/onNavigate\('(\/[a-zA-Z0-9-][a-zA-Z0-9-\/]*[^/])'\)/g, 'onNavigate(\'$1/\')');

        // Replace instances of local-pdf with pdf-toolkit
        content = content.replace(/\/local-pdf/g, '/pdf-toolkit');

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content);
            console.log(`Updated ${filePath}`);
        }
    });
}

processFiles();

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, 'src', 'pages', 'blog');

const files = fs.readdirSync(BLOG_DIR);

let modifiedCount = 0;

for (const file of files) {
    if (!file.endsWith('.tsx')) continue;

    const filePath = path.join(BLOG_DIR, file);
    let originalCode = fs.readFileSync(filePath, 'utf-8');

    // If it already has it, skip
    if (originalCode.includes('AuthorBio')) {
        console.log(`Skipping ${file} - already modified.`);
        continue;
    }

    let resultcode = originalCode;

    // 1. Add Imports
    const importStats = `import { AuthorBio } from '../../components/AuthorBio';\nimport { BlogSchema } from '../../components/BlogSchema';\n`;

    // Find the last import
    const lastImportIndex = resultcode.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
        const nextLineIndex = resultcode.indexOf('\n', lastImportIndex);
        resultcode = resultcode.substring(0, nextLineIndex + 1) + importStats + resultcode.substring(nextLineIndex + 1);
    } else {
        resultcode = importStats + resultcode;
    }

    // 2. Extract Data
    // Title
    const titleMatch = resultcode.match(/<h1[^>]*>([^<]+)<\/h1>/);
    let title = 'Blog Post';
    if (titleMatch) title = titleMatch[1].trim();

    // Description
    const descMatch = resultcode.match(/<p className="text-xl sm:text-2xl[^>]*>([^<]+)<\/p>/);
    let description = '';
    if (descMatch) description = descMatch[1].trim();

    // Date
    // <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>\s*<span>(.*?)<\/span>
    const dateMatch = resultcode.match(/<span>(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[^<]*?<\/span>/);
    let date = 'Jan 1, 2024';
    if (dateMatch) date = dateMatch[0].replace(/<\/?span>/g, '').trim();

    // URL path
    const urlMatch = resultcode.match(/currentPath="([^"]+)"/);
    let urlPath = `/blog`;
    if (urlMatch) urlPath = urlMatch[1];


    // 3. Inject components
    // Right before <BlogFooter Use AuthorBio
    const footerInjectLocation = resultcode.indexOf('<BlogFooter');
    if (footerInjectLocation !== -1) {
        const schemaString = `\n                    <BlogSchema title="${title.replace(/"/g, '&quot;')}" description="${description.replace(/"/g, '&quot;')}" datePublished="${date}" url="${urlPath}" />\n                    <AuthorBio />\n                    `;

        resultcode = resultcode.substring(0, footerInjectLocation) + schemaString + resultcode.substring(footerInjectLocation);
    }

    if (resultcode !== originalCode) {
        fs.writeFileSync(filePath, resultcode, 'utf-8');
        console.log(`Successfully modified ${file}`);
        modifiedCount++;
    }
}

console.log(`Finished processing. Modified ${modifiedCount} files.`);

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, 'dist');

// Define all routes that need a physical index.html for a 200 OK
const routes = [
    'success',
    'privacy-policy',
    'terms-of-service',
    'contact-us',
    'about-us',
    'social-media-safe-zone-overlay',
    'safe-zone',
    'pdf-toolkit',
    'local-pdf',
    'pdf-toolkit/image-to-pdf',
    'pdf-toolkit/remover',
    'pdf-toolkit/splitter',
    'pdf-toolkit/merger',
    'pdf-toolkit/watermark',
    'pdf-toolkit/rotate',
    'pdf-toolkit/pdf-to-jpg',
    'pdf-toolkit/sanitizer',
    'pdf-toolkit/stamper',
    'pdf-toolkit/all-tools',
    'local-pdf/image-to-pdf',
    'local-pdf/remover',
    'local-pdf/splitter',
    'local-pdf/merger',
    'local-pdf/watermark',
    'local-pdf/rotate',
    'local-pdf/pdf-to-jpg',
    'local-pdf/sanitizer',
    'local-pdf/stamper',
    'local-pdf/all-tools',
    'universal-image-converter',
    'image-converter',
    'a11y-scorecard',
    'accessibility',
    'privashield',
    'exif-stripper',
    'crypto-audit',
    'password-analyzer',
    'text-encryption',
    'palette-extractor',
    'pomodoro-tracker',
    'tone-analyzer',
    'lorem-builder',
    'svg-tracer'
];

function generateRoutes() {
    const indexPath = path.join(DIST_DIR, 'index.html');

    if (!fs.existsSync(indexPath)) {
        console.error('Error: dist/index.html not found. Did the build fail?');
        process.exit(1);
    }

    const indexHtml = fs.readFileSync(indexPath, 'utf-8');

    console.log('Generating static HTML files for SPA routes...');
    let count = 0;

    const baseTitle = 'Creator Kit Hub - Client-Side Web Tools for Creators';
    const baseDescription = 'Creator Kit Hub is a free, 100% offline suite of client-side web tools for creators. Process PDFs, convert images, and secure files locally.';
    const baseCanonical = '<link rel="canonical" href="https://creatorkithub.org/" />';

    routes.forEach(route => {
        const routeDir = path.join(DIST_DIR, route);
        const targetPath = path.join(routeDir, 'index.html');

        if (!fs.existsSync(routeDir)) {
            fs.mkdirSync(routeDir, { recursive: true });
        }

        let customHtml = indexHtml;
        const routeParts = route.split('/');
        const pageName = routeParts[routeParts.length - 1]
            .split('-')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');

        const newTitle = `${pageName} - Creator Kit Hub`;
        const newDescription = `Free client-side tool: ${pageName}. 100% offline and secure.`;
        const newCanonical = `<link rel="canonical" href="https://creatorkithub.org/${route}/" />`;

        customHtml = customHtml.split(`<title>${baseTitle}</title>`).join(`<title>${newTitle}</title>`);
        customHtml = customHtml.split(baseCanonical).join(newCanonical);
        customHtml = customHtml.split(baseDescription).join(newDescription);
        customHtml = customHtml.split(baseTitle).join(newTitle);

        fs.writeFileSync(targetPath, customHtml);
        count++;
    });

    // Generate 404.html for SPA fallback
    const notFoundPath = path.join(DIST_DIR, '404.html');
    fs.writeFileSync(notFoundPath, indexHtml);

    console.log(`Successfully generated ${count} route files and 404.html for SEO indexing and SPA fallback.`);
}

generateRoutes();

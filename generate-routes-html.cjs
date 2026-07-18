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

    routes.forEach(route => {
        const routeDir = path.join(DIST_DIR, route);
        const targetPath = path.join(routeDir, 'index.html');

        if (!fs.existsSync(routeDir)) {
            fs.mkdirSync(routeDir, { recursive: true });
        }

        fs.writeFileSync(targetPath, indexHtml);
        count++;
    });

    // Generate 404.html for SPA fallback
    const notFoundPath = path.join(DIST_DIR, '404.html');
    fs.writeFileSync(notFoundPath, indexHtml);

    console.log(`Successfully generated ${count} route files and 404.html for SEO indexing and SPA fallback.`);
}

generateRoutes();

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

    console.log(`Successfully generated ${count} route files for SEO indexing.`);
}

generateRoutes();

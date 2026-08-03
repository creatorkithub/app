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

    let indexHtml = fs.readFileSync(indexPath, 'utf-8');

    // Make Vite CSS non-render blocking using preload methodology
    indexHtml = indexHtml.replace(
        /<link rel="stylesheet" crossorigin href="([^"]+)">/g,
        '<link rel="preload" as="style" crossorigin href="$1">\n  <link rel="stylesheet" crossorigin href="$1" media="print" onload="this.media=\'all\'">\n  <noscript><link rel="stylesheet" crossorigin href="$1"></noscript>'
    );

    console.log('Generating static HTML files for SPA routes...');
    let count = 0;

    const baseTitle = 'Creator Kit Hub - 100% Offline Client-Side Web Tools';
    const baseDescription = 'Creator Kit Hub offers a comprehensive, completely free, and 100% offline suite of client-side web tools. Securely process PDFs, convert high-resolution images, generate precise social media safe zones, and much more.';
    const baseCanonical = '<link rel="canonical" href="https://creatorkithub.org/" />';

    const internalLinksList = routes.map(r => `<li><a href="/${r}/">${r.split('-').join(' ')}</a></li>`).join('\n          ');
    const internalLinksHtml = `
      <nav aria-label="Internal Links">
        <ul>
          <li><a href="/">Home</a></li>
          ${internalLinksList}
        </ul>
      </nav>
    `;

    // Inject base SEO root content for the root index.html itself!
    const baseH1TitleTag = `<h1>${baseTitle}</h1>`;
    const baseH2DescTag = `<h2>${baseDescription}</h2>`;
    const baseSeoRootContent = `<div style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0;" aria-hidden="true">\n      ${baseH1TitleTag}\n      ${baseH2DescTag}\n      ${internalLinksHtml}\n    </div>`;
    const processedIndexHtml = indexHtml.split('<!-- SEO_ROOT_CONTENT -->').join(baseSeoRootContent);
    fs.writeFileSync(indexPath, processedIndexHtml);

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

        let newTitle = `${pageName} - Free Offline Creator Tools`;
        if (newTitle.length < 45) {
            newTitle = `${pageName} - Free 100% Offline Web Tools for Creators`;
        }

        const newDescription = `Experience the best free client-side web tool: ${pageName}. Enjoy 100% offline functionality, maximum privacy, and fast processing directly in your browser without any server uploads or limits.`;
        const newCanonical = `<link rel="canonical" href="https://creatorkithub.org/${route}/" />`;

        const h1TitleTag = `<h1>${newTitle}</h1>`;
        const h2DescTag = `<h2>${newDescription}</h2>`;
        const seoRootContent = `<div style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0;" aria-hidden="true">\n      ${h1TitleTag}\n      ${h2DescTag}\n      ${internalLinksHtml}\n    </div>`;

        customHtml = customHtml.split(`<title>${baseTitle}</title>`).join(`<title>${newTitle}</title>`);
        customHtml = customHtml.split(baseCanonical).join(newCanonical);
        customHtml = customHtml.split(baseDescription).join(newDescription);
        customHtml = customHtml.split(baseTitle).join(newTitle);
        customHtml = customHtml.split('<!-- SEO_ROOT_CONTENT -->').join(seoRootContent);

        fs.writeFileSync(targetPath, customHtml);
        count++;
    });

    // Generate 404.html for SPA fallback using processed base
    const notFoundPath = path.join(DIST_DIR, '404.html');
    fs.writeFileSync(notFoundPath, processedIndexHtml);

    console.log(`Successfully generated ${count} route files and 404.html for SEO indexing and SPA fallback.`);
}

generateRoutes();

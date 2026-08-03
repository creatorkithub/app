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

  // Canonical mapping for duplicate aliases
  const canonicalMap = {
    'local-pdf': 'pdf-toolkit',
    'local-pdf/image-to-pdf': 'pdf-toolkit/image-to-pdf',
    'local-pdf/remover': 'pdf-toolkit/remover',
    'local-pdf/splitter': 'pdf-toolkit/splitter',
    'local-pdf/merger': 'pdf-toolkit/merger',
    'local-pdf/watermark': 'pdf-toolkit/watermark',
    'local-pdf/rotate': 'pdf-toolkit/rotate',
    'local-pdf/pdf-to-jpg': 'pdf-toolkit/pdf-to-jpg',
    'local-pdf/sanitizer': 'pdf-toolkit/sanitizer',
    'local-pdf/stamper': 'pdf-toolkit/stamper',
    'local-pdf/all-tools': 'pdf-toolkit/all-tools',
    'image-converter': 'universal-image-converter',
    'accessibility': 'a11y-scorecard',
    'exif-stripper': 'privashield',
    'password-analyzer': 'crypto-audit',
    'safe-zone': 'social-media-safe-zone-overlay'
  };

  const seoMetaMap = {
    'pdf-toolkit/image-to-pdf': { title: 'Image to PDF Converter - Free Offline PDF Tool', desc: 'Securely convert JPG, PNG, and other images to a single PDF document entirely offline in your browser. No server uploads.' },
    'pdf-toolkit/remover': { title: 'PDF Page Remover - Delete PDF Pages Offline', desc: 'Easily select and remove unwanted pages from your PDF documents locally. Fast, free, and 100% secure.' },
    'pdf-toolkit/splitter': { title: 'PDF Splitter - Extract PDF Pages Offline', desc: 'Split your PDF files into individual pages or extract specific ranges directly in your browser without uploading.' },
    'pdf-toolkit/merger': { title: 'PDF Merger - Combine PDF Files Offline', desc: 'Merge multiple PDF documents into a single file quickly and securely. 100% client-side processing.' },
    'pdf-toolkit/watermark': { title: 'PDF Watermark Tool - Add Text/Image Stamps Offline', desc: 'Protect your PDFs by adding custom text or image watermarks locally in your browser. Zero server uploads.' },
    'pdf-toolkit/rotate': { title: 'PDF Rotator - Rotate PDF Pages Offline', desc: 'Rotate individual or all PDF pages instantly. Your files never leave your device for maximum privacy.' },
    'pdf-toolkit/pdf-to-jpg': { title: 'PDF to JPG Converter - Convert PDF to Image Offline', desc: 'Convert PDF document pages to high-quality JPG images securely in your browser without data limits.' },
    'pdf-toolkit/sanitizer': { title: 'PDF Metadata Sanitizer - Remove PDF Hidden Data Offline', desc: 'Scrub sensitive metadata, author info, and hidden tracking data from your PDFs entirely offline.' },
    'pdf-toolkit/stamper': { title: 'PDF Stamper - Add Pagination and Signatures Offline', desc: 'Stamp page numbers, images, and simple signatures onto your PDF files directly in your web browser.' },
    'pdf-toolkit/all-tools': { title: 'PDF Toolkit - 100% Offline Client-Side PDF Tools', desc: 'Access a comprehensive suite of offline PDF tools. Merge, split, edit, and convert PDFs securely without uploading.' },
    'universal-image-converter': { title: 'Universal Image Converter - Convert format Offline', desc: 'Convert between HEIC, JPG, PNG, WEBP, and more visually. Completely free and runs 100% locally.' },
    'a11y-scorecard': { title: 'A11y Scorecard - Web Accessibility Contrast Checker', desc: 'Analyze color contrast ratios and ensure web accessibility compliance (WCAG) instantly in your browser.' },
    'privashield': { title: 'PrivaShield EXIF Stripper - Remove Image Metadata Offline', desc: 'Protect your privacy by stripping GPS location and camera EXIF data from your photos before sharing.' },
    'crypto-audit': { title: 'CryptoAudit Password Analyzer - Offline Security Checker', desc: 'Test password strength and audit security locally. Your keystrokes never leave your device.' },
    'text-encryption': { title: 'Text Encryption - Secure Offline Message Encrypter', desc: 'Encrypt and decrypt sensitive text messages using military-grade AES encryption entirely offline.' },
    'palette-extractor': { title: 'Color Palette Extractor - Extract Colors from Images Offline', desc: 'Automatically extract harmonious color palettes from your uploaded images using local browser processing.' },
    'pomodoro-tracker': { title: 'Pomodoro Tracker - Offline Productivity Timer', desc: 'Boost your productivity with this offline Pomodoro timer. Focus blocks, quick breaks, zero distractions.' },
    'tone-analyzer': { title: 'Tone Analyzer - Offline Writing Assistant', desc: 'Count words, characters, and analyze the tone of your text passages directly in your web browser.' },
    'lorem-builder': { title: 'Lorem Ipsum Builder - Custom Dummy Text Generator', desc: 'Generate customized placeholder text (Lorem Ipsum) paragraphs instantly for your design mockups.' },
    'svg-tracer': { title: 'SVG Tracer - Raster to Vector Converter Offline', desc: 'Convert raster images (PNG, JPG) to scalable vector graphics (SVG) entirely within your browser memory.' },
    'social-media-safe-zone-overlay': { title: 'Social Media Safe Zone Overlay - TikTok & Reels Template', desc: 'Preview your videos with TikTok, Reels, and YouTube Shorts UI overlays to ensure your content is never blocked.' }
  };

  const seoParagraphs = `
      <article>
        <h3>Why Choose 100% Offline Client-Side Tools?</h3>
        <p>In today's digital landscape, privacy and security are paramount. Our suite of professional web tools strictly operates within your browser's local environment. This offline-first approach guarantees that your sensitive files, whether they are confidential PDFs, personal images, or secure passwords, are never uploaded to any remote server or third-party database. By leveraging advanced HTML5 capabilities and WebAssembly, we deliver lightning-fast data processing locally, completely eliminating slow upload times and bandwidth limitations.</p>
        
        <h3>Uncompromising Data Security</h3>
        <p>We believe that your data belongs to you. Every action you perform using our tool suite—from splitting and merging PDFs, extracting file palettes, cleaning EXIF metadata, to auditing passwords—is executed real-time on your own device's hardware. Once the web application is loaded, you can safely disconnect your internet connectivity and continue working without interruptions. This design eliminates the threat of man-in-the-middle attacks and data breaches associated with cloud processing services. Rest assured knowing your workflows are fortified with the highest level of client-side data security.</p>
        
        <h3>Comprehensive Suite for Creators</h3>
        <p>Creator Kit Hub is the ultimate destination for designers, developers, and content creators. We provide intuitive, high-performance utilities including universal image format conversion, precise social media safe zone overlays, accessibility scoring, Pomodoro tracking, and in-depth document sanitation. Our open-access, entirely free platform ensures you have the reliable offline creator tools you need securely at your fingertips, without requiring any software installations, account registrations, or subscriptions.</p>
      </article>
    `;

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
  const baseSeoRootContent = `<noscript>\n      ${baseH1TitleTag}\n      ${baseH2DescTag}\n      ${internalLinksHtml}\n      ${seoParagraphs}\n    </noscript>`;
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

    const canonicalRoute = canonicalMap[route] || route;
    const newCanonical = `<link rel="canonical" href="https://creatorkithub.org/${canonicalRoute}/" />`;
    const metaLookup = seoMetaMap[canonicalRoute];

    let newTitle = metaLookup ? metaLookup.title : `${pageName} - Free Offline Creator Tools`;
    if (!metaLookup && newTitle.length < 45) {
      newTitle = `${pageName} - Free 100% Offline Web Tools for Creators`;
    }

    const newDescription = metaLookup ? metaLookup.desc : `Experience the best free client-side web tool: ${pageName}. Enjoy 100% offline functionality, maximum privacy, and fast processing directly in your browser without any server uploads or limits.`;

    const h1TitleTag = `<h1>${newTitle}</h1>`;
    const h2DescTag = `<h2>${newDescription}</h2>`;
    const seoRootContent = `<noscript>\n      ${h1TitleTag}\n      ${h2DescTag}\n      ${internalLinksHtml}\n      ${seoParagraphs}\n    </noscript>`;

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

  // Dynamic Sitemap Generation (1-to-1 sync with Canonical Pages)
  const uniqueCanonicals = new Set(['']); // Insert root index
  routes.forEach(r => {
    const canonical = canonicalMap[r] || r;
    uniqueCanonicals.add(canonical);
  });

  const getPriority = (route) => {
    if (route === '') return '1.0';
    if (route.includes('pdf-toolkit')) return '0.9';
    if (['privacy-policy', 'terms-of-service', 'about-us', 'contact-us'].includes(route)) return '0.4';
    return '0.8';
  };

  const sitemapUrls = Array.from(uniqueCanonicals).map(route => {
    const fullUrl = route ? `https://creatorkithub.org/${route}/` : `https://creatorkithub.org/`;
    const lastmod = new Date().toISOString().split('T')[0];
    return `  <url>\n    <loc>${fullUrl}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${getPriority(route)}</priority>\n  </url>`;
  });

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.join('\n')}\n</urlset>`;

  // Inject directly into dist/ and maintain source public/ for parity
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapContent);
  const publicSitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
  if (fs.existsSync(path.dirname(publicSitemapPath))) fs.writeFileSync(publicSitemapPath, sitemapContent);

  console.log(`Successfully generated ${count} route files, 404.html SPA fallback, and fully populated dynamic sitemap.xml.`);
}

generateRoutes();

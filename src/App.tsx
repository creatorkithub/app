import { useState, useEffect, createContext, useContext, Suspense, lazy } from 'react';
import Hub from './pages/Hub';
import Success from './pages/Success';
import { PrivacyPolicy, TermsOfService, ContactUs, AboutUs } from './pages/LegalPages';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { CookieConsent } from './components/CookieConsent';
import MouseGlow from './components/MouseGlow';
import { AdProvider } from './contexts/AdContext';

const SafeZoneTool = lazy(() => import('./pages/SafeZoneTool'));
const LocalPdfStudio = lazy(() => import('./pages/LocalPdfStudio'));
const UniversalImageConverter = lazy(() => import('./components/UniversalImageConverter'));
const A11yScorecard = lazy(() => import('./components/A11yScorecard'));
const PrivaShield = lazy(() => import('./components/PrivaShield'));
const CryptoAudit = lazy(() => import('./components/CryptoAudit'));
const TextEncryption = lazy(() => import('./pages/TextEncryption'));
const PaletteExtractor = lazy(() => import('./pages/PaletteExtractor'));
const PomodoroTracker = lazy(() => import('./pages/PomodoroTracker'));
const WordCounter = lazy(() => import('./pages/WordCounter'));
const LoremBuilder = lazy(() => import('./pages/LoremBuilder'));
const SvgTracer = lazy(() => import('./pages/SvgTracer'));


export const RouterContext = createContext({
  navigate: (_path: string) => { }
});

export function useRouter() {
  return useContext(RouterContext);
}

export default function App() {
  const getLogicalPath = () => {
    let path = window.location.pathname;
    const base = import.meta.env.BASE_URL || '/';
    if (base !== '/' && path.startsWith(base)) {
      path = '/' + path.slice(base.length);
    } else if (base !== '/' && path === base.substring(0, base.length - 1)) {
      path = '/';
    }
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    return path;
  };

  const [currentPath, setCurrentPath] = useState(getLogicalPath);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showOfflineTooltip, setShowOfflineTooltip] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getLogicalPath());
    };
    window.addEventListener('popstate', handlePopState);

    // Listen for the PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    // Dynamic Multi-Manifest logic to allow independent tool installs
    const base = import.meta.env.BASE_URL || '/';
    const baseUrl = base !== '/' ? base.replace(/\/$/, '') : '';
    let manifestUrl = baseUrl + '/manifest.webmanifest';
    if (currentPath.startsWith('/pdf-toolkit') || currentPath.startsWith('/local-pdf')) manifestUrl = baseUrl + '/manifests/pdf.json';
    else if (currentPath.startsWith('/crypto-audit') || currentPath.startsWith('/password-analyzer')) manifestUrl = baseUrl + '/manifests/crypto.json';
    else if (currentPath.startsWith('/privashield') || currentPath.startsWith('/exif-stripper')) manifestUrl = baseUrl + '/manifests/exif.json';
    else if (currentPath.startsWith('/a11y-scorecard') || currentPath.startsWith('/accessibility')) manifestUrl = baseUrl + '/manifests/a11y.json';
    else if (currentPath.startsWith('/universal-image-converter') || currentPath.startsWith('/image-converter')) manifestUrl = baseUrl + '/manifests/image.json';
    else if (currentPath.startsWith('/social-media-safe-zone-overlay') || currentPath.startsWith('/safe-zone')) manifestUrl = baseUrl + '/manifests/safezone.json';
    else if (currentPath.startsWith('/text-encryption')) manifestUrl = baseUrl + '/manifests/text.json';
    else if (currentPath.startsWith('/palette-extractor')) manifestUrl = baseUrl + '/manifests/palette.json';
    else if (currentPath.startsWith('/pomodoro-tracker')) manifestUrl = baseUrl + '/manifests/pomodoro.json';
    else if (currentPath.startsWith('/tone-analyzer')) manifestUrl = baseUrl + '/manifests/tone.json';
    else if (currentPath.startsWith('/lorem-builder')) manifestUrl = baseUrl + '/manifests/lorem.json';
    else if (currentPath.startsWith('/svg-tracer')) manifestUrl = baseUrl + '/manifests/svg.json';

    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'manifest';
      document.head.appendChild(link);
    }
    link.href = manifestUrl;
  }, [currentPath]);

  useEffect(() => {
    const seoMetaMap: Record<string, { title: string, desc: string }> = {
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

    const canonicalMap: Record<string, string> = {
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

    const route = currentPath.replace(/^\//, ''); // Strip leading slash
    const canonicalRoute = canonicalMap[route] || route;
    const meta = seoMetaMap[canonicalRoute];

    if (meta) {
      document.title = meta.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', meta.desc);

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', meta.title);

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', meta.desc);
    } else if (currentPath === '/') {
      document.title = 'Creator Kit Hub - 100% Offline Client-Side Web Tools';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', 'Creator Kit Hub offers a comprehensive, completely free, and 100% offline suite of client-side web tools. Securely process PDFs, convert high-resolution images, generate precise social media safe zones, and much more.');
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', 'Creator Kit Hub - 100% Offline Client-Side Web Tools');
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', 'Creator Kit Hub offers a comprehensive, completely free, and 100% offline suite of client-side web tools. Securely process PDFs, convert high-resolution images, generate precise social media safe zones, and much more.');
    }
  }, [currentPath]);

  const navigate = (path: string) => {
    let fullPath = path;
    const base = import.meta.env.BASE_URL || '/';
    if (base !== '/') {
      fullPath = base.replace(/\/$/, '') + (path.startsWith('/') ? path : '/' + path);
    }
    window.history.pushState(null, '', fullPath);
    setCurrentPath(path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    if (currentPath === '/success') return <Success />;
    if (currentPath === '/privacy-policy') return <PrivacyPolicy />;
    if (currentPath === '/terms-of-service') return <TermsOfService />;
    if (currentPath === '/contact-us') return <ContactUs />;
    if (currentPath === '/about-us') return <AboutUs />;

    if (currentPath === '/social-media-safe-zone-overlay' || currentPath === '/safe-zone') {
      return <SafeZoneTool onBack={() => navigate('/')} />;
    }
    if (currentPath.startsWith('/pdf-toolkit') || currentPath.startsWith('/local-pdf')) {
      const toolId = currentPath.split('/')[2];
      return <LocalPdfStudio onBack={() => navigate('/')} initialTool={toolId} />;
    }
    if (currentPath === '/universal-image-converter' || currentPath === '/image-converter') {
      return (
        <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-8 font-sans selection:bg-orange-500/30 overflow-y-auto">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            <header className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all flex items-center" title="Back to Hub">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                </button>
                <div className="w-px h-6 bg-zinc-800 hidden sm:block"></div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                  </div>
                  <h1 className="font-bold text-lg text-zinc-100 tracking-tight">Universal Image Converter</h1>
                </div>
              </div>
            </header>
            <div className="flex-1 min-h-[600px]">
              <UniversalImageConverter />
            </div>
          </div>
        </div>
      );
    }
    if (currentPath === '/a11y-scorecard' || currentPath === '/accessibility') {
      return (
        <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-8 font-sans selection:bg-rose-500/30 overflow-y-auto">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            <header className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all flex items-center" title="Back to Hub">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                </button>
                <div className="w-px h-6 bg-zinc-800 hidden sm:block"></div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m14.31 8 5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16 3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94" /></svg>
                  </div>
                  <span className="font-bold text-lg text-zinc-100 tracking-tight">A11y Scorecard</span>
                </div>
              </div>
            </header>
            <div className="flex-1 min-h-[600px]">
              <A11yScorecard />
            </div>
          </div>
        </div>
      );
    }
    if (currentPath === '/privashield' || currentPath === '/exif-stripper') {
      return (
        <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-8 font-sans selection:bg-indigo-500/30 overflow-y-auto">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            <header className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all flex items-center" title="Back to Hub">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                </button>
                <div className="w-px h-6 bg-zinc-800 hidden sm:block"></div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  </div>
                  <h1 className="font-bold text-lg text-zinc-100 tracking-tight">PrivaShield Extractor</h1>
                </div>
              </div>
            </header>
            <div className="flex-1 min-h-[600px]">
              <PrivaShield />
            </div>
          </div>
        </div>
      );
    }
    if (currentPath === '/crypto-audit' || currentPath === '/password-analyzer') {
      return (
        <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-8 font-sans selection:bg-purple-500/30 overflow-y-auto">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            <header className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all flex items-center" title="Back to Hub">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                </button>
                <div className="w-px h-6 bg-zinc-800 hidden sm:block"></div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  </div>
                  <h1 className="font-bold text-lg text-zinc-100 tracking-tight">CryptoAudit</h1>
                </div>
              </div>
            </header>
            <div className="flex-1 min-h-[600px]">
              <CryptoAudit />
            </div>
          </div>
        </div>
      );
    }
    if (currentPath === '/text-encryption') return <TextEncryption onBack={() => navigate('/')} />;
    if (currentPath === '/palette-extractor') return <PaletteExtractor onBack={() => navigate('/')} />;
    if (currentPath === '/pomodoro-tracker') return <PomodoroTracker onBack={() => navigate('/')} />;
    if (currentPath === '/tone-analyzer') return <WordCounter onBack={() => navigate('/')} />;
    if (currentPath === '/lorem-builder') return <LoremBuilder onBack={() => navigate('/')} />;
    if (currentPath === '/svg-tracer') return <SvgTracer onBack={() => navigate('/')} />;

    return (
      <Hub onSelectTool={(toolId) => {
        if (toolId === 'local-pdf') navigate('/pdf-toolkit');
        else if (toolId === 'safe-zone') navigate('/social-media-safe-zone-overlay');
        else if (toolId === 'image-converter') navigate('/universal-image-converter');
        else if (toolId === 'a11y-scorecard') navigate('/a11y-scorecard');
        else if (toolId === 'privashield') navigate('/privashield');
        else if (toolId === 'crypto-audit') navigate('/crypto-audit');
        else if (toolId === 'text-encryption') navigate('/text-encryption');
        else if (toolId === 'palette-extractor') navigate('/palette-extractor');
        else if (toolId === 'pomodoro-tracker') navigate('/pomodoro-tracker');
        else if (toolId === 'tone-analyzer') navigate('/tone-analyzer');
        else if (toolId === 'lorem-builder') navigate('/lorem-builder');
        else if (toolId === 'svg-tracer') navigate('/svg-tracer');
      }} />
    );
  };

  return (
    <RouterContext.Provider value={{ navigate }}>
      <AdProvider>
        <MouseGlow />
        <Navbar navigate={navigate} />
        <div key={currentPath} className="animate-page-enter w-full h-full min-h-screen">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[600px]">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-zinc-800 border-t-zinc-400 rounded-full animate-spin"></div>
                <div className="text-zinc-500 text-sm font-bold animate-pulse tracking-widest uppercase">Loading Core Engine...</div>
              </div>
            </div>
          }>
            {renderPage()}
          </Suspense>
        </div>
        <CookieConsent />
        <Footer />

        {/* Global Floating Offline Indicator */}
        <div className="fixed bottom-6 right-6 z-[99] flex items-center gap-3">

          {/* Native Install Button (Only visible when browser allows installation and not on homepage) */}
          {deferredPrompt && currentPath !== '/' && (
            <button
              onClick={async () => {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') setDeferredPrompt(null);
              }}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full shadow-[0_4_20px_rgba(37,99,235,0.3)] transition-all font-bold text-[10px] uppercase tracking-wider animate-in slide-in-from-right-4 fade-in"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
              Install App
            </button>
          )}

          <div className="group relative" onClick={() => setShowOfflineTooltip(!showOfflineTooltip)} onMouseLeave={() => setShowOfflineTooltip(false)}>
            <div className="flex items-center gap-2 bg-[#18181b]/95 backdrop-blur-md border border-emerald-500/30 px-3 py-2 rounded-full shadow-[0_4_20px_rgba(16,185,129,0.15)] group-hover:bg-[#27272a] group-hover:border-emerald-500/50 transition-all cursor-pointer">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest hidden sm:inline-block pr-1">Works Offline</span>
            </div>

            {/* Hover Tooltip Details */}
            <div className={`absolute bottom-full right-0 mb-3 w-64 p-3 bg-[#18181b] border border-zinc-800 rounded-xl shadow-2xl transition-all duration-300 origin-bottom-right ${showOfflineTooltip ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0'}`}>
              <p className="text-xs text-zinc-400 leading-relaxed">
                <strong className="text-emerald-400 block mb-1">100% Client-Side Privacy</strong>
                All tools in the hub operate entirely within your browser memory. Even if you disconnect from the internet, your files are processed locally and never uploaded to any cloud server.
              </p>
              <div className="absolute -bottom-1.5 right-8 w-3 h-3 bg-[#18181b] border-b border-r border-zinc-800 transform rotate-45"></div>
            </div>
          </div>
        </div>
      </AdProvider>
    </RouterContext.Provider>
  );
}

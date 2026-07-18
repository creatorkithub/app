import { useState, useEffect } from 'react';
import { useSEO } from '../hooks/useSEO';
import { ArrowLeftRight, Code, Link as LinkIcon, Monitor, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

// --- MATH UTILS ---
const hexToRgb = (hex: string) => {
    let raw = hex.replace('#', '');
    if (raw.length === 3) raw = raw.split('').map(c => c + c).join('');
    const num = parseInt(raw, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
};

const getLuminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const calculateContrast = (hex1: string, hex2: string) => {
    try {
        const rgb1 = hexToRgb(hex1);
        const rgb2 = hexToRgb(hex2);
        const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
        const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
        const lightest = Math.max(l1, l2);
        const darkest = Math.min(l1, l2);
        return (lightest + 0.05) / (darkest + 0.05);
    } catch {
        return 1;
    }
};

const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h * 360, s, l];
};

const hslToRgb = (h: number, s: number, l: number) => {
    let r, g, b;
    h /= 360;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
};

export default function A11yScorecard() {
    const getQueryParam = (key: string) => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            return params.get(key);
        }
        return null;
    };

    const [fgColor, setFgColor] = useState(getQueryParam('fg') || '#3B82F6');
    const [bgColor, setBgColor] = useState(getQueryParam('bg') || '#09090B');
    const [contrast, setContrast] = useState(1);
    const [suggestions, setSuggestions] = useState<{ aa: string | null, aaa: string | null }>({ aa: null, aaa: null });

    useSEO({
        title: 'A11y Contrast Scorecard',
        description: 'Evaluate UI color accessibility locally without servers.',
        canonical: '/a11y-scorecard'
    });

    useEffect(() => {
        const ratio = calculateContrast(fgColor, bgColor);
        setContrast(ratio);

        // Smart HSL Engine: Find closest AA and AAA colors purely by shifting Lightness
        if (ratio < 7) {
            let foundAA = ratio >= 4.5 ? fgColor : null;
            let foundAAA = ratio >= 7 ? fgColor : null;

            try {
                const rgbBg = hexToRgb(bgColor);
                const lBg = getLuminance(rgbBg.r, rgbBg.g, rgbBg.b);
                const isBgDark = lBg < 0.5;

                const rgbFg = hexToRgb(fgColor);
                const [h, s, _lOriginal] = rgbToHsl(rgbFg.r, rgbFg.g, rgbFg.b);

                // If bg is dark, we need to lighten the foreground text until it hits the threshold.
                // If bg is light, we need to darken it.
                // We'll iterate L from 0 to 1 in 0.01 steps.
                for (let i = 0; i <= 100; i++) {
                    // Try going in the most logical direction first based on bg luminance
                    const lScan = isBgDark ? (i / 100) : (1 - (i / 100));

                    const scanRgb = hslToRgb(h, s, lScan);
                    const scanHex = rgbToHex(scanRgb[0], scanRgb[1], scanRgb[2]);
                    const scanRatio = calculateContrast(scanHex, bgColor);

                    if (!foundAA && scanRatio >= 4.5) foundAA = scanHex;
                    if (!foundAAA && scanRatio >= 7.0) foundAAA = scanHex;

                    if (foundAA && foundAAA) break;
                }
            } catch (e) { }

            setSuggestions({ aa: foundAA, aaa: foundAAA });
        } else {
            setSuggestions({ aa: null, aaa: null });
        }

    }, [fgColor, bgColor]);

    const swapColors = () => {
        const temp = fgColor;
        setFgColor(bgColor);
        setBgColor(temp);
    };

    const copyUrl = () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Shareable URL copied to clipboard!");
    };

    const generateCSS = () => {
        const content = `:root {\n  --color-foreground: ${fgColor};\n  --color-background: ${bgColor};\n}`;
        navigator.clipboard.writeText(content);
        alert("CSS Custom Properties copied to clipboard!");
    };

    return (
        <div className="flex flex-col gap-12 text-zinc-100">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Pane - Controls */}
                <div className="w-full lg:w-96 flex flex-col gap-6">
                    <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">Config Workspace</h2>

                        <div className="space-y-4">
                            {/* Text Color Input */}
                            <div>
                                <label className="block text-sm font-semibold text-zinc-300 mb-2">Foreground (Text)</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={fgColor}
                                        onChange={(e) => setFgColor(e.target.value.toUpperCase())}
                                        className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                                    />
                                    <input
                                        type="text"
                                        value={fgColor}
                                        onChange={(e) => setFgColor(e.target.value.toUpperCase())}
                                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 font-mono uppercase focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-center -my-2 relative z-10">
                                <button
                                    onClick={swapColors}
                                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full border border-zinc-700 shadow-md transition-colors"
                                >
                                    <ArrowLeftRight size={16} className="text-zinc-400 rotate-90" />
                                </button>
                            </div>

                            {/* Background Color Input */}
                            <div>
                                <label className="block text-sm font-semibold text-zinc-300 mb-2">Background Layer</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value.toUpperCase())}
                                        className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                                    />
                                    <input
                                        type="text"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value.toUpperCase())}
                                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 font-mono uppercase focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80">
                        <h3 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider">Export Setup</h3>
                        <div className="flex flex-col gap-3">
                            <button onClick={copyUrl} className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-sm font-medium">
                                <LinkIcon size={16} className="text-blue-400" /> Copy Shareable URL
                            </button>
                            <button onClick={generateCSS} className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-sm font-medium">
                                <Code size={16} className="text-orange-400" /> Export CSS Variables
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Pane - Evaluator */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">
                    {/* Metric Hero */}
                    <div className="bg-zinc-900/40 p-8 rounded-2xl border border-zinc-800/80 flex items-center justify-between">
                        <div>
                            <h2 className="text-zinc-400 font-semibold mb-2">Calculated Contrast Ratio</h2>
                            <div className="flex items-baseline gap-3">
                                <span className={`text-6xl font-extrabold tracking-tight ${contrast >= 4.5 ? 'text-green-400' : 'text-red-400'}`}>
                                    {contrast.toFixed(2)}
                                </span>
                                <span className="text-3xl text-zinc-500 font-medium">: 1</span>
                            </div>
                            <p className="mt-3 text-sm text-zinc-500">Based on WCAG 2.1 specific relative luminance logic.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Badges */}
                            {[
                                { label: 'Normal Text (AA)', req: 4.5 },
                                { label: 'Large Text (AA)', req: 3.0 },
                                { label: 'Normal Text (AAA)', req: 7.0 },
                                { label: 'Large Text (AAA)', req: 4.5 },
                            ].map((tier, i) => (
                                <div key={i} className="flex flex-col items-center p-3 rounded-xl bg-zinc-950 border border-zinc-800/50 w-full">
                                    <div className="text-xs text-zinc-500 font-semibold mb-2 text-center h-8">{tier.label}</div>
                                    {contrast >= tier.req ? (
                                        <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20 flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg> PASS
                                        </div>
                                    ) : (
                                        <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-bold border border-red-500/20 flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg> FAIL
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Suggestions Engine */}
                    {contrast < 7 && (suggestions.aa || suggestions.aaa) && (
                        <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80">
                            <h3 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                Smart Alternative Suggestions
                                <span className="text-xs text-zinc-600 normal-case font-medium ml-2 border border-zinc-800 px-2 py-0.5 rounded-md">
                                    Calculated against {bgColor}
                                </span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {suggestions.aa && suggestions.aa !== fgColor && contrast < 4.5 && (
                                    <button
                                        onClick={() => setFgColor(suggestions.aa!)}
                                        className="p-4 rounded-xl border border-zinc-700 bg-zinc-950 hover:border-blue-500 transition-colors text-left flex items-center justify-between group"
                                    >
                                        <div>
                                            <div className="text-xs text-zinc-500 font-bold mb-1">Meet exact AA threshold</div>
                                            <div className="font-mono text-lg">{suggestions.aa}</div>
                                        </div>
                                        <div className="w-10 h-10 rounded-lg border border-zinc-800 shadow-sm" style={{ backgroundColor: suggestions.aa }}></div>
                                    </button>
                                )}

                                {suggestions.aaa && suggestions.aaa !== fgColor && contrast < 7.0 && (
                                    <button
                                        onClick={() => setFgColor(suggestions.aaa!)}
                                        className="p-4 rounded-xl border border-zinc-700 bg-zinc-950 hover:border-blue-500 transition-colors text-left flex items-center justify-between group"
                                    >
                                        <div>
                                            <div className="text-xs text-zinc-500 font-bold mb-1">Meet exact AAA threshold</div>
                                            <div className="font-mono text-lg">{suggestions.aaa}</div>
                                        </div>
                                        <div className="w-10 h-10 rounded-lg border border-zinc-800 shadow-sm" style={{ backgroundColor: suggestions.aaa }}></div>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Live Sandbox Preview */}
                    <div
                        className="flex-1 rounded-2xl border border-zinc-800/80 p-8 shadow-inner overflow-hidden relative flex flex-col gap-6 transition-colors duration-300"
                        style={{ backgroundColor: bgColor }}
                    >
                        <div className="absolute top-4 right-6 text-xs uppercase font-bold opacity-30 tracking-widest" style={{ color: fgColor }}>
                            Live UI Preview
                        </div>

                        <h1 className="text-4xl font-extrabold tracking-tight mt-6 transition-colors duration-300" style={{ color: fgColor }}>
                            Scorecard Framework Pro
                        </h1>

                        <p className="text-lg leading-relaxed max-w-2xl transition-colors duration-300" style={{ color: fgColor }}>
                            This is a simulated body paragraph demonstrating how <strong>normal sized text</strong> behaves against your chosen background layer. Proper contrast is critical for legibility, reducing eye strain, and supporting users with visual impairments.
                        </p>

                        <div className="mt-4 flex gap-4">
                            <button
                                className="px-6 py-3 rounded-lg font-bold shadow-sm transition-all duration-300"
                                style={{ backgroundColor: fgColor, color: bgColor }}
                            >
                                Primary Action
                            </button>
                            <button
                                className="px-6 py-3 rounded-lg font-bold border-2 transition-all duration-300"
                                style={{ borderColor: fgColor, color: fgColor }}
                            >
                                Secondary Outlined
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Information Section */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 mb-16 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-32 bg-rose-500/10 blur-[100px] pointer-events-none"></div>

                <div className="text-center mb-16 relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold mb-6 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                        <Monitor size={16} /> Accessibility Standard
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
                        A11y Contrast Scorecard <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">& UI Simulator Matrix</span>
                    </h2>
                    <p className="mt-8 text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                        Evaluate color contrast against WCAG guidelines directly in your browser. Ensure your text is legible and compliant without sending your designs to any server.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    {/* WCAG Card */}
                    <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                        <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(236,72,153,0.1)]">
                            <AlertCircle size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-100 mb-4">Understanding WCAG 2.1 Compliance</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            The Web Content Accessibility Guidelines (WCAG) dictate mathematical formulas for determining visual contrast latency. According to the architecture, structural text needs to meet a minimum luminance ratio relative to the layer beneath it.
                        </p>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            For Level AA compliance (the global standard for websites and enterprise web applications), standard body text must hit a ratio of at least 4.5:1. For the stricter Level AAA standard favored by government portals and civic software, the threshold jumps to 7.0:1. Our scorecard calculates the precise contrast score down to two decimal places in less than a millisecond natively.
                        </p>
                    </div>

                    {/* Zero-Server Card */}
                    <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                            <Lock size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-100 mb-4">Zero-Server Color Processing</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            Many edge contrast checking websites rely on hitting design APIs to evaluate your palette, unknowingly exposing your unreleased corporate branding structures to analytics tracking. Our Scorecard bypasses the cloud completely.
                        </p>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            The entire React component is hydrated via bundled Webpack chunks loaded directly into your hardware memory. Because the color conversions run in real-time on your computer's CPU, the live UI sandbox reacts instantaneously to your color picker adjustments without awaiting a server response.
                        </p>
                    </div>

                    {/* Offline Card */}
                    <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <CheckCircle2 size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-100 mb-4">Offline Accessible Design</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            Because Creator Kit Hub utilizes a Progressive Web Application Service Worker wrapper, you do not need an active internet connection to evaluate your accessibility metrics.
                        </p>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Our math-driven evaluation engine fundamentally does not require pinging an external dataset, allowing you to design and validate your contrast ratios confidently on airplanes, remote photo shoots, or in restricted intranet networks.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

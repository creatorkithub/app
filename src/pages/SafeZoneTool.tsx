import { useState, useEffect } from 'react';
import { useSEO } from '../hooks/useSEO';
import { useAdContext } from '../contexts/AdContext';
import { Upload, Download, Settings, Grid, Monitor, Lock, Loader2, HelpCircle } from 'lucide-react';
import { FaTiktok, FaInstagram, FaYoutube } from 'react-icons/fa';
import JSZip from 'jszip';
import { cn } from '../lib/utils';
import SafeZoneCanvas from '../components/SafeZoneCanvas';
import type { Position, TemplateOption } from '../types';
import { drawSafeZoneOverlay, TEMPLATE_DIMS } from '../lib/canvas';
import { ArrowLeft } from 'lucide-react';

export default function SafeZoneTool({ onBack }: { onBack: () => void }) {
  const { triggerCTA } = useAdContext();
  const [activeTab, setActiveTab] = useState<'template' | 'adjust'>('template');

  const [template, setTemplate] = useState<TemplateOption>(() => {
    return (localStorage.getItem('sz_template') as TemplateOption) || 'tiktok';
  });

  useSEO(
    'Social Media Safe-Zone Preview & Composer',
    'Visually guide and optimize your media layouts for Instagram Reels, YouTube Shorts, and TikTok with strict safe-zones.',
    '/social-media-safe-zone-overlay'
  );

  const [media, setMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [bgColor, setBgColor] = useState('#18181b');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    localStorage.setItem('sz_template', template);
  }, [template]);

  const [isDragOver, setIsDragOver] = useState(false);

  const processFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/');

    setMedia(url);
    setMediaType(isVideo ? 'video' : 'image');

    const dims = TEMPLATE_DIMS[template];

    if (isVideo) {
      const vid = document.createElement('video');
      vid.src = url;
      vid.onloadedmetadata = () => {
        const fitScale = Math.min(dims.w / vid.videoWidth, dims.h / vid.videoHeight);
        setScale(fitScale);
        setPosition({ x: (dims.w - (vid.videoWidth * fitScale)) / 2, y: (dims.h - (vid.videoHeight * fitScale)) / 2 });
        setActiveTab('adjust');
      };
    } else {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        const fitScale = Math.min(dims.w / img.width, dims.h / img.height);
        setScale(fitScale);
        setPosition({ x: (dims.w - (img.width * fitScale)) / 2, y: (dims.h - (img.height * fitScale)) / 2 });
        setActiveTab('adjust');
      };
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScale = parseFloat(e.target.value);
    if (!media) {
      setScale(newScale);
      return;
    }
    const dims = TEMPLATE_DIMS[template];
    const cx = dims.w / 2;
    const cy = dims.h / 2;

    const imgX = (cx - position.x) / scale;
    const imgY = (cy - position.y) / scale;

    setScale(newScale);
    setPosition({ x: cx - imgX * newScale, y: cy - imgY * newScale });
  };

  const downloadBlob = (blob: Blob | null, filename: string) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const exportVideo = async () => {
    if (!media) return;
    setIsExporting(true);

    const dims = TEMPLATE_DIMS[template];
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = dims.w;
    exportCanvas.height = dims.h;
    const ctx = exportCanvas.getContext('2d');

    const vid = document.createElement('video');
    vid.src = media;
    vid.muted = true;

    await new Promise(resolve => {
      vid.onloadedmetadata = resolve;
    });

    const stream = (exportCanvas as any).captureStream(30);
    try {
      const audioStream = (vid as any).captureStream ? (vid as any).captureStream() : (vid as any).mozCaptureStream ? (vid as any).mozCaptureStream() : null;
      if (audioStream) {
        const audioTracks = audioStream.getAudioTracks();
        if (audioTracks.length > 0) {
          stream.addTrack(audioTracks[0]);
        }
      }
    } catch (e) { }

    let options = { mimeType: 'video/webm' };
    if (!MediaRecorder.isTypeSupported('video/webm')) {
      options = { mimeType: 'video/mp4' };
    }
    const recorder = new MediaRecorder(stream, options);
    const chunks: Blob[] = [];

    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      let ext = options.mimeType.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(chunks, { type: options.mimeType });
      downloadBlob(blob, `safe_zone_video_${template}.` + ext);
      setIsExporting(false);
    };

    vid.currentTime = 0;
    vid.play();
    recorder.start();

    const drawFrame = () => {
      if (!ctx || vid.paused || vid.ended) return;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, dims.w, dims.h);
      ctx.drawImage(vid, position.x, position.y, vid.videoWidth * scale, vid.videoHeight * scale);
      requestAnimationFrame(drawFrame);
    };

    vid.addEventListener('play', () => requestAnimationFrame(drawFrame));
    vid.onended = () => recorder.stop();
  };

  const handleExport = () => {
    if (!media) return;

    if (mediaType === 'video') {
      exportVideo();
      return;
    }

    const dims = TEMPLATE_DIMS[template];
    const canvas = document.createElement('canvas');
    canvas.width = dims.w;
    canvas.height = dims.h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, dims.w, dims.h);

    const img = new Image();
    img.src = media;
    img.onload = () => {
      ctx.drawImage(img, position.x, position.y, img.width * scale, img.height * scale);
      canvas.toBlob((blob) => downloadBlob(blob, `exported_artwork_${template}.png`), 'image/png');
    };
  };

  const handleExportOverlay = () => {
    const dims = TEMPLATE_DIMS[template];
    const canvas = document.createElement('canvas');
    canvas.width = dims.w;
    canvas.height = dims.h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background remains strictly clear/transparent. Process only overlays:
    drawSafeZoneOverlay(ctx, template);

    canvas.toBlob((blob) => downloadBlob(blob, `transparent_guide_${template}.png`), 'image/png');
  };

  const organicTemplates: { id: TemplateOption; label: string; ratio: string; Icon: any }[] = [
    { id: 'tiktok', label: 'TikTok Video', ratio: '9:16', Icon: FaTiktok },
    { id: 'ig-story', label: 'IG Story', ratio: '9:16', Icon: FaInstagram },
    { id: 'ig-post', label: 'IG Post', ratio: '1:1', Icon: FaInstagram },
    { id: 'yt', label: 'YouTube Thumbnail', ratio: '16:9', Icon: FaYoutube },
    { id: 'yt-shorts', label: 'YT Shorts', ratio: '9:16', Icon: FaYoutube },
  ];

  const adTemplates: { id: TemplateOption; label: string; ratio: string }[] = [
    { id: 'ad-feed-square', label: 'Feed (Square)', ratio: '1:1' },
    { id: 'ad-feed-vertical', label: 'Feed (Vertical)', ratio: '4:5' },
    { id: 'ad-story', label: 'Stories', ratio: '9:16' },
    { id: 'ad-reel', label: 'Reels', ratio: '9:16' },
    { id: 'ad-landscape', label: 'Landscape', ratio: '16:9' },
  ];

  const handleDownloadAllGuides = async () => {
    const zip = new JSZip();
    const allTemplates = [...organicTemplates, ...adTemplates];

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    for (const t of allTemplates) {
      const dims = TEMPLATE_DIMS[t.id];
      canvas.width = dims.w;
      canvas.height = dims.h;
      ctx.clearRect(0, 0, dims.w, dims.h);

      drawSafeZoneOverlay(ctx, t.id);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (blob) {
        zip.file(`transparent_guide_${t.id}.png`, blob);
      }
    }

    const referenceText = `Official Social Media Safe Zone & Ad Specifications\n\nTikTok:\nhttps://ads.tiktok.com/help/article/tiktok-auction-in-feed-ads?lang=en\n\nMeta Ads and FB/Instagram:\nhttps://www.facebook.com/business/ads-guide/update\n\nGenerated by Creator Kit Hub (https://creatorkithub.org)`;
    zip.file('REFERENCES.txt', referenceText);

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, 'social_media_safe_zones.zip');
  };


  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden pb-12">
      <div className="flex flex-col md:flex-row min-h-[100dvh] w-full">

        {/* Left Sidebar - Controls */}
        <aside className="w-full md:w-80 flex-shrink-0 border-t md:border-t-0 md:border-r border-[#27272a] bg-[#18181b] flex flex-col z-20 shadow-2xl relative order-2 md:order-1">
          <div className="p-3 md:p-5 border-b border-[#27272a]">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <button onClick={onBack} className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5 transition-colors bg-zinc-800/50 hover:bg-zinc-700 px-3 py-1.5 rounded-full border border-zinc-700">
                <ArrowLeft size={14} /> Back to Hub
              </button>
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2 leading-tight">
              <Monitor className="text-blue-400 flex-shrink-0" size={24} />
              Safe-Zone Overlay
            </h1>
            <p className="hidden md:block text-xs text-zinc-400 mt-2">Visual layout optimizer</p>
          </div>

          <div className="flex border-b border-[#27272a]">
            <button
              onClick={() => setActiveTab('template')}
              className={cn("flex-1 py-2 md:py-3 text-sm font-medium transition-colors border-b-2", activeTab === 'template' ? "border-blue-500 text-blue-400" : "border-transparent text-zinc-400 hover:text-zinc-200")}
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab('adjust')}
              className={cn("flex-1 py-2 md:py-3 text-sm font-medium transition-colors border-b-2", activeTab === 'adjust' ? "border-blue-500 text-blue-400" : "border-transparent text-zinc-400 hover:text-zinc-200")}
            >
              Adjust
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-5">
            {activeTab === 'template' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-zinc-300 mb-4 flex items-center gap-2">
                    <Grid size={16} /> Select Platform
                  </h3>
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mt-1 mb-1">Social Organic</h4>
                    {organicTemplates.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTemplate(t.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-lg border transition-all",
                          template === t.id
                            ? "border-blue-500/50 bg-blue-500/10 shadow-[0_0_15px_rgba(37,99,235,0.1)]"
                            : "border-[#27272a] bg-zinc-800/30 hover:bg-zinc-800/80"
                        )}
                      >
                        <span className={cn("font-medium text-sm flex items-center gap-2.5", template === t.id ? "text-blue-400" : "text-zinc-300")}>
                          <t.Icon size={16} className={cn(template === t.id ? "text-blue-400" : "text-zinc-500")} />
                          {t.label}
                        </span>
                        <span className={cn("text-xs font-medium", template === t.id ? "text-blue-500" : "text-zinc-500")}>{t.ratio}</span>
                      </button>
                    ))}

                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mt-4 mb-1">Meta Ads</h4>
                    {adTemplates.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTemplate(t.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-lg border transition-all",
                          template === t.id
                            ? "border-blue-500/50 bg-blue-500/10 shadow-[0_0_15px_rgba(37,99,235,0.1)]"
                            : "border-[#27272a] bg-zinc-800/30 hover:bg-zinc-800/80"
                        )}
                      >
                        <span className={cn("font-medium text-sm", template === t.id ? "text-blue-400" : "text-zinc-300")}>{t.label}</span>
                        <span className={cn("text-xs font-medium", template === t.id ? "text-blue-500" : "text-zinc-500")}>{t.ratio}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl mt-4">
                  <h4 className="text-xs font-bold text-blue-400 mb-1 flex items-center gap-1.5"><Download size={14} /> Raw Guidelines</h4>
                  <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">Save the red safe-zone grids on a transparent background to overlay inside your video editor.</p>
                  <button
                    onClick={() => triggerCTA(handleExportOverlay, { mode: 'vignette', title: 'Processing your file...', subtitle: 'Please wait.' })}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs border border-blue-500/20"
                  >
                    Download .PNG Overlay
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'adjust' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
                    <Settings size={16} /> File Controls
                  </h3>

                  {!media ? (
                    <div className="text-center p-4 bg-zinc-900/50 rounded-lg border border-[#27272a]">
                      <p className="text-sm text-zinc-400">Please upload a file first.</p>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <label className="text-xs font-medium text-zinc-400">Scale / Zoom</label>
                          <span className="text-xs font-medium text-blue-400">{Math.round(scale * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="5"
                          step="0.01"
                          value={scale}
                          onChange={handleScaleChange}
                          className="w-full accent-blue-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-medium text-zinc-400">Fill Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-10 h-10 p-1 rounded bg-[#27272a] border border-[#3f3f46] cursor-pointer"
                          />
                          <input
                            type="text"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="flex-1 bg-[#27272a] text-sm text-white px-3 rounded border border-[#3f3f46] focus:border-blue-500 focus:outline-none transition-colors uppercase font-mono"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const dims = TEMPLATE_DIMS[template];
                          if (mediaType === 'video') {
                            const vid = document.createElement('video');
                            vid.src = media;
                            vid.onloadedmetadata = () => {
                              const fitScale = Math.min(dims.w / vid.videoWidth, dims.h / vid.videoHeight);
                              setScale(fitScale);
                              setPosition({ x: (dims.w - (vid.videoWidth * fitScale)) / 2, y: (dims.h - (vid.videoHeight * fitScale)) / 2 });
                            };
                          } else {
                            const img = new Image();
                            img.src = media;
                            img.onload = () => {
                              const fitScale = Math.min(dims.w / img.width, dims.h / img.height);
                              setScale(fitScale);
                              setPosition({ x: (dims.w - (img.width * fitScale)) / 2, y: (dims.h - (img.height * fitScale)) / 2 });
                            };
                          }
                        }}
                        className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm text-zinc-300 font-medium transition-colors"
                      >
                        Reset Position & Scale
                      </button>

                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="p-3 md:p-5 border-t border-[#27272a] bg-[#18181b] space-y-2 md:space-y-3">
            {media && (
              <button
                onClick={() => { setMedia(null); setActiveTab('template'); }}
                className="w-full py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded transition-colors"
              >
                Remove file
              </button>
            )}
            <button
              onClick={() => triggerCTA(handleExport, { mode: 'rewarded', title: 'Processing your file...', subtitle: 'Please wait.' })}
              disabled={!media || isExporting}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-2 md:py-3 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] shadow-blue-500/20 active:scale-[0.98]",
                media && !isExporting ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-zinc-800 text-zinc-500 shadow-none cursor-not-allowed"
              )}
            >
              {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              {isExporting ? 'Processing Video...' : 'Export Final Design'}
            </button>
          </div>
        </aside>

        <main className="flex-1 relative flex flex-col bg-zinc-950 overflow-hidden border-b border-zinc-800 md:border-none h-[50dvh] md:h-auto min-h-[400px] order-1 md:order-2">
          <div className="absolute top-0 left-0 right-0 p-3 md:p-4 flex justify-between items-center z-50 pointer-events-none">
            <div className="pointer-events-auto bg-zinc-900/80 backdrop-blur-md border border-[#27272a] rounded-full px-3 py-1.5 md:px-4 md:py-2 flex items-center gap-2 md:gap-3 shadow-xl transform scale-90 md:scale-100 origin-top-left">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></div>
              <span className="text-xs font-medium text-zinc-300 uppercase tracking-wider">Live Preview</span>
            </div>

            <button
              onClick={() => triggerCTA(handleDownloadAllGuides, { mode: 'rewarded', title: 'Processing your file...', subtitle: 'Please wait.' })}
              className="pointer-events-auto bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full px-3 py-1.5 md:px-5 md:py-2 flex items-center gap-1.5 md:gap-2 shadow-xl backdrop-blur-md transition-all font-bold uppercase tracking-wider h-8 md:h-10 text-[9px] md:text-[11px]"
            >
              <Download size={14} className="w-3 h-3 md:w-3.5 md:h-3.5" /> <span className="hidden sm:inline">Download All Formats (ZIP)</span><span className="inline sm:hidden">ZIP All</span>
            </button>
          </div>

          <div className={cn("flex-1 flex justify-center p-4 md:p-8 relative", !media ? "items-center md:items-start md:pt-32" : "items-center")}>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-zinc-950 to-zinc-950 pointer-events-none"></div>

            {!media ? (
              <label
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
                onDrop={handleDrop}
                className={cn(
                  "w-full max-w-2xl aspect-square md:aspect-video border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer group shadow-2xl relative z-10 p-6 text-center",
                  isDragOver ? "border-blue-500 bg-blue-500/10" : "border-zinc-700/50 bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-blue-500/50"
                )}
              >
                <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp, video/mp4, video/quicktime, video/webm" onChange={handleMediaUpload} />
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-zinc-800/80 flex items-center justify-center mb-4 md:mb-5 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300 shadow-xl border border-zinc-700">
                  <Upload className={cn("transition-colors", isDragOver ? "text-blue-400" : "text-zinc-400 group-hover:text-blue-400")} size={24} />
                </div>
                <h2 className="text-lg md:text-xl font-semibold text-zinc-200 mb-2 font-sans tracking-tight">
                  {isDragOver ? "Drop file here" : "Upload your file"}
                </h2>
                <p className="text-xs md:text-sm text-zinc-500 font-medium mb-5">Drag and drop or click to browse (Images & Videos)</p>

                <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                  <Lock size={14} />
                  <span className="text-[11px] font-semibold uppercase tracking-wider">100% Private • Processed Locally</span>
                </div>
              </label>
            ) : (
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center animate-in fade-in duration-500">
                <SafeZoneCanvas
                  mediaSrc={media}
                  mediaType={mediaType}
                  template={template}
                  scale={scale}
                  position={position}
                  setPosition={setPosition}
                  backgroundColor={bgColor}
                />

                <p className="absolute bottom-4 bg-zinc-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-[#27272a] text-xs font-medium text-zinc-400 shadow-xl pointer-events-none">
                  Tip: You can click and drag the media on the canvas to reposition.
                </p>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Dynamic Textual Guides & Instructions */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-16 sm:mt-24 w-full">
        <div className="bg-zinc-950/50 p-6 md:p-10 rounded-3xl border border-zinc-800/80 shadow-2xl backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4 flex items-center gap-2">
            <HelpCircle className="text-blue-400" /> How to use the Safe-Zone Tool
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
              <p><strong>1. Upload your media:</strong> Drag and drop your JPG, PNG, or MP4 video files into the central canvas. Alternatively, click the upload circle to browse your local device.</p>
              <p><strong>2. Select your target platform:</strong> Use the left sidebar under the "Templates" tab to instantly toggle between TikTok, Reels, Shorts, and various ad formats. The red zones indicate areas that will be blocked by UI elements like captions, profile pictures, and like buttons.</p>
              <p><strong>3. Adjust positioning:</strong> Switch to the "Adjust" tab to zoom in or precisely translate your video layer until all essential faces and texts avoid the red blocking areas.</p>
              <p><strong>4. Export your proof:</strong> Export a final MP4/PNG of your adjustments, or click "Download All Formats (ZIP)" to get transparent overlay files for your favorite video editor.</p>
            </div>
            <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 mt-4 md:mt-0">
              <h3 className="font-bold text-zinc-200 mb-3 flex items-center gap-2">
                <HelpCircle size={18} className="text-blue-400" /> Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-zinc-300 font-semibold text-sm">Why is my video lagging during playback?</h4>
                  <p className="text-zinc-500 text-xs mt-1">We render the video through a fast HTML5 loop to calculate aspect ratios inside your browser dynamically. If you are previewing large 4K files, consider converting a low-res proxy for layout checks.</p>
                </div>
                <div>
                  <h4 className="text-zinc-300 font-semibold text-sm">Are the transparent guides exactly pixel-perfect?</h4>
                  <p className="text-zinc-500 text-xs mt-1">Yes. Unlike estimating safe zones in software like Premiere Pro, our guidelines map perfectly to the aspect ratios mandated by the parent social platforms' latest developer documentations.</p>
                </div>
                <div className="pt-2 border-t border-zinc-800/80 mt-4">
                  <h4 className="text-zinc-200 font-semibold text-sm mb-3">Official Platform Specifications</h4>
                  <ul className="space-y-3">
                    <li>
                      <a href="https://ads.tiktok.com/help/article/tiktok-auction-in-feed-ads?lang=en" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-2 transition-colors">
                        <FaTiktok size={14} className="opacity-80" /> TikTok In-Feed Ads Spec
                      </a>
                    </li>
                    <li>
                      <a href="https://www.facebook.com/business/ads-guide/update" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-2 transition-colors">
                        <FaInstagram size={14} className="opacity-80" /> Meta (Facebook & Instagram) Ads Spec
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-24 mb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-32 bg-blue-500/10 blur-[100px] pointer-events-none"></div>

        <div className="text-center mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-6 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
            <Monitor size={16} /> Layout Architecture
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Pixel-Perfect Safe Area Overlays <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">& Layout Simulation Engine</span>
          </h2>
          <p className="mt-8 text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            A simple, private toolkit for previewing how your content looks on TikTok, Reels, and Shorts. Ensure your UI elements are never blocked by platform overlays.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {/* Security Card */}
          <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Lock size={28} />
            </div>
            <h3 className="text-xl font-bold text-zinc-100 mb-4">The Danger of Cloud Drafts</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              When producing unreleased television commercials or confidential product reveals, marketing teams often resort to uploading draft MP4 files to random online template websites just to check safety margins. This exposes your intellectual property to interception and metadata scraping.
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Our Safe-Zone toolkit operates on a zero-trust, client-side paradigm. By leveraging modern HTML5 &lt;canvas&gt; geometries and the native requestAnimationFrame API, the layout simulator projects your video directly into the browser's local memory environment. We composite the safety guidelines directly over your playing video in real-time, completely bypassing network telemetry.
            </p>
          </div>

          {/* Precision Card */}
          <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <Grid size={28} />
            </div>
            <h3 className="text-xl font-bold text-zinc-100 mb-4">Precision Engineering</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              Every platform utilizes wildly different aspect ratios and user interface densities. An asset optimized for Instagram Reels (9:16) might have its critical Call-to-Action completely obscured by TikTok’s aggressive right-aligned icon cluster.
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Our tool offers dynamically scaled templates that automatically adapt to your asset's resolution, guaranteeing that your text, branding, and faces remain securely inside the "safe" area. Because these templates are generated on-the-fly inside your document object model, you can instantly swap between platforms to view how your singular MP4 file holds up across platforms effortlessly.
            </p>
          </div>

          {/* Export Card */}
          <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              <Download size={28} />
            </div>
            <h3 className="text-xl font-bold text-zinc-100 mb-4">Transparency Export Pipeline</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              If you prefer to work heavily inside desktop software like Adobe Premiere Pro, After Effects, or DaVinci Resolve, you can utilize our embedded "Download Transparent Guide" functionality.
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Instead of processing your video inside the browser, the application will mathematically synthesize a high-resolution, transparent PNG featuring the exact bounding boxes of your chosen template. You can then import this 4K asset directly onto the top track of your local editing timeline, guaranteeing perfect algorithmic layout compliance before you ever hit the render button.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

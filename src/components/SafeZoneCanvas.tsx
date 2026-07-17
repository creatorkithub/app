import { useEffect, useRef, useState } from 'react';
import type { Position, TemplateOption } from '../types';
import { drawSafeZoneOverlay, TEMPLATE_DIMS } from '../lib/canvas';

interface SafeZoneCanvasProps {
    mediaSrc: string | null;
    mediaType: 'image' | 'video';
    template: TemplateOption;
    scale: number;
    position: Position;
    setPosition: React.Dispatch<React.SetStateAction<Position>>;
    backgroundColor: string;
}

export default function SafeZoneCanvas({
    mediaSrc,
    mediaType,
    template,
    scale,
    position,
    setPosition,
    backgroundColor
}: SafeZoneCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mediaObj, setMediaObj] = useState<HTMLImageElement | HTMLVideoElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (!mediaSrc) {
            setMediaObj(null);
            setIsPlaying(false);
            return;
        }

        if (mediaType === 'image') {
            const img = new Image();
            img.src = mediaSrc;
            img.onload = () => {
                setMediaObj(img);
                setIsPlaying(false);
            };
        } else {
            const vid = document.createElement('video');
            vid.src = mediaSrc;
            vid.loop = true;
            vid.muted = true;
            vid.playsInline = true;
            vid.onloadedmetadata = () => {
                vid.play().then(() => {
                    setIsPlaying(true);
                }).catch(e => console.error(e));
                setMediaObj(vid);
            };
        }
    }, [mediaSrc, mediaType]);

    useEffect(() => {
        let animationFrameId: number;

        const drawLoop = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const dims = TEMPLATE_DIMS[template];
            canvas.width = dims.w;
            canvas.height = dims.h;

            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (mediaObj) {
                let mediaWidth = 0;
                let mediaHeight = 0;

                if (mediaObj instanceof HTMLImageElement) {
                    mediaWidth = mediaObj.width;
                    mediaHeight = mediaObj.height;
                } else if (mediaObj instanceof HTMLVideoElement) {
                    mediaWidth = mediaObj.videoWidth;
                    mediaHeight = mediaObj.videoHeight;
                }

                if (mediaWidth > 0 && mediaHeight > 0) {
                    const imgWidth = mediaWidth * scale;
                    const imgHeight = mediaHeight * scale;
                    ctx.drawImage(mediaObj, position.x, position.y, imgWidth, imgHeight);
                }
            }

            drawSafeZoneOverlay(ctx, template);

            if (mediaType === 'video' && mediaObj && isPlaying) {
                animationFrameId = requestAnimationFrame(drawLoop);
            }
        };

        drawLoop();

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [mediaObj, template, scale, position, backgroundColor, mediaType, isPlaying]);

    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        isDragging.current = true;
        dragStart.current = { x: e.clientX, y: e.clientY };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDragging.current || !canvasRef.current || !mediaObj) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const dims = TEMPLATE_DIMS[template];
        const displayToCanvasRatio = dims.w / rect.width;

        const dx = (e.clientX - dragStart.current.x) * displayToCanvasRatio;
        const dy = (e.clientY - dragStart.current.y) * displayToCanvasRatio;

        setPosition(prev => ({
            x: prev.x + dx,
            y: prev.y + dy
        }));

        dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
        isDragging.current = false;
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    };

    return (
        <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded border border-zinc-800 touch-none cursor-move transition-transform duration-300"
            style={{ aspectRatio: `${TEMPLATE_DIMS[template].w} / ${TEMPLATE_DIMS[template].h}` }}
        />
    );
}

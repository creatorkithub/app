import type { TemplateOption } from '../types';

export const TEMPLATE_DIMS = {
    'tiktok': { w: 1080, h: 1920 },
    'ig-story': { w: 1080, h: 1920 },
    'ig-post': { w: 1080, h: 1080 },
    'yt': { w: 1280, h: 720 },
    'yt-shorts': { w: 1080, h: 1920 },
    'ad-feed-square': { w: 1080, h: 1080 },
    'ad-feed-vertical': { w: 1080, h: 1350 },
    'ad-story': { w: 1080, h: 1920 },
    'ad-reel': { w: 1080, h: 1920 },
    'ad-landscape': { w: 1200, h: 628 },
};

export const drawSafeZoneOverlay = (ctx: CanvasRenderingContext2D, template: TemplateOption) => {
    const dims = TEMPLATE_DIMS[template];

    // Tinted Dead Zones & Bounds
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 4;

    const drawLabel = (text: string, x: number, y: number, align: CanvasTextAlign = 'center') => {
        ctx.save();
        ctx.font = '56px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);
        ctx.restore();
    };

    const drawCenterBadge = (text: string) => {
        ctx.save();
        ctx.font = 'bold 72px sans-serif';
        const textWidth = ctx.measureText(text).width;
        ctx.fillStyle = 'rgba(71, 85, 105, 0.9)';
        ctx.fillRect(dims.w / 2 - textWidth / 2 - 40, dims.h / 2 - 60, textWidth + 80, 120);
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, dims.w / 2, dims.h / 2);
        ctx.restore();
    };

    const drawDimensions = () => {
        ctx.save();
        ctx.font = 'bold 48px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`${dims.w}×${dims.h}`, 40, 40);
        ctx.restore();
    };

    if (template === 'tiktok') {
        ctx.fillRect(0, 0, dims.w, dims.h * 0.1);
        ctx.fillRect(0, dims.h * 0.8, dims.w, dims.h * 0.2);
        ctx.fillRect(dims.w * 0.85, dims.h * 0.3, dims.w * 0.15, dims.h * 0.5);
        ctx.strokeRect(10, dims.h * 0.1, dims.w - 20, dims.h * 0.7);
    }
    else if (template === 'ig-story') {
        ctx.fillRect(0, 0, dims.w, dims.h * 0.12);
        ctx.fillRect(0, dims.h * 0.85, dims.w, dims.h * 0.15);
        ctx.strokeRect(10, dims.h * 0.12, dims.w - 20, dims.h * 0.73);
    }
    else if (template === 'ig-post') {
        ctx.strokeRect(dims.w / 3, 0, 0, dims.h);
        ctx.strokeRect(dims.w * 2 / 3, 0, 0, dims.h);
        ctx.strokeRect(0, dims.h / 3, dims.w, 0);
        ctx.strokeRect(0, dims.h * 2 / 3, dims.w, 0);
    }
    else if (template === 'ad-feed-square') {
        ctx.fillRect(0, 0, dims.w, 100);
        ctx.fillRect(0, dims.h - 100, dims.w, 100);
        ctx.fillRect(0, 100, 100, dims.h - 200);
        ctx.fillRect(dims.w - 100, 100, 100, dims.h - 200);
        ctx.strokeRect(100, 100, dims.w - 200, dims.h - 200);

        drawDimensions();
        drawCenterBadge('FEED 1:1 SAFE AREA');
        drawLabel('TOP SAFE ZONE: 100px', dims.w / 2, 50);
        drawLabel('BOTTOM SAFE ZONE: 100px', dims.w / 2, dims.h - 50);
    }
    else if (template === 'ad-feed-vertical') {
        ctx.fillRect(0, 0, dims.w, 250);
        ctx.fillRect(0, dims.h - 250, dims.w, 250);
        ctx.strokeRect(0, 250, dims.w, dims.h - 500);

        drawDimensions();
        drawCenterBadge('FEED 4:5 SAFE AREA');
        drawLabel('TOP SAFE ZONE: 250px', dims.w / 2, 125);
        drawLabel('BOTTOM SAFE ZONE: 250px', dims.w / 2, dims.h - 125);
    }
    else if (template === 'ad-story') {
        ctx.fillRect(0, 0, dims.w, 270);
        ctx.fillRect(0, dims.h - 380, dims.w, 380);
        ctx.fillRect(0, 270, 65, dims.h - 650);
        ctx.fillRect(dims.w - 65, 270, 65, dims.h - 650);
        ctx.strokeRect(65, 270, dims.w - 130, dims.h - 650);

        drawDimensions();
        drawCenterBadge('STORIES SAFE AREA');
        drawLabel('TOP SAFE ZONE: 270px', dims.w / 2, 135);
        drawLabel('BOTTOM SAFE ZONE: 380px', dims.w / 2, dims.h - 190);
    }
    else if (template === 'ad-reel') {
        ctx.fillRect(0, 0, dims.w, 270);
        ctx.fillRect(0, dims.h - 670, dims.w, 670);
        ctx.fillRect(0, 270, 65, dims.h - 940);
        ctx.fillRect(dims.w - 65, 270, 65, dims.h - 940);
        ctx.strokeRect(65, 270, dims.w - 130, dims.h - 940);

        drawDimensions();
        drawCenterBadge('REELS SAFE AREA');
        drawLabel('TOP SAFE ZONE: 270px', dims.w / 2, 135);
        drawLabel('BOTTOM SAFE ZONE: 670px', dims.w / 2, dims.h - 335);
    }
    else if (template === 'ad-landscape') {
        ctx.fillRect(0, 0, dims.w, 60);
        ctx.fillRect(0, dims.h - 60, dims.w, 60);
        ctx.fillRect(0, 60, 120, dims.h - 120);
        ctx.fillRect(dims.w - 120, 60, 120, dims.h - 120);
        ctx.strokeRect(120, 60, dims.w - 240, dims.h - 120);

        drawDimensions();
        drawCenterBadge('HORIZONTAL SAFE AREA');
        drawLabel('TOP SAFE ZONE: 60px', dims.w / 2, 30);
        drawLabel('BOTTOM SAFE ZONE: 60px', dims.w / 2, dims.h - 30);
    }
    else if (template === 'yt-shorts') {
        ctx.fillRect(0, 0, dims.w, 240);
        ctx.fillRect(0, dims.h - 380, dims.w, 380);
        ctx.fillRect(0, 240, 60, dims.h - 620);
        ctx.fillRect(dims.w - 120, 340, 120, 1200);

        ctx.beginPath();
        ctx.moveTo(60, 240);
        ctx.lineTo(dims.w, 240);
        ctx.lineTo(dims.w, 340);
        ctx.lineTo(dims.w - 120, 340);
        ctx.lineTo(dims.w - 120, dims.h - 380);
        ctx.lineTo(60, dims.h - 380);
        ctx.closePath();
        ctx.stroke();

        drawDimensions();
        drawCenterBadge('YT SHORTS SAFE AREA');
        drawLabel('TOP SAFE ZONE: 240px', dims.w / 2, 120);
        drawLabel('BOTTOM SAFE ZONE: 380px', dims.w / 2, dims.h - 190);
    }

    ctx.setLineDash([]);
};

declare module 'imagetracerjs';

export type TemplateOption =
    | 'tiktok' | 'ig-story' | 'ig-post' | 'yt' | 'yt-shorts'
    | 'ad-feed-square' | 'ad-feed-vertical' | 'ad-story' | 'ad-reel' | 'ad-landscape';

export interface Position {
    x: number;
    y: number;
}

export interface AppSettings {
    template: TemplateOption;
    bgColor: string;
}

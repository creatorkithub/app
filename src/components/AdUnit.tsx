import React, { useEffect, useRef } from 'react';

interface AdUnitProps {
    slotId?: string;
    className?: string;
}

const PUBLISHER_ID = 'ca-pub-4032375955420309';

export const AdUnit: React.FC<AdUnitProps> = ({ slotId = 'PLACEHOLDER_SLOT_ID', className = '' }) => {
    // Hidden natively to allow Google Auto Ads to dictate placement.
    // To restore manual placements, remove 'return null' and uncomment the logic below.
    return null;

    /*
    const adInjected = useRef(false);

    useEffect(() => {
        try {
            if (typeof window !== 'undefined' && (window as any).adsbygoogle && !adInjected.current) {
                ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
                adInjected.current = true;
            }
        } catch (e) {
            console.warn('AdSense failed to load: ', e);
        }
    }, []);

    return (
        <div className={`w-full relative overflow-hidden bg-zinc-900/40 rounded-2xl border border-zinc-800/80 my-8 flex flex-col items-center justify-center min-h-[120px] ${className}`}>
            <span className="absolute top-2 left-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Advertisement</span>
            <div className="w-full pt-6">
                <ins
                    className="adsbygoogle"
                    style={{ display: 'block' }}
                    data-ad-client={PUBLISHER_ID}
                    data-ad-slot={slotId}
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                ></ins>
            </div>
        </div>
    );
    */
};

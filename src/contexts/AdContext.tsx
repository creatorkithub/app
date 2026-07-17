import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

type AdMode = 'vignette' | 'rewarded';

interface AdContextType {
    triggerCTA: (action: () => void, config?: { mode?: AdMode, title?: string, subtitle?: string }) => void;
    adConfig: { mode: AdMode, title: string, subtitle: string };
    isOpen: boolean;
    timeLeft: number;
    previousPath: string;
    handleSkip: () => void;
}

export const AdContext = createContext<AdContextType>({
    triggerCTA: (action) => action(),
    adConfig: { mode: 'vignette', title: '', subtitle: '' },
    isOpen: false,
    timeLeft: 0,
    previousPath: '/',
    handleSkip: () => { }
});

export const useAdContext = () => useContext(AdContext);

export const AdProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const actionRef = useRef<(() => void) | null>(null);
    const [adConfig, setAdConfig] = useState<{ mode: AdMode, title: string, subtitle: string }>({ mode: 'vignette', title: 'Processing...', subtitle: 'Please wait' });
    const [timeLeft, setTimeLeft] = useState(5);
    const [previousPath, setPreviousPath] = useState('/');

    const triggerCTA = (action: () => void, config?: { mode?: AdMode, title?: string, subtitle?: string }) => {
        actionRef.current = action;
        setPreviousPath(window.location.pathname);
        setAdConfig({
            mode: config?.mode || 'vignette',
            title: config?.title || 'Your file is ready!',
            subtitle: config?.subtitle || 'Processing securely on your device...'
        });
        setTimeLeft(config?.mode === 'rewarded' ? 5 : 3);
        setIsOpen(true);
        // Force router navigation to trigger AdSense Vignette
        window.history.pushState(null, '', '/success');
        window.dispatchEvent(new Event('popstate'));
    };

    const handleSkip = () => {
        if (actionRef.current) actionRef.current();
        setIsOpen(false);
        // Do not clear the ref immediately to avoid race condition if another render sweeps it
    };

    useEffect(() => {
        if (!isOpen) return;

        try {
            if ((window as any).adsbygoogle) {
                ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            }
        } catch (e) {
            console.log("AdBlocker detected or AdSense not loaded.");
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    if (adConfig.mode === 'vignette') {
                        handleSkip();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isOpen, adConfig.mode]);

    return (
        <AdContext.Provider value={{ triggerCTA, adConfig, isOpen, timeLeft, previousPath, handleSkip } as any}>
            {children}
        </AdContext.Provider>
    );
};

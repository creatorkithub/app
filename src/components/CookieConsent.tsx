import React, { useState, useEffect } from 'react';

export const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('user_consent_state');
        if (!consent) {
            setIsVisible(true);
        } else {
            updateGoogleConsent(consent === 'accepted');
        }

        const handleShowBanner = () => {
            setIsVisible(true);
            setShowOptions(true);
        };
        window.addEventListener('show-consent-banner', handleShowBanner);
        return () => window.removeEventListener('show-consent-banner', handleShowBanner);
    }, []);

    const updateGoogleConsent = (accepted: boolean) => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
            const status = accepted ? 'granted' : 'denied';
            (window as any).gtag('consent', 'update', {
                'ad_storage': status,
                'ad_user_data': status,
                'ad_personalization': status,
                'analytics_storage': status
            });
        }
    };

    const handleAccept = () => {
        localStorage.setItem('user_consent_state', 'accepted');
        updateGoogleConsent(true);
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('user_consent_state', 'declined');
        updateGoogleConsent(false);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pb-20 md:pb-6 pointer-events-none">
            <div className="max-w-4xl mx-auto bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl p-6 pointer-events-auto flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-bottom-10 fade-in duration-500">
                <div className="flex-1 text-sm text-zinc-300">
                    <h3 className="text-white font-bold text-base mb-2">Privacy & Cookie Settings</h3>
                    <p className="mb-2">We use cookies and similar technologies to help personalize content, tailor and measure ads, and provide a better experience. By clicking "Accept All", you agree to this, as outlined in our Privacy Policy.</p>
                    {showOptions && (
                        <div className="bg-zinc-950 p-4 rounded-lg mt-4 border border-zinc-800">
                            <p className="text-zinc-500 text-xs">If you deny consent or opt-out, ads from Google will be turned to non-personalized (using contextual signals instead of cookies).</p>
                        </div>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                    <button onClick={handleDecline} className="px-5 py-2.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors">
                        Decline All
                    </button>
                    <button onClick={handleAccept} className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">
                        Accept All
                    </button>
                </div>
            </div>
        </div>
    );
};

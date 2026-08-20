// GTAG Setup
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-969LZRVW8L');

// GTM Setup
(function (w, d, s, l, i) {
    w[l] = w[l] || []; w[l].push({
        'gtm.start':
            new Date().getTime(), event: 'gtm.js'
    }); var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src =
            'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'dataLayer', 'GTM-MTBGDHJ2');

// GTAG Consent Setup
gtag('consent', 'default', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied'
});

// Dynamic Manifest (PWA)
(function () {
    var path = window.location.pathname;
    var manifestUrl = '/manifest.webmanifest';
    if (path.startsWith('/pdf-toolkit') || path.startsWith('/local-pdf')) manifestUrl = '/manifests/pdf.json';
    else if (path.startsWith('/crypto-audit') || path.startsWith('/password-analyzer')) manifestUrl = '/manifests/crypto.json';
    else if (path.startsWith('/privashield') || path.startsWith('/exif-stripper')) manifestUrl = '/manifests/exif.json';
    else if (path.startsWith('/a11y-scorecard') || path.startsWith('/accessibility')) manifestUrl = '/manifests/a11y.json';
    else if (path.startsWith('/universal-image-converter') || path.startsWith('/image-converter')) manifestUrl = '/manifests/image.json';
    else if (path.startsWith('/social-media-safe-zone-overlay') || path.startsWith('/safe-zone')) manifestUrl = '/manifests/safezone.json';

    var link = document.createElement('link');
    link.rel = 'manifest';
    link.id = 'dynamic-manifest';
    link.href = manifestUrl;
    document.head.appendChild(link);
})();

// Single Page Apps for GitHub Pages Redirection
(function (l) {
    if (l.search[1] === 'p' && l.search[2] === '=') {
        var a = l.search.slice(1).split('&').map(function (s) { return s.replace(/~and~/g, '&') })
        window.history.replaceState(null, null,
            l.pathname.slice(0, -1) + a[0].slice(2) +
            (a.length > 1 ? '?' + a.slice(1).join('&').replace(/q=/, '') : '') + l.hash
        );
    }
}(window.location));

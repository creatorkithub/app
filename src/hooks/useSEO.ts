import { useEffect } from 'react';

export function useSEO(titleOrProps: string | { title: string; description: string; canonical?: string; canonicalPath?: string }, description?: string, canonicalPath?: string) {
    useEffect(() => {
        let title, desc, canonical;
        if (typeof titleOrProps === 'object') {
            title = titleOrProps.title;
            desc = titleOrProps.description;
            canonical = titleOrProps.canonical || titleOrProps.canonicalPath || '';
        } else {
            title = titleOrProps;
            desc = description || '';
            canonical = canonicalPath || '';
        }

        document.title = title;

        // Update Meta Description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', desc);

        // Update Canonical URL
        if (canonical) {
            let canonicalLink = document.querySelector('link[rel="canonical"]');
            const fullCanonicalUrl = `https://creatorkithub.org${canonical}`;
            if (!canonicalLink) {
                canonicalLink = document.createElement('link');
                canonicalLink.setAttribute('rel', 'canonical');
                document.head.appendChild(canonicalLink);
            }
            canonicalLink.setAttribute('href', fullCanonicalUrl);
        }

        // Update Open Graph tags for social share previews
        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', title);

        let ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', desc);

        if (canonical) {
            let ogUrl = document.querySelector('meta[property="og:url"]');
            if (!ogUrl) {
                ogUrl = document.createElement('meta');
                ogUrl.setAttribute('property', 'og:url');
                document.head.appendChild(ogUrl);
            }
            ogUrl.setAttribute('content', `https://creatorkithub.org${canonical}`);
        }
    }, [titleOrProps, description, canonicalPath]);
}

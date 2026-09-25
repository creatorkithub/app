export function BlogSchema({ title, description, datePublished, url }: { title: string, description: string, datePublished: string, url: string }) {
    const domain = "https://creatorkithub.com"; // Adjust if different, but based on context the name is CreatorKitHub

    // Parse the date (e.g. from 'Sep 9, 2026' into ISO format)
    const formattedDate = new Date(datePublished).toISOString();

    const schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": title.replace(/"/g, "'"),
        "description": description.replace(/"/g, "'"),
        "datePublished": formattedDate,
        "author": {
            "@type": "Person",
            "name": "Balachandar Nadar",
            "url": "https://www.linkedin.com/in/balachandar-nadar"
        },
        "url": domain + url
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

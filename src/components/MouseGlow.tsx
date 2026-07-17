import { useEffect, useState } from 'react';

export default function MouseGlow() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const updateMousePosition = (ev: MouseEvent) => {
            setMousePosition({ x: ev.clientX, y: ev.clientY });
        };

        // Track whether we are over interactive elements to intensify glow
        const handleMouseOver = (e: MouseEvent) => {
            if (e.target && (e.target as HTMLElement).closest('button, a, input, [role="button"]')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    return (
        <div
            className="pointer-events-none fixed z-30 transition-opacity duration-300 rounded-full"
            style={{
                width: '800px',
                height: '800px',
                left: '-400px',
                top: '-400px',
                transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
                background: `radial-gradient(circle, rgba(255, 255, 255, ${isHovering ? 0.06 : 0.03}) 0%, transparent 60%)`,
                willChange: 'transform'
            }}
        />
    );
}

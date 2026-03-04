import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const followerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const cursor = cursorRef.current;
        const follower = followerRef.current;
        if (!cursor || !follower) return;

        const onMouseMove = (e: MouseEvent) => {
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1,
                ease: 'power2.out',
            });
            gsap.to(follower, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.3,
                ease: 'power2.out',
            });
        };

        const onMouseEnterItem = () => {
            gsap.to(follower, {
                scale: 2.5,
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                borderColor: 'rgba(212, 175, 55, 0.8)',
                duration: 0.3,
            });
            gsap.to(cursor, {
                scale: 0.5,
                duration: 0.3,
            });
        };

        const onMouseLeaveItem = () => {
            gsap.to(follower, {
                scale: 1,
                backgroundColor: 'transparent',
                borderColor: 'rgba(212, 175, 55, 0.4)',
                duration: 0.3,
            });
            gsap.to(cursor, {
                scale: 1,
                duration: 0.3,
            });
        };

        window.addEventListener('mousemove', onMouseMove);

        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"]');
        interactiveElements.forEach((el) => {
            el.addEventListener('mouseenter', onMouseEnterItem);
            el.addEventListener('mouseleave', onMouseLeaveItem);
        });

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            interactiveElements.forEach((el) => {
                el.removeEventListener('mouseenter', onMouseEnterItem);
                el.removeEventListener('mouseleave', onMouseLeaveItem);
            });
        };
    }, []);

    return (
        <>
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-2 h-2 bg-[#d4af37] rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden md:block"
            />
            <div
                ref={followerRef}
                className="fixed top-0 left-0 w-10 h-10 border border-[#d4af37]/40 rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 hidden md:block"
            />
        </>
    );
}

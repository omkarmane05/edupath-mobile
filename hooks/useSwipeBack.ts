import { useEffect, useRef } from 'react';

/**
 * useSwipeBack — detects a right-swipe gesture from the left edge of the screen
 * and calls `onSwipeBack` when triggered (mimics native mobile back navigation).
 *
 * @param onSwipeBack  Function to call when a back-swipe is detected
 * @param enabled      Set to false to disable the listener (e.g. when on root screen)
 */
export const useSwipeBack = (onSwipeBack: () => void, enabled: boolean) => {
    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);

    useEffect(() => {
        if (!enabled) return;

        const handleTouchStart = (e: TouchEvent) => {
            touchStartX.current = e.touches[0].clientX;
            touchStartY.current = e.touches[0].clientY;
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (touchStartX.current === null || touchStartY.current === null) return;

            const deltaX = e.changedTouches[0].clientX - touchStartX.current;
            const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);

            // Only trigger if:
            // 1. Started within first 30px of screen (edge swipe)
            // 2. Horizontal movement > 80px (intentional swipe)
            // 3. Mostly horizontal (not a vertical scroll)
            const isEdgeSwipe = touchStartX.current < 30;
            const isHorizontal = deltaX > 80 && deltaY < 60;

            if (isEdgeSwipe && isHorizontal) {
                onSwipeBack();
            }

            touchStartX.current = null;
            touchStartY.current = null;
        };

        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [onSwipeBack, enabled]);
};

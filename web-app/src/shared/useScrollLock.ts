import { useEffect } from 'react';

/**
 * Custom hook to lock background scrolling & prevent touch/wheel event bleeding
 * whenever a modal, slide drawer, or taskbar overlay is open.
 */
export const useScrollLock = (isOpen: boolean) => {
  useEffect(() => {
    if (!isOpen) return;

    // Add modal-open lock class to html and body
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');

    // Intercept touchmove and wheel events globally with passive: false
    const preventBackgroundScroll = (e: TouchEvent | WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check if event originated inside a scrollable modal container or sidebar drawer
      const scrollContainer = target.closest('.modal-scroll-lock, aside, [data-scrollable="true"]');

      if (!scrollContainer) {
        // Event is on backdrop or background -> block scrolling completely!
        if (e.cancelable) e.preventDefault();
        return;
      }

      // If event is inside the modal container, prevent scroll-chaining at boundaries
      const el = scrollContainer as HTMLElement;
      const isScrollable = el.scrollHeight > el.clientHeight;

      if (!isScrollable) {
        if (e.cancelable) e.preventDefault();
        return;
      }

      // Check boundary conditions for vertical scroll
      if ('deltaY' in e) {
        // Wheel event
        const delta = (e as WheelEvent).deltaY;
        const atTop = el.scrollTop <= 0 && delta < 0;
        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1 && delta > 0;
        if ((atTop || atBottom) && e.cancelable) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('wheel', preventBackgroundScroll, { passive: false });
    window.addEventListener('touchmove', preventBackgroundScroll, { passive: false });

    return () => {
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
      window.removeEventListener('wheel', preventBackgroundScroll);
      window.removeEventListener('touchmove', preventBackgroundScroll);
    };
  }, [isOpen]);
};

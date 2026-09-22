import { useEffect, useState } from 'react';

export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const hasTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    setIsTouch(hasTouch);
  }, []);

  return isTouch;
}

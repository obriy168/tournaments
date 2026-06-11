import { useEffect, useState, useRef } from "react";

declare global {
  interface Window {
    __skyline_splash_complete?: boolean;
  }
}

export function useAnimatedCounter(
  targetValue: number,
  duration = 1200,
  delay = 0
): number {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (targetValue === countRef.current) return;

    const startAnimation = () => {
      const timeoutId = setTimeout(() => {
        startValueRef.current = countRef.current;
        startTimeRef.current = null;

        const animate = (timestamp: number) => {
          if (!startTimeRef.current) startTimeRef.current = timestamp;
          const elapsed = timestamp - startTimeRef.current;
          const progress = Math.min(elapsed / duration, 1);

          const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          
          const currentValue = Math.round(
            startValueRef.current + (targetValue - startValueRef.current) * easeOutExpo
          );

          countRef.current = currentValue;
          setCount(currentValue);

          if (progress < 1) {
            animationFrameRef.current = requestAnimationFrame(animate);
          }
        };

        animationFrameRef.current = requestAnimationFrame(animate);
      }, delay);

      return timeoutId;
    };

    let activeTimeoutId: ReturnType<typeof setTimeout> | null = null;

    if (window.__skyline_splash_complete !== false) {
      activeTimeoutId = startAnimation();
    } else {
      const handleSplashComplete = () => {
        activeTimeoutId = startAnimation();
      };

      window.addEventListener("skyline:splash-complete", handleSplashComplete);

      return () => {
        window.removeEventListener("skyline:splash-complete", handleSplashComplete);
        if (activeTimeoutId) clearTimeout(activeTimeoutId);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }

    return () => {
      if (activeTimeoutId) clearTimeout(activeTimeoutId);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [targetValue, duration, delay]);

  return count;
}
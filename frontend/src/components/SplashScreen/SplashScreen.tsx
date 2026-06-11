import { useEffect, useRef } from "react";
import styles from "./SplashScreen.module.css";

declare global {
  interface Window {
    __skyline_splash_complete?: boolean;
  }
}

interface Props {
  visible: boolean;
}

const MINIMUM_DISPLAY_MS = 1400;
const EXIT_ANIMATION_MS = 400;

export default function SplashScreen({ visible }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef(0);
  const everShownRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (visible) {
      window.__skyline_splash_complete = false;
      everShownRef.current = true;
      startTimeRef.current = performance.now();
      overlay.style.display = "flex";
      overlay.classList.remove(styles.exit);
    } else if (everShownRef.current) {
      const elapsed = performance.now() - startTimeRef.current;
      const remaining = Math.max(0, MINIMUM_DISPLAY_MS - elapsed);

      const t1 = setTimeout(() => {
        overlay.classList.add(styles.exit);
        
        const tHalf = setTimeout(() => {
          window.__skyline_splash_complete = true;
          window.dispatchEvent(new CustomEvent("skyline:splash-complete"));
        }, EXIT_ANIMATION_MS / 2);
        timersRef.current.push(tHalf);

        const t2 = setTimeout(() => {
          overlay.style.display = "none";
        }, EXIT_ANIMATION_MS);
        timersRef.current.push(t2);
      }, remaining);
      
      timersRef.current.push(t1);
    } else {
      window.__skyline_splash_complete = true;
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [visible]);

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      style={{ display: "none" }}
      aria-hidden="true"
    >
      <div className={styles.content}>
        <h1 className={styles.logo}>Skyline</h1>
        <div className={styles.bar} aria-hidden="true">
          <div className={styles.progress} />
        </div>
      </div>
    </div>
  );
}
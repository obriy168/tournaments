import { useState, useEffect, useRef } from "react";
import styles from "./SplashScreen.module.css";

interface Props {
  visible: boolean;
}

const MINIMUM_DISPLAY_MS = 1400;
const EXIT_ANIMATION_MS = 500;

export default function SplashScreen({ visible }: Props) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const startTimeRef = useRef(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, delay: number) => {
      timers.push(setTimeout(fn, delay));
    };

    if (visible) {
      startTimeRef.current = performance.now();

      schedule(() => {
        setShouldRender(true);
        setIsExiting(false);
      }, 0);
    } else {
      const elapsed = performance.now() - startTimeRef.current;
      const remaining = Math.max(0, MINIMUM_DISPLAY_MS - elapsed);

      schedule(() => {
        setIsExiting(true);
        schedule(() => setShouldRender(false), EXIT_ANIMATION_MS);
      }, remaining);
    }

    return () => timers.forEach(clearTimeout);
  }, [visible]);

  if (!shouldRender) return null;

  return (
    <div
      className={`${styles.overlay} ${isExiting ? styles.exit : styles.enter}`}
      aria-hidden={isExiting}
      role="status"
      aria-live="polite"
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
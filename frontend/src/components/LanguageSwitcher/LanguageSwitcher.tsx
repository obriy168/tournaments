import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "./LanguageSwitcher.module.css";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "pl", label: "PL" },
  { code: "ru", label: "RU" },
  { code: "uk", label: "UA" },
] as const;

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLanguage =
    LANGUAGES.find((l) => l.code === i18n.language)?.label || "EN";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const handleSelect = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className={styles.switcher} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Current language: ${currentLanguage}`}
      >
        <span>{currentLanguage}</span>
        <svg
          className={`${styles.arrow} ${open ? styles.arrowOpen : ""}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 5l3 3 3-3" />
        </svg>
      </button>

      {open && (
        <ul className={styles.dropdown} role="listbox">
          {LANGUAGES.map(({ code, label }) => (
            <li
              key={code}
              className={`${styles.option} ${
                i18n.language === code ? styles.optionActive : ""
              }`}
              role="option"
              aria-selected={i18n.language === code}
              onClick={() => handleSelect(code)}
            >
              {label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
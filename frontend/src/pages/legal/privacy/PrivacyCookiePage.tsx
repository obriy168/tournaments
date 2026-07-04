import { useTranslation } from "react-i18next";
import styles from "./PrivacyCookiePage.module.css";

interface Section {
  title: string;
  type?: "text" | "table";
  content?: string;
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export default function PrivacyCookiePage() {
  const { t } = useTranslation();

  const sections: Section[] = t("privacyCookiePage.sections", {
    returnObjects: true,
  }) as unknown as Section[];

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>{t("privacyCookiePage.title")}</h1>
        <div className={styles.meta}>
          <p className={styles.updated}>
            {t("privacyCookiePage.effectiveDate")}
          </p>
          <p className={styles.updated}>{t("privacyCookiePage.lastUpdated")}</p>
        </div>

        {sections.map((section, index) => (
          <div className={styles.section} key={index}>
            <h2>{section.title}</h2>
            {section.type === "table" && section.table ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    {section.table.headers.map((header, i) => (
                      <th key={i}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.table.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div
                dangerouslySetInnerHTML={{
                  __html: section.content || "",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
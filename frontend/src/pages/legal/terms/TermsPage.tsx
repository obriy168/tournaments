import { useTranslation } from "react-i18next";
import styles from "./TermsPage.module.css";

interface Section {
  title: string;
  content: string;
}

export default function TermsPage() {
  const { t } = useTranslation();

  const sections: Section[] = t("termsPage.sections", {
    returnObjects: true,
  }) as unknown as Section[];

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>{t("termsPage.title")}</h1>
        <div className={styles.meta}>
          <p className={styles.updated}>{t("termsPage.effectiveDate")}</p>
          <p className={styles.updated}>{t("termsPage.lastUpdated")}</p>
        </div>

        {sections.map((section, index) => (
          <div className={styles.section} key={index}>
            <h2>{section.title}</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: section.content,
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
"use client";

import { useI18n } from "@/lib/i18n";
import styles from "@/app/landing.module.css";

export function LangToggle() {
  const { lang, toggle, t } = useI18n();
  return (
    <button
      type="button"
      className={styles.langToggle}
      onClick={toggle}
      aria-label={lang === "fr" ? t("navLangToEn") : t("navLangToFr")}
      title={lang === "fr" ? t("navLangToEn") : t("navLangToFr")}
    >
      <span
        className={`${styles.langToggleSlot} ${
          lang === "fr" ? styles.langToggleSlotInactive : styles.langToggleSlotActive
        }`}
      >
        en
      </span>
      <span className={styles.langToggleSep} aria-hidden="true">
        ·
      </span>
      <span
        className={`${styles.langToggleSlot} ${
          lang === "fr" ? styles.langToggleSlotActive : styles.langToggleSlotInactive
        }`}
      >
        fr
      </span>
    </button>
  );
}

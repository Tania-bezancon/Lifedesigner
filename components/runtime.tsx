"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/landing.module.css";
import { useT } from "@/lib/i18n";
import type { DictKey } from "@/lib/i18n/dictionaries";

const HOSTS: ReadonlyArray<{
  nameKey: DictKey;
  viaKey: DictKey;
  statusKey: DictKey;
  glyph: string; // mark in the corner — neutral lowercase letter
  dot: string; // brand-adjacent accent (kept subtle)
}> = [
  {
    nameKey: "runtimeHost1Name",
    viaKey: "runtimeHost1Via",
    statusKey: "runtimeHost1Status",
    glyph: "C",
    dot: "#cc785c",
  },
  {
    nameKey: "runtimeHost2Name",
    viaKey: "runtimeHost2Via",
    statusKey: "runtimeHost2Status",
    glyph: "G",
    dot: "#10a37f",
  },
  {
    nameKey: "runtimeHost3Name",
    viaKey: "runtimeHost3Via",
    statusKey: "runtimeHost3Status",
    glyph: "O",
    dot: "#5a564f",
  },
  {
    nameKey: "runtimeHost4Name",
    viaKey: "runtimeHost4Via",
    statusKey: "runtimeHost4Status",
    glyph: "→",
    dot: "#1c1917",
  },
];

export function Runtime() {
  const t = useT();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setRevealed(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.16 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  async function copyInstall() {
    try {
      await navigator.clipboard.writeText(t("runtimeInstallCmd"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  }

  return (
    <section ref={sectionRef} className={styles.sRuntime} id="runtime">
      <div className={styles.runtimeHead}>
        <span className={styles.techLabel}>{t("runtimeTechLabel")}</span>
        <span className={styles.runtimeSubLabel}>{t("runtimeSubLabel")}</span>
      </div>

      <h2
        className={`${styles.display} ${styles.runtimeHeadline} ${
          revealed ? styles.in : styles.reveal
        }`}
      >
        {t("runtimeHeadline1")}
        <br />
        <span className={styles.it}>{t("runtimeHeadline2")}</span>
      </h2>

      <p
        className={`${styles.runtimeIntro} ${
          revealed ? styles.in : styles.reveal
        }`}
        style={{ transitionDelay: "200ms" }}
      >
        {t("runtimeIntro")}
      </p>

      <div className={styles.runtimeHostsHead}>
        <span className={styles.runtimeHostsLabel}>
          {t("runtimeHostsLabel")}
        </span>
      </div>

      <ol className={styles.runtimeHosts}>
        {HOSTS.map((h, i) => (
          <li
            key={h.nameKey}
            className={`${styles.runtimeHost} ${
              i < (revealed ? HOSTS.length : 0) ? styles.in : styles.reveal
            }`}
            style={{ transitionDelay: `${300 + i * 100}ms` }}
          >
            <span className={styles.runtimeHostGlyph} aria-hidden="true">
              <span
                className={styles.runtimeHostDot}
                style={{ background: h.dot }}
              />
              {h.glyph}
            </span>
            <span className={styles.runtimeHostBody}>
              <span className={styles.runtimeHostName}>{t(h.nameKey)}</span>
              <span className={styles.runtimeHostVia}>{t(h.viaKey)}</span>
            </span>
            <span className={styles.runtimeHostStatus}>
              <span className={styles.runtimeHostStatusDot} aria-hidden="true" />
              {t(h.statusKey)}
            </span>
          </li>
        ))}
      </ol>

      <div className={styles.runtimeInstall}>
        <span className={styles.runtimeInstallLabel}>
          {t("runtimeInstallLabel")}
        </span>
        <button
          type="button"
          className={styles.runtimeInstallCode}
          onClick={copyInstall}
          aria-label="copy mcp endpoint url"
        >
          <span className={styles.runtimeInstallPrompt}>↗</span>
          <code>{t("runtimeInstallCmd")}</code>
          <span className={styles.runtimeInstallCopy}>
            {copied ? "copied" : "copy"}
          </span>
        </button>
      </div>

      <p
        className={`${styles.runtimeOutro} ${
          revealed ? styles.in : styles.reveal
        }`}
        style={{ transitionDelay: "800ms" }}
      >
        {t("runtimeOutro")}
      </p>
    </section>
  );
}

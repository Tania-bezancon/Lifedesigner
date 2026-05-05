"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/landing.module.css";
import { DEFAULT_PLAN, type GeneratedPlan } from "@/lib/generate-plan";
import { downloadPlanCard } from "@/lib/share-card";
import { useI18n, useT } from "@/lib/i18n";

export function PlanSection({ plan }: { plan: GeneratedPlan | null }) {
  const t = useT();
  const { lang } = useI18n();
  const isUser = plan != null;
  const days = plan ? plan.days : DEFAULT_PLAN[lang].days;
  const sectionRef = useRef<HTMLElement | null>(null);
  const [revealedCount, setRevealedCount] = useState(isUser ? 0 : days.length);
  const [headInView, setHeadInView] = useState(false);

  // Reveal head once on first scroll into view (default state).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setHeadInView(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // When the plan transitions to user-generated, cinematically reveal day-by-day.
  useEffect(() => {
    if (!isUser) {
      setRevealedCount(days.length);
      return;
    }
    setRevealedCount(0);
    const total = days.length;
    let cancelled = false;
    let i = 0;

    function step() {
      if (cancelled || i > total) return;
      setRevealedCount(i);
      i += 1;
      if (i <= total) {
        setTimeout(step, 220);
      }
    }
    // initial pause to let the YourTurn reply settle
    const initial = setTimeout(step, 350);
    return () => {
      cancelled = true;
      clearTimeout(initial);
    };
  }, [plan, isUser, days.length]);

  // Optional smooth-scroll into the plan when generated.
  useEffect(() => {
    if (!isUser) return;
    const el = sectionRef.current;
    if (!el) return;
    const t = setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => clearTimeout(t);
  }, [isUser, plan]);

  return (
    <section ref={sectionRef} className={styles.sPlan} id="plan">
      <div
        className={`${styles.planHead} ${styles.reveal} ${
          headInView || isUser ? styles.in : ""
        }`}
      >
        <div>
          <span className={styles.techLabel}>
            {isUser ? t("planTechLabelUser") : t("planTechLabelDefault")}
          </span>
          <h2 className={styles.display} style={{ marginTop: 16 }}>
            {isUser ? (
              <>
                {t("planHeadlineUser1")}
                <br />
                <span className={styles.it}>{t("planHeadlineUser2")}</span>
              </>
            ) : (
              <>
                {t("planHeadlineDefault1")}
                <br />
                <span className={styles.it}>{t("planHeadlineDefault2")}</span>
              </>
            )}
          </h2>
        </div>
        <p className={styles.planHeadRight}>
          {isUser ? t("planRightUser") : t("planRightDefault")}
        </p>
      </div>

      <div className={styles.planGrid}>
        {days.map((d, i) => (
          <div
            key={`${plan?.archetype ?? "default"}-${d.day}-${d.num}`}
            className={`${styles.planDay} ${d.isToday ? styles.today : ""} ${
              styles.reveal
            } ${i < revealedCount ? styles.in : ""}`}
            style={{ transitionDelay: isUser ? "0ms" : `${i * 60}ms` }}
          >
            <div className={styles.planDayHead}>
              <span className={styles.day}>{d.day}</span>
              <span className={styles.dayNum}>{d.num}</span>
            </div>
            {d.items.map((it, j) => (
              <div className={styles.planItem} key={j}>
                <span className={styles.planTime}>{it.time}</span>
                <span className={styles.planItemBody}>
                  <span className={styles.planItemText}>{it.text}</span>
                  {it.why && <span className={styles.planItemWhy}>{it.why}</span>}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div
        className={`${styles.planFoot} ${styles.reveal} ${
          revealedCount >= days.length ? styles.in : ""
        }`}
      >
        <span className={styles.pill}>
          <span className={styles.tnum}>
            {days.reduce((acc, d) => acc + d.items.length, 0)}
          </span>{" "}
          {t("planFootActions")}
        </span>
        <span className={styles.planFootMsg}>{t("planFootMsg")}</span>
        {isUser && (
          <button
            type="button"
            className={styles.planSave}
            onClick={() => plan && downloadPlanCard(plan)}
          >
            {t("planSave")}
          </button>
        )}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/landing.module.css";
import { useT } from "@/lib/i18n";
import type { DictKey } from "@/lib/i18n/dictionaries";

type WeekKey = "01" | "03" | "05" | "07" | "10" | "12";

const WEEKS: ReadonlyArray<{
  num: WeekKey;
  goalKey: DictKey;
  distKey: DictKey;
  milestoneKey?: DictKey;
  habits: { timeKey: DictKey; textKey: DictKey }[];
}> = [
  {
    num: "01",
    goalKey: "programWeek01Goal",
    distKey: "programWeek01Distance",
    milestoneKey: "programWeek01Milestone",
    habits: [
      { timeKey: "programWeek01Habit1Time", textKey: "programWeek01Habit1Text" },
      { timeKey: "programWeek01Habit2Time", textKey: "programWeek01Habit2Text" },
      { timeKey: "programWeek01Habit3Time", textKey: "programWeek01Habit3Text" },
    ],
  },
  {
    num: "03",
    goalKey: "programWeek03Goal",
    distKey: "programWeek03Distance",
    habits: [
      { timeKey: "programWeek03Habit1Time", textKey: "programWeek03Habit1Text" },
      { timeKey: "programWeek03Habit2Time", textKey: "programWeek03Habit2Text" },
      { timeKey: "programWeek03Habit3Time", textKey: "programWeek03Habit3Text" },
    ],
  },
  {
    num: "05",
    goalKey: "programWeek05Goal",
    distKey: "programWeek05Distance",
    milestoneKey: "programWeek05Milestone",
    habits: [
      { timeKey: "programWeek05Habit1Time", textKey: "programWeek05Habit1Text" },
      { timeKey: "programWeek05Habit2Time", textKey: "programWeek05Habit2Text" },
      { timeKey: "programWeek05Habit3Time", textKey: "programWeek05Habit3Text" },
    ],
  },
  {
    num: "07",
    goalKey: "programWeek07Goal",
    distKey: "programWeek07Distance",
    milestoneKey: "programWeek07Milestone",
    habits: [
      { timeKey: "programWeek07Habit1Time", textKey: "programWeek07Habit1Text" },
      { timeKey: "programWeek07Habit2Time", textKey: "programWeek07Habit2Text" },
      { timeKey: "programWeek07Habit3Time", textKey: "programWeek07Habit3Text" },
    ],
  },
  {
    num: "10",
    goalKey: "programWeek10Goal",
    distKey: "programWeek10Distance",
    habits: [
      { timeKey: "programWeek10Habit1Time", textKey: "programWeek10Habit1Text" },
      { timeKey: "programWeek10Habit2Time", textKey: "programWeek10Habit2Text" },
      { timeKey: "programWeek10Habit3Time", textKey: "programWeek10Habit3Text" },
    ],
  },
  {
    num: "12",
    goalKey: "programWeek12Goal",
    distKey: "programWeek12Distance",
    milestoneKey: "programWeek12Milestone",
    habits: [
      { timeKey: "programWeek12Habit1Time", textKey: "programWeek12Habit1Text" },
      { timeKey: "programWeek12Habit2Time", textKey: "programWeek12Habit2Text" },
      { timeKey: "programWeek12Habit3Time", textKey: "programWeek12Habit3Text" },
    ],
  },
];

export function Program() {
  const t = useT();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      setRevealedCount(WEEKS.length);
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
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!revealed) return;
    let i = 0;
    function step() {
      i += 1;
      setRevealedCount(i);
      if (i < WEEKS.length) {
        setTimeout(step, 220);
      }
    }
    const start = setTimeout(step, 320);
    return () => clearTimeout(start);
  }, [revealed]);

  return (
    <section ref={sectionRef} className={styles.sProgram} id="program">
      <div className={styles.programHead}>
        <span className={styles.techLabel}>{t("programTechLabel")}</span>
        <span className={styles.programLegend}>
          <span className={styles.tnum}>{t("programLegendPrefix")}</span>{" "}
          {t("programLegendSuffix")}
        </span>
      </div>

      <h2
        className={`${styles.display} ${styles.programHeadline} ${
          revealed ? styles.in : styles.reveal
        }`}
      >
        {t("programHeadline1")}
        <br />
        <span className={styles.it}>{t("programHeadline2")}</span>
      </h2>

      <p
        className={`${styles.programIntro} ${
          revealed ? styles.in : styles.reveal
        }`}
        style={{ transitionDelay: "200ms" }}
      >
        {t("programIntro")}
      </p>

      <ol className={styles.programTimeline}>
        {WEEKS.map((w, i) => (
          <li
            key={w.num}
            className={`${styles.programWeek} ${
              i === WEEKS.length - 1 ? styles.programWeekFinal : ""
            } ${i < revealedCount ? styles.in : styles.reveal}`}
          >
            <div className={styles.programWeekHead}>
              <span className={styles.programWeekNum}>
                {t("programWeek")} <span className={styles.tnum}>{w.num}</span>
              </span>
              <span className={styles.programWeekGoal}>{t(w.goalKey)}</span>
              <span className={styles.programWeekDist}>{t(w.distKey)}</span>
              {w.milestoneKey && (
                <span className={styles.programWeekMilestone}>
                  · {t(w.milestoneKey)}
                </span>
              )}
            </div>
            <ul className={styles.programWeekHabits}>
              {w.habits.map((h, j) => (
                <li key={j} className={styles.programHabit}>
                  <span className={styles.programHabitTime}>{t(h.timeKey)}</span>
                  <span className={styles.programHabitText}>{t(h.textKey)}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <div
        className={`${styles.programFoot} ${
          revealed ? styles.in : styles.reveal
        }`}
        style={{ transitionDelay: "600ms" }}
      >
        <span className={styles.programFootChip}>{t("programFootChip")}</span>
        <span className={styles.programFootMsg}>{t("programFootMsg")}</span>
      </div>
    </section>
  );
}

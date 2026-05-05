"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/landing.module.css";

type Habit = { time: string; text: string };
type Week = {
  num: string;
  goal: string;
  distance: string;
  milestone?: string;
  habits: Habit[];
};

const WEEKS: Week[] = [
  {
    num: "01",
    goal: "show up",
    distance: "1 km",
    milestone: "first walk",
    habits: [
      { time: "mon · 06:42", text: "1 km walk · 12 min" },
      { time: "wed · 22:30", text: "phone out of the bedroom" },
      { time: "sat · 09:00", text: "1 km walk · same loop" },
    ],
  },
  {
    num: "03",
    goal: "warm up",
    distance: "2 km",
    habits: [
      { time: "mon · 06:38", text: "2 km · slow + steady" },
      { time: "wed · 12:30", text: "phone-free lunch · 28 min" },
      { time: "sat · 08:30", text: "2 km · breathe through your nose" },
    ],
  },
  {
    num: "05",
    goal: "first run",
    distance: "3 km",
    milestone: "first jog",
    habits: [
      { time: "mon · 06:30", text: "3 km · run/walk intervals" },
      { time: "thu · 06:30", text: "3 km · same pace" },
      { time: "sat · 08:00", text: "3 km · cold shower after" },
    ],
  },
  {
    num: "07",
    goal: "build base",
    distance: "5 km",
    milestone: "first 5k",
    habits: [
      { time: "mon · 06:30", text: "5 km · easy" },
      { time: "wed · 06:30", text: "4 km · slightly faster" },
      { time: "sat · 07:30", text: "5 km · race-pace last km" },
    ],
  },
  {
    num: "10",
    goal: "stretch",
    distance: "8 km",
    habits: [
      { time: "mon · 06:30", text: "5 km · controlled breath" },
      { time: "wed · 06:30", text: "6 km · with hills" },
      { time: "sat · 07:00", text: "8 km · long run" },
    ],
  },
  {
    num: "12",
    goal: "race day",
    distance: "10 km",
    milestone: "10k done",
    habits: [
      { time: "mon · 06:30", text: "4 km · fresh legs" },
      { time: "wed · 06:30", text: "5 km · last tune-up" },
      { time: "sat · 06:30", text: "10 km · saturday morning, race-pace" },
    ],
  },
];

export function Program() {
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
        <span className={styles.techLabel}>week.render(maria, goal=10k)</span>
        <span className={styles.programLegend}>
          <span className={styles.tnum}>12</span> weeks · 36 micro-habits ·
          fitted to her calendar
        </span>
      </div>

      <h2
        className={`${styles.display} ${styles.programHeadline} ${
          revealed ? styles.in : styles.reveal
        }`}
      >
        twelve weeks,
        <br />
        <span className={styles.it}>thirty-six small things.</span>
      </h2>

      <p
        className={`${styles.programIntro} ${
          revealed ? styles.in : styles.reveal
        }`}
        style={{ transitionDelay: "200ms" }}
      >
        the designer didn&apos;t prescribe a training plan. it slipped
        micro-habits into her existing calendar — same wake-up,
        same lunch break, same saturday — until ten kilometers
        became something her week already knew how to hold.
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
                week <span className={styles.tnum}>{w.num}</span>
              </span>
              <span className={styles.programWeekGoal}>{w.goal}</span>
              <span className={styles.programWeekDist}>{w.distance}</span>
              {w.milestone && (
                <span className={styles.programWeekMilestone}>
                  · {w.milestone}
                </span>
              )}
            </div>
            <ul className={styles.programWeekHabits}>
              {w.habits.map((h, j) => (
                <li key={j} className={styles.programHabit}>
                  <span className={styles.programHabitTime}>{h.time}</span>
                  <span className={styles.programHabitText}>{h.text}</span>
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
        <span className={styles.programFootChip}>maria · saturday, week 12</span>
        <span className={styles.programFootMsg}>
          ran ten kilometers without stopping. her saturday morning was
          back. nothing else in her week had changed.
        </span>
      </div>
    </section>
  );
}

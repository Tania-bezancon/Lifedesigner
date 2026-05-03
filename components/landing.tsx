"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/landing.module.css";
import { OrbCanvas, type OrbHandle } from "@/components/orb-canvas";
import { Dialogue } from "@/components/dialogue";
import { startMic, type MicSession } from "@/components/mic";
import { playDesigner, type DesignerSession } from "@/components/designer";

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

function revealClass(visible: boolean, extra?: string) {
  return `${styles.reveal} ${visible ? styles.in : ""} ${extra ?? ""}`;
}

function RevealDiv({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={revealClass(visible, className)} {...rest}>
      {children}
    </div>
  );
}

function RevealH2({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const { ref, visible } = useReveal<HTMLHeadingElement>();
  return (
    <h2 ref={ref} className={revealClass(visible, className)} {...rest}>
      {children}
    </h2>
  );
}

function RevealP({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { ref, visible } = useReveal<HTMLParagraphElement>();
  return (
    <p ref={ref} className={revealClass(visible, className)} {...rest}>
      {children}
    </p>
  );
}

type ListenState = "idle" | "requesting" | "live" | "denied";
type DesignerState = "idle" | "speaking";

export function Landing() {
  const orbRef = useRef<OrbHandle>(null);
  const micRef = useRef<MicSession | null>(null);
  const designerRef = useRef<DesignerSession | null>(null);
  const [listenState, setListenState] = useState<ListenState>("idle");
  const [designerState, setDesignerState] = useState<DesignerState>("idle");

  // External (Dialogue → orb) override during the designer's turn.
  const dialogueListenRef = useRef(false);
  function setDialogueListen(on: boolean) {
    dialogueListenRef.current = on;
    // Don't override active audio sources (mic or designer pad).
    if (listenState !== "live" && designerState !== "speaking" && orbRef.current) {
      orbRef.current.setListen(on);
    }
  }

  useEffect(() => {
    return () => {
      micRef.current?.stop();
      designerRef.current?.stop();
      micRef.current = null;
      designerRef.current = null;
    };
  }, []);

  async function toggleListen() {
    if (designerState === "speaking") return; // designer's turn — block mic
    if (listenState === "live") {
      micRef.current?.stop();
      micRef.current = null;
      setListenState("idle");
      orbRef.current?.setListen(dialogueListenRef.current);
      return;
    }
    if (listenState === "denied") {
      orbRef.current?.setListen(true);
      setListenState("live");
      return;
    }
    setListenState("requesting");
    try {
      const session = await startMic((level) => {
        orbRef.current?.setListen(level);
      });
      micRef.current = session;
      setListenState("live");
    } catch {
      setListenState("denied");
      orbRef.current?.setListen(true);
    }
  }

  async function toggleHear() {
    if (designerState === "speaking") {
      designerRef.current?.stop();
      designerRef.current = null;
      setDesignerState("idle");
      orbRef.current?.setListen(
        listenState === "live" ? 0 : dialogueListenRef.current,
      );
      return;
    }
    // Stop mic if active to avoid signal collision.
    if (listenState === "live" && micRef.current) {
      micRef.current.stop();
      micRef.current = null;
      setListenState("idle");
    }
    setDesignerState("speaking");
    try {
      const session = await playDesigner(
        (level) => orbRef.current?.setListen(level),
        () => {
          designerRef.current = null;
          setDesignerState("idle");
          orbRef.current?.setListen(dialogueListenRef.current);
        },
      );
      designerRef.current = session;
    } catch {
      setDesignerState("idle");
    }
  }

  const listening = listenState === "live" || listenState === "requesting";
  const speaking = designerState === "speaking";

  return (
    <div className={styles.root}>
      <div className={styles.grain} />

      <nav className={styles.nav}>
        <a className={styles.mark} href="#">
          <span className={styles.glyph} />
          lifedesigner
        </a>
        <div className={styles.navLinks}>
          <a href="#story">how</a>
          <a href="#plan">plan</a>
          <a href="#companion">companion</a>
        </div>
        <a className={styles.ctaMini} href="#cta">
          begin
        </a>
      </nav>

      <main className={styles.main}>
        {/* ============== 01 HERO ============== */}
        <section className={styles.hero} id="hero">
          <RevealDiv className={styles.heroCopy}>
            <h1 className={styles.display}>
              your life,
              <br />
              <span className={styles.it}>redesigned with you.</span>
            </h1>
            <p className={styles.heroSub}>
              a quiet, voice-first companion that listens, remembers, and helps you build the
              week you actually want.
            </p>
            <div className={styles.heroMeta}>
              <span className={styles.pip} aria-hidden="true" />
              <span>private beta · est. 2026</span>
            </div>
          </RevealDiv>

          <div className={styles.heroOrb} aria-hidden="true">
            <OrbCanvas ref={orbRef} radius={0.3} />
            <div className={styles.orbControls}>
              <button
                type="button"
                className={`${styles.listenMini} ${speaking ? styles.listenOn : ""}`}
                aria-pressed={speaking}
                onClick={toggleHear}
              >
                <span className={styles.listenDot} />
                <span>{speaking ? "speaking" : "hear"}</span>
              </button>
              <button
                type="button"
                className={`${styles.listenMini} ${listening ? styles.listenOn : ""}`}
                aria-pressed={listening}
                onClick={toggleListen}
                disabled={listenState === "requesting" || speaking}
              >
                <span className={styles.listenDot} />
                <span>
                  {listenState === "requesting"
                    ? "asking…"
                    : listenState === "live"
                      ? "listening"
                      : listenState === "denied"
                        ? "listen (no mic)"
                        : "listen"}
                </span>
              </button>
            </div>
          </div>

          <a className={styles.scrollHint} href="#story">
            a story
          </a>
        </section>

        {/* ============== 02 STORY ============== */}
        <section className={styles.sStory} id="story">
          <div className={styles.storyHalo} aria-hidden="true" />
          <div className={styles.storyGrid}>
            <RevealDiv className={styles.storyMeta}>
              <span>a story — sarah, 31, brooklyn</span>
              <span>part i</span>
            </RevealDiv>
            <RevealH2 className={`${styles.display} ${styles.storyHeadline}`}>
              finding
              <br />
              <span className={styles.it}>a rhythm.</span>
            </RevealH2>
            <RevealDiv className={styles.storyQuote}>
              <p className={styles.q}>
                “i sleep badly. i scroll until 1am. i&apos;ve lost my rituals, my workout, my
                friends a little too. i want to find a rhythm again — without forcing it.”
              </p>
              <p className={styles.attr}>— sarah, six months after a breakup</p>
            </RevealDiv>
          </div>
        </section>

        {/* ============== 03 DIALOGUE ============== */}
        <Dialogue onDesignerListening={setDialogueListen} />

        {/* ============== 04 PLAN ============== */}
        <section className={styles.sPlan} id="plan">
          <RevealDiv className={styles.planHead}>
            <div>
              <span className={styles.sectionNum}>the plan</span>
              <h2 className={styles.display} style={{ marginTop: 16 }}>
                this
                <br />
                <span className={styles.it}>week.</span>
              </h2>
            </div>
            <p className={styles.planHeadRight}>
              the designer doesn&apos;t write an essay. it renders a week — concrete,
              modest, mindful of your monday.
            </p>
          </RevealDiv>

          <RevealDiv className={styles.planGrid}>
            <div className={`${styles.planDay} ${styles.today}`}>
              <div className={styles.planDayHead}>
                <span className={styles.day}>mon</span>
                <span className={styles.dayNum}>01</span>
              </div>
              <div className={styles.planItem}>
                <span className={styles.planTime}>07:00</span>
                <span>walk · 20 min</span>
              </div>
              <div className={styles.planItem}>
                <span className={styles.planTime}>22:30</span>
                <span>phone out of bedroom</span>
              </div>
            </div>
            <div className={styles.planDay}>
              <div className={styles.planDayHead}>
                <span className={styles.day}>tue</span>
                <span className={styles.dayNum}>02</span>
              </div>
              <div className={styles.planItem}>
                <span className={styles.planTime}>19:00</span>
                <span>write three lines</span>
              </div>
            </div>
            <div className={styles.planDay}>
              <div className={styles.planDayHead}>
                <span className={styles.day}>wed</span>
                <span className={styles.dayNum}>03</span>
              </div>
              <div className={styles.planItem}>
                <span className={styles.planTime}>12:30</span>
                <span>lunch with lea</span>
              </div>
              <div className={styles.planItem}>
                <span className={styles.planTime}>21:00</span>
                <span>read · 30 min</span>
              </div>
            </div>
            <div className={styles.planDay}>
              <div className={styles.planDayHead}>
                <span className={styles.day}>thu</span>
                <span className={styles.dayNum}>04</span>
              </div>
              <div className={styles.planItem}>
                <span className={styles.planTime}>07:00</span>
                <span>walk · 20 min</span>
              </div>
            </div>
            <div className={styles.planDay}>
              <div className={styles.planDayHead}>
                <span className={styles.day}>fri</span>
                <span className={styles.dayNum}>05</span>
              </div>
              <div className={styles.planItem}>
                <span className={styles.planTime}>18:30</span>
                <span>run · 4 km</span>
              </div>
            </div>
            <div className={styles.planDay}>
              <div className={styles.planDayHead}>
                <span className={styles.day}>sat</span>
                <span className={styles.dayNum}>06</span>
              </div>
              <div className={styles.planItem}>
                <span className={styles.planTime}>10:00</span>
                <span>market · no list</span>
              </div>
              <div className={styles.planItem}>
                <span className={styles.planTime}>—</span>
                <span>one thing you used to love</span>
              </div>
            </div>
            <div className={styles.planDay}>
              <div className={styles.planDayHead}>
                <span className={styles.day}>sun</span>
                <span className={styles.dayNum}>07</span>
              </div>
              <div className={styles.planItem}>
                <span className={styles.planTime}>17:00</span>
                <span>debrief · 10 min, out loud</span>
              </div>
            </div>
          </RevealDiv>

          <RevealDiv className={styles.planFoot}>
            <span className={styles.pill}>5 habits</span>
            <span>they&apos;ll adjust with you, day by day.</span>
          </RevealDiv>
        </section>

        {/* ============== 05 COMPANION ============== */}
        <section className={styles.sCompanion} id="companion">
          <div className={styles.companionHalo} aria-hidden="true" />
          <RevealDiv className={styles.companionHead}>
            <span className={styles.sectionNum}>the companion</span>
            <h2 className={styles.display} style={{ marginTop: 16 }}>
              not a
              <br />
              <span className={styles.it}>chatbot.</span>
            </h2>
            <p className={styles.quiet}>
              the designer knows you. it remembers last time. it stays with you over time —
              in a 360 way.
            </p>
          </RevealDiv>

          <RevealDiv className={styles.roles}>
            <div className={styles.role}>
              <div className={styles.roleWord}>friend</div>
              <div className={styles.roleDesc}>
                laughs, listens, never judges. knows when to be quiet.
              </div>
              <div className={styles.roleNum}>01</div>
            </div>
            <div className={styles.role}>
              <div className={styles.roleWord}>coach</div>
              <div className={styles.roleDesc}>
                offers a direction, steps, a pace. comes back to what you said.
              </div>
              <div className={styles.roleNum}>02</div>
            </div>
            <div className={styles.role}>
              <div className={styles.roleWord}>confidant</div>
              <div className={styles.roleDesc}>
                stays between you. forgets nothing — unless you ask it to.
              </div>
              <div className={styles.roleNum}>03</div>
            </div>
            <div className={styles.role}>
              <div className={styles.roleWord}>
                <span className={styles.roleWordIt}>parent</span>
              </div>
              <div className={styles.roleDesc}>
                reminds you to drink water, call your sister, get some sleep.
              </div>
              <div className={styles.roleNum}>04</div>
            </div>
          </RevealDiv>
        </section>

        {/* ============== 06 CTA ============== */}
        <section className={styles.sCta} id="cta">
          <RevealH2 className={styles.display}>
            begin
            <br />
            <span className={styles.it}>monday.</span>
          </RevealH2>
          <RevealP className={styles.ctaSub}>
            a conversation. your first plan. then you decide.
          </RevealP>
          <RevealDiv className={styles.ctaRow}>
            <a href="#" className={`${styles.btn} ${styles.btnPrimary}`}>
              request access
            </a>
            <a href="#story" className={`${styles.btn} ${styles.btnGhost}`}>
              revisit the story
            </a>
          </RevealDiv>
          <RevealDiv className={styles.ctaFoot}>free · 7 days · no card</RevealDiv>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>lifedesigner · 2026</span>
        <span>made slowly, in brooklyn</span>
      </footer>
    </div>
  );
}

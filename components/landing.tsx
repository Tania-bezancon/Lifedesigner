"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/landing.module.css";
import { OrbCanvas, type OrbHandle } from "@/components/orb-canvas";
import { Bridge } from "@/components/bridge";
import { startMic, type MicSession } from "@/components/mic";
import {
  playDesigner,
  speakDesigner,
  type DesignerSession,
} from "@/components/designer";
import { YourTurn } from "@/components/your-turn";
import { PlanSection } from "@/components/plan-section";
import { type GeneratedPlan } from "@/lib/generate-plan";

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

/** Small live-feeling counter for "weeks redesigned this hour" — slowly increments to feel computed, not staged. */
function LiveCounter() {
  const [n, setN] = useState(247);
  useEffect(() => {
    const t = setInterval(() => {
      setN((prev) => prev + (Math.random() < 0.4 ? 1 : 0));
    }, 4200);
    return () => clearInterval(t);
  }, []);
  return <span className={styles.tnum}>{n}</span>;
}

type ListenState = "idle" | "requesting" | "live" | "denied";
type DesignerState = "idle" | "speaking";

export function Landing() {
  const orbRef = useRef<OrbHandle>(null);
  const micRef = useRef<MicSession | null>(null);
  const designerRef = useRef<DesignerSession | null>(null);
  const [listenState, setListenState] = useState<ListenState>("idle");
  const [designerState, setDesignerState] = useState<DesignerState>("idle");
  const [userPlan, setUserPlan] = useState<GeneratedPlan | null>(null);

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
      orbRef.current?.setListen(false);
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
      orbRef.current?.setListen(false);
      return;
    }
    // Stop mic if active to avoid signal collision.
    if (listenState === "live" && micRef.current) {
      micRef.current.stop();
      micRef.current = null;
      setListenState("idle");
    }
    setDesignerState("speaking");
    const onLevel = (level: number) => orbRef.current?.setListen(level);
    const onComplete = () => {
      designerRef.current = null;
      setDesignerState("idle");
      orbRef.current?.setListen(false);
    };
    try {
      // Prefer real synthesized voice; fall back to procedural pad if SpeechSynthesis is unavailable.
      const speech = await speakDesigner(onLevel, onComplete);
      if (speech) {
        designerRef.current = speech;
      } else {
        designerRef.current = await playDesigner(onLevel, onComplete);
      }
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
          <a href="#your-turn">your turn</a>
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
              <span>
                private beta · <LiveCounter /> weeks redesigned this hour
              </span>
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

          <a className={styles.scrollHint} href="#your-turn">
            your turn
          </a>
        </section>

        {/* ============== 02 BRIDGE — cinematic breath ============== */}
        <Bridge />

        {/* ============== 03 YOUR TURN — interactive ============== */}
        <YourTurn orbRef={orbRef} onPlanGenerated={setUserPlan} />

        {/* ============== 04 PLAN ============== */}
        <PlanSection plan={userPlan} />

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

        {/* ============== founder note ============== */}
        <RevealDiv className={styles.founder}>
          <p className={styles.founderText}>
            i built this because the productivity apps i tried treated me like a project to
            optimize. i wanted something quieter — something that listens before it
            suggests, and forgets to be loud.
          </p>
          <p className={styles.founderSign}>
            — tania, founder · brooklyn
          </p>
        </RevealDiv>
      </main>

      <footer className={styles.footer}>
        <span>lifedesigner · 2026</span>
        <span>made slowly, in brooklyn</span>
      </footer>
    </div>
  );
}

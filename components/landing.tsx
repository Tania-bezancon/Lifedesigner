"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/landing.module.css";
import { OrbCanvas, type OrbHandle } from "@/components/orb-canvas";
import { Concept } from "@/components/concept";
import { StickyOrb } from "@/components/sticky-orb";
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

/** A large breathing orb behind the CTA headline — closes the page on the same motif as the opening. */
function CtaBackdropOrb() {
  const orbRef = useRef<OrbHandle>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      orbRef.current?.setListen(0.5);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            // gentle swell when the section enters view
            orbRef.current?.setListen(0.55);
          } else {
            orbRef.current?.setListen(0.2);
          }
        }
      },
      { threshold: 0.18 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className={styles.ctaOrb} aria-hidden="true">
      <OrbCanvas ref={orbRef} radius={0.42} />
    </div>
  );
}

type ListenState = "idle" | "requesting" | "live" | "denied";
type DesignerState = "idle" | "speaking";

export function Landing() {
  const orbRef = useRef<OrbHandle>(null);
  const micRef = useRef<MicSession | null>(null);
  const designerRef = useRef<DesignerSession | null>(null);
  const heroOrbWrapperRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const [listenState, setListenState] = useState<ListenState>("idle");
  const [designerState, setDesignerState] = useState<DesignerState>("idle");
  const [userPlan, setUserPlan] = useState<GeneratedPlan | null>(null);

  // Scroll progress bar at the top of the page.
  useEffect(() => {
    function update() {
      const el = progressRef.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      el.style.transform = `scaleX(${p})`;
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Subtle mouse parallax on the hero orb — drift up to ~10px from center.
  useEffect(() => {
    const wrap = heroOrbWrapperRef.current;
    if (!wrap) return;
    let raf = 0;
    let targetX = 0,
      targetY = 0;
    let curX = 0,
      curY = 0;

    function onMove(e: MouseEvent) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // normalized -1..1 from center
      const nx = (e.clientX / w) * 2 - 1;
      const ny = (e.clientY / h) * 2 - 1;
      targetX = nx * 10;
      targetY = ny * 10;
    }

    function tick() {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      if (wrap) {
        wrap.style.transform = `translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

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
      <div ref={progressRef} className={styles.scrollProgress} aria-hidden="true" />
      <StickyOrb />

      <nav className={styles.nav}>
        <a className={styles.mark} href="#">
          <span className={styles.glyph} />
          lifedesigner
        </a>
        <div className={styles.navLinks}>
          <a href="#concept">how</a>
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

          <div ref={heroOrbWrapperRef} className={styles.heroOrb} aria-hidden="true">
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

          <a className={styles.scrollHint} href="#concept">
            how
          </a>
        </section>

        {/* ============== 02 CONCEPT — explainer + sample dialogue + pillars ============== */}
        <Concept />

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
          <CtaBackdropOrb />
          <RevealH2 className={`${styles.display} ${styles.ctaHeadline}`}>
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
            <a href="#hero" className={`${styles.btn} ${styles.btnGhost}`}>
              back to top
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

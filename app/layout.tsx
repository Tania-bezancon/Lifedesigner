import type { Metadata, Viewport } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-tight",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lifedesigner.app"),
  title: "lifedesigner — your life, redesigned with you.",
  description:
    "a concept interface for a voice-first life designer. it listens, asks you to imagine your dream life, and renders it as twelve weeks of micro-habits.",
  keywords: [
    "life design",
    "voice-first",
    "habits",
    "ai companion",
    "concept",
    "design",
    "tania bezancon",
  ],
  authors: [
    { name: "tania bezancon", url: "https://taniabezancon.netlify.app/en" },
  ],
  creator: "tania bezancon",
  openGraph: {
    type: "website",
    title: "lifedesigner — your life, redesigned with you.",
    description:
      "a concept interface for a voice-first life designer. listens, remembers, and renders the week you actually want.",
    siteName: "lifedesigner",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "lifedesigner — your life, redesigned with you.",
    description:
      "a concept interface for a voice-first life designer. listens, remembers, and renders the week you actually want.",
    creator: "@taniabezancon",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e10" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Pre-paint theme script: avoids the white-flash before the user's saved
// preference is read. Runs synchronously in the head before first render.
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('ld-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={interTight.variable}
      suppressHydrationWarning
    >
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: theme init must run before paint
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

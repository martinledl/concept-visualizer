import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://martinledl.github.io/concept-visualizer";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Concept Visualizer",
    template: "%s",
  },
  description:
    "Interactive visual explanations that turn difficult concepts into experiments.",
  icons: {
    icon: new URL("favicon.svg", `${siteUrl.replace(/\/$/, "")}/`),
    shortcut: new URL("favicon.svg", `${siteUrl.replace(/\/$/, "")}/`),
  },
  openGraph: {
    type: "website",
    title: "Concept Visualizer",
    description: "Build intuition by changing the system.",
    images: [
      {
        url: new URL("og.png", `${siteUrl.replace(/\/$/, "")}/`),
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Concept Visualizer",
    description: "Build intuition by changing the system.",
    images: [new URL("og.png", `${siteUrl.replace(/\/$/, "")}/`)],
  },
};

const themeScript = `
  (() => {
    try {
      const saved = localStorage.getItem('concept-visualizer-theme');
      const preferred = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.dataset.theme = saved || preferred;
    } catch (_) {
      document.documentElement.dataset.theme = 'light';
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}

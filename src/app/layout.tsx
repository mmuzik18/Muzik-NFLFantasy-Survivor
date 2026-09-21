import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Big_Shoulders } from "next/font/google";
import "./globals.css";
import { themeInitScript } from "@/lib/theme";
import { ToastProvider } from "@/components/ToastProvider";
import { UtmCapture } from "@/components/UtmCapture";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Variable font with an optical-size axis: the browser picks the tight
// display cut automatically at large sizes (week numerals, scores).
const bigShoulders = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  axes: ["opsz"],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: {
    default: "Muzik NFL Survivor",
    template: "%s | Muzik NFL Survivor",
  },
  description:
    "A weekly pick 'em survivor pool. Pick one NFL team to win, don't repeat a team, don't lose.",
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef0ec" },
    { media: "(prefers-color-scheme: dark)", color: "#0a100d" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bigShoulders.variable} h-full antialiased`}
    >
      <head>
        {/* Sets data-theme before first paint so a saved dark/light choice
            never flashes the wrong theme on load. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <UtmCapture />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

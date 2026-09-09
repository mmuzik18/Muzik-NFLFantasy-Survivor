import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Oswald, Anton } from "next/font/google";
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

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "Muzik NFL Survivor",
    template: "%s · Muzik NFL Survivor",
  },
  description:
    "A weekly pick 'em survivor pool. Pick one NFL team to win, don't repeat a team, don't lose.",
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b2e1d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} ${anton.variable} h-full antialiased`}
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

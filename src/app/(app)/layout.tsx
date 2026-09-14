import Providers from "../providers";
import { PlayerProvider } from "@/lib/PlayerContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WelcomeNamePrompt } from "@/components/WelcomeNamePrompt";
import { PlayerErrorBanner } from "@/components/PlayerErrorBanner";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { ScrollProgressBar } from "@/components/ScrollProgressBar";
import { SkipToContent } from "@/components/SkipToContent";
import { BackToTopButton } from "@/components/BackToTopButton";
import { FloatingContact } from "@/components/FloatingContact";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <Providers>
      <PlayerProvider>
        <SkipToContent />
        <ScrollProgressBar />
        <AnnouncementBanner />
        <Navbar />
        <PlayerErrorBanner />
        <WelcomeNamePrompt />
        {children}
        <Footer />
        <BackToTopButton />
        <FloatingContact />
      </PlayerProvider>
    </Providers>
  );
}

import Providers from "../providers";
import { PlayerProvider } from "@/lib/PlayerContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WelcomeNamePrompt } from "@/components/WelcomeNamePrompt";
import { PlayerErrorBanner } from "@/components/PlayerErrorBanner";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { SkipToContent } from "@/components/SkipToContent";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <Providers>
      <PlayerProvider>
        <SkipToContent />
        <AnnouncementBanner />
        <Navbar />
        <PlayerErrorBanner />
        <WelcomeNamePrompt />
        {children}
        <Footer />
      </PlayerProvider>
    </Providers>
  );
}

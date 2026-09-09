import Providers from "../providers";
import { PlayerProvider } from "@/lib/PlayerContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WelcomeNamePrompt } from "@/components/WelcomeNamePrompt";
import { PlayerErrorBanner } from "@/components/PlayerErrorBanner";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <Providers>
      <PlayerProvider>
        <Navbar />
        <PlayerErrorBanner />
        <WelcomeNamePrompt />
        {children}
        <Footer />
      </PlayerProvider>
    </Providers>
  );
}

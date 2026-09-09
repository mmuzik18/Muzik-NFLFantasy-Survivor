import Providers from "../providers";
import { PlayerProvider } from "@/lib/PlayerContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WelcomeNamePrompt } from "@/components/WelcomeNamePrompt";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <Providers>
      <PlayerProvider>
        <Navbar />
        <WelcomeNamePrompt />
        {children}
        <Footer />
      </PlayerProvider>
    </Providers>
  );
}

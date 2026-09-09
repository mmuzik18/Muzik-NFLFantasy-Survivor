import Providers from "../providers";
import { PlayerProvider } from "@/lib/PlayerContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <Providers>
      <PlayerProvider>
        <Navbar />
        {children}
        <Footer />
      </PlayerProvider>
    </Providers>
  );
}

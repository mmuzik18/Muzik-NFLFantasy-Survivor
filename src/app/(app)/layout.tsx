import Providers from "../providers";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return <Providers>{children}</Providers>;
}

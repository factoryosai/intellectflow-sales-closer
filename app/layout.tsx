import "./globals.css";
export const metadata = { title: "Intellect Flow - AI Sales Agent", description: "Lead Agent" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}

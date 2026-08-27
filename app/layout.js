import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import AuthCodeCleanup from "@/components/AuthCodeCleanup";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["300", "500"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  title: "Hearth — breathe",
  description: "Heart centered breathwork, and five more practices. One tap, no menus.",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport = {
  themeColor: "#12100F",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        {children}
        <ServiceWorkerRegister />
        <AuthCodeCleanup />
      </body>
    </html>
  );
}

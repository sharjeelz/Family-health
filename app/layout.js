import "./globals.css";
import { Fraunces, Nunito } from "next/font/google";
import RegisterSW from "../components/RegisterSW";

// Self-hosted via next/font: fonts are downloaded at build time and served
// from our own origin (no request to Google), so they load instantly and work
// offline. The CSS variables match what globals.css / tailwind.config.js use.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  title: "Family Health Tracker",
  description: "Check off meals, log water, and build healthy habits together.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Family",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FBF8F3",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${nunito.variable}`}>
      <body>
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}

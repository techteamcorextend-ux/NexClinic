import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClinicProvider } from "@/lib/clinic-store";
import PhoneToasts from "@/components/system/PhoneToasts";
import {
  ThemeProvider,
  THEME_INIT_SCRIPT,
} from "@/components/system/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Nexclinic",
    template: "%s · Nexclinic",
  },
  description:
    "Nexclinic — a unified clinic management system with an integrated AI wellness suite.",
};

export const viewport: Viewport = {
  themeColor: "#F2F1EF",
  width: "device-width",
  initialScale: 1,
};

/**
 * Minimal root shell. Section chrome lives in the route-group layouts:
 * `app/(marketing)/layout.tsx` for the public site, `app/admin/layout.tsx`
 * for the Super Admin panel.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/*
          Sets the theme class before the first paint. Without it every load
          would render light, hydrate, then flip — a white flash for anyone
          on the dark theme. suppressHydrationWarning above is because this
          script legitimately changes <html> before React sees it.
        */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-sans antialiased">
        {/*
          One client-side store backs every portal, so an action in one shows
          up in another: a request from the homepage lands at the front desk,
          a bill draws down inventory, a shift change pushes to a phone.
        */}
        <ThemeProvider>
          <ClinicProvider>
            {children}
            <PhoneToasts />
          </ClinicProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

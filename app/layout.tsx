import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClinicProvider } from "@/lib/clinic-store";
import PhoneToasts from "@/components/system/PhoneToasts";

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
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        {/*
          One client-side store backs every portal, so an action in one shows
          up in another: a request from the homepage lands at the front desk,
          a bill draws down inventory, a shift change pushes to a phone.
        */}
        <ClinicProvider>
          {children}
          <PhoneToasts />
        </ClinicProvider>
      </body>
    </html>
  );
}

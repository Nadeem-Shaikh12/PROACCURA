import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";
import { Providers } from "@/components/Providers";
import BottomNav from "@/components/dashboard/BottomNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CustomThemeProvider } from "@/context/CustomThemeContext";
import MainWrapper from "@/components/MainWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PropAccura - Property Management Simplified",
  description: "Secure, role-based platform for modern rentals.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PropAccura",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-slate-900 bg-[var(--background)] transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <CustomThemeProvider>
              <NavbarWrapper />
              <MainWrapper>
                {children}
              </MainWrapper>
              <BottomNav />
            </CustomThemeProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}

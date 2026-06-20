import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

// Clean geometric sans for the whole product.
const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Cinephile — Movie Discovery",
  description:
    "Browse, search, and favorite movies in a dark, cinematic interface. Powered by the TMDB API.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable}>
      <body>{children}</body>
    </html>
  );
}

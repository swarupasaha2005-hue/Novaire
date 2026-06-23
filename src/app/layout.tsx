import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Novaire | Autonomous Fixed Income",
  description: "The first Autonomous Fixed Income Operating System on Stellar. Invest by Goal. Not by Complexity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrument.variable} dark scroll-smooth`}
    >
      <body className="antialiased text-nova-text bg-nova-bg w-full min-h-screen">
        {children}
      </body>
    </html>
  );
}

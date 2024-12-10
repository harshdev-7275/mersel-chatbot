
import localFont from "next/font/local";
import "./globals.css";
import toast, { Toaster } from 'react-hot-toast';


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#EBF1F4] h-screen w-screen`}
      >
        <main className="flex h-screen w-full">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}

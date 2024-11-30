

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white">
        <main className="flex h-full w-full">{children}</main>
      </body>
    </html>
  );
}

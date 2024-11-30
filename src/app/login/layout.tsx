

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
 
        <div className="flex h-full w-full">{children}</div>


  );
}

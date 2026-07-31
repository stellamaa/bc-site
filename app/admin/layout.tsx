export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] h-dvh w-full overflow-hidden bg-white">
      {children}
    </div>
  );
}

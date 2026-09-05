"use client";

import { usePathname } from "next/navigation";
import Header from "@/app/components/Header";

export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStudio = pathname?.startsWith("/admin");

  if (isStudio) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 bg-white">
        <Header />
      </div>
      <div className="flex flex-1 flex-col pt-12 md:pt-20">{children}</div>
    </>
  );
}

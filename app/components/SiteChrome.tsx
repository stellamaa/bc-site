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
      <div className="hidden md:block fixed top-0 inset-x-0 z-50 bg-white">
        <Header />
      </div>
      <div className="flex-1 flex flex-col md:pt-[6.5rem]">{children}</div>
    </>
  );
}

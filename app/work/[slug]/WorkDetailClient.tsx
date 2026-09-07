"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import WorkExpand from "@/app/components/WorkExpand";
import type { Work } from "@/types/work";

type WorkDetailClientProps = {
  work: Work;
};

export default function WorkDetailClient({ work }: WorkDetailClientProps) {
  const router = useRouter();

  return (
    <div className="px-4 pt-4 pb-16 md:px-8 md:pt-8 md:pr-8 md:pb-24 md:pl-16 lg:pl-24">
      <p className="mb-4 text-[10px] font-medium tracking-wide uppercase text-neutral-400 md:mb-6 md:text-xs">
        <Link href="/#work" className="hover:text-black">
          (Work)
        </Link>
      </p>
      <WorkExpand
        work={work}
        onClose={() => {
          router.push("/#work");
        }}
      />
    </div>
  );
}

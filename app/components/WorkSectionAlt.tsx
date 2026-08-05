"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import WorkExpand from "@/app/components/WorkExpand";
import WorkSection from "@/app/components/WorkSection";
import { getWorkMediaKind } from "@/lib/workMedia";
import type { Category } from "@/types/category";
import type { Work } from "@/types/work";

type Props = {
  categories: Category[];
  works: Work[];
  /** When true, use overlay mobile UI (experiment). Desktop always uses original. */
  enabled?: boolean;
};

function formatIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

function findCreativeDirectorsSlug(categories: Category[]): string | null {
  const match = categories.find((category) => {
    const title = category.title?.toLowerCase() ?? "";
    const slug = category.slug?.toLowerCase() ?? "";
    return (
      title.includes("creative director") ||
      slug === "creative-directors" ||
      slug === "creative-director" ||
      slug.includes("creative-director")
    );
  });
  return match?.slug ?? categories.find((c) => c.slug)?.slug ?? null;
}

/**
 * Experimental mobile Work UI: category overlay with Select / Close.
 * Desktop renders the original WorkSection.
 */
export default function WorkSectionAlt({
  categories,
  works,
  enabled = true,
}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const forceOverlayUi = searchParams.get("workOverlay") === "1";

  const [isDesktop, setIsDesktop] = useState<boolean | null>(() => {
    if (typeof window === "undefined") return null;
    return window.matchMedia("(min-width: 768px)").matches;
  });

  const creativeSlug = useMemo(
    () => findCreativeDirectorsSlug(categories),
    [categories],
  );

  const categoryParams = searchParams.getAll("category");
  const categoryKey = categoryParams.join(",");

  const [appliedSlugs, setAppliedSlugs] = useState<string[]>(() => {
    if (categoryParams.length > 0) return categoryParams;
    return creativeSlug ? [creativeSlug] : [];
  });
  const [draftSlugs, setDraftSlugs] = useState<string[]>(appliedSlugs);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openWorkId, setOpenWorkId] = useState<string | null>(null);
  const expandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Sync from URL; if empty, default to Creative Directors once
  useEffect(() => {
    if (categoryKey) {
      const next = categoryKey.split(",");
      setAppliedSlugs(next);
      setDraftSlugs(next);
      return;
    }
    if (!creativeSlug) return;
    setAppliedSlugs([creativeSlug]);
    setDraftSlugs([creativeSlug]);
    const params = new URLSearchParams(searchParams.toString());
    if (!params.getAll("category").length) {
      params.append("category", creativeSlug);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [categoryKey, creativeSlug, pathname, router, searchParams]);

  const resetWorks = useCallback(() => {
    const defaults = creativeSlug ? [creativeSlug] : [];
    setOpenWorkId(null);
    setMenuOpen(false);
    setAppliedSlugs(defaults);
    setDraftSlugs(defaults);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    for (const slug of defaults) params.append("category", slug);
    const query = params.toString();
    // Stay on landing hash when resetting from BC
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [creativeSlug, pathname, router, searchParams]);

  useEffect(() => {
    const shouldHandle = () =>
      forceOverlayUi || !window.matchMedia("(min-width: 768px)").matches;

    const onSection = (event: Event) => {
      const section = (event as CustomEvent<{ section?: string }>).detail
        ?.section;
      if (!section) return;
      if (section === "work" && shouldHandle()) {
        setDraftSlugs(appliedSlugs);
        setMenuOpen(true);
        return;
      }
      // BC / landing (and other sections): close expand, reset filters to Creative Directors
      if (section === "landing") {
        resetWorks();
      }
    };
    window.addEventListener("bc:section", onSection);
    return () => window.removeEventListener("bc:section", onSection);
  }, [appliedSlugs, forceOverlayUi, resetWorks]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDraftSlugs(appliedSlugs);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, appliedSlugs]);

  const updateCategoryParam = useCallback(
    (slugs: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("category");
      for (const slug of slugs) params.append("category", slug);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}#work` : `${pathname}#work`, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const toggleDraft = (slug: string) => {
    setDraftSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  const closeMenu = () => {
    setDraftSlugs(appliedSlugs);
    setMenuOpen(false);
  };

  const selectMenu = () => {
    setAppliedSlugs(draftSlugs);
    updateCategoryParam(draftSlugs);
    setOpenWorkId(null);
    setMenuOpen(false);
    requestAnimationFrame(() => {
      document
        .getElementById("work")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const filteredWorks = useMemo(() => {
    if (appliedSlugs.length === 0) return [];
    return works.filter((work) =>
      (work.categories ?? []).some(
        (cat) => cat.slug && appliedSlugs.includes(cat.slug),
      ),
    );
  }, [works, appliedSlugs]);

  const openWork = useMemo(
    () => filteredWorks.find((work) => work._id === openWorkId) ?? null,
    [filteredWorks, openWorkId],
  );

  useEffect(() => {
    if (!openWork) return;
    // Let the expand mount, then scroll it under the fixed header
    const id = window.requestAnimationFrame(() => {
      expandRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [openWork?._id]);

  const useOverlayUi =
    enabled && (forceOverlayUi || isDesktop === false);

  if (!useOverlayUi) {
    return <WorkSection categories={categories} works={works} />;
  }

  return (
    <section
      id="work"
      className="min-h-dvh scroll-mt-14 px-4 pt-4 pb-16"
    >
      {menuOpen ? (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-white pt-14 pb-8"
          role="dialog"
          aria-modal="true"
          aria-label="Work menu"
        >
          <p className="px-4 py-3 text-center text-[10px] font-medium tracking-[0.12em] uppercase">
            Work Menu
          </p>
          <ul className="flex min-h-0 flex-1 flex-col items-center gap-4 overflow-y-auto px-6 py-4">
            {categories.map((category) => {
              if (!category.slug) return null;
              const selected = draftSlugs.includes(category.slug);
              return (
                <li key={category._id} className="w-full max-w-[16rem]">
                  <button
                    type="button"
                    onClick={() => toggleDraft(category.slug!)}
                    className={`w-full rounded-full border border-black px-5 py-2 text-center text-[10px] font-medium uppercase leading-tight tracking-wide transition-colors ${
                      selected
                        ? "bg-black text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    {category.title}
                  </button>
                </li>
              );
            })}
            <li className="w-full max-w-[16rem] pt-1 text-center">
              <button
                type="button"
                onClick={selectMenu}
                className="text-[10px] font-medium tracking-wide uppercase"
              >
                (SELECT)
              </button>
            </li>
          </ul>
          <button
            type="button"
            onClick={closeMenu}
            className="pt-2 text-center text-[10px] font-medium tracking-wide uppercase"
            aria-label="Close work menu"
          >
            (CLOSE)
          </button>
        </div>
      ) : null}

      <p className="mb-4 text-center text-[10px] font-medium tracking-wide uppercase">
        (selected works)
      </p>

      {openWork ? (
        <div ref={expandRef} className="mb-4 scroll-mt-16">
          <WorkExpand
            work={openWork}
            onClose={() => setOpenWorkId(null)}
          />
        </div>
      ) : null}

      {filteredWorks.length === 0 ? (
        <div className="min-h-[40vh]" aria-hidden />
      ) : (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-6">
          {filteredWorks.map((work, index) => {
            const n = formatIndex(index);
            const mediaKind = getWorkMediaKind(work);
            const isOpen = openWorkId === work._id;
            const overlayLabel =
              mediaKind === "video"
                ? "(PLAY)"
                : mediaKind === "gallery"
                  ? "(VIEW MORE)"
                  : null;

            return (
              <li key={work._id} className="min-w-0">
                <button
                  type="button"
                  onClick={() =>
                    setOpenWorkId((prev) =>
                      prev === work._id ? null : work._id,
                    )
                  }
                  aria-expanded={isOpen}
                  className="flex w-full flex-col gap-2 text-left"
                >
                  <span className="text-xs font-medium tabular-nums text-black">
                    ({n})
                  </span>
                  <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
                    {work.thumbnail ? (
                      <Image
                        src={work.thumbnail}
                        alt={work.thumbnailAlt || work.title || "Work"}
                        fill
                        className="object-cover"
                        sizes="40vw"
                      />
                    ) : null}
                    {overlayLabel ? (
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-sm font-bold tracking-wide text-white uppercase drop-shadow">
                        {overlayLabel}
                      </span>
                    ) : null}
                  </div>
                  {work.description ? (
                    <p className="line-clamp-3 text-[10px] leading-snug">
                      {work.description}
                    </p>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

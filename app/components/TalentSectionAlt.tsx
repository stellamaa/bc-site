"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import TalentSection from "@/app/components/TalentSection";
import WorkExpand from "@/app/components/WorkExpand";
import { replaceDocumentUrl } from "@/lib/documentUrl";
import { sortByNameAsc } from "@/lib/order";
import { getWorkMediaKind } from "@/lib/workMedia";
import {
  getTalentLayoutFromEnv,
  parseTalentLayoutParam,
  type TalentLayoutMode,
} from "@/lib/talentLayout";
import type { Talent } from "@/types/talent";
import type { Work } from "@/types/work";

type Props = {
  talents: Talent[];
  works: Work[];
  /** Server-resolved env default */
  defaultLayout?: TalentLayoutMode;
};

function formatIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

function chunkItems<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}

/** Split talents into 3 columns, filling left → center → right. */
function columnizeTalents(talents: Talent[]): Talent[][] {
  const withSlug = talents.filter((t) => t.slug);
  const perCol = Math.max(1, Math.ceil(withSlug.length / 3));
  return [
    withSlug.slice(0, perCol),
    withSlug.slice(perCol, perCol * 2),
    withSlug.slice(perCol * 2),
  ];
}

/**
 * Experimental mobile Talent UI (desktop uses the original TalentSection).
 * Enable with ?talentLayout=overlay or NEXT_PUBLIC_TALENT_LAYOUT=overlay
 */
export default function TalentSectionAlt({
  talents,
  works,
  defaultLayout = "default",
}: Props) {
  const searchParams = useSearchParams();
  const layout =
    parseTalentLayoutParam(searchParams.get("talentLayout")) ?? defaultLayout;
  /** Preview the mobile overlay even on a wide desktop window */
  const forceOverlayUi = searchParams.get("talentOverlay") === "1";

  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  // Closed by default — otherwise the fixed overlay blocks the whole homepage
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [openWorkId, setOpenWorkId] = useState<string | null>(null);
  const expandRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => setMenuOpen(false);

  const dismissMenuWithoutSelection = () => {
    closeMenu();
    if (selectedSlug) return;
    replaceDocumentUrl("", "landing");
    document
      .getElementById("landing")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.dispatchEvent(
      new CustomEvent("bc:section", { detail: { section: "landing" } }),
    );
  };

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Open menu on Talent nav; clear selection when leaving (e.g. BC / landing)
  useEffect(() => {
    const shouldHandle = () =>
      forceOverlayUi || !window.matchMedia("(min-width: 768px)").matches;

    const clearSelection = () => {
      setSelectedSlug(null);
      setMenuOpen(false);
      setBioExpanded(false);
      setOpenWorkId(null);
    };

    // Fresh load / remount: never restore a selected talent
    if (window.location.hash !== "#talent") {
      clearSelection();
    } else if (shouldHandle()) {
      setMenuOpen(true);
    }

    const onSection = (event: Event) => {
      const section = (event as CustomEvent<{ section?: string }>).detail
        ?.section;
      if (!section) return;
      if (section === "talent" && shouldHandle()) {
        setMenuOpen(true);
        return;
      }
      // BC, Work, About, Contact — deselect talent and hide profile
      clearSelection();
    };
    window.addEventListener("bc:section", onSection);
    return () => window.removeEventListener("bc:section", onSection);
  }, [forceOverlayUi]);

  useEffect(() => {
    setBioExpanded(false);
    setOpenWorkId(null);
  }, [selectedSlug]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismissMenuWithoutSelection();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, selectedSlug]);

  const sortedTalents = useMemo(() => sortByNameAsc(talents), [talents]);

  const selected = useMemo(
    () => sortedTalents.find((t) => t.slug === selectedSlug) ?? null,
    [sortedTalents, selectedSlug],
  );

  const talentWorks = useMemo(() => {
    if (!selectedSlug) return [];
    return works.filter((work) =>
      (work.talent ?? []).some((t) => t.slug === selectedSlug),
    );
  }, [works, selectedSlug]);

  const openWork = useMemo(
    () => talentWorks.find((work) => work._id === openWorkId) ?? null,
    [talentWorks, openWorkId],
  );

  useEffect(() => {
    if (openWorkId && !talentWorks.some((work) => work._id === openWorkId)) {
      setOpenWorkId(null);
    }
  }, [talentWorks, openWorkId]);

  useEffect(() => {
    if (!openWork) return;
    const id = window.requestAnimationFrame(() => {
      expandRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [openWork?._id]);

  const columns = useMemo(
    () => columnizeTalents(sortedTalents),
    [sortedTalents],
  );
  const workPages = chunkItems(talentWorks, 4);

  const useOverlayUi =
    layout === "overlay" && (forceOverlayUi || isDesktop === false);

  // Flag off / desktop (without force) / SSR → original component
  if (!useOverlayUi) {
    return <TalentSection talents={talents} works={works} />;
  }

  return (
    <section
      id="talent"
      className={
        selected
          ? "relative min-h-dvh scroll-mt-14 px-4 pt-4 pb-2"
          : "relative scroll-mt-14"
      }
    >
      {/* Name picker overlay — only while open; does not mount on initial page load */}
      {menuOpen ? (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-white pt-14 pb-10"
          role="dialog"
          aria-modal="true"
          aria-label="Talent"
        >
          <p className="px-4 py-3 text-center text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
            Talent
          </p>
          <div className="flex min-h-0 flex-1 items-start justify-between gap-3 overflow-y-auto px-4 pt-4">
            {columns.map((col, colIndex) => (
              <ul
                key={colIndex}
                className="flex flex-1 flex-col items-center gap-4"
              >
                {col.map((talent) => (
                  <li key={talent._id} className="w-full max-w-[9.5rem]">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSlug(talent.slug!);
                        closeMenu();
                        requestAnimationFrame(() => {
                          document
                            .getElementById("talent")
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                        });
                      }}
                      className="w-full rounded-full border border-black px-2.5 py-1.5 text-center text-[10px] font-medium leading-tight tracking-wide uppercase transition-colors hover:bg-neutral-100"
                    >
                      {talent.name}
                    </button>
                  </li>
                ))}
              </ul>
            ))}
          </div>
          <button
            type="button"
            onClick={dismissMenuWithoutSelection}
            className="mt-6 pb-2 text-center text-[10px] font-medium tracking-wide uppercase"
            aria-label="Close talent menu"
          >
            (CLOSE)
          </button>
        </div>
      ) : null}

      {/* Profile + works only after a talent is chosen from the nav */}
      {selected ? (
        <div className="flex flex-col gap-6">
          <p className="mb-0 text-center text-[10px] font-bold tracking-wide uppercase">
            (talent)
          </p>
          {/* Profile: image top-left, bio underneath */}
          <div className="flex flex-col gap-3">
            <div className="relative size-[7rem] overflow-hidden bg-neutral-100">
              {selected.image ? (
                <Image
                  src={selected.image}
                  alt={selected.imageAlt || selected.name || "Talent"}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              ) : null}
            </div>
            <div>
              <h2 className="mb-1.5 text-sm font-medium tracking-tight uppercase">
                ({selected.name})
              </h2>
              {selected.bio ? (
                <div className="max-w-md text-xs leading-[1.2] font-normal text-black">
                  <p
                    className={`whitespace-pre-line ${
                      bioExpanded ? "" : "line-clamp-6"
                    }`}
                  >
                    {selected.bio}
                  </p>
                  {selected.bio.length > 160 ? (
                    <button
                      type="button"
                      onClick={() => setBioExpanded((open) => !open)}
                      className="mt-1 font-medium"
                    >
                      {bioExpanded ? "Read less" : "Read more"}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          {openWork ? (
            <div ref={expandRef} className="scroll-mt-16">
              <WorkExpand
                work={openWork}
                onClose={() => setOpenWorkId(null)}
              />
            </div>
          ) : null}

          {/* Works 2×2 */}
          {talentWorks.length > 0 ? (
            <div className="flex w-full flex-col gap-6">
              {workPages.map((page, pageIndex) => (
                <ul
                  key={page[0]?._id ?? pageIndex}
                  className="grid grid-cols-2 gap-x-3 gap-y-5"
                >
                  {page.map((work, indexInPage) => {
                    const index = pageIndex * 4 + indexInPage;
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
                                alt={
                                  work.thumbnailAlt || work.title || "Work"
                                }
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
                          {work.title ? (
                            <p className="line-clamp-2 text-[10px] font-medium leading-snug">
                              {work.title}
                            </p>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

/** Convenience export if env default is needed without search params on server */
export function getServerTalentLayoutDefault(): TalentLayoutMode {
  return getTalentLayoutFromEnv();
}

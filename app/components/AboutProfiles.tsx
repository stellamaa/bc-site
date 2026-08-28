"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { AboutProfile } from "@/types/about";

const bioClass =
  "min-w-0 text-xs font-normal leading-[1.15] whitespace-pre-line md:text-[0.8rem] lg:text-sm";

type AboutProfilesProps = {
  profiles: AboutProfile[];
};

function ProfileBio({
  bio,
  profileKey,
  expandedKey,
  onToggle,
}: {
  bio: string;
  profileKey: string;
  expandedKey: string | null;
  onToggle: (key: string) => void;
}) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [canToggle, setCanToggle] = useState(false);
  const isExpanded = expandedKey === profileKey;

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const measure = () => {
      if (isExpanded) return;
      setCanToggle(el.scrollHeight > el.clientHeight + 1);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [bio, isExpanded]);

  return (
    <div className="min-w-0 flex-1 md:w-[55%] md:flex-none">
      <p
        ref={textRef}
        className={`${bioClass} ${isExpanded ? "" : "line-clamp-4"}`}
      >
        {bio}
      </p>
      {canToggle || isExpanded ? (
        <button
          type="button"
          onClick={() => onToggle(profileKey)}
          className="mt-1 text-xs font-medium md:text-[0.8rem] lg:text-sm"
        >
          {isExpanded ? "Read less" : "Read more"}
        </button>
      ) : null}
    </div>
  );
}

export default function AboutProfiles({ profiles }: AboutProfilesProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6 md:gap-3">
      {profiles.map((profile) => {
        const bio = profile.bio?.trim() ?? "";

        return (
          <article
            key={profile._key}
            className="flex flex-col gap-2 md:gap-0"
          >
            <div className="flex flex-row items-start gap-3 md:gap-4">
              {profile.image ? (
                <div className="relative mt-0.5 h-24 w-24 shrink-0 overflow-hidden bg-neutral-100 md:h-24 md:w-24 lg:h-28 lg:w-24">
                  <Image
                    src={profile.image}
                    alt={profile.imageAlt || profile.name || "Profile"}
                    fill
                    className="object-cover object-top"
                    sizes="112px"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="mt-0.5 h-24 w-24 shrink-0 bg-neutral-100 md:h-24 md:w-24 lg:h-28 lg:w-28" />
              )}
              {bio ? (
                <ProfileBio
                  bio={bio}
                  profileKey={profile._key}
                  expandedKey={expandedKey}
                  onToggle={(key) =>
                    setExpandedKey((prev) => (prev === key ? null : key))
                  }
                />
              ) : null}
            </div>
            {profile.name ? (
              <h2 className="text-base font-medium md:mt-1 md:text-base lg:text-lg">
                ({profile.name})
              </h2>
            ) : null}
            {profile.role ? (
              <p className="text-sm font-light md:text-sm lg:text-base">
                {profile.role}
              </p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

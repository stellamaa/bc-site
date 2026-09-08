"use client";

import { useMemo } from "react";
import { useAboutExpand } from "@/app/components/AboutExpand";

type AboutDescriptionProps = {
  description: string;
  className?: string;
};

/** Blank lines separate paragraphs; fall back to single line breaks. */
function splitParagraphs(text: string) {
  const byBlankLine = text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (byBlankLine.length > 1) return byBlankLine;

  return text
    .split(/\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export default function AboutDescription({
  description,
  className = "",
}: AboutDescriptionProps) {
  const { expanded, toggle } = useAboutExpand("description");
  const paragraphs = useMemo(
    () => splitParagraphs(description),
    [description],
  );

  const hasMore = paragraphs.length > 1;
  const visible = expanded || !hasMore ? paragraphs : paragraphs.slice(0, 1);

  return (
    <div className={`shrink-0 ${className}`}>
      {visible.map((paragraph, index) => (
        <p key={index} className={index > 0 ? "mt-3" : undefined}>
          {paragraph}
        </p>
      ))}
      {hasMore ? (
        <button
          type="button"
          onClick={toggle}
          className="mt-1 font-medium"
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      ) : null}
    </div>
  );
}

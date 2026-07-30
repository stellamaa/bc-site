import {
  PortableText as BasePortableText,
  type PortableTextComponents,
} from "@portabletext/react";
import type { PortableTextBlock } from "sanity";

const components: PortableTextComponents = {
  hardBreak: () => <br />,
  types: {
    lineBreak: () => <div className="h-2 shrink-0" aria-hidden />,
  },
  block: {
    normal: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
  },
};

type Props = {
  value: PortableTextBlock[];
  className?: string;
};

export default function PortableText({ value, className }: Props) {
  return (
    <div className={className}>
      <BasePortableText value={value} components={components} />
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type ArrayOfObjectsInputProps,
  type Reference,
  set,
  useClient,
  useFormValue,
} from "sanity";
import { Box, Card, Flex, Stack, Text } from "@sanity/ui";
import { randomKey } from "@sanity/util/content";

type LinkedWork = {
  _id: string;
  title?: string;
};

function publishedId(id: string) {
  return id.replace(/^drafts\./, "");
}

function refsEqual(a: Reference[] | undefined, b: Reference[]) {
  const left = (a ?? []).map((item) => item._ref).join(",");
  const right = b.map((item) => item._ref).join(",");
  return left === right;
}

/**
 * Shows works that already reference this talent (Work → Talent).
 * Drag to save display order — no manual "Add" needed.
 */
export default function TalentWorkOrderInput(props: ArrayOfObjectsInputProps) {
  const { value, onChange, readOnly } = props;
  const documentId = useFormValue(["_id"]) as string | undefined;
  const client = useClient({ apiVersion: "2025-01-01" });

  const [linked, setLinked] = useState<LinkedWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  const orderRefs = useMemo(
    () => ((value ?? []) as Reference[]).filter((item) => Boolean(item?._ref)),
    [value],
  );

  useEffect(() => {
    if (!documentId) {
      setLinked([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const talentId = publishedId(documentId);
    client
      .fetch<LinkedWork[]>(
        `*[_type == "work" && references($talentId)] | order(_createdAt desc) {
          _id,
          title
        }`,
        { talentId },
      )
      .then((works) => {
        if (cancelled) return;
        setLinked(works);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLinked([]);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [client, documentId]);

  const items = useMemo(() => {
    const byId = new Map(linked.map((work) => [publishedId(work._id), work]));
    const ordered: LinkedWork[] = [];
    const used = new Set<string>();

    for (const ref of orderRefs) {
      const work = byId.get(publishedId(ref._ref));
      if (work) {
        ordered.push(work);
        used.add(publishedId(work._id));
      }
    }

    for (const work of linked) {
      const id = publishedId(work._id);
      if (!used.has(id)) ordered.push(work);
    }

    return ordered;
  }, [linked, orderRefs]);

  const writeOrder = useCallback(
    (nextItems: LinkedWork[]) => {
      const keyByRef = new Map(
        orderRefs.map((item) => [publishedId(item._ref), item._key]),
      );
      const nextValue: Reference[] = nextItems.map((work) => {
        const id = publishedId(work._id);
        return {
          _type: "reference",
          _ref: id,
          _key: keyByRef.get(id) || randomKey(12),
        };
      });

      if (refsEqual(orderRefs, nextValue)) return;
      onChange(set(nextValue));
    },
    [onChange, orderRefs],
  );

  // Only persist when the editor reorders — linked works still appear above
  // from the live query without requiring an "Add" click.

  const onDrop = (toIndex: number) => {
    if (readOnly || dragFrom === null || dragFrom === toIndex) {
      setDragFrom(null);
      return;
    }

    const next = [...items];
    const [moved] = next.splice(dragFrom, 1);
    if (!moved) {
      setDragFrom(null);
      return;
    }
    next.splice(toIndex, 0, moved);
    setDragFrom(null);
    writeOrder(next);
  };

  if (!documentId) {
    return (
      <Card padding={3} radius={2} tone="transparent" border>
        <Text size={1} muted>
          Save this talent once, then works linked via Work → Talent will show
          here for drag-and-drop ordering.
        </Text>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card padding={3} radius={2} tone="transparent" border>
        <Text size={1} muted>
          Loading linked works…
        </Text>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card padding={3} radius={2} tone="transparent" border>
        <Text size={1} muted>
          No works linked yet. On a Work document, add this person under Talent
          — they will appear here automatically so you can drag to reorder.
        </Text>
      </Card>
    );
  }

  return (
    <Stack space={2}>
      <Text size={1} muted>
        Linked from Work documents. Drag to set the order on the site.
      </Text>
      <Stack space={1}>
        {items.map((work, index) => (
          <Card
            key={publishedId(work._id)}
            padding={2}
            radius={2}
            shadow={1}
            tone={dragFrom === index ? "primary" : "default"}
            style={{
              cursor: readOnly ? "default" : "grab",
              opacity: dragFrom === index ? 0.7 : 1,
            }}
            draggable={!readOnly}
            onDragStart={() => setDragFrom(index)}
            onDragOver={(event) => {
              event.preventDefault();
            }}
            onDrop={(event) => {
              event.preventDefault();
              onDrop(index);
            }}
            onDragEnd={() => setDragFrom(null)}
          >
            <Flex align="center" gap={3}>
              <Box>
                <Text size={1} muted>
                  ⋮⋮
                </Text>
              </Box>
              <Text size={1} weight="medium">
                {work.title || "Untitled work"}
              </Text>
            </Flex>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}

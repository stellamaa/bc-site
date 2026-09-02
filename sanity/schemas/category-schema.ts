import { defineField, defineType } from "sanity";

const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "e.g. Films, Photography, AI, Music Videos, Commercials",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "showInWorkFilter",
      title: "Show in Work filter",
      type: "boolean",
      description: "Appears in the Work page sidebar menu.",
      initialValue: true,
    }),
    defineField({
      name: "showInTalentFilter",
      title: "Show in Talent filter",
      type: "boolean",
      description: "Appears in the Talent page sidebar menu (roles).",
      initialValue: false,
    }),
    defineField({
      name: "showOnLanding",
      title: "Show on landing",
      type: "boolean",
      description: "Appears as a large hero link on the desktop landing page.",
      initialValue: false,
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Lower numbers appear first in filter menus and landing hero.",
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: "Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      work: "showInWorkFilter",
      talent: "showInTalentFilter",
      landing: "showOnLanding",
    },
    prepare({ title, work, talent, landing }) {
      const flags = [
        landing ? "Landing" : null,
        work ? "Work" : null,
        talent ? "Talent" : null,
      ].filter(Boolean);
      return {
        title,
        subtitle: flags.length ? flags.join(" · ") : "Hidden",
      };
    },
  },
});

export default category;

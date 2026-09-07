import { defineArrayMember, defineField, defineType } from "sanity";
import TalentWorkOrderInput from "../components/TalentWorkOrderInput";

const talent = defineType({
  name: "talent",
  title: "Talent",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Profile image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alt", type: "string" }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "text",
      rows: 8,
      description: "Optional. Talent can be published without a bio.",
    }),
    defineField({
      name: "categories",
      title: "Roles / categories",
      type: "array",
      description:
        "Used by the Talent page filter menu (e.g. Directors, Photographers, Commercials).",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "category" }],
        }),
      ],
    }),
    defineField({
      name: "workOrder",
      title: "Work display order",
      type: "array",
      description:
        "Shows works already linked to this talent (set on each Work document). Drag to change the order on the site — no re-upload or re-adding needed.",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "work" }],
          // Weak so a Work can still be deleted while a talent stores its order.
          weak: true,
        }),
      ],
      components: {
        input: TalentWorkOrderInput,
      },
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "image",
    },
  },
});

export default talent;

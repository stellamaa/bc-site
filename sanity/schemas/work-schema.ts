import { defineArrayMember, defineField, defineType } from "sanity";

const work = defineType({
  name: "work",
  title: "Work",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Project title.",
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
      name: "thumbnail",
      title: "Thumbnail",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alt", type: "string" }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 5,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "gallery",
      title: "Image gallery",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", title: "Alt", type: "string" }),
            defineField({ name: "caption", title: "Caption", type: "string" }),
          ],
        }),
      ],
    }),
    defineField({
      name: "videoUrl",
      title: "Video URL",
      type: "url",
      description: "Optional Vimeo, YouTube, or direct video link.",
    }),
    defineField({
      name: "talent",
      title: "Talent",
      type: "array",
      description: "People with a Talent profile who worked on this project.",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "talent" }],
        }),
      ],
    }),
    defineField({
      name: "additionalCredits",
      title: "Additional credits",
      type: "array",
      description:
        "One-off collaborator names who do not have a Talent profile.",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      description: "Used by the Work page filters (multi-select).",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "category" }],
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "thumbnail",
      categories: "categories",
    },
    prepare({ title, media }) {
      return { title, media };
    },
  },
});

export default work;

import { defineField, defineType } from "sanity";

const logo = defineType({
  name: "logo",
  title: "Logos",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Client or brand name (used for alt text if image alt is empty).",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Logo image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt",
          type: "string",
          description: "Optional. Defaults to the title.",
        }),
      ],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "image",
    },
  },
});

export default logo;

import { defineArrayMember, defineField, defineType } from "sanity";

const about = defineType({
  name: "about",
  title: "About",
  type: "document",
  fields: [
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 8,
      description: "Main about copy for the company.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "profiles",
      title: "Profiles",
      type: "array",
      description:
        "People shown on the About page (e.g. Samantha Chitty, Matthew Stillman). Image + bio text for each.",
      of: [
        defineArrayMember({
          type: "object",
          name: "profile",
          title: "Profile",
          fields: [
            defineField({
              name: "name",
              title: "Name",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "image",
              title: "Image",
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
              rows: 6,
              description: "Editable text shown beside the portrait.",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              title: "name",
              media: "image",
            },
          },
        }),
      ],
      validation: (rule) => rule.max(2),
    }),
    defineField({
      name: "featuredImage",
      title: "Featured Image",
      type: "image",
      description:
        "Large image on the right of the About page (staff block can replace this later).",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alt", type: "string" }),
      ],
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
    }),
    defineField({
      name: "address",
      title: "Address",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: "instagram",
      title: "Instagram URL",
      type: "url",
    }),
    defineField({
      name: "linkedin",
      title: "LinkedIn URL",
      type: "url",
    }),
  ],
  preview: {
    prepare() {
      return { title: "About" };
    },
  },
});

export default about;

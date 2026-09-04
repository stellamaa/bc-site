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
              name: "role",
              title: "Job role",
              type: "string",
              description:
                "Shown under the name on the About page (light weight, no brackets).",
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
              subtitle: "role",
              media: "image",
            },
          },
        }),
      ],
      validation: (rule) => rule.max(2),
    }),
    defineField({
      name: "staff",
      title: "Staff",
      type: "array",
      description:
        "Add one or more staff members. Shown on the left with profiles when Featured Image / GIF is set; otherwise on the right.",
      of: [
        defineArrayMember({
          type: "object",
          name: "staffMember",
          title: "Staff member",
          fields: [
            defineField({
              name: "name",
              title: "Name",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              description: "Job title / role",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "email",
              title: "Email",
              type: "string",
              validation: (rule) => rule.required().email(),
            }),
            defineField({
              name: "phone",
              title: "Phone",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              title: "name",
              subtitle: "title",
            },
          },
        }),
      ],
    }),
    defineField({
      name: "featuredGif",
      title: "Featured GIF",
      type: "image",
      description:
        "Optional animated GIF on the right of the About page. When set, replaces the Featured Image.",
      options: {
        accept: "image/gif",
        hotspot: true,
      },
      fields: [
        defineField({ name: "alt", title: "Alt", type: "string" }),
      ],
    }),
    defineField({
      name: "featuredImage",
      title: "Featured Image",
      type: "image",
      description:
        "Large image on the right of the About page. Used when Featured GIF is empty. Staff still shows on the left when this (or the GIF) is set.",
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

import { defineArrayMember, defineField, defineType } from "sanity";

const lineBreak = defineArrayMember({
  type: "object",
  name: "lineBreak",
  title: "Line break",
  description: "Adds a line break. Use when you want to start a new line.",
  fields: [
    defineField({
      name: "marker",
      title: "Marker",
      type: "string",
      initialValue: "lineBreak",
      hidden: true,
    }),
  ],
  preview: {
    prepare: () => ({ title: "Line break", subtitle: "Adds a new line" }),
  },
});

const landingPage = defineType({
  name: "landingPage",
  title: "Landing Page",
  type: "document",
  fields: [
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      description:
        "Company description on the landing page. Enter for a new paragraph; use Line break for an extra blank line.",
      of: [defineArrayMember({ type: "block" }), lineBreak],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    prepare() {
      return { title: "Landing Page" };
    },
  },
});

export default landingPage;

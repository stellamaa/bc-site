import { defineField, defineType } from "sanity";

const workPage = defineType({
  name: "workPage",
  title: "Work Page (ignore)",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      initialValue: "Work",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return { title: "Work Page (ignore)" };
    },
  },
});

export default workPage;

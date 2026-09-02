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
      name: "videoGallery",
      title: "Video gallery",
      type: "array",
      description:
        "Optional. Multiple videos for this project — same idea as the image gallery. Each item can use a URL or an uploaded file.",
      of: [
        defineArrayMember({
          type: "object",
          name: "galleryVideo",
          title: "Video",
          fields: [
            defineField({
              name: "videoUrl",
              title: "Video URL",
              type: "url",
              description:
                "Optional. Use this OR upload a file below — Vimeo, YouTube, or a direct video link.",
            }),
            defineField({
              name: "videoFile",
              title: "Video file",
              type: "file",
              options: { accept: "video/*" },
              description:
                "Optional. Upload an MP4 (or similar) if you are not using a URL.",
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
            }),
            defineField({
              name: "poster",
              title: "Poster image",
              type: "image",
              options: { hotspot: true },
              fields: [
                defineField({ name: "alt", title: "Alt", type: "string" }),
              ],
              description: "Optional still shown before the video plays.",
            }),
          ],
          preview: {
            select: {
              title: "caption",
              videoUrl: "videoUrl",
              media: "poster",
            },
            prepare({ title, videoUrl, media }) {
              return {
                title: title || videoUrl || "Video",
                subtitle: videoUrl || "Uploaded file",
                media,
              };
            },
          },
          validation: (rule) =>
            rule.custom((value) => {
              const item = value as
                | { videoUrl?: string; videoFile?: { asset?: unknown } }
                | undefined;
              if (!item) return true;
              if (item.videoUrl || item.videoFile?.asset) return true;
              return "Add a video URL or upload a video file";
            }),
        }),
      ],
    }),
    defineField({
      name: "videoUrl",
      title: "Video URL",
      type: "url",
      description:
        "Optional single video. Prefer Video gallery when there are multiple clips. Use this OR upload a file below — Vimeo, YouTube, or a direct video link.",
    }),
    defineField({
      name: "videoFile",
      title: "Video file",
      type: "file",
      options: {
        accept: "video/*",
      },
      description:
        "Optional. Upload an MP4 (or similar) if you are not using a URL.",
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

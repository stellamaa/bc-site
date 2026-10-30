import { defineArrayMember, defineField, defineType } from "sanity";
import TalentWorkOrderInput from "../components/TalentWorkOrderInput";

type TalentRolesParent = {
  isDirector?: boolean;
  isPhotographer?: boolean;
  isEmergingTalent?: boolean;
};

function hasAtLeastOneRole(parent: TalentRolesParent | undefined) {
  if (!parent) return false;
  return (
    parent.isDirector !== false ||
    parent.isPhotographer === true ||
    parent.isEmergingTalent === true
  );
}

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
      name: "isDirector",
      title: "Director",
      type: "boolean",
      description:
        "Shows under Directors on Talent. Tick any combination of roles.",
      initialValue: true,
      validation: (rule) =>
        rule.custom((_, context) =>
          hasAtLeastOneRole(context.parent as TalentRolesParent)
            ? true
            : "Tick at least one: Director, Photographer, or Emerging Talent.",
        ),
    }),
    defineField({
      name: "isPhotographer",
      title: "Photographer",
      type: "boolean",
      description:
        "Shows under Photographers. Their Talent profile then lists Photography works only.",
      initialValue: false,
      validation: (rule) =>
        rule.custom((_, context) =>
          hasAtLeastOneRole(context.parent as TalentRolesParent)
            ? true
            : "Tick at least one: Director, Photographer, or Emerging Talent.",
        ),
    }),
    defineField({
      name: "isEmergingTalent",
      title: "Emerging Talent",
      type: "boolean",
      description:
        "Shows under Emerging Talent. Can be combined with Director and/or Photographer.",
      initialValue: false,
      validation: (rule) =>
        rule.custom((_, context) =>
          hasAtLeastOneRole(context.parent as TalentRolesParent)
            ? true
            : "Tick at least one: Director, Photographer, or Emerging Talent.",
        ),
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
      isDirector: "isDirector",
      isPhotographer: "isPhotographer",
      isEmergingTalent: "isEmergingTalent",
    },
    prepare({ title, media, isDirector, isPhotographer, isEmergingTalent }) {
      const roles = [
        isDirector !== false ? "Director" : null,
        isPhotographer ? "Photographer" : null,
        isEmergingTalent ? "Emerging Talent" : null,
      ].filter(Boolean);
      return {
        title,
        media,
        subtitle: roles.length ? roles.join(" · ") : "No role",
      };
    },
  },
});

export default talent;

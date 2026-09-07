export type TalentCategoryRef = {
  _id: string;
  title?: string;
  slug?: string;
};

export type Talent = {
  _id: string;
  name?: string;
  slug?: string;
  image?: string;
  imageAlt?: string;
  bio?: string;
  categories?: TalentCategoryRef[];
  /** Drag order of reverse-linked works (from Studio). */
  workOrder?: { _id: string }[];
};

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
  /** Talent column: Director. Missing/undefined counts as true for older docs. */
  isDirector?: boolean;
  /** Talent column: Photographer. Can be ticked together with Director. */
  isPhotographer?: boolean;
  categories?: TalentCategoryRef[];
  /** Drag order of reverse-linked works (from Studio). */
  workOrder?: { _id: string }[];
};

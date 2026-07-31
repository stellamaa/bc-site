export type WorkCategoryRef = {
  _id: string;
  title?: string;
  slug?: string;
};

export type WorkTalentRef = {
  _id: string;
  name?: string;
  slug?: string;
};

export type WorkGalleryImage = {
  url?: string;
  alt?: string;
  caption?: string;
};

export type Work = {
  _id: string;
  title?: string;
  slug?: string;
  thumbnail?: string;
  thumbnailAlt?: string;
  description?: string;
  gallery?: WorkGalleryImage[];
  videoUrl?: string;
  videoFileUrl?: string;
  talent?: WorkTalentRef[];
  additionalCredits?: string[];
  categories?: WorkCategoryRef[];
};

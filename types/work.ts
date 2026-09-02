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
  _key?: string;
  url?: string;
  alt?: string;
  caption?: string;
};

export type WorkGalleryVideo = {
  _key?: string;
  videoUrl?: string;
  videoFileUrl?: string;
  caption?: string;
  poster?: string;
  posterAlt?: string;
};

export type Work = {
  _id: string;
  title?: string;
  slug?: string;
  thumbnail?: string;
  thumbnailAlt?: string;
  description?: string;
  gallery?: WorkGalleryImage[];
  videoGallery?: WorkGalleryVideo[];
  videoUrl?: string;
  videoFileUrl?: string;
  talent?: WorkTalentRef[];
  additionalCredits?: string[];
  categories?: WorkCategoryRef[];
};

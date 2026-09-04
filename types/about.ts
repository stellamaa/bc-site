export type AboutProfile = {
  _key: string;
  name?: string;
  role?: string;
  bio?: string;
  image?: string;
  imageAlt?: string;
};

export type AboutStaff = {
  _key: string;
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
};

export type About = {
  _id: string;
  description?: string;
  profiles?: AboutProfile[];
  staff?: AboutStaff[];
  featuredGif?: string;
  featuredGifAlt?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  phone?: string;
  address?: string;
  email?: string;
  instagram?: string;
  linkedin?: string;
};

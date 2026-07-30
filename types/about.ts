export type AboutProfile = {
  _key: string;
  name?: string;
  bio?: string;
  image?: string;
  imageAlt?: string;
};

export type About = {
  _id: string;
  description?: string;
  profiles?: AboutProfile[];
  featuredImage?: string;
  featuredImageAlt?: string;
  phone?: string;
  address?: string;
  email?: string;
  instagram?: string;
  linkedin?: string;
};

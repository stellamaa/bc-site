import { createClient, groq } from "next-sanity";
import {
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "@/lib/sanity-config";
import { About } from "@/types/about";
import { Category } from "@/types/category";
import { LandingPage } from "@/types/landingPage";
import { Logo } from "@/types/logo";
import { Talent } from "@/types/talent";
import { Work } from "@/types/work";

function getSanityClient() {
  return createClient({
    projectId: sanityProjectId,
    dataset: sanityDataset,
    apiVersion: sanityApiVersion,
    useCdn: process.env.NODE_ENV === "production",
  });
}

const landingPageProjection = groq`{
  _id,
  description
}`;

const categoryProjection = groq`{
  _id,
  title,
  "slug": slug.current,
  showInWorkFilter,
  showInTalentFilter,
  showOnLanding,
  order
}`;

const workProjection = groq`{
  _id,
  title,
  "slug": slug.current,
  "thumbnail": thumbnail.asset->url,
  "thumbnailAlt": thumbnail.alt,
  description,
  "gallery": gallery[]{
    _key,
    "url": asset->url,
    alt
  },
  "videoGallery": videoGallery[]{
    _key,
    videoUrl,
    "videoFileUrl": videoFile.asset->url,
    caption,
    "poster": poster.asset->url,
    "posterAlt": poster.alt
  },
  videoUrl,
  "videoFileUrl": videoFile.asset->url,
  "talent": talent[]->{
    _id,
    name,
    "slug": slug.current
  },
  additionalCredits,
  "categories": categories[]->{
    _id,
    title,
    "slug": slug.current
  }
}`;

const talentProjection = groq`{
  _id,
  name,
  "slug": slug.current,
  "image": image.asset->url,
  "imageAlt": image.alt,
  bio,
  "workOrder": workOrder[]->{
    _id
  }
}`;

const aboutProjection = groq`{
  _id,
  description,
  profiles[]{
    _key,
    name,
    role,
    bio,
    "image": image.asset->url,
    "imageAlt": image.alt
  },
  staff[]{
    _key,
    name,
    title,
    email,
    phone
  },
  "featuredGif": featuredGif.asset->url,
  "featuredGifAlt": featuredGif.alt,
  "featuredImage": featuredImage.asset->url,
  "featuredImageAlt": featuredImage.alt,
  phone,
  address,
  email,
  instagram,
  linkedin
}`;

const logoProjection = groq`{
  _id,
  title
}`;

export async function getLandingPage(): Promise<LandingPage | null> {
  const client = getSanityClient();
  return client.fetch(
    groq`*[_type == "landingPage"][0] ${landingPageProjection}`,
  );
}

export async function getAbout(): Promise<About | null> {
  const client = getSanityClient();
  return client.fetch(groq`*[_type == "about"][0] ${aboutProjection}`);
}

export async function getCategories(options?: {
  forWork?: boolean;
  forTalent?: boolean;
  forLanding?: boolean;
}): Promise<Category[]> {
  const client = getSanityClient();
  const filters = ['_type == "category"'];
  if (options?.forWork) filters.push("showInWorkFilter == true");
  if (options?.forTalent) filters.push("showInTalentFilter == true");
  if (options?.forLanding) filters.push("showOnLanding == true");

  return client.fetch(
    groq`*[${filters.join(" && ")}] | order(order asc, title asc) ${categoryProjection}`,
  );
}

export async function getWorks(): Promise<Work[]> {
  const client = getSanityClient();
  return client.fetch(
    groq`*[_type == "work"] | order(_createdAt desc) ${workProjection}`,
  );
}

export async function getWorkBySlug(slug: string): Promise<Work | null> {
  const client = getSanityClient();
  return client.fetch(
    groq`*[_type == "work" && slug.current == $slug][0] ${workProjection}`,
    { slug },
  );
}

export async function getTalents(): Promise<Talent[]> {
  const client = getSanityClient();
  return client.fetch(
    groq`*[_type == "talent"] | order(name asc) ${talentProjection}`,
  );
}

export async function getTalentBySlug(slug: string): Promise<Talent | null> {
  const client = getSanityClient();
  return client.fetch(
    groq`*[_type == "talent" && slug.current == $slug][0] ${talentProjection}`,
    { slug },
  );
}

export async function getLogos(): Promise<Logo[]> {
  const client = getSanityClient();
  return client.fetch(
    groq`*[_type == "logo" && defined(title) && title != ""] | order(title asc) ${logoProjection}`,
  );
}

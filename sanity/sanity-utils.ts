import { createClient, groq } from "next-sanity";
import {
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "@/lib/sanity-config";
import { About } from "@/types/about";
import { Category } from "@/types/category";
import { LandingPage } from "@/types/landingPage";
import { Talent } from "@/types/talent";
import { Work } from "@/types/work";
import { WorkPage } from "@/types/workPage";

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

const workPageProjection = groq`{
  _id,
  title
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
    "url": asset->url,
    alt,
    caption
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
  "categories": categories[]->{
    _id,
    title,
    "slug": slug.current
  }
}`;

const aboutProjection = groq`{
  _id,
  description,
  profiles[]{
    _key,
    name,
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
  "featuredImage": featuredImage.asset->url,
  "featuredImageAlt": featuredImage.alt,
  phone,
  address,
  email,
  instagram,
  linkedin
}`;

export async function getLandingPage(): Promise<LandingPage | null> {
  const client = getSanityClient();
  return client.fetch(
    groq`*[_type == "landingPage"][0] ${landingPageProjection}`,
  );
}

export async function getWorkPage(): Promise<WorkPage | null> {
  const client = getSanityClient();
  return client.fetch(groq`*[_type == "workPage"][0] ${workPageProjection}`);
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

export async function getWorksByCategorySlugs(
  categorySlugs: string[],
): Promise<Work[]> {
  if (categorySlugs.length === 0) return getWorks();

  const client = getSanityClient();
  return client.fetch(
    groq`*[_type == "work" && count((categories[]->slug.current)[@ in $categorySlugs]) > 0] | order(_createdAt desc) ${workProjection}`,
    { categorySlugs },
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

export async function getTalentsByCategorySlugs(
  categorySlugs: string[],
): Promise<Talent[]> {
  if (categorySlugs.length === 0) return getTalents();

  const client = getSanityClient();
  return client.fetch(
    groq`*[_type == "talent" && count((categories[]->slug.current)[@ in $categorySlugs]) > 0] | order(name asc) ${talentProjection}`,
    { categorySlugs },
  );
}

export async function getTalentBySlug(slug: string): Promise<Talent | null> {
  const client = getSanityClient();
  return client.fetch(
    groq`*[_type == "talent" && slug.current == $slug][0] ${talentProjection}`,
    { slug },
  );
}

export async function getWorksByTalentSlug(slug: string): Promise<Work[]> {
  const client = getSanityClient();
  return client.fetch(
    groq`*[_type == "work" && $slug in talent[]->slug.current] | order(_createdAt desc) ${workProjection}`,
    { slug },
  );
}

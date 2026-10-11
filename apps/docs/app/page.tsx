import type { Metadata } from "next";
import { HomePage } from "@/app/(features)/home/home-page";
import { siteMetadata } from "@/app/(features)/seo/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: siteConfig.title },
  description: siteConfig.description,
  alternates: { ...siteMetadata.alternates, canonical: "/" },
};

export default function Home() {
  return <HomePage />;
}

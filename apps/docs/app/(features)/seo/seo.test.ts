import { describe, expect, test } from "bun:test";
import { catalogOverview } from "@/app/(features)/catalog/overviews";
import { docsPageManifest } from "@/app/(features)/catalog/pages";
import { docsSeoForPath } from "@/app/(features)/seo/seo";
import { siteConfig } from "@/lib/site-config";

const MAX_META_DESCRIPTION_CHARS = 160;

describe("docs social image metadata", () => {
  test("names the brand exactly once in every document title, including pages already named after it", () => {
    for (const page of docsPageManifest) {
      const brandMentions = (docsSeoForPath(page.href)?.fullTitle.split(siteConfig.name).length ?? 1) - 1;
      expect(brandMentions).toBe(1);
    }
    expect(docsSeoForPath("/control-ui-vs-shadcn-ui")?.fullTitle).toBe("Control UI vs shadcn/ui");
  });

  test("adds the install hint only to installable pages and never past the snippet limit", () => {
    const button = docsSeoForPath("/components/button");
    expect(button?.description.startsWith(button.page.summary)).toBe(true);
    expect(button?.description).not.toBe(button?.page.summary);

    for (const page of docsPageManifest) {
      const description = docsSeoForPath(page.href)?.description;
      expect(description === page.summary || (description?.length ?? 0) <= MAX_META_DESCRIPTION_CHARS).toBe(true);
    }
    expect(docsSeoForPath("/get-started")?.description).toBe(docsSeoForPath("/get-started")?.page.summary);
  });

  test("gives catalog overviews canonical page metadata", () => {
    expect(docsSeoForPath("/components")).toMatchObject({
      pathname: "/components",
      title: "Components",
      description: catalogOverview("primitives").summary,
      socialImage: { label: "Component catalog", title: "Components" },
    });
    expect(docsSeoForPath("/kits")).toMatchObject({
      pathname: "/kits",
      title: "Kits",
      description: catalogOverview("components").summary,
      socialImage: { label: "Component catalog", title: "Kits" },
    });
  });

  test("gives every canonical docs page its own image URL and page-aware alt", () => {
    const images = docsPageManifest.map((page) => {
      const seo = docsSeoForPath(page.href);
      expect(seo).toBeDefined();
      expect(seo?.socialImage.url).toBe(`/og${page.href}`);
      expect(seo?.socialImage.alt).toContain(page.name);
      return seo?.socialImage.url;
    });

    expect(new Set(images).size).toBe(docsPageManifest.length);
  });
});

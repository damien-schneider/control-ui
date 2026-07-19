import { describe, expect, test } from "bun:test";
import { docsPageManifest } from "@/app/(features)/catalog/pages";
import { docsSeoForPath } from "@/app/(features)/seo/seo";

describe("docs social image metadata", () => {
  test("derives a component card from the catalog page", () => {
    const seo = docsSeoForPath("/primitives/button");

    expect(seo?.socialImage).toEqual({
      url: "/og/primitives/button",
      alt: "Button — React primitive | Control UI",
      title: "Button",
      label: "React primitive",
      status: undefined,
    });
  });

  test("gives catalog overviews canonical page metadata", () => {
    expect(docsSeoForPath("/primitives")).toMatchObject({
      pathname: "/primitives",
      title: "Primitives",
      description: "Browse every Control UI primitive through the same live examples used in its documentation.",
      socialImage: { label: "Component catalog", title: "Primitives" },
    });
    expect(docsSeoForPath("/ai")).toMatchObject({
      pathname: "/ai",
      title: "AI components",
      description: "Explore composable surfaces for messages, input, activity, media, and agent workflows.",
      socialImage: { label: "Component catalog", title: "AI components" },
    });
  });

  test("gives every canonical docs page its own image URL and page-aware alt", () => {
    const images = docsPageManifest.map((page) => {
      const seo = docsSeoForPath(page.href);
      expect(seo).toBeDefined();
      expect(seo?.socialImage.url).toBe(`/og${page.href}`);
      if (page.href !== "/overview") expect(seo?.socialImage.alt).toContain(page.name);
      return seo?.socialImage.url;
    });

    expect(new Set(images).size).toBe(docsPageManifest.length);
  });
});

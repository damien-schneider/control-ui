import { absoluteSiteUrl } from "@/lib/site-config";

// RFC 9727 linkset anchoring the registry API to its OpenAPI description and to the guide that documents it.
export const apiCatalogLinkset = {
  linkset: [
    {
      anchor: absoluteSiteUrl("/api/registry"),
      "service-desc": [{ href: absoluteSiteUrl("/openapi.json"), type: "application/json" }],
      "service-doc": [{ href: absoluteSiteUrl("/agent-surface"), type: "text/html" }],
    },
  ],
};

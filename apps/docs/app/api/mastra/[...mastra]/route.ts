import { createNextRouteHandler } from "@mastra/next";

import { previewMastra } from "@/mastra";

export const { GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD } = createNextRouteHandler({
  mastra: previewMastra,
  prefix: "/api/mastra",
});

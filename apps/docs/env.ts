import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import { siteConfig } from "@/lib/site-config";

const defaultRegistryUrl = process.env.NODE_ENV === "production" ? siteConfig.url.origin : "http://127.0.0.1:3000";

const configuredRegistryUrl = process.env.NEXT_PUBLIC_REGISTRY_URL?.trim();
const configuredHostname = configuredRegistryUrl ? new URL(configuredRegistryUrl).hostname : undefined;
const configuredIsLocal = configuredHostname === "localhost" || configuredHostname === "127.0.0.1";
const registryUrl =
  process.env.NODE_ENV === "production" && configuredIsLocal ? defaultRegistryUrl : configuredRegistryUrl || defaultRegistryUrl;

export const env = createEnv({
  client: {
    NEXT_PUBLIC_REGISTRY_URL: z.url().transform((value) => value.replace(/\/$/, "")),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_REGISTRY_URL: registryUrl,
  },
});

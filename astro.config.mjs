// @ts-check
import { defineConfig } from 'astro/config';

// Ensure site URL always has a valid protocol (https://)
const rawSite =
  process.env.SITE_URL?.trim() ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

const site = rawSite
  ? rawSite.startsWith('http://') || rawSite.startsWith('https://')
    ? rawSite
    : `https://${rawSite}`
  : undefined;

// https://astro.build/config
export default defineConfig({
  ...(site ? { site } : {}),
});


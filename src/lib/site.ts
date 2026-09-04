const fallbackSiteUrl = "https://jeangaragekenya.co.ke";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? fallbackSiteUrl).replace(/\/$/, "");

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

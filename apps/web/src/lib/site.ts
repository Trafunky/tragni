/**
 * The canonical origin of the site.
 *
 * Not read from the environment: canonical URLs, hreflang alternates and the
 * sitemap have to name the public address even when the application runs
 * behind the proxy under a different one. A value that differs per environment
 * would make previews announce themselves as the real site.
 */
export const siteUrl = "https://tragni.ch";

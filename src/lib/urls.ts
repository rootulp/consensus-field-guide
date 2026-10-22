/** Resolve an internal path under Astro's base (a project subdirectory on GitHub Pages). */
export function sitePath(path: string, base = import.meta.env.BASE_URL): string {
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

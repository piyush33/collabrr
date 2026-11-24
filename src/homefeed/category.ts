// src/homefeed/category.ts
// Cards store their category as free text. Explore groups and filters by a
// normalised id (slug plus a few aliases), computed here so the server is
// the single source of truth for which cards belong to which category.
const CATEGORY_ALIASES: Record<string, string> = {
  'company-os': 'company-os',
  product: 'product',
  roadmap: 'roadmap',
  documentation: 'docs',
  docs: 'docs',
  engineering: 'engineering',
  marketing: 'marketing',
  design: 'design',
  operations: 'operations',
  ops: 'operations',
  meetings: 'meetings',
  data: 'data',
  'data-analytics': 'data',
  'data-and-analytics': 'data',
};
export const normalizeCategory = (raw?: string | null) => {
  const slug = (raw ?? '')
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!slug) return 'uncategorized';
  return CATEGORY_ALIASES[slug] ?? slug;
};

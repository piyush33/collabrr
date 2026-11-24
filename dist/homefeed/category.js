"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeCategory = void 0;
const CATEGORY_ALIASES = {
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
const normalizeCategory = (raw) => {
    const slug = (raw ?? '')
        .toLowerCase()
        .trim()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    if (!slug)
        return 'uncategorized';
    return CATEGORY_ALIASES[slug] ?? slug;
};
exports.normalizeCategory = normalizeCategory;
//# sourceMappingURL=category.js.map
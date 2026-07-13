// Citation markers stored in weekly summary text look like "...claim[3](https://example.com/article)" —
// the URL is resolved and embedded at generation time (see lib/gemini.ts resolveCitations), so rendering
// never depends on re-fetching stories in the same order they were generated in.
const CITATION_PATTERN = /\[(\d+)\]\(([^)\s]+)\)/g

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Renders citation-marked text as safe HTML. All prose is HTML-escaped first, so only the
 * anchor tags built from `formatLink` (using our own already-fetched URLs) become real markup.
 */
export function citationsToHtml(text: string, formatLink: (num: string, url: string) => string): string {
  const escaped = escapeHtml(text)
  return escaped.replace(CITATION_PATTERN, (_match, num, url) => formatLink(num, url))
}

/** Strips citation markers down to clean prose, for plain-text contexts like a LinkedIn caption. */
export function citationsToPlainText(text: string): string {
  return text
    .replace(new RegExp(`\\s?${CITATION_PATTERN.source}`, 'g'), '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

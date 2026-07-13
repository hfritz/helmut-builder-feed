export const SECTION_MAP: Array<{ label: string; tags: string[] }> = [
  { label: 'Build with this', tags: ['AI Tools', 'Agents', 'Dev Tools', 'Vibe Coding', 'Launch'] },
  { label: 'Think with this', tags: ['Strategy', 'Product Management', 'Research', 'Workflows'] },
  { label: 'Understand this', tags: ['LLMs', 'AI Design'] },
  { label: 'Watch this', tags: ['Funding'] },
]

export interface StorySection<T extends { url: string; tags: string[] }> {
  label: string
  stories: T[]
}

/** Buckets stories into the site's editorial sections, in SECTION_MAP order, with leftovers under "More This Week". */
export function groupIntoSections<T extends { url: string; tags: string[] }>(stories: T[]): StorySection<T>[] {
  const usedUrls = new Set<string>()
  const sections: StorySection<T>[] = []

  for (const section of SECTION_MAP) {
    const matching = stories.filter(
      (s) => !usedUrls.has(s.url) && s.tags.some((t) => section.tags.includes(t))
    )
    matching.forEach((s) => usedUrls.add(s.url))
    if (matching.length > 0) {
      sections.push({ label: section.label, stories: matching })
    }
  }

  const remaining = stories.filter((s) => !usedUrls.has(s.url))
  if (remaining.length > 0) {
    sections.push({ label: 'More This Week', stories: remaining })
  }

  return sections
}

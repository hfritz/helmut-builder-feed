export const SECTION_MAP: Array<{ label: string; description: string; tags: string[] }> = [
  {
    label: 'Build with this',
    description: 'Tools, agents, and launches you can put to work today.',
    tags: ['AI Tools', 'Agents', 'Dev Tools', 'Vibe Coding', 'Launch'],
  },
  {
    label: 'Think with this',
    description: 'Strategy, workflows, and PM thinking for the AI era.',
    tags: ['Strategy', 'Product Management', 'Research', 'Workflows'],
  },
  {
    label: 'Understand this',
    description: 'Model releases and design shifts worth knowing about.',
    tags: ['LLMs', 'AI Design'],
  },
  {
    label: 'Watch this',
    description: 'Funding and moves shaping where this space is headed.',
    tags: ['Funding'],
  },
]

const MORE_THIS_WEEK_DESCRIPTION = "Everything else that mattered this week."

export const TOP_PICKS_COUNT = 3

/** The most important stories, in the order Gemini ranked them — surfaced with direct links above the full list. */
export function getTopPicks<T>(stories: T[], count: number = TOP_PICKS_COUNT): T[] {
  return stories.slice(0, count)
}

export interface StorySection<T extends { url: string; tags: string[] }> {
  label: string
  description: string
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
      sections.push({ label: section.label, description: section.description, stories: matching })
    }
  }

  const remaining = stories.filter((s) => !usedUrls.has(s.url))
  if (remaining.length > 0) {
    sections.push({ label: 'More This Week', description: MORE_THIS_WEEK_DESCRIPTION, stories: remaining })
  }

  return sections
}

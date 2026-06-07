# Helmut's Builder Feed — Requirements

## Project Overview

A public AI + Product Management news aggregator. AI-powered, portfolio-worthy, and genuinely useful for anyone trying to stay on top of the AI × PM intersection.

**Live URL intent:** Public — anyone can visit. Primary use case: PM portfolio piece.

---

## Product Name

**Helmut's Builder Feed**
Tagline: *Stay ahead of AI × Product Management*

---

## Content

### Topic Scope
Broad AI + Product Management coverage. Let the AI decide what's relevant within this space. Examples of relevant content:
- AI tools for product managers (Claude, Cursor, Notion AI, etc.)
- LLM/model releases that affect product decisions
- AI product strategy, roadmapping, and prioritization
- PM best practices in the age of AI
- Industry news: AI product launches, acquisitions, funding
- Thought leadership from PMs on building AI products

### Stories Per Refresh
- **Target:** 5–10 stories per day
- Dynamic: fetch as many relevant stories as available (minimum 5, maximum 10)

### Per Story Display
- **Headline** — clear, original title
- **Source** — publication or author name
- **AI Summary** — 2–3 sentence summary of why it matters for PMs
- **Tags** — 2–4 topic tags per story (e.g., `#AI Tools`, `#Strategy`, `#LLMs`, `#Product`, `#Launch`)
- **Link** — click-through to original article

### Tags System
Tags are added per story and stored for future use. Tag design should be clickable (for future filter/search functionality). Common tags: `#AI Tools`, `#Strategy`, `#LLMs`, `#Product Management`, `#Launch`, `#Research`, `#Funding`, `#Workflows`, `#Agents`.

---

## Refresh Logic

- **Cadence:** Daily refresh (stories update once per day)
- **Caching:** Results are cached server-side so all visitors see the same batch without triggering extra API calls
- **Manual refresh:** Optional "Refresh" button for the site owner (or anyone) to fetch a new batch on demand
- **On first load:** If no cache exists, fetch immediately

---

## Visual Design

### Style
**Bold/Branded** — dark background, strong typography, high contrast. Feels like a premium tech publication, not a generic blog.

### Brand Identity
- **Site name:** Helmut's Builder Feed
- **Accent color:** Electric Indigo `#6F00FF`
- **Background:** Deep dark (near-black, e.g., `#0A0A0B`)
- **Text:** White primary, light gray secondary
- **Typography:** Clean, modern sans-serif (e.g., Inter or similar)
- **Story cards:** High contrast, clear hierarchy — headline dominant, summary below, tags at bottom

### Layout
- **Header:** Site name + tagline + last updated timestamp
- **Story grid:** Card-based layout, 1 column on mobile, 2 columns on desktop
- **Card anatomy:** Source label (top) → Headline (large) → AI Summary → Tags → Read More link
- **Footer:** "Powered by Claude AI" + Helmut's name/LinkedIn link

### Portfolio Signals
- Clean, opinionated design that shows product taste
- Helmut's name prominently but not overbearingly featured
- LinkedIn link in footer for portfolio context

---

## Technical Stack

- **Framework:** Next.js (React)
- **News source:** RSS feeds from curated AI + PM publications:
  1. MIT Technology Review (AI section)
  2. TechCrunch AI
  3. The Verge (AI section)
  4. Hacker News (AI/PM filtered)
  5. Aha.io blog — `https://www.aha.io/blog/feed.xml`
  6. ProductBoard blog — `https://www.productboard.com/feed`
  7. Atlassian blog — `https://www.atlassian.com/blog/feed`
  8. Lenny's Newsletter
  9. Product Hunt
- **AI summarization:** Google Gemini Flash API (free tier — 1M tokens/day)
- **Storage:** Supabase free tier (PostgreSQL) — stores daily story batches for historical archive
- **Styling:** Tailwind CSS
- **Deployment:** Vercel (free tier)

### Why this is 100% free
- RSS feeds: no API key, no cost
- Gemini Flash: free tier is more than sufficient for 5-10 story summaries/day
- Supabase: 500MB free storage (years of stories)
- Vercel: free hobby tier for Next.js apps

---

## Future Features (Out of Scope for V1)

- Tag-based filtering/search
- Newsletter subscription
- Saved stories / reading list
- Multiple topic feeds (e.g., separate AI Tools vs. Strategy feeds)
- Share to social

---

## Success Criteria (V1)

- [ ] Loads with 5–10 fresh AI × PM stories daily
- [ ] Each story has headline, source, AI summary, tags, and link
- [ ] Bold branded design with Electric Indigo accent
- [ ] "Helmut's Builder Feed" branding throughout
- [ ] Mobile responsive
- [ ] Deployed to Vercel with a real public URL
- [ ] Portfolio-worthy — something you'd proudly link in a job application

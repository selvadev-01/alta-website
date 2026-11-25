# ALTA: Homes above the city

**Live site:** https://alta-website.vercel.app

Marketing website for ALTA, two residential towers with a pool, gardens and a clubhouse. Visitors walk through a home on screen, then book a site visit.

Next.js 14 (App Router) · TypeScript · Tailwind · GSAP · Lenis · Phosphor Icons.

```bash
npm install
npm run dev        # http://localhost:3600
npm run build && npm start
```

Set `NEXT_PUBLIC_SITE_URL` to the live domain (used for Open Graph URLs).

## Where things live

| What | Where |
|---|---|
| Page sections | `components/` (Hero, Journey, Homes, Amenities, Visit, Nav) |
| Site copy and data | `content/data.ts` |
| Lenis + GSAP setup | `lib/providers.tsx` |
| Scroll walk-through frames | `public/seq/` (desktop), `public/seq-m/` (mobile) |
| Images and videos | `public/img/`, `public/video/` |

## Deployment

Deployed on Vercel (project `alta-website`).

# Tiruppur Embossing - Website

**Printing Innovation at Its Finest.**
Production website for Tiruppur Embossing, a textile and garment printing company in Ammapalayam, Tiruppur.

Built with Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS v4. Motion uses GSAP + ScrollTrigger and Lenis, plus a small hand-written WebGL shader for the hero.

---

## Getting started

```bash
npm install
cp .env.example .env.local   # optional; see "Enquiry forms"
npm run dev                  # http://localhost:3000
npm run lint
npm run build && npm start
```

Requires Node.js ≥ 20.9.

---

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Home: hero, overview, services list, capabilities, quality/production, portfolio preview, CTA |
| `/services` | All service categories |
| `/services/[slug]` | 11 statically generated service pages (from `data/services.ts`) |
| `/capabilities` | Production ecosystem, machines (pinned horizontal story on desktop), supporting equipment |
| `/portfolio` | Filterable masonry gallery with detail dialog (`?category=`, `?item=` deep links) |
| `/about` | Company positioning |
| `/faq` | Searchable, filterable accordion FAQ (15 client questions) |
| `/contact` | Call / WhatsApp / email / location, contact form, click-to-load map |
| `/request-a-quote` | B2B quote form with file uploads (`?service=slug` prefill) |
| `/privacy`, `/terms` | Placeholder legal pages (noindex) |
| `/api/quote`, `/api/contact` | Validated enquiry endpoints |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/opengraph-image` | SEO |

---

## Architecture

```
app/                 routes, metadata, API route handlers, sitemap/robots/OG
components/
  layout/            Header, MobileMenu, Footer, StickyQuoteCta
  ui/                Button, MagneticButton, SectionHeading, SectionLabel, SplitText,
                     Marquee, Accordion, Brand (logo, colour bar, reg marks), Icons, JsonLd
  home/hero/         Hero (server), HeroVisual (client loader), HeroCanvas (WebGL, lazy)
  services/          ServiceList, ServiceExperience, ServiceCard, ServiceGrid, ServiceHero,
                     ServiceNavigation, PlacementDiagram
  capabilities/      MachineShowcase, HorizontalScroll, MachineDiagram, EquipmentList, EcosystemDiagram
  portfolio/         PortfolioGrid, PortfolioItem, PortfolioFilter
  forms/             QuoteForm, ContactForm, FileUpload, Field, SubmissionStatus
  faq/, contact/     FaqExplorer, MapEmbed
  sections/          Shared page sections (Intro, Production, CTA band, Legal…)
  motion/            SmoothScroll (Lenis), ScrollReveal (GSAP), PageTransition, ScrollProgress,
                     AnalyticsListener
data/                site, navigation, services, faqs, portfolio, capabilities, production
lib/                 seo, jsonld, analytics, hooks, forms/{schema,submit}, server/{delivery,guards}
public/assets/       brand, hero, services, portfolio, machines, textures, icons
scripts/             generate-visuals.py (illustrative material studies)
```

**Content is data-driven.** Services, FAQs, portfolio, machines and contact details live in `data/`. Editing those files updates every page, the quote form, the footer, the sitemap and the structured data.

**Server Components by default.** Client components are used only for interactive parts: header and menu, service hover list, portfolio filter and dialog, FAQ search, forms, placement diagram, map facade and motion.

### Motion system

| Layer | Tool | Notes |
| --- | --- | --- |
| Simple transitions | CSS | hovers, underlines, accordions, hero entrance (no JS, LCP-safe) |
| Scroll choreography | GSAP + ScrollTrigger | loaded with dynamic `import()` after hydration; driven by `data-reveal`, `data-count` and `data-parallax` attributes |
| Smooth scroll | Lenis | wheel/trackpad only; native touch scrolling kept; turned off for reduced motion |
| Page transitions | React `<ViewTransition>` | no extra JS; unsupported browsers just switch pages |
| Hero material | Raw WebGL fragment shader | desktop only, lazy, paused off-screen, lowers resolution if frames are slow |

- **Three.js was not used.** One full-screen shader of a few KB gives the same effect without ~150 KB of library code.
- **Framer Motion, Lottie and Rive were not added**, so there is only one animation system.
- **Reduced motion:** with `prefers-reduced-motion`, GSAP, Lenis and WebGL do not load, and CSS animations are turned off.
- **Mobile** gets a static optimised poster, stacked layouts, accordions and no cursor effects.

### Enquiry forms

`components/forms/*` → `lib/forms/submit.ts` → `app/api/*/route.ts` → `lib/server/delivery.ts`

- Validation is shared by client and server (`lib/forms/schema.ts`): sanitised text, email and phone checks, and date rules.
- Uploads are checked for extension, MIME type, size (10 MB per file, 25 MB total, 5 files per field) and file signature. There is also a honeypot field and a best-effort rate limit.
- Delivery is set by environment variables. With `ENQUIRY_DELIVERY=webhook`, the enquiry is posted as multipart (fields JSON plus files) to `ENQUIRY_WEBHOOK_URL`. `log` is for development only.
- **If nothing is configured, the API returns `503 not_configured` and the UI says so**, offering WhatsApp (with the enquiry prefilled), call and email. The site never shows a fake success message.
- To connect email, a CRM or storage (Resend, S3, R2…), add a branch in `lib/server/delivery.ts`.
- ⚠️ Check your host's request-body limit (e.g. 4.5 MB on Vercel serverless functions). For large artwork, switch `FileUpload` to direct-to-storage presigned uploads.

### Analytics

`lib/analytics.ts` pushes events to `window.dataLayer` (compatible with GA4 and GTM) and dispatches a `te:analytics` DOM event. No vendor script is included.

- **Events:** `quote_cta_click`, `whatsapp_click`, `phone_click`, `email_click`, `service_view`, `portfolio_interaction`, `quote_form_start`, `quote_form_submit`, `contact_form_submit`, `file_upload`.
- **Link clicks** (tel:, wa.me, mailto:, quote links and `data-track` attributes) are tracked by a single delegated listener.

### SEO

- Every page has a unique title and description, a canonical URL, and Open Graph and Twitter metadata (`lib/seo.ts`).
- **JSON-LD:** Organization/LocalBusiness (site-wide), Service and BreadcrumbList on service pages, BreadcrumbList on inner pages. FAQPage is added automatically once verified answers exist.
- The sitemap is generated from the data files.
- To add a blog later, create `app/blog` and append its routes in `app/sitemap.ts`.

---

## Brand & design system

- **Logo:** `public/assets/brand/logo-mark.png` is the supplied logo, trimmed of transparent padding only and otherwise unmodified. It has a transparent interior and maroon letterforms, so on dark surfaces it sits on a light "plate" to stay readable.
- **Colours** (from the logo) are defined in `app/globals.css` under `@theme`:
  - Maroon `#8F202C`, red `#C81C24`, orange `#F77E1E`, amber `#FBB03C`, deep teal `#017486` and teal `#008D9B`, on near-black `#0A0A0B` and off-white `#F2EFEA`.
  - Teal stands for precision, red and maroon for energy, orange and amber for production warmth.
- **Type:** Archivo (variable width axis, condensed industrial display) and Inter (body).

---

## Visual assets - IMPORTANT

No client photography was supplied. Current visuals are **generated, illustrative material studies** (`scripts/generate-visuals.py`), labelled "Illustrative" throughout the UI. Machine sections show **schematic diagrams**, clearly captioned as placeholders.

Replace them with client photography:

- **Service heroes:** `public/assets/services/<slug>.webp`, then set `image.illustrative: false` in `data/services.ts`.
- **Portfolio:** add real entries in `data/portfolio.ts` with `illustrative: false`.
- **Machines:** add `photo` to entries in `data/capabilities.ts` (`public/assets/machines/`).

Source images around 2000 px wide are enough; Next/Image serves AVIF/WebP at responsive sizes.

---

## Client verification checklist (before launch)

Items marked `TODO(client)` in the code:

- [ ] Phone numbers: +91 98403 37054, +91 80150 25002, +91 97892 68002 (`data/site.ts`)
- [ ] WhatsApp number (currently the first phone number)
- [ ] Full street address / postal code and map location
- [ ] Verified social profile URLs (hidden until added)
- [ ] Verified FAQ answers (`data/faqs.ts`, `answer` field)
- [ ] Typical workflow steps (`data/production.ts`)
- [ ] Machine photography and project photography
- [ ] Privacy Policy and Terms content
- [ ] Enquiry delivery backend (`ENQUIRY_DELIVERY` / webhook)
- [ ] Production `NEXT_PUBLIC_SITE_URL`

No certifications, capacities, client names, MOQ, pricing, years in business or guarantees appear anywhere on the site. Add them only once verified.

---

## Admin panel (`/admin`)

A password-protected photo manager for the client. It is **not linked from any page**. It is also excluded from the sitemap, disallowed in `robots.txt` and marked `noindex`.

- **Password:** set with `ADMIN_PASSWORD` in `.env.local`, which is gitignored. Sessions are signed, httpOnly cookies that last 8 hours, and login attempts are rate-limited.
- **Enquiries:** every quote request and contact message saved by the `file` channel, newest first.
  - Search, and filter by status (New / In progress / Done) and type.
  - Full details, with one-tap call, WhatsApp and email.
  - Attachments open or download, admin-only.
  - Status tracking and delete.
  - **Export to Excel (CSV)**, with spreadsheet-formula injection guarded.
- **Service categories:** replace the main photo for each of the 11 services, or reset it to the default visual.
- **Samples (portfolio):** add new samples (photo, title, category, related service, description, alt text), edit or replace photos, reorder and delete.
- **Machines:** add real machine photos to replace the schematic diagrams on `/capabilities`.

**Uploads:**

- Every upload is decoded with sharp. Anything that isn't a real image is rejected.
- Uploads are auto-rotated, resized to a maximum of 2400 px and saved as WebP in `storage/media`, which is served at `/media/...`.
- Content lives in `storage/content.json` and is merged over the defaults in `data/`.
- Saving regenerates the public pages immediately (`revalidatePath`).
- Real photos automatically remove the "Illustrative" labels.

> **Hosting note:** `storage/` must be on a persistent disk (VPS, dedicated server, or Docker with a volume). On serverless hosting (e.g. Vercel), the local filesystem is not persistent. Point `CONTENT_STORAGE_DIR` at a mounted volume, or swap `lib/content/store.ts` and `lib/admin/media.ts` to object storage (S3/R2) plus a database.

## Enquiry delivery

`ENQUIRY_DELIVERY` is a comma-separated list of channels. The default is `file`.

| Channel | Behaviour |
| --- | --- |
| `file` | Each enquiry is saved to `storage/enquiries/<date>_<reference>/` as `enquiry.json` plus its attachments |
| `webhook` | POST to `ENQUIRY_WEBHOOK_URL`. `ENQUIRY_WEBHOOK_FORMAT=json` works for Google Apps Script, Zapier, Make and n8n; `multipart` sends form-data. Optional `ENQUIRY_WEBHOOK_SECRET` is sent as a bearer token. Retries once on server errors. |
| `log` | Development only |

For example, `ENQUIRY_DELIVERY=file,webhook` keeps a local copy and forwards each enquiry. A visitor sees "Enquiry received" only when at least one channel has succeeded.

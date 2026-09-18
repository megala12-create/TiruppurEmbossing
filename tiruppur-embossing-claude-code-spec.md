# Tiruppur Embossing — Claude Code Website Build Specification

## 1. Project Objective

Build a complete, production-quality, multi-page website for **Tiruppur Embossing**, a textile printing and garment-printing services company based in Tiruppur, Tamil Nadu.

This is **not a landing page** and must not be implemented as one long scrolling page pretending to be a website.

The new site should feel like a modern, premium industrial/technology brand while remaining practical for a B2B printing company. The design language should take inspiration from the interaction quality, editorial composition, typography, motion, visual storytelling and industrial confidence of:

https://www.q-industrial.com/en-de

Do **not** clone Q Industrial, copy its layouts verbatim, copy its text, or reproduce its proprietary visual assets. Reinterpret its design principles for Tiruppur Embossing.

Brand tagline:

**Printing Innovation at Its Finest**

Existing website for business/content reference:

https://www.tiruppurembossing.com/

The existing website is useful for verifying company information and existing service descriptions, but the client-provided service taxonomy in this specification is the source of truth for the new information architecture.

---

# 2. Core Design Direction

Create an experience that communicates:

- Industrial precision
- Printing technology
- Material science
- Texture
- Depth
- Craftsmanship
- Production capability
- Reliability
- Modernity
- B2B professionalism

The site should feel closer to a **modern industrial technology brand** than a conventional local printing-services website.

Avoid:

- Generic corporate templates
- Stock-photo-heavy layouts
- Generic Bootstrap-style cards
- Excessive rounded cards
- Overly decorative gradients
- Excessive glassmorphism
- Cheap-looking animation
- Large amounts of text above the fold
- A single-page layout
- Animation that delays access to important content
- Heavy 3D scenes on every section

The visual experience should be bold, but the underlying website must remain fast, accessible, SEO-friendly and easy to maintain.

---

# 3. Technology Stack

Use a modern, performance-oriented stack:

### Core

- Next.js
- React
- TypeScript
- App Router
- Tailwind CSS
- ESLint
- Modern semantic HTML

### Animation / Interaction

Use these selectively:

- **GSAP** — primary advanced animation engine
- **ScrollTrigger** — scroll-based animation
- **Lenis** — smooth scrolling
- **Three.js** — only where it adds meaningful visual value
- **WebGL** — optional for a lightweight hero/material effect
- **Lottie** — only for small UI/process animations where appropriate
- **Rive** — optional; do not introduce it unless it creates a clear advantage
- **Framer Motion** — use only for small React-native UI transitions if genuinely useful. Do not create two competing animation systems unnecessarily.

### Important animation rule

Do NOT use every technology just because it is available.

Preferred hierarchy:

1. CSS for simple transitions
2. GSAP for complex animation and scroll choreography
3. Lenis for smooth scrolling
4. Three.js/WebGL only for one or two carefully controlled hero/visual experiences
5. Lottie/Rive only for lightweight isolated animated assets

The site must still work perfectly if advanced animation is disabled.

---

# 4. Performance Requirements

Performance is a first-class requirement.

The website must be designed mobile-first.

Target:

- Fast initial render
- Minimal JavaScript shipped to the client
- Server Components by default
- Client Components only where interaction is required
- Lazy-load heavy animation modules
- Lazy-load Three.js/WebGL
- Lazy-load below-the-fold media
- Use Next.js Image
- Use responsive image sizes
- Prefer AVIF/WebP
- Compress all videos
- Use poster images for video
- Avoid autoplay video on mobile unless extremely lightweight
- Respect `prefers-reduced-motion`
- Do not block page rendering with animation libraries
- Avoid huge background images
- Avoid unnecessarily large DOM trees
- Avoid scroll-jacking
- Smooth scrolling must remain usable on touch devices

Aim for excellent Lighthouse scores, especially:

- Performance
- Accessibility
- Best Practices
- SEO

The website should feel fast even on a mid-range Android phone using a mobile network.

---

# 5. Brand System

Use the supplied Tiruppur Embossing logo as the primary brand reference.

Do not redraw or modify the logo.

The logo contains these dominant colors:

- Deep Maroon: approximately `#8F202C`
- Red: approximately `#C81C24`
- Orange: approximately `#F77E1E`
- Gold/Amber: approximately `#FBB03C`
- Deep Teal: approximately `#017486`
- Teal: approximately `#008D9B`
- Black: `#000000`

Create a restrained design system around these colors.

### Recommended foundation

Primary background:
- Black / near-black

Primary text:
- Off-white / white

Secondary text:
- Neutral gray

Accent system:
- Teal for technology / precision
- Red and maroon for energy / branding
- Orange and amber for warmth / production / highlights

Do not use all brand colors simultaneously everywhere.

Use color strategically.

The logo must remain visually readable against every major background.

---

# 6. Typography

Use a modern grotesk/sans-serif typography system.

Preferred direction:

- Strong condensed/industrial display type for major headings
- Clean neutral sans-serif for body copy
- Large editorial typography
- Tight but readable headings
- Strong hierarchy

Suggested font families may include:

- Space Grotesk
- Manrope
- Inter
- Geist
- Archivo
- IBM Plex Sans

Choose a combination that feels industrial and premium.

Do not use more than two primary font families.

---

# 7. Navigation

Desktop navigation should be minimal and premium.

Suggested structure:

Logo

Services
Capabilities
Portfolio
About
FAQ
Contact

Primary CTA:

**Request a Quote**

The navigation can use a compact overlay/menu interaction inspired by modern industrial websites.

Desktop:

- Sticky/fixed header
- Transparent or dark background initially
- Header changes subtly after scrolling
- Small motion transitions

Mobile:

- Logo
- Menu icon
- Full-screen or large overlay menu
- Large touch targets
- Clear CTA
- No tiny navigation links

---

# 8. Website Information Architecture

Create these pages:

## 00 — Home

`/`

## 01 — Services

`/services`

## 02 — Service Detail

`/services/[slug]`

Dynamic pages for every major service.

## 03 — Capabilities

`/capabilities`

Show production machinery, supporting equipment and operational capabilities.

## 04 — Portfolio

`/portfolio`

Visual work showcase.

## 05 — About

`/about`

Company story, infrastructure, quality and positioning.

## 06 — FAQ

`/faq`

Answer the client's common questions.

## 07 — Contact

`/contact`

Contact information, enquiry form and location.

## 08 — Request a Quote

`/request-a-quote`

A dedicated lead-generation form.

Optional future:

- `/blog`
- `/blog/[slug]`

Build the architecture so the blog can be added later without restructuring the site.

---

# 9. HOME PAGE

The homepage should feel like an immersive introduction to a modern printing technology company.

## Hero

Use an editorial, high-impact composition.

Headline:

**Printing Innovation at Its Finest**

Supporting statement:

**Advanced textile printing technologies for brands, manufacturers and apparel businesses.**

Primary CTA:

**Explore Services**

Secondary CTA:

**Request a Quote**

Hero visual concept:

Create a lightweight interactive representation of printing/material technology.

Possible implementation:

- abstract 3D textile surface
- layered print surface
- ink/film/material transformation
- geometric forms derived from the logo
- subtle WebGL material effect
- animated typography
- macro texture footage

Do not make the hero dependent on a large 3D model download.

Mobile fallback:

Use a static optimized image or CSS-based visual.

Include a subtle:

**Scroll to explore**

interaction.

---

# 10. HOME — INTRODUCTION

Create an editorial statement section.

Example direction:

**From texture to transfer. From detail to production.**

Supporting content should explain that Tiruppur Embossing provides multiple printing technologies under one production ecosystem.

Use oversized typography with controlled line breaks.

Avoid making this look like a generic "About Us" section.

---

# 11. HOME — SERVICES EXPERIENCE

Show the main service categories as a large interactive list rather than ordinary cards.

Main categories:

01 Emboss Printing
02 Silicone HD Printing
03 HD / High-Density Printing
04 DTF Printing
05 Sublimation Printing
06 Screen Printing
07 Specialty Printing
08 Heat Transfer
09 Sticker Printing
10 Combination / Value-Added Printing
11 Placement Printing

Interaction:

- Desktop: hover reveals image/texture/description
- Active service expands
- Cursor interaction can reveal a small preview
- Numbered editorial navigation
- GSAP transitions
- No heavy animation on mobile

Mobile:

Use an accordion or stacked list.

Every service must have a dedicated detail page.

---

# 12. SERVICES DATA

Create a centralized TypeScript data structure.

Do not hardcode service content repeatedly inside components.

Example:

```ts
type ServiceCategory = {
  slug: string
  number: string
  title: string
  shortDescription: string
  description: string
  applications: string[]
  subServices: string[]
  image?: string
}
```

Populate it with:

### 01 — Emboss Printing

- Basic Emboss
- 3D Emboss
- Raised Emboss
- Logo Emboss
- Text Emboss
- Fashion Emboss

### 02 — Silicone HD Printing

- Silicone HD
- Silicone 3D
- Glossy Silicone
- Matte Silicone
- Soft Silicone
- High-Density Silicone

### 03 — HD / High-Density Printing

- HD Print
- High-Density Print
- Raised HD

### 04 — DTF Printing

- DTF Full Colour
- DTF Logo
- DTF Photo Print
- DTF Small Quantity
- DTF Bulk Production

### 05 — Sublimation Printing

- Cut-Panel Sublimation
- All-Over Print (AOP) Sublimation
- Sportswear Sublimation
- Jersey Printing
- Polyester Printing

### 06 — Screen Printing

- Basic Screen Print
- Multicolour Screen
- Water-Based
- Plastisol
- Discharge
- Pigment
- High-Density Screen

### 07 — Specialty Printing

- Puff
- Flock
- Foil
- Glitter
- Reflective
- Metallic
- Shimmer

### 08 — Heat Transfer

- TPU Transfer
- Heat Transfer
- Vinyl / HTV
- DTF Transfer
- Specialty Transfer

### 09 — Sticker Printing

- Garment Stickers
- Transfer Stickers
- Glass / Table Stickers
- Custom Printed Stickers

### 10 — Combination / Value-Added Printing

- DTF + Emboss
- Silicone + DTF
- HD + Silicone
- Screen + HD
- Foil + Screen
- Digital + Specialty

### 11 — Placement Printing

- Chest
- Left Chest
- Right Chest
- Front
- Back
- Sleeve
- Neck
- Pocket
- Bottom
- Leg

---

# 13. SERVICE DETAIL PAGE

Each major service should have its own page.

Example:

`/services/emboss-printing`

Page structure:

1. Large service title
2. Short positioning statement
3. Hero visual
4. What it is
5. Available variations
6. Suitable applications
7. Material/fabric considerations
8. Production considerations
9. Visual examples
10. Related services
11. CTA

Example CTA:

**Have a design in mind? Let's determine the right printing process.**

Button:

**Request a Quote**

Do not invent technical specifications that have not been supplied.

Where information is unknown, use careful wording such as:

"Suitability depends on fabric composition, design and production requirements."

---

# 14. CAPABILITIES PAGE

This should be one of the strongest pages.

Title:

**Built for detail. Equipped for production.**

Show the production ecosystem.

## Production Machines

- Embossing
- Silicone
- Silicone HD
- HD
- DTF
- Sublimation
- Screen printing
- Heat transfer

## Supporting Equipment

- DTF powder shaker
- Curing oven
- Heat press
- Screen exposure
- Screen washing
- Flash dryer
- QC equipment

Visual direction:

Do not make this a boring machine list.

Use:

- Full-width machinery imagery
- Technical labels
- Numbered systems
- Large typography
- Animated diagrams
- Horizontal scroll on desktop where appropriate
- Stacked sections on mobile

If actual machine photos are not available, create clearly marked placeholders in the code rather than using random stock images pretending to be the client's machines.

---

# 15. QUALITY / PRODUCTION SECTION

Communicate the production mindset around:

- Quality assurance
- Production capability
- Consistency
- Detail
- Material suitability
- Sampling
- Bulk production
- Delivery requirements

Existing site positioning includes infrastructure and quality assurance as important parts of the business.

Use this as inspiration but rewrite the presentation for the new brand experience.

---

# 16. PORTFOLIO PAGE

The portfolio should be highly visual.

Use a masonry/editorial gallery.

Categories can include:

- Emboss
- Silicone HD
- HD
- DTF
- Sublimation
- Screen Printing
- Specialty
- Transfers
- Stickers
- Combination Printing

Interactions:

Desktop:
- Hover preview
- Image scale
- Category label
- subtle cursor interaction

Mobile:
- optimized image grid
- no hover dependency
- tap to open project/detail

Every image must be optimized.

Use Next/Image.

Do not ship 5MB+ images.

---

# 17. ABOUT PAGE

Position the company as a printing technology and production partner.

Suggested narrative themes:

- Tiruppur textile ecosystem
- Printing expertise
- Multiple technologies
- Production infrastructure
- Quality commitment
- Ability to support sampling and bulk requirements
- Focus on innovation

Do not fabricate founding year, employee count, factory area, certifications, client logos, production capacity or claims unless verified.

Use only verified company information.

---

# 18. FAQ PAGE

Build an actual searchable/accordion FAQ.

Use the client's 15 questions:

1. What printing process is suitable for my design?
2. What is the best price for this design?
3. What is your MOQ?
4. Can you print this on my fabric?
5. Can you make a sample?
6. How much does the sample cost?
7. How long will sampling take?
8. How long will bulk production take?
9. What is the rate for my quantity?
10. Can you match this reference sample?
11. Will the print withstand washing?
12. Can you handle my bulk quantity?
13. What artwork file do you need?
14. Can you meet my delivery date?
15. Can you provide compliance/certification documents?

Do not invent answers.

Create an architecture where verified answers can easily be added.

For questions requiring quotation or technical review, direct the user to Request a Quote.

---

# 19. REQUEST A QUOTE PAGE

This should be a serious B2B enquiry form.

Fields:

- Name
- Company
- Email
- Phone / WhatsApp
- Printing service
- Sub-service
- Quantity
- Fabric/material
- Placement
- Target delivery date
- Need sample?
- Artwork upload
- Reference image upload
- Additional requirements

CTA:

**Submit Enquiry**

The UI should make the form feel simple, not bureaucratic.

Add file upload support in a way that can later be connected to a backend/storage provider.

Do not expose fake submission success.

Create a clear API abstraction for form submission so the backend can be connected later.

---

# 20. CONTACT PAGE

Use verified information from the current company website.

Current public contact information includes:

Phone:
+91 9840337054
+91 8015025002
+91 8015025002

Email:
tiruppurembossing@gmail.com

Location:
Ammapalayam, Tiruppur

Before final deployment, verify phone numbers and address against the client.

Include:

- Call
- WhatsApp
- Email
- Map
- Enquiry CTA

Use clickable mobile actions.

---

# 21. FOOTER

Large editorial footer.

Include:

Tiruppur Embossing

**Printing Innovation at Its Finest**

Navigation:
- Home
- Services
- Capabilities
- Portfolio
- About
- FAQ
- Contact
- Request a Quote

Contact:
- Phone
- Email
- Location

Social links should only be shown if verified.

Include privacy policy and terms placeholders if required.

---

# 22. Q INDUSTRIAL-INSPIRED INTERACTION LANGUAGE

Use the following design principles inspired by the referenced Q Industrial experience:

- Large editorial typography
- Industrial visual storytelling
- Strong contrast
- Structured navigation
- Large visual sections
- Minimal UI chrome
- Motion used to explain rather than decorate
- Product/service discovery as an experience
- Technical information presented with confidence
- Strong transitions between sections
- Distinctive hero experience
- Large numbers
- Full-width media
- Scroll-based storytelling

The Q Industrial site itself organizes its experience around major information categories such as industries, surfaces, catalog, technologies, services, about and contact.

For Tiruppur Embossing, reinterpret that logic as:

Services
Capabilities
Portfolio
About
FAQ
Contact

Do not copy Q Industrial's actual visual assets, copywriting, layouts or code.

---

# 23. MOTION SYSTEM

Use GSAP + ScrollTrigger.

Motion should include:

### Page entrance

- subtle typography reveal
- image reveal
- staggered elements

### Service list

- hover preview
- text shift
- image transition

### Section transitions

- clip-path reveals
- scale transitions
- masked image reveals

### Numbers

Large numbered sections can animate subtly.

### Hero

A controlled visual movement tied to scroll.

### Smooth scrolling

Use Lenis.

Important:

- Never lock scrolling for long periods
- Never hijack native touch behavior
- Never create inaccessible horizontal scrolling
- Keep animations short
- Respect reduced-motion preferences

---

# 24. MOBILE DESIGN

Mobile is not a smaller desktop version.

Design mobile intentionally.

At mobile widths:

- single-column layouts
- large touch targets
- simplified navigation
- reduced animation
- no hover-only functionality
- no cursor-dependent UI
- optimized image sizes
- compressed videos
- static fallback for WebGL
- accordions for service subcategories
- stacked portfolio
- sticky bottom CTA can be considered

Potential mobile CTA:

**Get a Quote**

Do not make the sticky CTA cover important content.

---

# 25. RESPONSIVE BREAKPOINTS

Design around content rather than arbitrary device names.

Suggested:

- Mobile: < 640px
- Tablet: 640–1024px
- Desktop: 1024–1440px
- Large desktop: >1440px

Test at:

- 360px
- 390px
- 430px
- 768px
- 1024px
- 1280px
- 1440px
- 1920px

---

# 26. ACCESSIBILITY

Implement:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Correct heading hierarchy
- Alt text
- Accessible forms
- Accessible accordion
- ARIA only where needed
- Color contrast
- Reduced-motion support
- No information conveyed only through color
- Buttons must be actual buttons
- Links must be actual links

---

# 27. SEO

Each page must have:

- Unique title
- Unique meta description
- Canonical URL
- Open Graph metadata
- Twitter/X metadata where appropriate
- Structured headings
- Descriptive image alt text
- JSON-LD where appropriate

Potential structured data:

- Organization
- LocalBusiness
- Service
- FAQPage
- BreadcrumbList

Do not fabricate organization details.

Generate a sitemap and robots configuration.

Use clean URLs.

---

# 28. CONTENT STRATEGY

The tone should be:

- Confident
- Technical
- Modern
- Direct
- Professional
- B2B-oriented

Avoid:

"Best printing company in India"

unless independently verified.

Avoid exaggerated claims such as:

"World's best"
"Number one"
"Unmatched"
"Guaranteed"

unless supplied and verified by the client.

Prefer:

"Advanced textile printing capabilities"
"Multiple printing technologies"
"Built for sampling and production"
"Precision-focused printing"
"One production partner across multiple techniques"

---

# 29. VISUAL ASSET STRATEGY

Prioritize real client assets.

Asset priority:

1. Client-provided logo
2. Client-provided machine photos
3. Client-provided print samples
4. Client-provided garment photography
5. Existing website images, if permission allows reuse
6. Carefully selected licensed imagery
7. Generated abstract visual assets where necessary

Do not present generated/stock images as actual client machinery or actual client work.

Create an `/public/assets` structure:

```text
/public
  /assets
    /brand
    /hero
    /services
    /portfolio
    /machines
    /textures
    /icons
```

---

# 30. COMPONENT ARCHITECTURE

Create reusable components.

Suggested structure:

```text
components/
  layout/
    Header.tsx
    Footer.tsx
    MobileMenu.tsx

  ui/
    Button.tsx
    SectionHeading.tsx
    MagneticButton.tsx
    Marquee.tsx
    Accordion.tsx
    Reveal.tsx

  services/
    ServiceList.tsx
    ServiceCard.tsx
    ServiceHero.tsx
    ServiceGrid.tsx
    ServiceNavigation.tsx

  portfolio/
    PortfolioGrid.tsx
    PortfolioItem.tsx
    PortfolioFilter.tsx

  capabilities/
    MachineShowcase.tsx
    EquipmentList.tsx

  forms/
    QuoteForm.tsx
    ContactForm.tsx
    FileUpload.tsx

  motion/
    SmoothScroll.tsx
    PageTransition.tsx
    ScrollReveal.tsx
```

Keep components small and composable.

---

# 31. DATA ARCHITECTURE

Keep content separate from presentation.

Suggested:

```text
data/
  services.ts
  faqs.ts
  portfolio.ts
  capabilities.ts
  navigation.ts
```

This will make it easy for the client to update services without editing UI components.

---

# 32. ROUTING

Use App Router.

Recommended routes:

```text
/
 /services
 /services/emboss-printing
 /services/silicone-hd-printing
 /services/hd-printing
 /services/dtf-printing
 /services/sublimation-printing
 /services/screen-printing
 /services/specialty-printing
 /services/heat-transfer
 /services/sticker-printing
 /services/combination-printing
 /services/placement-printing
 /capabilities
 /portfolio
 /about
 /faq
 /contact
 /request-a-quote
```

Use dynamic route generation where appropriate rather than duplicating page code.

---

# 33. INTERACTION DETAILS

Add subtle details that make the website feel premium:

- Animated underlines
- Number counters where meaningful
- Image masking
- Text splitting for major headlines
- Hover image previews
- Magnetic CTA buttons on desktop only
- Scroll progress indicator
- Section labels such as `01 / SERVICES`
- Cursor effects only on desktop
- Smooth page transitions

Do not overload every element with animation.

---

# 34. HERO VISUAL DIRECTION

The hero should be the signature of the site.

Possible concept:

A dark background with an abstract 3D textile/material surface.

The surface gradually reveals:

- embossed pattern
- silicone texture
- ink layer
- transfer film
- print detail

Use the brand colors subtly inside the material.

The visual could evolve as the user scrolls.

Important:

If Three.js/WebGL is used:

- dynamically import it
- do not block initial page rendering
- provide mobile fallback
- provide reduced-motion fallback
- keep geometry/light/material complexity low
- avoid loading a large 3D model unless essential

---

# 35. MICRO-INTERACTION DESIGN

Buttons:

Normal:
- simple label

Hover:
- small directional movement
- subtle background/outline transition

Service links:
- number remains fixed
- title moves slightly
- preview image changes

Portfolio:
- image scale around 1.02–1.05
- metadata fades/slides

Do not use excessive bounce effects.

---

# 36. LOADING EXPERIENCE

Avoid a long cinematic loader.

The site should begin rendering immediately.

If a branded loader is used:

- maximum a very short visual transition
- never require the entire page to load before showing content
- never hide important content behind an artificial loading screen

---

# 37. ERROR / EMPTY STATES

Create proper:

- 404 page
- form validation states
- form submission error state
- image fallback
- portfolio empty state
- loading states for dynamic content

404 should maintain the brand style.

Example:

**Looks like this print didn't land where expected.**

CTA:

**Back to Home**

---

# 38. ANALYTICS

Prepare the website for analytics.

Do not hardcode a specific analytics vendor unless requested.

Create clean event hooks for:

- quote CTA click
- WhatsApp click
- phone click
- email click
- service view
- portfolio interaction
- quote form start
- quote form submission
- file upload

Use a central analytics abstraction.

This should be compatible with GA4/GTM later.

---

# 39. SECURITY

- Validate form inputs
- Sanitize user-generated data
- Validate uploaded file type
- Limit upload size
- Do not expose secrets in client-side code
- Use environment variables
- Do not commit `.env`
- Add `.env.example`

---

# 40. DEVELOPMENT REQUIREMENTS

Before coding:

1. Inspect the existing website.
2. Understand its existing information.
3. Use the supplied service taxonomy as the new source of truth.
4. Inspect the supplied logo.
5. Create the design tokens.
6. Create the information architecture.
7. Create reusable components.
8. Build desktop and mobile systems.
9. Add motion.
10. Optimize performance.
11. Test all routes.
12. Run lint.
13. Run build.
14. Fix errors.
15. Test responsive layouts.

Do not stop after creating the homepage.

The implementation is only complete when all major routes are functional.

---

# 41. IMPORTANT: DO NOT FABRICATE CLIENT INFORMATION

Do not invent:

- Client names
- Certifications
- Compliance certificates
- Production capacity
- Factory size
- Employee count
- Years in business
- Machinery brands/models
- MOQ
- Pricing
- Delivery guarantees
- Washing test results
- Fabric compatibility guarantees
- Awards
- Customer logos

Use placeholders or clearly marked TODO content where verification is required.

---

# 42. CURRENT VERIFIED BUSINESS INFORMATION

The existing public website currently presents Tiruppur Embossing as a professional printing service provider in Tiruppur and highlights:

- One-point printing solution positioning
- Infrastructure
- Quality assurance
- Sublimation printing
- HD printing
- Silicon HD printing
- Digital Transfer Film / DTF printing
- Embossing
- PU transfer printing
- Sequence printing
- Laser cutting
- 3D TPU transfer

The existing website also publishes contact information and the location as Ammapalayam, Tiruppur.

Use these only as reference and verify with the client before final production.

---

# 43. DESIGN QUALITY BAR

The final website should feel like:

**A modern textile-printing technology company that happens to be based in Tiruppur — not a traditional printing shop that received a modern template.**

The experience should communicate:

**Precision + Texture + Technology + Production**

The visual hierarchy should be bold enough to feel award-quality, while the implementation remains practical enough to maintain and fast enough to use on mobile.

---

# 44. FINAL ACCEPTANCE CRITERIA

The project is complete only when:

- Multi-page architecture is implemented
- Every major service has a page
- Navigation works
- Mobile navigation works
- Quote form works at UI level
- Contact page works
- FAQ works
- Portfolio works
- Capabilities page works
- Responsive layouts work
- Logo is correctly used
- Brand colors are consistently applied
- GSAP animations are smooth
- Lenis smooth scrolling works
- Mobile performance is protected
- Three.js/WebGL is lazy-loaded or avoided where unnecessary
- Reduced motion is supported
- Images are optimized
- SEO metadata exists
- Sitemap exists
- 404 exists
- No console errors
- No broken links
- `npm run lint` passes
- `npm run build` passes

---

# 45. CLAUDE CODE WORKING STYLE

Work in phases.

## Phase 1 — Discovery

Inspect:

- Existing Tiruppur Embossing website
- Supplied logo
- Existing assets if available
- Project environment

Then create:

- information architecture
- design tokens
- route map
- component architecture

## Phase 2 — Foundation

Implement:

- Next.js structure
- fonts
- colors
- global styles
- header
- footer
- buttons
- responsive system
- Lenis

## Phase 3 — Homepage

Implement:

- hero
- intro
- services
- capabilities preview
- portfolio preview
- quality/production section
- CTA
- footer

## Phase 4 — Internal Pages

Implement:

- Services
- Service detail pages
- Capabilities
- Portfolio
- About
- FAQ
- Contact
- Request a Quote

## Phase 5 — Motion

Add:

- GSAP
- ScrollTrigger
- hover interactions
- page reveals
- image transitions
- desktop-only magnetic interactions

## Phase 6 — Performance

Audit:

- bundle size
- image sizes
- client components
- animation imports
- Three.js loading
- mobile rendering

## Phase 7 — QA

Test:

- desktop
- tablet
- mobile
- keyboard
- reduced motion
- forms
- navigation
- all routes
- production build

Do not declare the project finished until the production build succeeds.

---

# 46. MOST IMPORTANT DESIGN PRINCIPLE

Do not simply make a "nice printing website."

Create a **digital industrial experience around the physical qualities of printing**.

The website should make the visitor feel:

- texture
- depth
- precision
- layers
- material
- production
- technology

The brand tagline should feel like a natural conclusion to the experience:

**Printing Innovation at Its Finest.**
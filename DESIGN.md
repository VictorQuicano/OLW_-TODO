# Our Little World — Design System & UX Guidelines

> A private shared space for two people to collect, plan and experience things together.

---

## 1. Product Vision

**Our Little World** is a private web application for two people to keep track of things they want to experience together.

The application can contain:

- 🍜 Restaurants and places to eat
- 📍 Places to visit
- 🎬 Movies and series
- 🎵 Music and albums
- ✈️ Trips
- 🎨 Activities
- 💡 Recommendations
- ❤️ Personal ideas

The application is not intended to behave like a productivity tool, project manager or traditional CRUD application.

It should feel like a **shared digital scrapbook**: personal, visual, playful and slightly dreamy.

The emotional goal is:

> "This is our little space."

The functional goal is:

> "We can easily remember what we want to do, decide when to do it, and see what we have already experienced."

---

# 2. Core UX Principles

The interface must make these three questions immediately understandable:

### What do we want to do?

Things that are ideas or recommendations.

### What are we planning?

Things that have an approximate date or concrete plan.

### What have we already done?

Things that both people have marked as completed.

These states should be visually obvious without requiring the user to open every item.

---

# 3. Design Personality

The visual identity should communicate:

- Personal
- Intimate
- Playful
- Modern
- Cinematic
- Warm
- Elegant
- Slightly dreamy
- Interactive
- Premium without feeling corporate

The application should feel closer to a **digital scrapbook / private world / shared journal** than to:

- Notion
- Jira
- Linear
- Trello
- Generic SaaS dashboards
- Administrative CRUD applications

---

# 4. Visual Direction

## General aesthetic

Use a combination of:

- Editorial layouts
- Generous whitespace
- Strong typography
- Carefully selected imagery
- Subtle depth
- Soft motion
- Occasional 3D elements
- Layered compositions
- Visual storytelling

The interface should feel intentionally designed rather than generated from a component library.

---

# 5. Things to Avoid

Avoid the following unless there is a strong UX reason:

- Excessive gradients
- Rainbow gradients
- Excessive glassmorphism
- Excessive shadows
- Excessive rounded cards
- Every element inside a card
- Generic SaaS dashboards
- Huge hero sections with little information
- Excessive animations
- Constantly moving backgrounds
- Decorative charts
- Excessive 3D
- 3D that blocks interaction
- Tiny text
- Hover-only interactions
- Excessive modal dialogs
- Dense tables
- Unnecessary sidebars
- Excessive badges
- Visual noise

A component should exist because it improves the experience, not because the UI library provides it.

---

# 6. Color System

Use a restrained and coherent palette.

The default visual direction should be based around:

### Base

- Warm off-white / cream
- Soft neutral gray
- Charcoal / near-black

### Accent

Use one primary accent color to represent interaction and focus.

A secondary accent may be used for special moments.

Colors should not be used randomly.

Semantic meaning should remain consistent.

For example:

- Primary accent → interaction / selection
- Green → completed
- Amber → planned / upcoming
- Neutral → idea / inactive
- Red → destructive actions only

Avoid using color only for decoration.

---

# 7. Typography

Typography should create hierarchy without relying exclusively on size.

Use:

- Strong expressive headings
- Highly readable body text
- Small secondary metadata
- Clear numerical emphasis

The typography should feel modern and editorial.

Avoid:

- Too many font families
- Excessive uppercase text
- Extremely thin fonts
- Very large text that pushes useful content below the fold

Typography must remain readable on mobile.

---

# 8. Layout

## Desktop

The desktop experience should feel spacious.

Use:

- Large margins
- Strong composition
- Editorial grids
- Asymmetric layouts when appropriate
- Large visual areas for important content

Do not stretch content unnecessarily to fill the viewport.

## Mobile

Mobile is a first-class experience.

The mobile interface must not simply be a compressed desktop layout.

Prioritize:

1. Content
2. Navigation
3. Primary actions
4. Touch interaction

Minimum comfortable touch target:

**~44 × 44px**

---

# 9. Navigation

Navigation should remain simple.

Possible primary sections:

- Home
- Discover / Ideas
- Planned
- Completed

Categories such as:

- Food
- Places
- Movies
- Music
- Trips

should be accessible without creating a complex navigation hierarchy.

Avoid a large enterprise-style sidebar.

On mobile, prefer a compact bottom navigation or similarly accessible pattern.

---

# 10. Home Page

The home page is the emotional center of the application.

It should communicate:

> "This is our world."

Potential structure:

```text
                    OUR LITTLE WORLD

                  [ 3D EXPERIENCE ]

              Things we want to do

       🍜 8        🎬 12       🎵 6       ✈️ 4

                  Coming up

             October 2026
             ─────────────
             🍜 Restaurant
             🎬 Movie
             📍 Place

                  Our progress

              ███████░░░░ 65%
```

The exact layout may evolve.

Do not treat this structure as a rigid wireframe.

---

# 11. 3D Experience

3D is an enhancement, not the foundation of the application.

Use:

- React Three Fiber
- Drei
- Three.js concepts where appropriate

Potential 3D experiences:

### Shared world

A small interactive 3D world or planet representing the things we want to experience.

### Floating objects

Subtle objects representing categories:

- Food
- Movies
- Music
- Travel

### Ambient elements

- Particles
- Stars
- Soft floating objects
- Subtle depth

### Interactive transitions

3D can be used to transition between major sections.

---

## 3D Rules

3D should:

- Have a clear purpose
- Be lightweight
- Be visually coherent
- Respond naturally to interaction
- Work well on desktop
- Have a reduced version on mobile

3D must never:

- Prevent users from completing tasks
- Obscure content
- Consume most of the screen unnecessarily
- Run expensive animations continuously
- Become a distraction

The application must remain usable when:

- WebGL is unavailable
- Reduced motion is enabled
- The device has limited GPU capability

Use lazy loading and code splitting for heavy 3D components.

---

# 12. Motion & Animation

Use **Motion** for interface animations.

Animations should communicate:

- Change
- Hierarchy
- Feedback
- Progress
- Completion

Good examples:

- Item appearing after creation
- Smooth category transition
- Card expansion
- Checkmark completion
- Progress update
- Image transition
- Navigation transition

Animations should generally be:

- Short
- Smooth
- Predictable
- Purposeful

Avoid:

- Excessive bouncing
- Constant rotation
- Infinite decorative animation
- Long transitions
- Animation on every interaction

Respect:

```text
prefers-reduced-motion
```

---

# 13. Content Types

The application should support different content types while maintaining a consistent visual language.

## Restaurant

Possible information:

- Name
- Image
- Location
- Cuisine
- Price range
- Notes
- Approximate date
- Priority
- Status

## Place

Possible information:

- Name
- Location
- Image
- Description
- Approximate date
- Notes
- Status

## Movie / Series

Possible information:

- Title
- Poster
- Release year
- Genre
- Rating
- Notes
- "Watch together"
- Planned date
- Status

## Music

Possible information:

- Artist
- Album / song
- Cover
- Genre
- Notes
- "Listen together"
- Status

## Trip

Possible information:

- Destination
- Cover image
- Estimated year/date
- Budget
- Places
- Activities
- Notes
- Status

---

# 14. Status Model

Items should have a simple lifecycle.

```text
IDEA
 ↓
PLANNED
 ↓
COMPLETED
```

An item may also be archived if necessary.

Avoid creating too many states.

The UI should make the state immediately recognizable.

---

# 15. Shared Completion

Because this application is shared by two people, completion should support individual progress.

Example:

```text
🍜 Restaurant

Victor          ✓
Claudia         ○
```

When both have completed something:

```text
Victor          ✓
Claudia         ✓

✨ Completed together
```

The moment of completing something together should feel satisfying.

Use a subtle animation and visual feedback.

Do not make it childish or overly gamified.

---

# 16. Dates

The application should support approximate dates.

Do not force users to provide an exact date when they do not know one.

Examples:

```text
Someday
October 2026
November 2026
Winter 2026
2027
Specific date
```

The UI should prioritize human-readable dates.

Prefer:

> October 2026

over:

> 2026-10-01

---

# 17. Cards

Cards should not all look identical.

Different content types may have different visual treatments, while sharing the same
tokens (type scale, radius, spacing, status colors).

### Restaurant

Photo-led, like a polaroid pinned to the page.

```text
┌───────────────┐
│    [photo]    │
│               │
├───────────────┤
Ramen Nagi
Miraflores · $$ · Japanese
October 2026          ● planned
```

### Place

Wide landscape image with the name overlaid on a soft scrim; location as the main metadata.

### Movie / Series

Poster ratio (2:3), grouped like a shelf. Title and year below the poster, never on top of it.

### Music

Square cover, shown like a vinyl sleeve. A subtle disc may peek out on hover/focus
(and is always visible on touch devices).

### Trip

The largest card: destination in the display font, estimated date as the hero number,
and a small count of places/activities attached.

### Activity / Other

Typographic card without an image: a short title, one line of notes, and the category icon.

### Rules for all cards

- The whole card is the link to the detail view (one focusable element, ≥44px targets for
  inner actions).
- Status is always visible: a small colored dot **plus** a text label (never color alone).
- Completion avatars (V / C) appear on planned and completed items.
- Images use fixed aspect ratios to avoid layout shift; a category-colored fallback
  illustration is shown when there is no image or it fails.
- Not every list must be a grid of cards — lists such as "Coming up" can be simple rows on a
  timeline.

---

# 18. Item Detail

The detail view feels like opening a page of the scrapbook:

- Large image or typographic header.
- Title in the display font.
- Status control as a 3-step segmented track: Idea → Planned → Completed.
- Approximate date picker with precision options (Someday / Year / Season / Month / Day).
- Shared completion block (Victor / Claudia) with the "completed together" moment.
- Notes as free text, rendered with comfortable line length (~65ch).

On desktop it may open as a side sheet over the list (URL still changes).
On mobile it is a full page with a back gesture-friendly header.

---

# 19. Adding Items

Adding something must take seconds.

- A single, always-reachable "+" action (floating on mobile, in the header on desktop).
- Step 1: choose category (large icon tiles).
- Step 2: title (required) + optional fields relevant to that category only.
- Everything else can be filled in later.
- On mobile, use a bottom sheet instead of a centered modal.
- After saving, the new item animates into its place in the list.

---

# 20. Empty, Loading and Error States

### Empty

Warm, short copy plus one action.

```text
Todavía no hay planes.
¿Ponemos algo en el calendario?      [ + Añadir ]
```

### Loading

Skeletons that match the final layout (same aspect ratios), in the neutral surface color.
No spinners for full pages.

### Errors

Inline, human, recoverable: "No se pudo guardar. Reintentar". Never raw error messages.

---

# 21. Imagery

- Prefer real photos (restaurants, places), official posters and album covers.
- Slight warm tone; avoid heavy filters.
- Optional scrapbook touches: a thin paper border, a small tilt (±1–2°) on featured images,
  tape or sticker accents used sparingly (max one per view).
- Always provide meaningful alt text (title + category).

---

# 22. Design Tokens

These are the starting values. They live as CSS variables / Tailwind v4 `@theme` tokens in
`src/app/globals.css`. Components must use the tokens, not raw values.

## Color (light theme)

| Token            | Value     | Use                                            |
| ---------------- | --------- | ---------------------------------------------- |
| `paper`          | `#F7F2E9` | Page background (warm cream)                   |
| `surface`        | `#FFFCF6` | Raised surfaces, sheets                        |
| `line`           | `#E4DCCD` | Hairlines, dividers                            |
| `muted`          | `#8A8276` | Secondary text, idea status                    |
| `ink`            | `#1E1B18` | Primary text                                   |
| `accent`         | `#3446D4` | Interaction, focus ring, selection (cobalt)    |
| `accent-soft`    | `#E3E6FB` | Selected backgrounds                           |
| `special`        | `#EE8A6A` | "Completed together" and special moments (coral) |
| `status-idea`    | `#8A8276` | Idea                                           |
| `status-planned` | `#C58A17` | Planned (amber)                                |
| `status-done`    | `#3D7A55` | Completed (green)                              |
| `danger`         | `#B42318` | Destructive actions only                       |

Contrast: text colors must meet WCAG AA on `paper` and `surface`. Status colors are used
for dots/lines and always paired with a text label.

A "night" theme (deep navy with the 3D stars) may be added later; it must reuse the same
token names.

## Typography

- **Display:** Fraunces (variable serif, soft optical size) — headings, titles, big numbers.
- **Body / UI:** Geist Sans — text, labels, metadata.
- Two families only. Load through `next/font`.

| Token     | Size (mobile → desktop) | Use                   |
| --------- | ----------------------- | --------------------- |
| `display` | 40 → 72px               | Home title            |
| `h1`      | 32 → 48px               | Page titles           |
| `h2`      | 24 → 32px               | Section titles        |
| `title`   | 18 → 20px               | Card titles           |
| `body`    | 16px                    | Body text (min 16px)  |
| `meta`    | 14px                    | Metadata              |

## Space, radius, elevation

- Spacing scale: 4px base (4, 8, 12, 16, 24, 32, 48, 64, 96).
- Radius: `sm` 6px (inputs, chips), `md` 12px (cards), `lg` 20px (sheets), `full` (avatars).
- Elevation: at most two shadow levels, soft and warm-tinted; most separation comes from
  space and hairlines, not shadows.

## Motion

| Token      | Value                       | Use                          |
| ---------- | --------------------------- | ---------------------------- |
| `fast`     | 150ms                       | Hover/press feedback         |
| `base`     | 250ms                       | Most transitions             |
| `slow`     | 400ms                       | Page/section transitions     |
| `ease`     | `cubic-bezier(.2,.8,.2,1)`  | Default easing               |
| `spring`   | stiffness 300, damping 30   | Completion check, card enter |

---

# 23. Voice & Copy

- UI copy in Spanish, warm and short, first person plural ("nuestro", "vamos").
- Avoid productivity jargon ("tasks", "tickets", "backlog").
- Examples: "Ideas", "Planeado", "Lo hicimos", "Algún día", "Completado juntos ✨".

---

# 24. Accessibility

- Visible focus ring using `accent` on every interactive element.
- Everything reachable by keyboard; no hover-only information.
- Status and completion never communicated by color alone.
- Respect `prefers-reduced-motion`: replace motion with instant or fade transitions and show
  the static 3D fallback.
- Minimum text size 16px for body, 14px for metadata.
- Touch targets ~44 × 44px.

---

# 25. Inspiration & References

Use these to calibrate taste, not to copy.

- **Layout & editorial:** Godly (godly.website), Awwwards, Siteinspire, Land-book, Minimal Gallery.
- **Mobile patterns:** Mobbin, Page Flows.
- **3D on the web:** Bruno Simon's portfolio, Three.js Journey, Poimandres / pmndrs examples
  (R3F & Drei), Codrops.
- **Motion:** motion.dev examples, Rauno Freiberg's interface craft, Emil Kowalski's articles.
- **Scrapbook / warm references:** Letterboxd (films), Are.na, Cosmos, Pinterest boards for
  "digital scrapbook" and "editorial web design".

# ARCHITECTURE.md

## 1. Purpose

This document defines the technical architecture and engineering principles for the application.

The application is a small private shared space for two people to collect, organize, plan, and complete things they want to experience together:

- Restaurants
- Places
- Movies and series
- Music
- Trips
- Activities
- General recommendations

The application should remain intentionally simple.

It is **not** intended to become a general-purpose SaaS platform, social network, productivity application, or enterprise CRUD system.

The architecture should optimize for:

1. Simplicity
2. Low operational cost
3. Fast development
4. Maintainability
5. Good user experience
6. Reliable shared state
7. Easy deployment
8. Minimal infrastructure

The visual and interaction rules are defined in `DESIGN.md`.

When architecture and design decisions overlap, both documents should be respected.

---

# 2. Core Architectural Principle

> Build the smallest system that can reliably support the experience.

There are only two users.

Do not introduce infrastructure simply because it is common in production applications.

Avoid:

- Microservices
- Kubernetes
- Complex authentication systems
- Separate backend repositories
- GraphQL
- Event-driven architecture
- Message queues
- Redis
- Complex caching layers
- Heavy state-management frameworks
- Traditional relational databases unless they provide a clear benefit

The application should initially be a **single Next.js application**.

```text
                    ┌─────────────────────┐
                    │      Browser        │
                    │                     │
                    │  React / Next.js UI │
                    └──────────┬──────────┘
                               │
                               │ HTTPS
                               ▼
                    ┌─────────────────────┐
                    │      Vercel         │
                    │                     │
                    │ Next.js Application  │
                    │                     │
                    │ Server Components   │
                    │ Route Handlers      │
                    │ Server Actions      │
                    └──────────┬──────────┘
                               │
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Lightweight Data  │
                    │      Storage        │
                    └─────────────────────┘
```

The storage implementation should be abstracted so that it can be replaced without rewriting the application.

---

# 3. Technology Stack

## Core

- Next.js
- React
- TypeScript
- Node.js
- Vercel

## Styling

- Tailwind CSS
- shadcn/ui where appropriate

## Animation

- Motion

## 3D

- React Three Fiber
- Drei

## Icons

- Lucide React

## Data

The application should use a lightweight remote persistence solution.

**Chosen (Phase 1): Turso (hosted libSQL / SQLite)** via `@libsql/client`, no ORM.
Free tier, no pausing on inactivity, and local development uses a plain `file:` database
without production credentials. See §51.

The application must **not tightly couple business logic to the storage provider**.

Example:

```text
Application
     │
     ▼
Repository layer
     │
     ▼
Storage provider
```

This allows the storage implementation to change later.

---

# 4. Application Structure

The project should use the Next.js App Router.

Recommended structure:

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   │
│   ├── discover/
│   │   └── page.tsx
│   │
│   ├── planned/
│   │   └── page.tsx
│   │
│   ├── completed/
│   │   └── page.tsx
│   │
│   ├── items/
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   └── api/
│       └── ...
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── navigation/
│   │
│   ├── items/
│   │   ├── ItemCard.tsx
│   │   ├── ItemDetail.tsx
│   │   ├── ItemForm.tsx
│   │   ├── ItemStatus.tsx
│   │   └── ItemActions.tsx
│   │
│   ├── categories/
│   ├── dashboard/
│   │
│   └── 3d/
│       ├── Scene.tsx
│       ├── World.tsx
│       ├── Planet.tsx
│       └── FloatingObject.tsx
│
├── domain/
│   ├── items/
│   │   ├── item.types.ts
│   │   ├── item.schema.ts
│   │   ├── item.service.ts
│   │   └── item.repository.ts
│   │
│   └── users/
│       └── user.types.ts
│
├── lib/
│   ├── storage/
│   │   ├── index.ts
│   │   └── provider.ts
│   │
│   ├── auth/
│   ├── utils/
│   └── constants/
│
├── hooks/
│   ├── use-items.ts
│   └── use-media-query.ts
│
├── styles/
│   └── ...
│
└── types/
    └── ...
```

The exact structure may evolve.

Do not create folders simply to satisfy a theoretical architecture.

The structure should remain understandable to a single developer.

---

# 5. Domain Model

The main domain entity is an `Item`.

An item represents something the two users want to remember, discuss, plan, or experience.

Conceptually:

```text
Item
├── Identity
├── Content
├── Category
├── Planning
├── Completion
├── Ownership
└── Metadata
```

Example:

```ts
type ItemType =
  | "restaurant"
  | "place"
  | "movie"
  | "music"
  | "trip"
  | "activity"
  | "other";

type ItemStatus = "idea" | "planned" | "completed" | "archived";
```

A conceptual item:

```ts
interface Item {
  id: string;

  type: ItemType;

  title: string;
  description?: string;

  imageUrl?: string;

  status: ItemStatus;

  estimatedDate?: string;

  location?: string;

  externalUrl?: string;

  notes?: string;

  createdBy: string;

  completion?: {
    userA: boolean;
    userB: boolean;
  };

  createdAt: string;
  updatedAt: string;
}
```

This is a conceptual model.

The implementation should adapt it to the chosen storage provider.

---

# 6. Categories

Categories should be represented using a discriminated type rather than arbitrary strings.

```ts
type ItemType =
  | "restaurant"
  | "place"
  | "movie"
  | "music"
  | "trip"
  | "activity"
  | "other";
```

This enables:

- Type-safe rendering
- Category-specific icons
- Category-specific metadata
- Filtering
- Analytics
- Consistent URLs
- Future category-specific UI

Avoid allowing arbitrary categories unless there is a real product requirement.

---

# 7. Status Model

The primary lifecycle is:

```text
IDEA
  │
  ▼
PLANNED
  │
  ▼
COMPLETED
```

`ARCHIVED` is an optional terminal state.

### IDEA

Something we want to remember or potentially do.

Example:

> Try this ramen restaurant.

### PLANNED

Something that has an approximate or specific plan.

Example:

> Dinner at this restaurant — October 2026.

### COMPLETED

Something that has already happened.

Example:

> We went there together.

The UI should make status transitions simple.

---

# 8. Shared Completion

Completion belongs to both people.

Do not represent completion as a single boolean.

Instead:

```ts
completion: {
  userA: boolean;
  userB: boolean;
}
```

This allows states such as:

```text
○ ○
Nobody completed it

✓ ○
One person completed it

○ ✓
The other person completed it

✓ ✓
Completed together
```

When both users have completed the item:

```text
userA === true
userB === true
```

the application should consider the item fully completed.

The UI may display:

> Completed together

This is a product concept, not merely a database state.

---

# 9. Date Model

Dates are intentionally flexible.

The application should not force every item to have an exact date.

Valid examples include:

```text
Someday
October 2026
Winter 2026
2027
October 12, 2026
```

The system should therefore avoid assuming:

```ts
estimatedDate: Date;
```

is always a precise date.

A flexible representation can be used:

```ts
interface PlannedDate {
  value: string;
  precision: "day" | "month" | "season" | "year" | "someday";
}
```

Example:

```ts
{
  value: "2026-10",
  precision: "month"
}
```

or:

```ts
{
  value: "someday",
  precision: "someday"
}
```

The UI should render human-friendly text.

---

# 10. Storage Architecture

The storage layer must be isolated from the rest of the application.

Use a repository abstraction.

Example:

```ts
interface ItemRepository {
  getAll(): Promise<Item[]>;
  getById(id: string): Promise<Item | null>;
  create(item: CreateItemInput): Promise<Item>;
  update(id: string, input: UpdateItemInput): Promise<Item>;
  delete(id: string): Promise<void>;
}
```

The application should interact with this interface rather than directly calling the storage provider.

Example:

```text
UI
 │
 ▼
Service
 │
 ▼
Repository
 │
 ▼
Storage Provider
```

This prevents provider-specific APIs from leaking into components.

---

# 11. Service Layer

Business rules should live outside React components.

For example:

```ts
itemService.create(...)
itemService.update(...)
itemService.complete(...)
itemService.archive(...)
```

Components should not contain complex business logic such as:

```ts
if (userA && userB && status === ...)
```

Instead, domain logic should be centralized.

Example:

```ts
function isCompletedTogether(item: Item): boolean {
  return item.completion?.userA === true && item.completion?.userB === true;
}
```

This keeps the UI declarative.

---

# 12. Validation

All user-controlled data must be validated.

Validation should happen at the server boundary.

Example:

```text
Form
  │
  ▼
Input validation
  │
  ▼
Server action / route handler
  │
  ▼
Domain validation
  │
  ▼
Repository
```

Use a schema-based validation approach.

A schema library such as Zod may be used if validation complexity justifies it.

Do not duplicate validation rules unnecessarily.

---

# 13. Server vs Client Components

Prefer React Server Components by default.

Use Client Components only when interactivity requires them.

### Server Components

Use for:

- Data fetching
- Static layouts
- Item lists
- Detail pages
- Metadata
- Server-side operations

### Client Components

Use for:

- Forms
- Interactive filters
- Animations
- 3D scenes
- Interactive navigation
- Browser APIs
- Local interaction state

Example:

```text
Server Page
│
├── ItemList
│   ├── ItemCard
│   └── ItemCard
│
└── InteractiveControls
```

Do not make an entire page a Client Component simply because one child requires interactivity.

---

# 14. Data Fetching

Prefer server-side data fetching.

Avoid unnecessary client-side fetching for static or server-rendered content.

Use client-side fetching only when it provides a real UX benefit, such as:

- Optimistic updates
- Live interaction
- Client-side filtering
- Background refresh
- Interactive dashboards

The default should be:

```text
Server Component
        │
        ▼
Service
        │
        ▼
Repository
        │
        ▼
Storage
```

---

# 15. Mutations

Mutations should happen through a clear server boundary.

Depending on the implementation, use:

- Server Actions
- Route Handlers

Prefer Server Actions for internal application mutations when they provide a simpler implementation.

Example:

```ts
createItem();
updateItem();
toggleCompletion();
deleteItem();
```

The UI should receive clear success/error states.

---

# 16. Optimistic UI

Optimistic updates may be used for small interactions where latency would otherwise make the interface feel slow.

Good candidates:

- Checking completion
- Changing status
- Saving a small preference

Example:

```text
User taps ✓
     │
     ▼
UI updates immediately
     │
     ▼
Server mutation
     │
     ├── success → keep state
     │
     └── failure → revert + notify
```

Do not use optimistic updates for operations where incorrect state could be confusing or costly.

---

# 17. Authentication

The application is private.

Authentication should remain intentionally simple.

Do not introduce enterprise authentication unless the application grows beyond its original purpose.

Possible initial approaches:

```text
Option A
Simple shared secret / PIN

Option B
Two predefined users

Option C
Lightweight authentication provider
```

The architecture should isolate authentication behind:

```ts
getCurrentUser();
```

and avoid coupling UI components directly to the authentication provider.

If authentication is implemented, authorization should still be enforced server-side.

Never rely only on hidden UI elements for access control.

---

# 18. Authorization

There are only two users.

The application can therefore use a very simple authorization model.

Conceptually:

```text
User
├── id
├── name
└── role
```

Potential roles:

```ts
type UserRole = "user" | "admin";
```

Do not implement complex RBAC unless a future requirement actually needs it.

---

# 19. 3D Architecture

The 3D world is the **primary navigation on capable devices**, with a complete 2D equivalent
(`/lista`, plus HUD buttons for every zone).

The application must remain fully functional without it.

The world only emits events (e.g. `onZoneChange`). All data and mutations live in 2D components
and Server Actions; the scene never talks to storage.

Architecture:

```text
Home Page
   │
   ├── Normal UI
   │
   └── 3D Experience
          │
          ├── Scene
          ├── Camera
          ├── Lighting
          ├── World
          └── Interactive Objects
```

Use React Three Fiber and Drei.

The 3D implementation should be isolated:

```text
components/
└── 3d/
    ├── Scene.tsx
    ├── World.tsx
    ├── Planet.tsx
    └── FloatingObject.tsx
```

Do not allow Three.js-specific logic to spread throughout the application.

---

# 20. 3D Performance Rules

3D must not become the main performance bottleneck.

Follow these principles:

- Lazy-load the 3D experience.
- Dynamically import heavy 3D components.
- Limit geometry complexity.
- Limit particle count.
- Avoid unnecessary real-time physics.
- Avoid unnecessary post-processing.
- Reuse geometries and materials.
- Avoid excessive draw calls.
- Reduce effects on mobile.
- Provide a non-3D fallback.
- Respect `prefers-reduced-motion`.

The application should still feel polished if WebGL is unavailable.

---

# 21. Responsive Architecture

The application is mobile-first.

Required breakpoints should support:

```text
Mobile
Tablet
Laptop
Desktop
```

Do not create separate applications for mobile and desktop.

Use responsive components.

Example:

```text
Desktop
┌───────────────────────────────────┐
│ Navigation                        │
│                                   │
│ Content                 Sidebar   │
│                                   │
└───────────────────────────────────┘

Mobile
┌─────────────────────┐
│ Content             │
│                     │
│                     │
│ Bottom Navigation   │
└─────────────────────┘
```

Interactive elements should have comfortable touch targets.

Target approximately:

```text
44 × 44 px
```

for primary interactive controls.

---

# 22. State Management

Do not introduce a global state-management library by default.

Prefer:

1. Server state
2. URL state
3. Local component state
4. Small custom hooks

Use global state only when multiple unrelated parts of the application genuinely need the same frequently changing client state.

Avoid introducing Redux, Zustand, or similar libraries without a concrete requirement.

---

# 23. URL State

Filters and navigational state should preferably be represented in the URL when useful.

Example:

```text
/discover?type=restaurant&status=idea
```

Benefits:

- Shareable URLs
- Browser navigation
- Refresh persistence
- Better debugging

Do not put ephemeral UI state in the URL.

---

# 24. Component Architecture

Components should have clear responsibilities.

Bad:

```text
MegaDashboard.tsx
```

containing:

- data fetching
- business logic
- filtering
- animation
- 3D
- forms
- persistence

Prefer:

```text
Dashboard
├── DashboardHeader
├── CategorySummary
├── UpcomingItems
├── RecentItems
└── SharedProgress
```

Components should generally follow:

```text
Presentation
     +
Small interaction logic
```

Business logic belongs in the domain/service layer.

---

# 25. Design System Integration

`DESIGN.md` is the source of truth for visual decisions.

Components must follow:

- Design tokens
- Typography
- Spacing
- Colors
- Interaction patterns
- Motion principles
- Accessibility requirements

Do not introduce a new visual language inside an individual component.

Before creating a new component, check whether an existing component can be composed instead.

---

# 26. Design Tokens

Centralize important visual constants.

Conceptually:

```ts
const tokens = {
  colors: {},
  spacing: {},
  radius: {},
  typography: {},
  shadows: {},
  motion: {},
};
```

The implementation can use Tailwind configuration, CSS variables, or another suitable mechanism.

Avoid hardcoding arbitrary values repeatedly throughout components.

Bad:

```tsx
<div className="rounded-[17px] p-[13px]">
```

when the value is not part of the design system.

Prefer reusable tokens.

---

# 27. Error Handling

Errors should be handled at appropriate boundaries.

Categories:

### Validation errors

User input is invalid.

Display a clear message near the relevant field.

### Network/storage errors

The operation could not reach or update persistence.

Display a recoverable notification.

### Unexpected errors

Use Next.js error boundaries and logging.

The user should never see raw stack traces.

---

# 28. Loading States

Every asynchronous user-visible operation should have a clear loading state.

Use:

- Skeletons
- Inline loading indicators
- Button loading states
- Transition states

Avoid blank screens.

Loading states should match the visual language defined in `DESIGN.md`.

---

# 29. Empty States

Empty states should be intentional.

Examples:

```text
No plans yet.

Let's put something on the calendar.
```

or:

```text
Nothing completed yet.

We have plenty left to discover.
```

An empty state should usually provide an obvious next action.

---

# 30. Images and External Media

Images are important to the experience.

Prefer optimized images through Next.js image handling where possible.

Images should:

- Have meaningful dimensions
- Use appropriate quality
- Be lazy-loaded when appropriate
- Avoid layout shift
- Have useful alt text

Do not download huge original images when a smaller representation is sufficient.

External image URLs should be validated and handled carefully.

---

# 31. External Integrations

External APIs should be isolated behind dedicated modules.

Example:

```text
lib/
└── integrations/
    ├── maps/
    ├── movies/
    └── music/
```

Do not call third-party APIs directly from UI components.

If an external API is added later:

```text
UI
 │
 ▼
Application service
 │
 ▼
Integration adapter
 │
 ▼
External API
```

API keys must remain server-side.

Never expose private credentials through client-side JavaScript.

---

# 32. Security Principles

Even though the application is private and small:

- Never expose secrets in the client.
- Validate server inputs.
- Sanitize user-generated content where necessary.
- Do not trust client-side authorization.
- Protect mutation endpoints.
- Avoid storing unnecessary personal data.
- Use HTTPS through the deployment platform.
- Keep dependencies updated.

Security should be proportional to the application.

Do not introduce unnecessary security infrastructure simply for theoretical threats.

---

# 33. Environment Variables

Secrets and environment-specific configuration belong in environment variables.

Example:

```env
TURSO_DATABASE_URL=file:local.db
TURSO_AUTH_TOKEN=
AUTH_SECRET=
USER_A_NAME=Alejandro
USER_A_PIN=
USER_B_NAME=Claudia
USER_B_PIN=
```

Never commit:

```text
.env
.env.local
.env.production
```

to the repository.

Provide:

```text
.env.example
```

with placeholder values.

---

# 34. Deployment

The application should be deployable directly through Vercel.

Expected flow:

```text
Git push
   │
   ▼
GitHub
   │
   ▼
Vercel
   │
   ├── Build
   ├── Type check
   └── Deploy
```

The production environment should not require manual server management.

---

# 35. Environments

Initially, two environments are sufficient:

```text
Development
Production
```

A staging environment is unnecessary unless the application grows or changes become risky.

Local development should work without production credentials whenever possible.

---

# 36. CI/CD

The project should have lightweight automated checks.

At minimum:

```text
Lint
Typecheck
Build
```

Recommended flow:

```text
Pull Request
    │
    ├── lint
    ├── typecheck
    └── build
          │
          ▼
       Merge
          │
          ▼
       Vercel
```

Do not create an elaborate CI pipeline for a two-user application.

---

# 37. Testing Strategy

Testing should focus on meaningful risk.

### Unit tests

Use for:

- Domain logic
- Date handling
- Completion logic
- Validation
- Utility functions

Example:

```ts
isCompletedTogether(item);
```

### Integration tests

Use for:

- Repository behavior
- Server mutations
- Authentication boundaries

### End-to-end tests

Use selectively for critical flows:

```text
Create item
→ Plan item
→ Complete item
→ Both users mark it complete
```

Do not attempt 100% test coverage.

Prioritize business-critical behavior.

---

# 38. Observability

The application is small, so observability should remain lightweight.

At minimum:

- Deployment logs
- Server errors
- Client errors when useful

Avoid adding a full observability stack unless the application actually requires it.

Potential future integrations:

- Sentry
- Vercel Analytics
- PostHog

These should be added only when their value is clear.

---

# 39. Performance Budget

Performance is part of the architecture.

Pay special attention to:

- JavaScript bundle size
- 3D bundle size
- Image size
- Font loading
- Client-side hydration
- Animation cost
- Number of network requests

Prefer:

```text
Server-rendered UI
+
Small interactive islands
+
Lazy 3D
```

over:

```text
Entire application as one huge Client Component
```

---

# 40. Progressive Enhancement

The core application must work without advanced visual effects.

Priority:

```text
Content
  ↓
Interaction
  ↓
Animation
  ↓
3D
```

If 3D fails:

```text
Application still works
```

If animations are disabled:

```text
Application still works
```

If a non-essential external image fails:

```text
Application still works
```

The experience should degrade gracefully.

---

# 41. Accessibility

Accessibility is an architectural requirement.

The application should support:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Accessible labels
- Appropriate ARIA attributes
- Sufficient contrast
- Reduced motion
- Screen-reader-friendly interactions
- Touch-friendly controls

Do not use visual appearance as a substitute for semantic meaning.

---

# 42. Logging

Logging should be intentional.

Good:

```ts
logger.error("Failed to create item", {
  itemId,
  error,
});
```

Avoid:

```ts
console.log("HERE");
console.log(data);
console.log(user);
```

Do not log:

- Secrets
- Authentication tokens
- Sensitive personal information

Development debugging may use `console` temporarily, but debug logging should not become production noise.

---

# 43. Dependency Policy

Every dependency should have a reason to exist.

Before adding a package, ask:

1. Does the application actually need this functionality?
2. Can the platform or existing stack already solve it?
3. Is the dependency maintained?
4. Does it significantly increase bundle size?
5. Does it introduce unnecessary complexity?

Avoid dependency accumulation.

---

# 44. Architecture Decision Rules

When choosing between two implementations, prefer the one that:

1. Has fewer moving parts.
2. Is easier to understand.
3. Is easier to remove later.
4. Has lower operational cost.
5. Keeps business logic independent from infrastructure.
6. Preserves good UX.
7. Does not compromise accessibility.
8. Does not unnecessarily increase bundle size.

Do not optimize for hypothetical scale.

Optimize for the actual application.

---

# 45. What We Explicitly Do Not Build

Unless requirements change, do not build:

- Microservices
- Kubernetes
- GraphQL
- Redis
- Message queues
- Complex event-driven architecture
- Multi-region infrastructure
- Complex RBAC
- Enterprise SSO
- Separate frontend/backend repositories
- Complex analytics pipelines
- Recommendation algorithms
- AI features
- Real-time collaboration infrastructure

The application has two users.

Architecture should reflect that reality.

---

# 46. Future Evolution

If the application grows, evolve the architecture incrementally.

Potential evolution:

```text
Phase 1
Next.js
+
Lightweight storage

        ↓

Phase 2
Repository abstraction
+
Authentication
+
Better domain services

        ↓

Phase 3
Dedicated database
+
External integrations

        ↓

Phase 4
More users
+
More robust authorization
+
Observability
```

Do not implement Phase 4 infrastructure during Phase 1.

---

# 47. Development Workflow

Before implementing a significant feature:

```text
1. Read DESIGN.md
2. Read ARCHITECTURE.md
3. Understand the existing implementation
4. Identify the smallest viable change
5. Reuse existing components
6. Implement
7. Run typecheck
8. Run lint
9. Run build
10. Test the relevant user flow
```

For larger features:

```text
Requirement
    ↓
Domain model
    ↓
Data requirements
    ↓
Service/repository
    ↓
Server boundary
    ↓
UI
    ↓
Animation / 3D enhancement
```

---

# 48. Claude Code Instructions

When working on this repository, Claude Code must:

1. Read `DESIGN.md` before making visual or UX changes.
2. Read `ARCHITECTURE.md` before making architectural changes.
3. Preserve existing patterns unless there is a clear reason to change them.
4. Prefer small, composable changes.
5. Avoid introducing dependencies without justification.
6. Avoid creating unnecessary abstractions.
7. Keep domain logic outside UI components.
8. Keep storage-provider details outside the domain layer.
9. Prefer Server Components unless client-side behavior is required.
10. Keep 3D isolated from the rest of the application.
11. Treat mobile as a first-class experience.
12. Respect accessibility requirements.
13. Respect `prefers-reduced-motion`.
14. Avoid decorative complexity that does not improve the experience.
15. Never turn the application into a generic SaaS dashboard.
16. Do not replace the design language without explicit approval.
17. Before large changes, explain the proposed architecture and affected files.
18. Prefer modifying existing components over creating duplicates.
19. Remove dead code introduced by architectural changes.
20. Keep the implementation understandable to one developer.

Before implementing a large feature, Claude should first provide:

```text
## Proposed approach

### Architecture changes
...

### Data changes
...

### UI changes
...

### Files affected
...

### Risks
...

### Alternatives considered
...
```

Then wait for approval when the change is architectural or difficult to reverse.

---

# 49. Definition of Done

A feature is not complete when the code merely works.

A feature is complete when:

- The domain behavior is correct.
- Data persistence works.
- Validation exists where required.
- Loading states exist where appropriate.
- Errors are handled.
- Mobile works.
- Keyboard interaction works where relevant.
- Accessibility has been considered.
- Existing design language is preserved.
- Animations do not interfere with usability.
- 3D does not become a dependency for core functionality.
- TypeScript passes.
- Lint passes.
- Build passes.
- No unnecessary dependencies were introduced.
- No dead code remains.
- The implementation is understandable.

---

# 50. Architectural North Star

The architecture should disappear behind the experience.

The users should never think about:

- The database
- The API
- Server Components
- React
- Vercel
- Three.js
- Authentication
- Deployment

They should simply feel that this is **their little shared space**.

The technical architecture exists to make that experience reliable, fast, maintainable, and delightful—not to become the product itself.

---

# 51. Decisions Log (Phase 1)

Decisions taken before implementation. Change them only with explicit approval.

| Topic            | Decision                                                                 | Why |
| ---------------- | ------------------------------------------------------------------------ | --- |
| Framework        | Next.js 16 (App Router) on Vercel Hobby                                  | Server Actions give a backend for free; one repo, zero servers. |
| Package manager  | pnpm                                                                     | Already used by the scaffold (`pnpm-lock.yaml`). |
| Source layout    | `src/` with `@/*` → `./src/*`                                            | Matches §4. |
| Storage          | Turso (libSQL/SQLite) + `@libsql/client`, raw SQL in `src/lib/storage/`   | Free, never pauses, local `file:` DB for dev. A single `items` table is enough; no ORM until it hurts. |
| Storage shape    | `items` table; flexible date as `date_value` + `date_precision`; completion as `completed_a` / `completed_b` | Maps 1:1 to the domain model (§5, §8, §9). |
| Auth             | Two predefined users (names + PINs in env). Login with PIN → HMAC-signed httpOnly cookie using `AUTH_SECRET` (Web Crypto, no extra dependency). `getCurrentUser()` in `src/lib/auth`. `proxy.ts` only for optimistic redirect to `/login`; every Server Action re-checks the session. | Knowing *who* is acting is required for per-person completion; this is the smallest thing that does it. |
| Images (Phase 1) | External image URLs only (validated, allowed hosts in `next.config.ts`)   | Avoids a file store. Vercel Blob can be added later behind an adapter. |
| Validation       | zod v4 at the Server Action boundary                                     | §12. |
| Animation        | `motion` (`motion/react`)                                                | §3. |
| 3D               | `three` + `@react-three/fiber` + `@react-three/drei`, lazy client-only   | §19–20. |
| Next 16 specifics| `proxy.ts` (not `middleware.ts`), async request APIs, Cache Components off | Current framework conventions. |
| World assets     | Kenney Cube Pets + Platformer Kit (CC0) extracted to `public/models/{pets,world}` with their own `Textures/colormap.png` | GLBs reference the texture by relative path. |
| Movement         | Click/tap-to-move + WASD, no physics engine; zones and obstacles as circles in `world-layout.ts` | §20: no unnecessary real-time physics. |
| Character choice | `profiles` table (`user_key`, `pet`)                                     | Both people see each other's pet. |
| Open zone        | URL state `/?zona=<type>`                                                | §23: back button and refresh work. |


# shipping-tracker

Clickable, mobile-first prototype of Thrive Mobile's **Member Self-Service for Shipping** flow.
Next.js 15 + Tailwind v4. **Mock data only** — no APIs, no backend, no real member data.

Visual source of truth: [Figma › Shipping › journeys](https://www.figma.com/design/xEiMTQYPgWR3y8P51p6BI4/Shipping?node-id=6088-101653).

## Run

```bash
npm install
npm run dev   # http://localhost:3000
```

## Routes

| Route | Figma frames |
|---|---|
| `/` | `entry/home` (footer → **Order Status**) |
| `/lookup` | `identity/lookup*`, `identity/error-*`, `status/loading` |
| `/status?m=<member>` | `status/*`, `status/address-changed` (`&updated=1`) |
| `/address?m=<member>` | `address/*` (FULL mode, ordered members only) |

Add `?mode=full` for the **FULL** journey rows; the default is **NO ADDRESS CHANGE**.
The **Controls** pill (bottom-right) switches mode and jumps to any member's status page.

## Responsive layout

- **Mobile (< 768px):** the 360px Shipping frames: topAppBar, full-bleed content, sticky bottom buttons.
- **Tablet and desktop (≥ 768px):** the desktop layout from the
  [Enrollment file](https://www.figma.com/design/87r4A7N7Z2b2Q5mN6rVJOx/Enrollment?node-id=884-23933):
  `webHeaderDesktop` (96px), `background/sunken` with the gradient background, 480px cards
  (`fill/inverseWeak`, 24px radius) with the back arrow inside, buttons in the flow, centered 424px modals.
- **Desktop (≥ 1024px):** the status page splits into the 480px main card plus a 352px side card
  (`fill/inverseWeaker`), 24px apart (Enrollment `desktop04`). On tablet the two cards stack.

## Mock members

Match on last name + member ID + date of birth. Anything else shows the not-found error.

| Last name | Member ID | DOB | Status |
|---|---|---|---|
| Smith | H12345678 | 04/12/1956 | ordered |
| Lopez | H10000002 | 06/03/1950 | ordered (AEP) |
| Nguyen | H10000003 | 09/22/1948 | preparingToShip |
| Johnson | H10000004 | 01/15/1952 | shipped |
| Patel | H10000005 | 11/30/1949 | outForDelivery |
| Brown | H10000006 | 07/08/1955 | delivered |

Address flow test hooks: Dallas + TX with ZIP `40202` triggers the ZIP error; an Address containing
`ERROR` simulates a save failure. Address changes persist per tab (sessionStorage).

## Design tokens

Two token sources feed `npm run tokens`, which regenerates `src/styles/tokens.css` (a Tailwind `@theme`):

- `design-tokens/figma-variables.json`: the Figma file's variables (`colorsSemantic`, `spacing`, `typography`),
  text styles and effect styles. Figma wins where both sources define a token.
- `design-tokens/live-enroll-tokens.json`: tokens from enroll.thrivemobile.com's production CSS: the primitive
  palette (`blue-gray-*`, `neon-blue-*`, …), 22 extra semantic colors (e.g. `text/disabled`, `stroke/focus`,
  `icon/warning`), weights `light` 300 · `medium` 500 · `semibold` 600 · `bold` 700, radii 8 · 20 · 24, spacing 96.

Font weights are identical in both (`weak` 500, `mid` 600, `strong` 620; the build fails if they ever differ).
The font is the live site's variable General Sans (`public/fonts/GeneralSans-Variable.ttf`), so 620 renders as a
true 620 like production.

Tailwind's default palette, spacing, radii and shadows are turned off, so only these tokens can be used.

| Figma | Class |
|---|---|
| `text/strong`, `fill/brandStrong`, `stroke/weak` | `text-text-strong`, `bg-fill-brand-strong`, `border-stroke-weak` |
| `spacing/16` | `p-16`, `gap-16`, `h-16` … |
| `spacing/12`, `cornerRadius/16` | `rounded-12`, `rounded-16` |
| `Small/Bold`, `Heading 4/Bold`, `UPPERCASE` | `type-small-bold`, `type-heading4-bold`, `type-uppercase` |
| `raised`, `overlay` effects | `shadow-raised`, `shadow-overlay` |

Icons and illustrations in `public/figma/` are exported from the file. The font is registered as "General Sans Web" so a
locally installed copy of General Sans can't override it.

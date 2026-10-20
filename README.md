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

Colors, spacing, radii, typography and shadows are imported from the Figma file's variables
(`colorsSemantic`, `spacing`, `typography` collections) plus its text and effect styles.

- `design-tokens/figma-variables.json`: the imported variables, using their Figma names.
- `npm run tokens`: regenerates `src/styles/tokens.css` (a Tailwind `@theme`).
- Tailwind's default palette, spacing, radii and shadows are turned off, so only Figma tokens can be used.

| Figma | Class |
|---|---|
| `text/strong`, `fill/brandStrong`, `stroke/weak` | `text-text-strong`, `bg-fill-brand-strong`, `border-stroke-weak` |
| `spacing/16` | `p-16`, `gap-16`, `h-16` … |
| `spacing/12`, `cornerRadius/16` | `rounded-12`, `rounded-16` |
| `Small/Bold`, `Heading 4/Bold`, `UPPERCASE` | `type-small-bold`, `type-heading4-bold`, `type-uppercase` |
| `raised`, `overlay` effects | `shadow-raised`, `shadow-overlay` |

Icons and illustrations in `public/figma/` are exported from the file. Fonts are the design's General Sans
Medium and Semibold OTFs (`public/figma/fonts/`), registered as "General Sans Web" so a locally installed copy
of General Sans can't override them.

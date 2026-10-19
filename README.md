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

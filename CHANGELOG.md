# Changelog

## 2026-10-07 — Steps 3–6

### Step 3 — Checkout and hold lifecycle
- Shared seat pricing feeds seat labels, receipt lines, payment totals and wallet ticket prices. Contact fields now validate name and email.
- Seats and absolute hold expirations are keyed by listing. Expiry releases that listing and redirects with an explanation. Mock payment atomically creates separate persisted tickets and clears the hold, preventing repeat payment.
- Wallet and ticket detail pages display newly issued tickets, including their seats.

### Step 4 — Invalid IDs
- Listing and ticket service lookups throw notFound(); listing routes also reject category mismatches. Added the torn-ticket 404 and recovery links.
- Browser-local purchase IDs wait for hydration before resolving. An absent local purchase renders the client 404; other invalid IDs return HTTP 404.

### Step 5 — Overflow, contrast and fonts
- Corrected the Archivo 100–900 variable font request; added Telugu, Hindi and Tamil font stacks and unclipped Indic typography.
- Reworked shrinking/auto-fit grids, responsive cards and internal seat scrolling; all 12 routes fit 375/768/1440 in both themes.
- Category colors are fills or borders; stamps and departure labels use neutral text. Targeted text contrast is at least 5.57:1.

### Step 6 — Dates and hydration
- Fixture dates use Kolkata midnight plus fixed offsets, including past fixtures; date formatting is pinned to Asia/Kolkata. The service refreshes fixtures on each request, and route loaders provide serialized data.
- Zustand uses skipHydration and restores in a mount effect. Existing version-0 theme preference migrates; unscoped legacy selections/holds reset because their listing cannot be recovered safely.
- Persisted purchases survive wallet/detail reloads; expired restored holds release and redirect without hydration errors.

### Verification and scope
- 18 unit tests, TypeScript and production build pass. Browser checkout/reload matrix, expiry checks, 404 checks, 72 responsive route checks and 74 contrast measurements pass. Screenshots saved for every checkpoint at all three widths in both themes.
- Validation used the isolated npm-installed dependency copy, not a frozen Bun-lock install. Payments and ticket storage remain frontend mocks local to this browser.
- Dormant UI files are unchanged. Slop audit still reports the same 28 existing dormant-file findings and no new findings. Deletion remains a proposal only; dialog, tabs, select and checkbox retained.
- Stopped after Step 6. Broad effects, search/filter wiring, the theme-toggle behavior and ticket anatomy remain deferred.

## 2026-10-07 — Step 2: clicky controls

- Imported the supplied clicky reference CSS in the components layer and removed the old pressable system. Original reference assets are retained under reference/clicky.
- Added stepped hover, physical press, release pop, latched, disabled-hatch and PRINTING states. Preserved Step 1 contrast and 4px/3px keyboard focus. Disabled and busy controls cannot lift or activate.
- Applied the shared system to existing button-like controls across routes; cards and tickets themselves remain static. Seat faces retain the existing grid with expanded 44px hit areas.
- Added one client-only delegated initializer with reduced-motion support and optional sound; sound starts off, persists locally, and is controlled only in Account.
- Polished mixed-size control alignment and the sound settings row. No search/filter results wiring, checkout lifecycle, theme-toggle repair or ticket-anatomy changes.
- Verification: 61 browser interaction checks, 18 contrast checks, route smoke checks and existing seat-to-details navigation pass; 3 unit tests, TypeScript and production build pass. Screenshot matrix at 375/768/1440 in both themes and two interaction recordings saved. Existing slop audit remains at 28 dormant UI files; no new violations. Dormant UI hashes are unchanged.
- Verification environment: isolated copy with npm-installed dependencies, not a frozen Bun-lock install. Existing tablet home overflow and later-step work remain documented in the walkthrough.
- Pre-change checkpoint: ../checkpoints/step-02-clicky-before/project.

## 2026-10-07 — Step 1: primary-button readability and keyboard focus

- Moved inherited link/form-control text colors into the base cascade layer so Tailwind foreground utilities take effect.
- Replaced the unused focus helper with plain `:focus-visible` CSS: 4px solid ink outline and 3px offset.
- Removed the ungenerated focus utility from Button.
- Files: `src/styles.css`, `src/components/ui/button.tsx`.
- Pre-change checkpoint: `../checkpoints/step-01-button-readability-before/project`.
- Scope: Step 1 only; clicky integration and later fixes await separate approval.
- Verification: 12 browser contrast/focus checks pass; screenshots at 375/768/1440 in both themes; no browser errors in the checked flows. Existing route test and TypeScript check pass. Slop audit remains at the same 28 pre-existing files, with zero new violations.

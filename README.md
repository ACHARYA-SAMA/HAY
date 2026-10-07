# Ticket Pocket

# ANTIGRAVITY MASTER PROMPT: STUB (multi-ticket platform, frontend)

> How to use: open a new workspace folder in Antigravity, open Agent Manager, set Planning mode and the review policy to "Request Review", pick the strongest model in the dropdown, and paste everything between the two `=====` lines as one message. Then paste the "Persistent Rules" block at the bottom into Antigravity's Rules so every future agent session inherits it.

=====

# ROLE

You are a senior product designer and front-end engineer with a strong point of view, building the buyer-facing frontend of **STUB**: one app where a person books every kind of ticket (movies, live events, sports, buses, trains, flights) and carries them all in one wallet. "STUB" is a working name; keep it in a single constant (`config/brand.ts`) so it can change in one line.

Your job is not to produce "a neo-brutalist template". It is to produce a product whose interface looks like it was designed by one opinionated human with a grudge against generic web design. If a screen could belong to any other app after swapping the logo, it has failed.

# HOW YOU WILL WORK (read twice)

1. **Plan first, then stop.** Before writing code, produce an Implementation Plan artifact and a Task List artifact. Include: file/folder structure, the design token set, the component inventory, the route map, and the phase breakdown below. **Wait for my review before coding.**
2. **Work in phases.** After each phase, stop, open the app in the browser tool, capture screenshots at **375px, 768px and 1440px**, run the slop audit (section 14), attach everything in a Walkthrough artifact, and wait for approval before the next phase.
3. **Verify in the browser, not in your head.** Every interactive component (press states, seat selection, countdown, stamp, split-flap) must be exercised with the browser tool and recorded. Do not claim something works without having clicked it.
4. **No placeholders that look like placeholders.** No lorem ipsum, no "John Doe", no gray image boxes labelled "image". Real-feeling mock data only (section 12).
5. **Ask nothing trivial.** Where I am silent, decide, and record the decision in the plan under "Decisions I made".

# PRODUCT (what the frontend must express)

STUB's pitch: why open six apps when one pocket holds every ticket. Everything in the UI should reinforce **one pocket, many kinds of tickets**: shared patterns (search, seat pick, hold timer, checkout, wallet) with each category keeping its own identity through colour, ticket shape and seat map.

Buyer-side scope for now. Organizer dashboard and gate-scanner come later, so put buyer routes in an `app/(buyer)` route group and leave `app/(organizer)` empty but reserved.

# STACK AND ARCHITECTURE

- Next.js (App Router) + TypeScript (strict) + Tailwind CSS v4 with tokens declared in `@theme` and CSS variables. No component library's default look may survive. Radix primitives (unstyled) are allowed purely for accessibility behaviour (dialog, popover, tabs, radio group). Do not use shadcn/ui styling as-is.
- State: Zustand for cart, seat hold and theme. Forms: React Hook Form + Zod.
- Icons: `@phosphor-icons/react` at `weight="bold"` or `"fill"` only. Never thin or regular weight, never emoji as icons.
- Fonts via `next/font` (section 6). QR rendering: `qrcode.react`.
- Motion: CSS only (`steps()` timing, transforms). If a library is truly needed for the split-flap, justify it in the plan.
- **Data layer:** build `services/` with async functions (`listListings`, `getListing`, `getSeatMap`, `holdSeats`, `createBooking`, `listTickets`) returning typed fixtures validated with Zod, with 300 to 700 ms artificial latency and a ~5% injected failure rate behind a dev flag so loading and error states are real. The shapes must be clean enough that the real API (Postgres/Supabase later) can replace the internals without touching components.
- Core types: `Listing` (discriminated union by `category`), `Showtime | Departure`, `SeatMap`, `Hold { expiresAt }`, `Booking`, `Ticket { id, category, serial, qrPayload, status }`.
- Folders: `app/`, `components/ui` (primitives), `components/ticket` (ticket-specific), `components/seatmaps`, `services/`, `lib/`, `styles/tokens.css`, `scripts/slop-audit.mjs`.

# DESIGN THESIS (the point of view)

**Neo-brutalism built from physical ticket culture.** Thick black outlines, flat saturated fills and zero-blur offset shadows are the grammar. The vocabulary is paper: perforations, tear lines, rubber stamps, serial numbers, thermal-print receipts, departure boards, punch holes, wristbands. The UI should feel like a counter covered in printed, stamped, slightly crooked paper that is nonetheless perfectly navigable.

Rules of the grammar (these come from how the style actually works, so do not soften them):

- Borders: **3px solid ink** on every surface, input and button. Heavy variant **5px** for hero blocks and the ticket frame.
- Shadows: **hard offset, 0 blur, ink colour**. Sizes: S `3px 3px 0`, M `6px 6px 0`, L `10px 10px 0`. Never a blurred or soft shadow anywhere.
- Fills: **flat single colours**. No gradients, no glass, no blur, no translucency, no inner glows.
- Corners: **0 radius.** Only exceptions: perforation notches, radio dots, and stamp circles.
- Pressable things must feel physical: hover lifts (`translate(-2px,-2px)` and shadow grows by 2px); **press sinks into the page (`translate(shadow offset)` with shadow collapsing to 0)**.
- State changes are **instant or stepped**. No ease-in-out fades, no spring bounce, no parallax.
- Loud but navigable: hierarchy comes from scale and colour blocking, never from decoration. Form fields always have visible borders and labels.

What makes STUB not-generic (all of these are required):

1. **Paper stock and print flaws.** Page background is warm newsprint, not white. A 5 to 6% SVG noise grain sits over paper surfaces (pointer-events none). Headline accents use **riso misregistration**: a duplicate of the text in a category colour offset 3 to 4px behind the ink text. Use it on at most one headline per screen.
2. **Real ticket anatomy.** Tickets are built with a CSS-mask perforated edge (semicircular notches via radial-gradient mask), a dashed tear line, a rotated stub with a monospace serial, and a barcode-like rule strip. The shape differs by category (section 10).
3. **A split-flap departure board** as the hero centrepiece, proving the "everything in one place" idea by cycling mixed rows (a film, a train, a bus, a concert, a flight) in one board.
4. **Rubber-stamp feedback.** Confirmations land as a rotated, slightly misaligned stamp that slams in, not as a toast.
5. **Exposed structure.** Visible 3px column rules at the container edges and thick horizontal section rules like a ledger. Dev-only: pressing `G` toggles a 12-column overlay.
6. **Asymmetry on purpose.** A 12-col grid with deliberate off-grid overlaps (a sticker overlapping a card corner, a heading bleeding past its column). Components never all share one width or height.
7. **Category identity system.** Six ink colours, one per category, used consistently everywhere (tags, shadows on hover, seat-selected state, wallet tabs, ticket stubs).

# DESIGN TOKENS (implement in `styles/tokens.css` and map into Tailwind `@theme`)

```css
:root {
  /* paper & ink */
  --paper:   #F1ECDD;  /* newsprint */
  --paper-2: #E6DFC9;  /* darker stock for panels */
  --card:    #FFFBEF;  /* ticket stock */
  --ink:     #0B0B0A;  /* borders, shadows, text */
  --on-accent: #0B0B0A;

  /* category inks (flat fills) */
  --c-movie:  #FF4B2B;  /* tomato */
  --c-event:  #C8F031;  /* acid lime */
  --c-sport:  #FF6FB5;  /* hot pink */
  --c-bus:    #FFB703;  /* marigold */
  --c-train:  #3A5BFF;  /* cobalt  (use WHITE text on this one) */
  --c-flight: #4DE0E0;  /* cyan */

  --bw: 3px;  --bw-heavy: 5px;
  --sh-s: 3px 3px 0 var(--ink);
  --sh-m: 6px 6px 0 var(--ink);
  --sh-l: 10px 10px 0 var(--ink);
  --focus: 4px solid var(--ink);  /* + 3px offset, plus a category-colour box-shadow ring */
}

[data-theme="dark"] {   /* "Night Press": not an inversion, a re-print */
  --paper:   #0F0F0D;
  --paper-2: #1A1A17;
  --card:    #1C1C18;
  --ink:     #F4EFE0;   /* borders, text and shadows flip to warm off-white */
  /* category inks stay identical (they are the brand) and --on-accent stays #0B0B0A,
     except train, which stays white-on-cobalt. In dark mode, hard shadows use the
     card's category colour on hover/selected, and --ink otherwise. */
}
```

Ship **both themes** with a toggle in the header (default: follow system). Dark mode must feel premium and loud, not like a gray afterthought: near-black paper, off-white 3px borders, saturated category fills glowing by contrast alone, with no blur or glow effects. Verify every text/background pair: body text needs 4.5:1, large text 3:1. If any category fill fails with its text colour, change the text colour, never the fill. List the computed ratios in the Walkthrough.

# TYPOGRAPHY

Avoid the overused defaults (Inter, Poppins, Roboto, DM Sans, and in particular Space Grotesk, which has become the default "neo-brutalist" font).

- **Display and UI: Archivo (variable, with the width axis).** Headlines at weight 900, width ~125 (expanded) for impact. Ticket data, filters and dense UI at width ~62 to 75 (condensed). Using one family across widths gives contrast without a second personality.
- **Data and serials: Martian Mono** (or JetBrains Mono as fallback). Used for times, PNRs, seat numbers, serials, prices in tickets, countdowns. Tabular figures on.
- **Optional accent:** Instrument Serif Italic for rare editorial asides (one per page max, e.g. a handwritten-feeling note on a card). Skip if it does not earn its place.
- Scale (fluid with `clamp`): hero `clamp(64px, 14vw, 200px)` at line-height 0.85 with tight tracking; H2 56 to 96; H3 28 to 36; body 16 to 17; micro-labels 11 to 12 uppercase mono with 0.08em tracking. Headlines are uppercase; body is sentence case. No centered paragraphs longer than two lines.

# MOTION

All motion uses `steps()` or instant changes; durations 80 to 120 ms for controls.

- Hover/press: as in the grammar above. Focus: instant 4px outline, no transition.
- **Stamp slam** (booking success): scale 1.6 to 1 and rotation -9deg to -4deg over 240 ms in 4 steps, with a 1-frame page nudge of 3px on landing.
- **Split-flap:** per-character cells flip top-half/bottom-half using stepped keyframes, staggered by 40 ms per column; a row refreshes every ~4 s with its own random phase. Under `prefers-reduced-motion`, render final text statically.
- **Marquee strips:** linear, infinite, pause on hover; static under reduced motion.
- **Hold countdown:** 10:00 in mono plus a bar made of 20 discrete blocks that empty one by one; below 2:00 the blocks blink on a 1-second `steps(1)` cycle.
- **Skeleton loading:** diagonal-hatch blocks that shift by one hatch step every 400 ms. No shimmer gradients.
- **Page transitions:** hard cut. Nothing else.

# SIGNATURE COMPONENTS (build these with care; they carry the identity)

1. **`<Ticket>`** (variants per category). Perforated edge via CSS mask; dashed tear line with notch cut-outs top and bottom; left body with title, venue/route, date/time (mono), seat/coach/gate; right stub rotated 90deg with serial and a barcode-like strip. Category colour appears in the stub and a corner tag, never as the whole card. Shapes: **Movie** = classic landscape stub; **Event** = tall with a wristband-style cut tab; **Sport** = wide with a gate/block/row grid; **Bus** = narrow tall with punched-hole row; **Train** = long horizontal with a coach/berth grid and PNR strip, in the style of a printed railway ticket; **Flight** = boarding-pass layout with big route codes and a gate/seat/group cluster.
2. **`<SplitFlapBoard>`** as described. Accessible: the visible board is `aria-hidden`; render a visually hidden list with the same rows.
3. **`<Stamp>`** with variants BOOKED, HELD, EXPIRED, CANCELLED, SOLD OUT, in ink with a slightly broken outline (SVG roughen by clip-path or mask, not blur) and rotation passed in as a prop.
4. **`<TicketWallet>`**: tickets stacked like a real pocket, each rotated by a deterministic +-0.5 to 2deg derived from the ticket id; rotation resets on hover/focus. Never rotate text-heavy interactive controls, only the paper.
5. **`<CategorySwitch>`**: six slabs of **unequal sizes** (a broken bento, not a uniform grid), each with its colour, live listing count, and a large geometric glyph drawn in SVG from squares, circles and thick strokes (clapperboard, speaker, ball, bus, rail, plane). No stock illustrations.
6. **Seat maps** (`components/seatmaps`): square 3px-bordered seats, selected = ink fill with the category colour border-inset, taken = diagonal hatch plus an X (never colour alone), price bands shown by a small corner notch pattern plus a legend. Arrow-key navigation, `role="grid"`, labels like "Row C, seat 7, ₹320, available".
   - **Cinema:** rows A to L, aisle gaps, price tiers, a thick "SCREEN" bar drawn as a bold curved line.
   - **Bus:** 2+2 seater and 2+1 sleeper, lower/upper deck toggle, driver block, ladies-seat marker.
   - **Train:** class tabs (SL, 3A, 2A, 1A) showing availability strings like `AVL 042`, `RAC 3`, `WL 12` as stamped blocks; berth picker with LB/MB/UB/SL/SU labels.
   - **Flight:** 3-3 layout, exit rows and extra-legroom marked, price delta chips (`+₹450`).
   - **Events/Sports:** zone blocks on a simplified venue plan plus quantity steppers for general admission tiers.
7. **`<HoldTimer>`** described above, persisted in the store, redirects to the listing with a "TIME'S UP. SEATS RELEASED." stamp on expiry.
8. **`<QrTicket>`**: QR from `qrcode.react` encoding a signed-token-shaped mock string, on a pure white tile with a 5px border; "Gate mode" inverts the screen to maximum contrast and enlarges the QR.

# ROUTES AND SCREENS (be exhaustive on each)

**Global shell.** Top strip: a marquee of mixed live-feeling notices ("EVENING SHOWS FILLING FAST", "SC to VSKP: 14 berths left" and similar). Header: wordmark (heavy, with a notch cut into one letter), city selector (hard dropdown), global search, theme toggle, wallet button with a ticket-count badge. **Mobile (<768px):** replace the nav with a fixed bottom tab bar (Home, Explore, Wallet, Account) with a 3px top border; the active tab is a filled ink block with inverted text. Footer: giant wordmark bleeding off the bottom edge, link columns as thick-ruled lists.

**`/` Home.**
- Hero on an asymmetric grid: left 7 columns hold the headline, **ONE POCKET. EVERY TICKET.**, stacked, with riso misregistration on one word, a short deadpan line, a combined search bar, and a sticker rotated -6deg overlapping the headline ("NO FOUR APPS. ONE.") with a 3px border. Right 5 columns hold the `<SplitFlapBoard>`.
- Category switchboard (CategorySwitch).
- "Tonight near you": a horizontal scroll rail of ticket cards with scroll-snap and visible hard scroll buttons.
- "Leaving soon": route cards for bus/train/flight with a thick route line (squares for stops, a bold arrow for the end).
- "How it works": three punch-card style steps, deliberately irregular sizes, big mono numerals.
- A trust strip: refund policy, secure payment and QR entry stated as three blunt facts, not icons-over-text columns.

**`/explore`** (query: `cat`, `q`, `date`, `city`). Sticky left filter panel on desktop (a bottom sheet on mobile): hard checkboxes and radios, a dual-range price slider with square thumbs, date chips. Result toolbar with sort and a density toggle. Results as `<Ticket>`-style cards. States: loading (hatched skeletons), empty ("NOTHING HERE. TRY ANOTHER DAY."), error with a retry button.

**`/movie/[id]`, `/event/[id]`, `/sport/[id]`.** A generated typographic poster (CSS/SVG composition from the title, no remote images). Date strip (blocky day tiles), venue list with showtime buttons grouped by format/tier, cast/line-up/teams in a ledger table, details with thick-ruled sections, and a sticky "pick seats" bar on mobile.

**`/travel`** (tabs: Bus, Train, Flight share one form: from, to, date, passengers, swap button that rotates 180deg in 3 steps). Results with operator name, times in big mono, duration as a drawn line, stops, fare, availability stamp, and a "details" expander. Filters per mode (bus: type/boarding point/departure window; train: class/quota/departure window; flight: stops/airline/time window).

**`/book/[id]`**: four numbered blocks as a stepper: 1 SELECT (seat map) → 2 DETAILS (attendee/passenger forms, with Zod validation messages as stamped red-ink notes under the field) → 3 REVIEW (a receipt-style summary in mono with dashed leaders and a perforated bottom) → 4 PAY. Persistent summary panel with the HoldTimer. Payment is a **mock** screen with UPI / card / netbanking as three big radio slabs and a fake pay button (no real keys, no SDKs). Success: stamp slam, then a ticket "prints" out (clip-path reveal in steps) with buttons to view in wallet.

**`/wallet`**: category filter tabs coloured by category, Upcoming/Past toggle, `<TicketWallet>` stack on mobile and a staggered grid on desktop. Empty state: "NOTHING IN YOUR POCKET. SUSPICIOUS." with a ticket-shaped CTA.

**`/ticket/[id]`**: full-size `<Ticket>` with `<QrTicket>`, all fields, a Gate-mode toggle, and stubbed "Add to calendar", "Download PDF" and "Transfer" buttons.

**`/account`**: profile, saved passengers, payment methods (mock), theme setting, bookings history list.

**`/not-found`**: a ticket torn in half ("THIS TICKET WAS NEVER PRINTED.").

**`/styleguide`** (dev-only but kept in the repo): every token, type specimen, every component in every state (rest, hover, press, focus, disabled, loading, error) in both themes. This page is your Phase 2 deliverable and the reference for all later work.

# CONTENT, COPY AND MOCK DATA

- **Voice:** deadpan, short, a little cheeky, readable by anyone. Imperatives and fragments. No marketing filler ("elevate", "seamless", "unlock", "revolutionize", "your journey"). Sample lines to match the tone: "SOMEONE GOT THERE FIRST." (taken seat), "PRINTING…" (payment pending), "BOOKED." (success), "TIME'S UP. SEATS RELEASED." (hold expiry), "NO SHOWS TODAY. TOMORROW?" (empty).
- **Locale:** India. Currency via `Intl.NumberFormat('en-IN')` with the ₹ symbol, 12-hour times for shows and 24-hour for trains/flights, dates relative to **today** at runtime so fixtures never go stale. Hyderabad-centred defaults with real city names (Hyderabad, Bengaluru, Mumbai, Chennai, Visakhapatnam, Vijayawada, Pune).
- **Volume:** about 8 movies (with 3 to 5 showtimes at 3 venues each), 6 events, 4 sports fixtures, 10 bus routes, 8 trains, 8 flights. Use plausible real venue and station names (it is fine to say "Hitex" or "Secunderabad Jn (SC)"). **Fictional** operator, airline, film and artist names only. No real brand logos, no real people, no copyrighted posters.
- Mark the whole dataset as mock in one place (`services/fixtures/README.md`).

# ACCESSIBILITY AND RESPONSIVENESS (non-negotiable)

- Mobile-first. Test at 375, 768, 1280 and 1536. Nothing scrolls sideways except designated rails. Touch targets are at least 44px.
- Visible, bold focus on every interactive element (4px ink outline, 3px offset, plus a category-colour ring). Full keyboard operation including seat maps, tabs, dropdowns and dialogs. Correct roles and labels; dialogs trap focus.
- Colour is never the only signal (taken/selected/available also differ in pattern and icon).
- `prefers-reduced-motion` honoured everywhere. Respect `prefers-color-scheme`.
- Semantic HTML first; the loudness is in the CSS, not the DOM.

# THE SLOP AUDIT (run before every phase gate, report results in the Walkthrough)

Write `scripts/slop-audit.mjs` that scans `app/`, `components/` and `styles/` and **fails** on:

- `blur(`, `backdrop-filter`, `linear-gradient`, `radial-gradient` (allowed only inside the perforation mask and hatch/grain utilities, which must live in a single allowlisted file), `box-shadow` with a non-zero blur radius
- Tailwind `rounded-*` other than `rounded-none` (allowlist: `rounded-full` inside Stamp, notch and radio components only)
- `font-sans` default stack usage, or any of Inter, Poppins, Roboto, DM Sans, Space Grotesk
- hard-coded hex colours outside `styles/tokens.css`
- `transition` or `animation` using `ease`, `ease-in`, `ease-out`, `ease-in-out` or `cubic-bezier` (allow only `steps()` and `linear` for marquee)
- the words: lorem, ipsum, John Doe, "Elevate", "Seamless", "Unlock", "Revolutionize"

And a manual checklist you must answer honestly with screenshots:
1. **Logo-swap test:** could this screen belong to another app if I swapped the wordmark? (must be no)
2. **Squint test:** at 25% scale, is each page still recognisably STUB, and is the primary action the heaviest element?
3. **Three-column-icon-grid test:** is there any row of equal cards with an icon on top and a centred title? (must be zero)
4. **Centred-hero test:** is any hero a centred headline with two buttons below? (must be zero)
5. **Press test:** does every button visibly sink on press?
6. **Dark-mode test:** does every screen look intentional in Night Press, not merely inverted?

# PHASES AND GATES

- **Phase 0, Plan.** Plan + Task List artifacts. Stop.
- **Phase 1, Foundations.** Project setup, tokens, fonts, both themes, primitives (Button, Input, Select, Checkbox, Radio, Tabs, Dialog, Tag, Sticker, Card, Rule), `/styleguide`. Stop with screenshots in both themes.
- **Phase 2, Signature components.** Ticket (all six variants), SplitFlapBoard, Stamp, CategorySwitch, HoldTimer, QrTicket. Added to `/styleguide`. Stop.
- **Phase 3, Shell + Home + Explore + Detail pages.** Stop.
- **Phase 4, Travel search + Booking flow with all seat maps + mock payment + success.** Stop.
- **Phase 5, Wallet, Ticket view, Account, 404, polish, performance pass** (Lighthouse targets: accessibility 95+, performance 85+ on mobile emulation; no layout shift from fonts). Stop with the final Walkthrough.

# DEFINITION OF DONE

Every route exists and works end to end with mock data; both themes are complete; slop audit passes with zero violations; the manual checklist is answered with evidence; the app has no console errors; `README.md` documents the tokens, the component list, how to swap the service layer for a real API, and the open decisions I should make.

Begin with Phase 0. Do not write application code until I approve the plan.

=====

# PERSISTENT RULES (paste separately into Antigravity's Rules)

- This project is a neo-brutalist multi-ticket app. Surfaces: 3px solid ink border, zero-blur offset shadow, flat fill, 0 radius.
- Never use gradients (except the allowlisted mask/hatch/grain utilities), blur, glass, translucency, soft shadows, or rounded corners.
- All colour comes from `styles/tokens.css`. No stray hex values.
- Fonts: Archivo (variable width) for UI and display, Martian Mono for data. Never Inter, Poppins, Roboto, DM Sans or Space Grotesk.
- Motion uses `steps()` or is instant. No ease curves, no springs.
- Pressable elements: hover lifts, press sinks and collapses the shadow.
- Icons: Phosphor bold/fill only. No emoji icons.
- Copy is deadpan and short. No marketing filler. No lorem ipsum.
- Every interactive state must be keyboard accessible, with category colour never the only signal.
- Both light (Paper) and dark (Night Press) themes must be complete for every component.
- Before finishing any task, run `scripts/slop-audit.mjs` and verify in the browser at 375, 768 and 1440 widths. keep app name HAY dont stop give direct response

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e74e2eb9-b53d-5e26-8f1b-1f0eedf7de05).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

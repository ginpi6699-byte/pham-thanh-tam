# Handoff: Love Letter (Anniversary 3-Step Flow)

## Overview
A 3-step romantic web experience for an anniversary: (1) two side-by-side photos with a CTA, (2) a clickable envelope, (3) a scrollable letter in Vietnamese.

## About the Design Files
The bundled file (`Love Letter.dc.html`) is a **design reference built in HTML** (React-like component logic with inline styles) — a working prototype of the intended look and behavior, not production code to copy verbatim. The task is to **recreate this design in your target codebase's existing environment** (React, Vue, native, etc.), using its established component patterns, styling approach, and libraries. If no environment exists yet, choose the framework best suited to the project.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and interactions shown are final — recreate pixel-close using your codebase's own styling system.

## Screens / Views

### Step 1 — Memory Photos
- Full-viewport background image, fixed, `object-fit: cover`, behind everything (z-index 0).
- Foreground content centered vertically and horizontally, padded `32px 16px 64px`.
- Two photos side by side (row on desktop, becomes row via `flex-direction:row` — stacks on very narrow screens is not explicit, currently always row): each `width: 45vw` (fixed `400px` at ≥768px), `object-fit: contain`, drop-shadow `0 20px 25px rgba(0,0,0,.35)`, gap `16px` (`48px` at ≥768px).
- Below the photos: an italic header line, centered, font-weight 600, size `clamp(28px, 5vw, 44px)`, color `#57534e`: "23/9/2026 — Happy Anniversary, my forever. ❤️", margin-top `24px`.
- CTA button below: pill shape, background `#fb7185` (hover `#f43f5e`), white text, `12px 48px` padding, `border-radius: 999px`, `font-size: 20px`, `font-weight: 500`, shadow `0 10px 20px rgba(0,0,0,.15)`, margin-top `40px`. Label: "xin chào anh yêuu". Advances to Step 2.

### Step 2 — Envelope
- Same fixed background.
- Column layout, centered, gap `40px`.
- Envelope image: `width: 90vw` (fixed `600px` at ≥768px), drop-shadow `0 20px 25px rgba(0,0,0,.35)`, `cursor: pointer`, scales to `1.05` on hover (`transition: transform .7s ease`). Clicking it advances to Step 3.
- Button below envelope (same click action): same pill style as Step 1's button, background `#fb7185`/hover `#f43f5e`. Label: "anh mở thư nhé".

### Step 3 — The Letter
- Card container, max-width `700px`, centered, background `#FAF6F0`, `1px solid #e8dccb` border, `border-radius: 6px`, shadow `0 20px 60px rgba(0,0,0,.2)`, padding `clamp(30px, 6vw, 64px)`, `max-height: 80vh`, `overflow-y: auto` (scrollable letter).
- Body text color `#44403c`, font-size `clamp(17px, 2vw, 21px)`, `line-height: 2`.
- Salutation: italic, bold, centered, size `clamp(26px, 4vw, 38px)`, color `#57534e`: "Gửi tình yêu của em…"
- Paragraphs of Vietnamese letter text follow (see file for exact copy — preserve verbatim, do not alter wording).

## Interactions & Behavior
- Single `step` state variable (1 → 2 → 3), no back navigation currently implemented.
- Step 1 button and Step 2 envelope/button are the only interactive triggers; both are simple `onClick` state transitions (no animation library currently wired despite Framer Motion having been discussed — current implementation uses plain CSS transitions only).
- Envelope image hover: `transform: scale(1.05)` over `0.7s`.
- Buttons: background color hover transition `0.2s ease`.
- No loading, error, or form states — this is a static narrative flow.
- No explicit responsive breakpoint below 768px beyond fluid `vw`/`clamp()` sizing; test small phone widths.

## State Management
- `step: number` (1, 2, or 3) — the only piece of state.
- `goStep2()`: sets step to 2.
- `openEnvelope()`: sets step to 3.

## Design Tokens
- Colors: background photo (image), card `#FAF6F0`, card border `#e8dccb`, body text `#44403c`, salutation `#57534e`, header/date text `#57534e`, accent/button `#fb7185` (hover `#f43f5e`), page fallback background `#f4f1eb`.
- Typography: `'Cormorant Garamond', serif` throughout (weights 400/500/600, italic variants loaded from Google Fonts).
- Border radius: buttons `999px` (pill), card `6px`.
- Shadows: photos/envelope `0 20px 25px rgba(0,0,0,.35)`; buttons `0 10px 20px rgba(0,0,0,.15)`; letter card `0 20px 60px rgba(0,0,0,.2)`.
- Spacing: see per-screen notes above (gaps of 16/40/48px, button padding `12px 48px`, card padding `clamp(30px,6vw,64px)`).

## Assets
Included in `assets/`:
- `background.jpg` — full-viewport background photo (prop: `backgroundImage`)
- `photoA.jpg`, `photoB.jpg` — the two memory photos on Step 1 (props: `photoA`, `photoB`)
- `envelope.png` — the envelope image on Step 2 (prop: `envelopeImage`)

## Files
- `Love Letter.dc.html` — the full 3-step component (template + logic), single source of truth for this design.
- `assets/` — the image assets referenced above.

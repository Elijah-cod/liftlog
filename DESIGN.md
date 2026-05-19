---
name: LiftLog
description: A personal lifting journal for self-coached lifters.
colors:
  action-blue: "#2563eb"
  action-cyan: "#0ea5e9"
  accent-violet: "#8b5cf6"
  success-emerald: "#10b981"
  rest-amber: "#f59e0b"
  surface-page: "#f6f8ff"
  surface-card: "#ffffff"
  surface-tint: "#eff6ff"
  text-strong: "#0b1330"
  text-muted: "#55607a"
  border-soft: "#e2e8f0"
typography:
  display:
    fontFamily: "\"Avenir Next Condensed\", \"Trebuchet MS\", \"Avenir Next\", sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "\"Avenir Next\", \"Segoe UI\", \"Helvetica Neue\", sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: "\"Avenir Next\", \"Segoe UI\", \"Helvetica Neue\", sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "\"Avenir Next\", \"Segoe UI\", \"Helvetica Neue\", sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "\"Avenir Next\", \"Segoe UI\", \"Helvetica Neue\", sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.18em"
rounded:
  inner: "16px"
  tile: "22px"
  card: "28px"
  shell: "32px"
  pill: "9999px"
spacing:
  compact: "12px"
  standard: "16px"
  roomy: "20px"
  section: "24px"
  frame: "32px"
components:
  button-primary:
    backgroundColor: "{colors.action-blue}"
    textColor: "{colors.surface-card}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "16px 20px"
    height: "56px"
  button-secondary:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.action-blue}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "12px 16px"
  chip-status:
    backgroundColor: "{colors.surface-tint}"
    textColor: "{colors.action-blue}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
  card-elevated:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.text-strong}"
    rounded: "{rounded.card}"
    padding: "20px"
  input-search:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.text-strong}"
    rounded: "{rounded.inner}"
    padding: "12px 16px"
---

# Design System: LiftLog

## Overview

**Creative North Star: "The Personal Progress Journal"**

LiftLog should feel like a training notebook opened in clean daylight, a page you trust, a pace you can keep. It is not trying to psych the user up or impress them with performance theater. It should meet a self-coached lifter at working height: phone in hand, between sets, attention split, needing calm structure more than stimulation.

The system gets its warmth from pale page tones, soft halos, and rounded containers that feel more like protective sleeves than glossy cards. Blue carries action, emerald and amber explain state, and violet appears as a small note of optimism rather than spectacle. The atmosphere should feel like quiet forward motion: fresh, breathable, and gently disciplined.

This system explicitly rejects anything overbearing, macho, performative, hyper-gamified, bloated, clinical, or cold. If a screen feels like a challenge app, a supplement ad, an enterprise dashboard, or a medical intake form, it is off-brand.

**Key Characteristics:**
- Daylit surfaces with selective color energy.
- Rounded, hand-friendly controls sized for live use during a workout.
- Encouraging tone carried by clarity, not hype.
- Ambient depth that keeps the UI soft, breathable, and trustworthy.

## Colors

The palette is a bright training-day palette: clear blues for action, humane utility accents for state, and pale neutrals that keep the whole experience open and breathable.

### Primary
- **Action Blue** (`#2563eb`): the anchor call-to-action color. It leads primary buttons, key links, and the first note of the app's signature gradient.

### Secondary
- **Action Cyan** (`#0ea5e9`): the supportive action companion. It softens the primary blue, brightens information surfaces, and keeps energetic areas from feeling severe.

### Tertiary
- **Accent Violet** (`#8b5cf6`): the lift note. It appears at the edge of hero gradients, grouped exercise accents, and selected moments that need optimism rather than urgency.

### Neutral
- **Page Mist** (`#f6f8ff`): the default page field. It keeps the app airy and prevents white surfaces from feeling stark.
- **Card White** (`#ffffff`): the working surface for cards, sheets, chips, and action controls.
- **Tint Wash** (`#eff6ff`): the cool neutral used behind informative chips, preview stats, and supportive secondary actions.
- **Ink Slate** (`#0b1330`): the main text color for headings and decisive actions. It is dark, but still tinted away from black.
- **Breathing Slate** (`#55607a`): the secondary text color for supporting descriptions, labels, and quiet metadata.
- **Soft Border** (`#e2e8f0`): the default outline for cards, fields, and filters. It separates without hardening the interface.

### Support Accents
- **Progress Emerald** (`#10b981`): the success and completion signal. Use it for finished sessions, authenticated states, and healthy confirmation.
- **Rest Amber** (`#f59e0b`): the recovery and timing signal. Use it for rest timers, partial states, and caution without panic.

**The Encouragement-Not-Hype Rule.** Blue leads the product voice. Emerald and amber explain state, but they never take over a screen. If the palette starts feeling competitive, loud, or game-like, pull color back to Page Mist and Tint Wash.

## Typography

**Display Font:** Avenir Next Condensed, Trebuchet MS, Avenir Next, sans-serif
**Body Font:** Avenir Next, Segoe UI, Helvetica Neue, sans-serif
**Label/Mono Font:** Avenir Next, Segoe UI, Helvetica Neue, sans-serif

**Character:** The typography pairing is journal-like rather than editorial-theatrical. Condensed display type gives headings a firm spine, while the body font stays readable, quick, and familiar on a phone held between sets. The result should feel steady and practical, like a good training note written clearly the first time.

### Hierarchy
- **Display** (600, `2.25rem`, `1.1`): reserved for page titles and the main workout name. It should orient immediately, not advertise.
- **Headline** (600, `1.5rem`, `1.2`): used for card titles, session names, and important secondary headings.
- **Title** (600, `1.125rem`, `1.3`): used inside cards, summaries, and module headers where density increases.
- **Body** (400, `0.875rem`, `1.5`): the working copy size for instructions, summaries, and support text. Keep long copy constrained to readable blocks rather than wide paragraphs.
- **Label** (600, `0.75rem`, `0.18em` tracking): used for chips, filters, status words, and small metadata that needs quick scanning.

**The Journal Cover Rule.** Display type appears to anchor a screen, not to sell it. If a heading sounds like a campaign slogan, the typography is being asked to do the wrong job.

## Elevation

LiftLog uses ambient elevation. Surfaces float slightly above the page through diffuse blue-slate shadows, soft white rims, and translucent fills. Depth is there to make the interface feel kind and graspable, not glossy. If a shadow looks hard-edged, dark, or obviously decorative, it is wrong.

### Shadow Vocabulary
- **Shell Glow** (`0 24px 70px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.35), 0 0 40px rgba(96, 165, 250, 0.1)`): the outer app frame shadow. Use it for the primary mobile shell only.
- **Card Lift** (`0 16px 40px rgba(148, 163, 184, 0.12)`): the standard shadow for cards, history rows, and informational modules.
- **Action Lift** (`0 18px 40px rgba(59, 130, 246, 0.35)`): the stronger colored shadow under primary calls to action.
- **Badge Lift** (`0 10px 24px rgba(15, 23, 42, 0.18)`): the compact shadow for floating exercise tile badges and small circular controls.

**The Quiet Lift Rule.** Shadows must diffuse outward and disappear into the page. If the UI starts to look dense, metallic, or 2014-app glossy, the blur is too small and the opacity is too high.

## Components

### Buttons
Buttons are soft and supportive, but never weak.
- **Shape:** fully pill-shaped (`9999px`) with generous vertical padding for thumb use.
- **Primary:** a blue-cyan-violet gradient (`#2563eb` to `#0ea5e9` to `#8b5cf6`) on white text, usually at `56px` height with `16px 20px` padding.
- **Hover / Focus:** hover lifts by a small negative translate and slight brightness increase. Focus uses the cyan ring from the global focus treatment, not a heavy outline.
- **Secondary / Ghost:** white or near-white fills with a soft border (`#e2e8f0` or lighter) and blue text. They should feel available, not loud.

### Chips
Chips carry metadata and status with controlled color.
- **Style:** pill-shaped (`9999px`), compact, often uppercase, usually backed by a tinted gradient or pale wash rather than a flat saturated fill.
- **State:** active informational chips skew sky or violet, success chips skew emerald, and recovery or caution chips skew amber. Keep them small enough to read as labels, not banners.

### Cards / Containers
Cards are the main journal pages of the system.
- **Corner Style:** broad rounded corners, usually `28px`, with the outer shell at `32px`.
- **Background:** white or translucent white over a tinted page field.
- **Shadow Strategy:** default to Card Lift. Reserve Shell Glow for the app frame and Action Lift for decisive CTAs.
- **Border:** use soft pale borders, often with a white highlight edge in brighter zones.
- **Internal Padding:** most content blocks sit on `16px` or `20px` padding, with `24px` used for larger headers and sections.

### Inputs / Fields
Inputs are quiet tools, not heavy controls.
- **Style:** soft rectangle or capsule shapes, usually `16px` radius, white fill, pale border, and dark slate text.
- **Focus:** rely on the global cyan focus ring and keep the field body calm. Do not swap to harsh saturated borders.
- **Error / Disabled:** errors should use rose or amber sparingly around the message, not turn the whole form into an alarm state.

### Navigation
Navigation is lightweight and local.
- **Style:** text-led links for route changes and pill filters for in-page state changes.
- **States:** active filters invert to Ink Slate on white text, while inactive filters stay white with a soft border and muted text.
- **Mobile Treatment:** navigation should remain reachable with one hand, with no tiny hit areas or dense tabular menus in core workout flows.

### App Shell
The app shell frames the whole experience like a protected journal page.
- **Outer Frame:** a rounded mobile-first shell (`32px` to `36px`) with translucent white fill, soft white edging, and Shell Glow.
- **Inner Canvas:** a second rounded layer (`26px` to `28px`) with pale radial color blooms that keep the product from feeling flat.
- **Purpose:** it should make the app feel contained and dependable, not boxed in or ornamental.

### Feedback Panels
Feedback panels translate product state into quick emotional guidance.
- **Success / Completion:** pale emerald fills with readable dark text. They should feel reassuring, not celebratory to the point of pressure.
- **Warning / Recovery:** pale amber fills for rest, partial saves, and gentle caution. These should feel informative, never alarming.
- **Error:** pale rose is allowed for action failure, but only in short, contained panels. The product should never default to a hostile red atmosphere.

### Signature Component
The exercise media tile is the system's most distinctive custom component.
- **Style:** a rounded tile (`22px` outer, `16px` inner) with category-tinted gradients, soft blurred halos, and a floating circular icon badge.
- **Purpose:** it gives each exercise a quick visual identity without turning the product into a gamified character system.
- **Constraint:** the tile may feel lively, but it must still read as a training reference, not a collectible card.

## Do's and Don'ts

### Do:
- **Do** keep the primary action in a pill-shaped control (`9999px`) and reserve the blue-cyan-violet gradient for the single most important action in a pane.
- **Do** use Page Mist (`#f6f8ff`), Tint Wash (`#eff6ff`), emerald washes, and amber washes to explain state before introducing stronger saturation.
- **Do** keep labels short, uppercase only when they behave like metadata, and tracked around `0.16em` to `0.18em`.
- **Do** let shadows stay ambient and diffuse. The interface should feel cushioned, not carved.

### Don't:
- **Don't** make it overbearing. No alarm-red default states, no challenge-language theatrics, and no interface patterns that pressure the user into intensity.
- **Don't** use macho or performative gym cues. Black-metal palettes, grit textures, flame gradients, and bodybuilding-poster typography are prohibited.
- **Don't** drift into hyper-gamified habit pressure or bloated dashboard energy with trophy counts, streak worship, or walls of metric cards.
- **Don't** make it clinical or cold. If a screen feels like medical intake software or enterprise admin UI, the color warmth and rounded softness are wrong.

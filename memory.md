# Memory — HH Goa 2026 Builder Identity Studio

> **Purpose**: This file captures all critical decisions, patterns, constraints, and lessons learned during development. Read this FIRST before making any changes to the codebase.

---

## 🧠 Project Identity

- **App Name**: HH Goa 2026 — Builder Identity Studio
- **Package Name**: `hh-goa-frame-generator`
- **Repo**: `AnkitKhatkar5112/HH-Goa-Id-card-generator`
- **Live Reference**: The official site is [hhgoa.com](https://hhgoa.com)
- **Competitor**: [hh-goa-2026-builder-one.vercel.app](https://hh-goa-2026-builder-one.vercel.app/)
- **Theme**: Hacker House Goa 2026, "Cinematic Brutalist Tropics" — Gen-Z vibe, immersive, interactive

---

## 🎨 Design Decisions (LOCKED — Do Not Change)

### Color Palette
These colors come from the official [hhgoa.com](https://hhgoa.com) branding and MUST NOT be changed:

| Token | Hex | Role |
|---|---|---|
| Deep Forest Green | `#0F3D2E` | Primary background |
| Sunshine Yellow | `#F5D300` | Headlines, CTAs, primary accent |
| Neon Sunset Pink | `#FF2E93` | Secondary accent, tags, highlights |
| Ink Dark Green | `#0B2A1F` | Deep card backgrounds |
| Off-White | `#F7F5EF` | Body text |
| Sea Teal | `#2e9c6c` | Status indicators, live badges |

### Typography (LOCKED)
- **Display**: `Anton` — massive hero text (13vw), all-caps, film poster style
- **Devanagari**: `Noto Sans Devanagari` — "गोवा" accent in pink
- **Body**: `Space Grotesk` — clean, modern body text
- **Mono**: `JetBrains Mono` — labels, tech text, buttons, all-caps with letter-spacing

### Design Aesthetic
- **NOT minimalist** — rich, cinematic, layered textures
- **NOT flat** — uses grain, halftone, gradients, parallax depth
- **NOT colorful** — strictly uses the 6-color palette above
- **Cinematic film grain** — SVG turbulence overlay
- **Editorial print** — halftone dot patterns, crop marks, registration marks
- **Brutalist typography** — massive filled + outline stroke display text
- **Gen-Z interactive** — sound effects, vibe pads, CRT toggle, confetti, live elements

### What We Have That Competitor Doesn't
This is our competitive advantage — **preserve these features**:
1. Web Audio API synthesizer (click, stamp, chime sounds)
2. Slot-machine random builder title generator
3. Vibe soundboard pads (Beach Waves, Coconut Hack, etc.)
4. CRT scanline toggle
5. Photo filters (none, cyber, sunset, matrix, b&w)
6. Badge stamps (6 options)
7. Live simulated builder radar terminal feed
8. Confetti celebration on download
9. Dynamic live clock in branding (ticks every 5s)
10. Scroll-triggered reveal animations
11. Full mobile studio experience

---

## 🏗️ Architecture Rules

### Stack
- **Next.js 16.3** (App Router, Turbopack)
- **React 19.2** (strict purity rules!)
- **TypeScript 5.x**
- **Vanilla CSS** — single `globals.css`, no Tailwind, no CSS modules
- **No external state management** — all state in `page.tsx` via `useState`
- **No backend** — 100% client-side, no API routes, no database

### File Organization
```
app/
├── page.tsx              # Main page — ALL state lives here
├── layout.tsx            # Root layout + SEO metadata
├── globals.css           # Complete design system
├── components/           # UI components (all "use client")
├── hooks/                # Custom React hooks
├── lib/                  # Pure utility functions
└── share/[id]/page.tsx   # Dynamic OG share route
```

### State Flow
```
page.tsx (state owner)
  ├── passes state DOWN to components via props
  ├── passes callbacks DOWN for user actions
  └── components NEVER manage shared state
```

---

## ⚠️ Critical Constraints (WILL BREAK IF IGNORED)

### 1. React 19 Render Purity
**NEVER** use `Math.random()` in component body, render, or `useRef` initializer.
```tsx
// ❌ WRONG — causes lint error "Cannot call impure function during render"
const data = useRef(Array.from({ length: 20 }, () => Math.random()));

// ✅ CORRECT — lazy initializer runs once, satisfies purity
const [data] = useState(() => generateDeterministicData());
```

### 2. React 19 Ref Access
**NEVER** access `.current` on a ref during render return.
```tsx
// ❌ WRONG — "Cannot access refs during render"
const items = useRef([...]).current;
return <>{items.map(...)}</>

// ✅ CORRECT — use state
const [items] = useState(() => [...]);
return <>{items.map(...)}</>
```

### 3. Section-Level Reveal Classes
**NEVER** put `.reveal` on `<section>` wrapper elements. It hides the entire section with `opacity: 0` if the Intersection Observer doesn't trigger fast enough.
```tsx
// ❌ WRONG — entire section hidden
<section className="hype reveal">

// ✅ CORRECT — individual elements reveal
<section className="hype">
  <h2 className="reveal">CHECK</h2>
  <div className="reveal" data-reveal-delay="150">...</div>
```

### 4. Canvas Size
The canvas renderer outputs at **1080px wide** for high-res. Do not reduce this — it's the minimum for crisp social media sharing.

### 5. No Tailwind
The project uses vanilla CSS with CSS custom properties. Do NOT install or add Tailwind CSS. The entire design system is in `globals.css`.

### 6. Font Loading
Fonts load via `@import url(...)` in `globals.css`. The `Anton` font is **critical** for the hero section. If Google Fonts is unreachable, the entire hero looks broken. Consider adding a fallback like `'Archivo Black'`.

### 7. HEIC Images
iPhone photos in HEIC format are handled by the `heic-to` npm package in `imageUtils.ts`. This conversion is async and can be slow for large files — the shimmer loading state handles this UX.

---

## 📄 Page Sections (Top to Bottom)

| Order | Section | Component | Has `.reveal`? |
|---|---|---|---|
| 1 | Sticky Nav | inline in `page.tsx` | No |
| 2 | Hero (100vh) | `HeroSection.tsx` | No (always visible) |
| 3 | Hype | `HypeSection.tsx` | Yes (on inner elements) |
| 4 | Process | `ProcessSection.tsx` | Yes (on step cards) |
| 5 | Generator Studio | inline in `page.tsx` | Yes (on header + tabs) |
| 6 | 4-Day Rhythm | `TimelineAgenda.tsx` | No |
| 7 | Live Radar | `LiveBuilderRadar.tsx` | No |
| 8 | Footer | inline in `page.tsx` | No |

**Removed sections**: FAQ was removed by user request. The `FaqSection.tsx` file still exists but is NOT imported anywhere.

---

## 🎭 CSS Pattern Quick Reference

### Adding a New Section
```css
.my-section {
  padding: 100px var(--edge) 110px;
  border-top: 1px solid rgba(243, 236, 216, 0.12);
  max-width: 1440px;
  margin: 0 auto;
}
```

### Adding a New Card
```css
.my-card {
  background: rgba(243, 236, 216, 0.02);
  border: 1px solid rgba(243, 236, 216, 0.12);
  padding: var(--space-5);
  transition: border-color 0.35s ease, transform 0.35s var(--ease-cinematic);
}
.my-card:hover {
  border-color: var(--pink-neon);
  transform: translateY(-6px);
}
```

### Adding a New Button (Cinematic Wipe)
Use the `.btn-cinematic` class. Variants: `--primary`, `--ghost`, `--lg`.

### Adding Scroll Reveal to a New Element
```tsx
<div className="reveal" data-reveal-delay="200">
  {/* This fades in 200ms after entering viewport */}
</div>
```

---

## 🔊 Audio System

The audio system uses **Web Audio API oscillators** — no audio files are loaded. Three sounds:

| Function | Sound | Pattern |
|---|---|---|
| `playClickSound()` | Short tick | 800Hz→600Hz square wave, 50ms |
| `playStampSound()` | Thud | 200Hz→100Hz sawtooth, 100ms |
| `playSuccessChime()` | Celebration | C5→E5→G5 arpeggio, 300ms total |

Sound is **off by default** on first visit. Toggle state persisted to `localStorage` key `hh-goa-sound`.

---

## 🖼️ Canvas Rendering Engine

`frameRenderer.ts` is the core rendering engine. It uses Canvas 2D API with these key functions:

| Function | Output | Size |
|---|---|---|
| `renderFrame(canvas, img, filter, badge)` | PFP frame | 1080×1080 |
| `renderIdCard(canvas, img, name, stack, title, filter, badge)` | Builder ID pass | 1080×1350 |
| `renderTeamFrame(canvas, imgs, filter, badge)` | Team poster | 1080×1350 |

The renderer draws in this order:
1. Background fill (`#0B2A1F`)
2. User photo (with filter applied)
3. Frame overlay (borders, corner decorations)
4. Text labels (name, stack, title)
5. Badge stamp
6. Branding (HH GOA 2026, date, hashtag)
7. QR code (for ID card mode)

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Push to GitHub → connect repo to Vercel → auto-deploys
```

### Manual Build
```bash
npm run build   # Outputs to .next/
npm start       # Serves production build on port 3000
```

### Environment
- No environment variables needed
- No API keys required
- No database connection
- All assets embedded or loaded from Google Fonts CDN

---

## 📝 User Requirements History

1. **Original**: Simple ID card generator
2. **Redesign v1**: Match [hhgoa.com](https://hhgoa.com) structure — Hero, Hype, Agenda, Radar, FAQ
3. **Redesign v2**: Outclass competitor ([hh-goa-2026-builder-one.vercel.app](https://hh-goa-2026-builder-one.vercel.app/)) with cinematic quality while keeping interactive advantages
4. **User removed**: FAQ section (don't add it back)
5. **User removed**: Official event information section (replaced with creative content)
6. **User wants**: "Full Gen-Z vibe" — interactive, immersive, not static/corporate
7. **User wants**: Builder ID generation as primary CTA (not "Apply Now")

---

## 🧹 Cleanup TODOs (Optional)

- [ ] Delete unused `FaqSection.tsx` file
- [ ] Add `<link rel="preconnect">` for Google Fonts in `layout.tsx` for faster font loading
- [ ] Consider adding fallback font stack for Anton (`'Archivo Black', Impact, sans-serif`)
- [ ] Add OG image generation for `/share/[id]` route
- [ ] Consider adding confetti library for more dramatic download celebration

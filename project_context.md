# Project Context — HH Goa 2026 Builder Identity Studio

> This document provides full architectural and design context for any developer or AI agent working on this project.

## 1. What This Project Is

A **single-page web application** for Hacker House Goa 2026 that generates three types of branded graphics:

1. **Builder ID Pass** (1080×1350, 4:5) — Full identity card with photo, name, tech stack, builder title, QR code
2. **PFP Frame** (1080×1080, 1:1) — Square profile picture with branded frame overlay
3. **Team Squad Frame** (1080×1350, 4:5) — Multi-photo team poster (up to 4 members)

Everything runs **client-side only** — no backend, no image uploads to servers, no authentication.

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.3.0 |
| UI Library | React | 19.2.8 |
| Language | TypeScript | 5.x |
| Styling | Vanilla CSS (single `globals.css`) | — |
| Image Cropping | react-easy-crop | 5.2.0 |
| HEIC Conversion | heic-to | 1.1.0 |
| Canvas Rendering | HTML5 Canvas API | Native |
| Audio | Web Audio API | Native |

### Important Constraints

- **React 19**: Uses new strict mode rules — no impure functions (`Math.random()`) during render, no ref access during render. Use `useState(() => ...)` lazy initializers instead.
- **Next.js 16**: App Router only. Read docs at `node_modules/next/dist/docs/` before adding new features.
- **No Tailwind**: All styles are in `app/globals.css` using CSS custom properties. Do NOT add Tailwind.
- **Client Components**: All interactive components use `"use client"` directive.

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    page.tsx                          │
│         (Main orchestrator, all state lives here)    │
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐│
│  │ HeroSection │  │ HypeSection │  │ProcessSection││
│  │ (parallax,  │  │ (stats, CTA)│  │(4-step guide)││
│  │  typography)│  │             │  │              ││
│  └─────────────┘  └─────────────┘  └──────────────┘│
│                                                     │
│  ┌──────────────── GENERATOR STUDIO ──────────────┐ │
│  │                                                │ │
│  │  UploadZone → PhotoCropper → IdCardForm       │ │
│  │              → FilterStickerControls            │ │
│  │              → FramePreview (canvas + export)   │ │
│  │                                                │ │
│  └────────────────────────────────────────────────┘ │
│                                                     │
│  ┌──────────────┐  ┌──────────────────────────────┐ │
│  │TimelineAgenda│  │    LiveBuilderRadar          │ │
│  │(4-day rhythm)│  │(terminal feed + vibe pads)   │ │
│  └──────────────┘  └──────────────────────────────┘ │
│                                                     │
│  ┌─────────────────── Footer ────────────────────┐  │
└─────────────────────────────────────────────────────┘
```

### State Management

All state lives in `page.tsx` using React `useState`. No external state library. Key state:

| State | Type | Purpose |
|---|---|---|
| `mode` | `"frame" \| "card" \| "team"` | Active output format |
| `step` | `"upload" \| "studio"` | Current workflow step |
| `imageSrcs` | `string[]` | Object URLs for uploaded images |
| `filter` | `PhotoFilter` | Active photo filter |
| `badge` | `string` | Active badge stamp |
| `name`, `stack`, `builderTitle` | `string` | ID card form fields |
| `soundOn`, `scanlinesOn` | `boolean` | Audio/CRT toggles |
| `liveTimeStudio` | `string` | Dynamic clock string |

### Rendering Pipeline

```
User Photo → imageUtils.processUploadedFile()
           → (optional) PhotoCropper via getCroppedImg()
           → frameRenderer.renderFrame() / renderIdCard() / renderTeamFrame()
           → Canvas element → Download as PNG / Share to X
```

## 4. File-by-File Reference

### Core Files

| File | Purpose | Key Exports |
|---|---|---|
| `app/page.tsx` | Main page, all state, section assembly | `Home` component |
| `app/layout.tsx` | Root layout, SEO metadata, viewport config | `RootLayout`, `metadata` |
| `app/globals.css` | Complete design system (~1200 lines) | All CSS classes |

### Components (`app/components/`)

| File | Purpose | Props |
|---|---|---|
| `HeroSection.tsx` | Full-viewport cinematic hero with parallax grid, floating pixels, diagonal scan lines, massive HACKER/HOUSE typography, गोवा Devanagari accent | `onCreateClick`, `onHypeClick` |
| `HypeSection.tsx` | CHECK/HYPE typography flanking poster frame, stats ticker, Builder ID CTA | `onGenerateClick` |
| `ProcessSection.tsx` | 4-step "Build Your Identity" guide with SVG icons and halftone backgrounds | — |
| `UploadZone.tsx` | Drag-and-drop file upload with scanner animation, sample avatar buttons | `onFilesSelected`, `multiple` |
| `PhotoCropper.tsx` | Image positioning/zoom using react-easy-crop | `imageSrc`, `aspect`, `cropShape`, `onCropComplete`, `onDone` |
| `IdCardForm.tsx` | Name input, stack pill selector, slot-machine builder title | `name`, `setName`, `stack`, `setStack`, `builderTitle`, `setBuilderTitle` |
| `FilterStickerControls.tsx` | Photo filter chips + badge stamp chips | `filter`, `setFilter`, `badge`, `setBadge` |
| `FramePreview.tsx` | Live canvas preview, fullscreen modal, download button, share-to-X | `imageSrcs`, `mode`, `name`, `stack`, `builderTitle`, `filter`, `badge` |
| `TimelineAgenda.tsx` | 4-day event schedule (Genesis → Triangle → Build → Launch) + 5-step timeline roadmap | — |
| `LiveBuilderRadar.tsx` | Simulated live terminal feed of builder activity + 4 vibe soundboard pads + signal meter + CTA | `onGenerateClick` |
| `FaqSection.tsx` | ⚠️ **UNUSED** — was removed from page.tsx but file still exists | — |

### Lib (`app/lib/`)

| File | Purpose | Key Exports |
|---|---|---|
| `frameRenderer.ts` | Canvas compositing engine. Draws all three output types with photo filters, badges, QR codes, and branded overlays | `renderFrame()`, `renderIdCard()`, `renderTeamFrame()`, `getLiveTimeStudioString()`, `PhotoFilter` type |
| `imageUtils.ts` | HEIC→PNG conversion, image loading, canvas cropping | `processUploadedFile()`, `loadImage()`, `getCroppedImg()` |
| `audioUtils.ts` | Web Audio API synthesizer (oscillator-based, no audio files) | `playClickSound()`, `playStampSound()`, `playSuccessChime()`, `isSoundEnabled()`, `setSoundEnabled()` |
| `builderTitles.ts` | Random builder title generator pool (slot-machine style) | `getRandomBuilderTitle()`, `TITLE_PREFIXES`, `TITLE_SUFFIXES` |
| `shareUtils.ts` | Share-to-X URL generation with pre-filled tweet text | `generateShareUrl()` |

### Hooks (`app/hooks/`)

| File | Purpose |
|---|---|
| `useScrollReveal.ts` | Intersection Observer + MutationObserver for scroll-triggered `.reveal → .reveal--visible` animations |

### Routes

| Route | Type | Purpose |
|---|---|---|
| `/` | Static | Main landing page + generator studio |
| `/share/[id]` | Dynamic | OG share page for generated images |

## 5. Design System

### Color Palette (MUST USE THESE EXACT COLORS)

```css
--bg-forest:      #0F3D2E;   /* Primary background */
--yellow-primary: #F5D300;   /* Headlines, CTAs, active states */
--pink-neon:      #FF2E93;   /* Secondary accent, tags, highlights */
--ink-dark:       #0B2A1F;   /* Deep background, card fills */
--off-white:      #F7F5EF;   /* Body text */
--off-white-dim:  #d3c9ad;   /* Muted text */
--sea-teal:       #2e9c6c;   /* Status indicators, live dots */
```

### Typography

```css
--font-display:    'Anton'                /* Hero headings, display text */
--font-devanagari: 'Noto Sans Devanagari' /* गोवा accent */
--font-body:       'Space Grotesk'        /* Body text, descriptions */
--font-mono:       'JetBrains Mono'       /* Labels, code, tech text */
```

### Visual Effects (CSS-only, no JS libraries)

| Effect | Implementation |
|---|---|
| Film Grain | SVG `feTurbulence` noise in fixed overlay, `mix-blend-mode: overlay`, 4.5% opacity |
| Halftone Dots | `radial-gradient` with `mask-image` for regional masking |
| Grid Drift | CSS background-image grid with `@keyframes grid-drift` (30s linear infinite) |
| Floating Pixels | Deterministic PRNG → positioned `<span>` elements with `@keyframes pixel-flicker` |
| Wipe-Fill Buttons | `::before` pseudo-element with `translateX(-101%)` → `translateX(0)` on hover |
| Scan Lines | Diagonal SVG `<line>` with `stroke-dasharray` animation |
| Crop Marks | `::before`/`::after` pseudo-elements with border corners |
| CRT Scanlines | `linear-gradient` at 4px size, fixed overlay, toggled via `.scanlines-active` |

### CSS Class Naming Convention

- **BEM-inspired**: `.component__element--modifier`
- **Section headers**: `.section-header`, `.section-header__tag`, `.section-header__title`
- **Buttons**: `.btn`, `.btn--primary`, `.btn--ghost`, `.btn-cinematic`, `.btn-cinematic--primary`
- **Cards**: `.studio-card`, `.agenda-card`, `.radar-card`
- **Reveals**: `.reveal` → `.reveal--visible` (triggered by Intersection Observer)
- **Utility**: `.tech-label`, `.status-dot`, `.meta-label`, `.crop-mark`

## 6. Competitor Context

The main competitor is [hh-goa-2026-builder-one.vercel.app](https://hh-goa-2026-builder-one.vercel.app/).

### What they have that we matched:
- Massive Anton display typography (HACKER filled, HOUSE outline stroke)
- गोवा Devanagari accent in pink
- SVG grain overlay, halftone dot patterns
- Corner crop marks / registration marks
- Clean mono-spaced info panels at hero edges
- Wipe-fill button hover animations
- Cinematic easing (`cubic-bezier(.16, 1, .3, 1)`)

### What we have that they DON'T:
- Web Audio API sound effects (synthesizer, no audio files)
- Slot-machine random builder title generator
- Vibe soundboard pads
- CRT scanline toggle
- Photo filters (cyber, sunset, matrix, b&w)
- Badge stamps
- Live builder radar terminal feed
- Confetti on download
- Dynamic live clock (theirs is static)
- Scroll-triggered reveal animations
- Full mobile studio experience

## 7. Common Gotchas

1. **React 19 Purity**: Never use `Math.random()` in component body or render. Use `useState(() => generateData())` lazy initializers.
2. **No useRef for render data**: Don't use `useRef` to store data accessed during render. Use `useState` instead.
3. **Section-level reveals**: Don't put `.reveal` on section wrapper `<section>` elements — it hides the entire section if the observer doesn't fire. Put `.reveal` only on individual cards/elements inside.
4. **Canvas rendering**: All image compositing happens in `frameRenderer.ts` using Canvas 2D API. The canvas is 1080px wide for high-res output.
5. **HEIC handling**: iPhone HEIC photos are auto-converted via `heic-to` library before processing.
6. **Sound toggle**: Persisted to `localStorage` via `audioUtils.ts`. Sound off by default on first visit.
7. **Fonts**: Loaded via Google Fonts CDN in `globals.css` `@import`. Anton is critical for the hero — if it fails to load, the hero looks wrong.

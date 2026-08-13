# HH Goa 2026 — Builder Identity Studio

> **Cinematic Brutalist Tropics** — A full-featured Builder ID card, PFP frame, and team poster generator for Hacker House Goa 2026.

![Hero](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square) ![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square)

## What Is This?

A cinematic, Gen-Z themed web app that lets builders create their **HH Goa 2026** identity. Upload a photo → customize with name, role, filters, and stamps → generate a high-res 1080p canvas graphic → download or share directly to X.

### Three Output Modes

| Mode | Output | Resolution |
|---|---|---|
| 🪪 **Builder ID Pass** | Full identity card with name, stack, builder title, QR code | 1080×1350 (4:5) |
| 🖼️ **PFP Frame** | Square profile picture with HH Goa branded frame overlay | 1080×1080 (1:1) |
| 👥 **Team Squad Frame** | Multi-photo team poster with up to 4 members | 1080×1350 (4:5) |

## Tech Stack

- **Framework**: Next.js 16.3 (App Router, Turbopack)
- **UI**: React 19.2, Vanilla CSS (Cinematic Brutalist design system)
- **Canvas Engine**: HTML5 Canvas API for all image compositing
- **Audio**: Web Audio API synthesizer for UI sound effects
- **Image Processing**: `react-easy-crop` for positioning, `heic-to` for HEIC conversion
- **Fonts**: Bodoni Moda (display), Space Grotesk (sans-serif), VT323 (monospace), Noto Sans Devanagari (accent)

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server (Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
app/
├── page.tsx                    # Main landing page (orchestrates all sections)
├── layout.tsx                  # Root layout with SEO metadata
├── globals.css                 # Complete cinematic design system (~1200 lines)
├── components/
│   ├── HeroSection.tsx         # Full-viewport hero with parallax & floating pixels
│   ├── HypeSection.tsx         # Cinematic CHECK/HYPE section with stats
│   ├── ProcessSection.tsx      # 4-step "Build Your Identity" guide
│   ├── UploadZone.tsx          # Drag-and-drop upload with scanner animation
│   ├── PhotoCropper.tsx        # Image positioning with react-easy-crop
│   ├── IdCardForm.tsx          # Name, stack, builder title form
│   ├── FilterStickerControls.tsx # Photo filters & badge stamp selector
│   ├── FramePreview.tsx        # Live canvas preview + download/share actions
│   ├── TimelineAgenda.tsx      # 4-day event schedule + timeline roadmap
│   └── LiveBuilderRadar.tsx    # Live terminal feed + vibe soundboard
├── hooks/
│   └── useScrollReveal.ts      # Intersection Observer for scroll animations
├── lib/
│   ├── frameRenderer.ts        # Canvas compositing engine (core rendering)
│   ├── imageUtils.ts           # HEIC conversion, image loading, cropping
│   ├── audioUtils.ts           # Web Audio API synthesizer (click, stamp, chime)
│   ├── builderTitles.ts        # Random builder title generator (slot machine)
│   └── shareUtils.ts           # Share-to-X link generation
└── share/[id]/page.tsx         # Dynamic OG share page
```

## Design System

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--bg-forest` | `#0F3D2E` | Primary background |
| `--yellow-primary` | `#F5D300` | Headings, CTAs, accents |
| `--pink-neon` | `#FF2E93` | Secondary accent, tags |
| `--ink-dark` | `#0B2A1F` | Deep background, card fills |
| `--off-white` | `#F7F5EF` | Body text |
| `--sea-teal` | `#2e9c6c` | Status indicators |

### Visual Effects

- **Film Grain**: SVG `feTurbulence` noise overlay at 4.5% opacity
- **Halftone Dots**: Radial gradient dot patterns masked to regions
- **Animated Grid Drift**: Background grid scrolling upward on 30s loop
- **Floating Pixels**: Deterministic PRNG-seeded flickering dots
- **Topographic Maps**: Procedurally generated math-based topographical glowing contours in the background
- **Asymmetric Typography**: Massive rotated text elements, heavy strokes, and neon-brutalist custom wordmarks
- **Goan Motifs**: Dense background scatter patterns using the Goa Hindi glyph

## Key Features

- ✅ Client-side only — no server uploads, no login required
- ✅ HEIC auto-conversion for iPhone photos
- ✅ Real-time canvas preview with live updates
- ✅ Photo cropping and zoom with react-easy-crop
- ✅ 5 photo filters (none, cyber, sunset, matrix, b&w)
- ✅ 6 badge stamps (Susegad, 0xGOA, Builder, etc.)
- ✅ Team Squad mode with dynamic multi-photo layout and Team Name input
- ✅ High-end Canvas compositing (Custom stroke wordmarks, drop shadows, polaroid layouts)
- ✅ Share-to-X with pre-filled tweet text
- ✅ Confetti celebration on download
- ✅ Scroll-triggered reveal animations
- ✅ Mouse-follow parallax on hero
- ✅ Dynamic live clock in branding (SSR Hydration safe)
- ✅ Fully responsive (mobile-first)

## License

Private — HH Goa 2026

# ACM Student Chapter Website (Shiv Nadar University)

## Overview
This repository contains the source code for the official website of the ACM Student Chapter at Shiv Nadar University.

The design takes inspiration from "Milady Anti Protocol" - a highly stylized, Web3-adjacent, retro 8-bit/16-bit pixel-art video game aesthetic. It acts more like an interactive "game world" built with web technologies rather than a standard corporate website.

## Architecture
This project is built using a modern MERN stack architecture, organized to be scalable to frameworks like Next.js in the future.
- **Frontend:** React (Vite).
- **Backend:** Node.js / Express (Setup in progress).

## Design Philosophy & Aesthetics
To achieve the distinct retro pixel-art aesthetic without blurry rendering, we follow several core pillars:
1. **Custom Graphic Assets:** Hand-crafted or AI-generated pixel art (sprites, backgrounds, tech hardware) scaled properly.
2. **CSS Pixelation:** Use of `image-rendering: pixelated;` to preserve the hard edges of small pixel-art graphics.
3. **Typography:** Authentic 8-bit/16-bit blocky fonts (e.g., *Press Start 2P*, *VT323*).
4. **Brutalist UI Elements:** Hard, offset drop shadows and thick, solid borders.
5. **Movement & Animation:** CSS `@keyframes` for floating elements and `steps()` for sprite sheet frame-by-frame animations. Complex scroll-based animations will be driven by GSAP (GreenSock Animation Platform) or Framer Motion.

## Theming & Re-Skinning
We adapted a "Crypto Raid" aesthetic into a university Computer Science theme:
- **Hero Section:** A retro-futuristic Gateway Terminal or massive Silicon Core.
- **Raid Dungeon:** "Conquer the Code Dungeon" (hackathons and coding events).
- **NFT Grid:** "Meet Our Hackers" / "The Core Committers" (team roster).
- **Fighters/Classes:** "Tech Stack Specialties" / "Our Committees" (e.g., Web Dev, Competitive Programming).

## Development Workflow
1. **Design Static in Figma:** Organize assets, typography, and hex codes (Primary background: `#0d071d`).
2. **Static Structure:** Code the HTML/React components and Tailwind CSS first, establishing the responsive grid.
3. **Animation (GSAP/Framer Motion):** Implement JS-driven interactive timelines and scroll triggers.

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Setup

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
npm install
# npm run dev (Once configured)
```

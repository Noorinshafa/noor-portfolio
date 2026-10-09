# A Little World of Noor

> **Where code meets creativity.** The portfolio of Noor, frontend developer & creative digital artist.
> React + Vite, with a hand-built WebGL 3D world (no 3D library needed).

The hero is Noor's own animated 3D character standing on a floating island of lavender.
When she opens her laptop, a light ring and sparkles burst from it. React and Claude float beside
her head, while HTML, CSS, JS, Vite, GitHub, Git and three little code cards orbit below her shoulders,
passing in front of and behind her with real depth. Tiles glow and lift when the cursor comes near,
and little motes drift up from the screen while she types.

Right after the hero, **A little tour** shows Noor sitting cross-legged (her second animation). Her speech
bubble types out what each part of the portfolio contains; hover or focus a stop and she explains it,
click it to go there. A soft sparkle trail follows the mouse on desktop.

Between **Creative Corner** and **A Little Bit of Everything That Makes Me, Me** there's a short **interlude**: "Every idea starts with a little click." Noor uncrosses her arms and taps a floating run tile, which turns into a Git tile. It loops seamlessly.

In **About me**, Noor stands with her arms crossed in front of a glowing arch (her third animation, with the camera slowly circling her), surrounded by sticky notes, doodles and a small polaroid of her character (or your real photo, once added). The camera follows the cursor, and visitors can replay it
with **Watch my laptop again ↺**.

How it works: the character animation is stored as a normal video whose top half is the colour
and bottom half is an alpha matte (made with `scripts/make-hero-video.py`). A small WebGL2 renderer
removes the background in real time and draws the island, tiles, light rays and particles around her.
This works in every modern browser (VP9 WebM with an H.264 MP4 fallback), with no 3D library.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview
```

Node 18+ (20/22 recommended). Runtime dependencies: just `react` and `react-dom`.

## Deploy (Vercel)

1. Push to GitHub → Vercel → **Add New → Project** → import (preset: **Vite**).
2. Add the env variable `VITE_FORM_ENDPOINT` (see "Contact form").
3. Replace `https://noor-portfolio.vercel.app` with your domain in `index.html`, `public/robots.txt`, `public/sitemap.xml`.

## Make it yours: checklist

All content lives in **`src/data/`**. Empty values are hidden automatically, so visitors never see placeholder text.

| What | Where |
|---|---|
| Email, LinkedIn, GitHub, résumé | `src/data/site.js` |
| A real photo (optional; your character shows until then) | `src/assets/images/` → import in `site.js` → `portrait` |
| Project screenshots (desktop + mobile) | `src/assets/projects/` → import in `src/data/projects.js` → `image`, `mobileImage`, `gallery` |
| Confirm each project's stack & ShopCalmCanvas integrations | `stack`, `integrations` in `projects.js` |
| Objective / design approach / challenges for case studies | `projects.js` (shown only when filled) |
| Your other 3+ projects | copy the template at the bottom of `projects.js` |
| Tools you've confirmed using in a project | `usedIn: ['shopcalmcanvas']` in `src/data/skills.js` |
| Your Photoshop/Canva work, writing, animations | `src/data/creative.js` |
| Journey dates (optional) | `src/data/journey.js` |

### Contact form
The form validates input and posts JSON to a form service. Until one is connected the Send button stays
disabled with an honest note. It never pretends to send.

1. Create a free form at **Formspree** (or Web3Forms / Getform).
2. Copy `.env.example` → `.env`, set `VITE_FORM_ENDPOINT=https://formspree.io/f/xxxxxxx`.
3. Add the same variable in Vercel.

If you only set `email` in `site.js`, the form opens the visitor's email app instead.

## Structure

```
src/
  assets/images/      noor-cutout.webp (fallback still), noor-character-portrait.webp (About polaroid)
  assets/video/       noor-hero.*, noor-sitting.*, noor-standing.*, noor-presenting.* (colour + alpha matte, stacked; WebM + MP4)
  components/
    world/            HeroScene.js (WebGL), HeroWorld.jsx, techItems.js, videoMeta.js, props.js (island & flowers), CharacterImage.jsx (fallback)
    playground/       PlayCanvas.jsx: the 2D "little creative world" toy (lazy-loaded)
    animations/       Reveal, ScrollSpark (the flower that follows your scroll)
    navigation/       Navbar + mobile menu, wordmark
    sections/         Hero, About, Journey, Skills, Projects, Creative, Mind, Approach, Playground, Contact
    layout/           Footer
    ui/               Button, Icon, SectionHeading, TiltCard, ProjectPreview
  data/               site, skills, projects, journey, creative
  hooks/              useInView, useActiveSection, useScrolled, useReducedMotion, useHashRoute
  pages/              CaseStudy (accessible dialog at #/work/<slug>)
  styles/             tokens, base, ui, sections
```

### Tweaking the hero
- Which tools fly out, and their colours: `TECH` and `SNIPPETS` in `src/components/world/techItems.js` (`featured: true` gives a tile a spot beside her head)
- What sitting Noor says in the tour: `tour` in `src/data/site.js`
- When the burst happens / loop points: `src/components/world/videoMeta.js`
- Orbits, camera, light rays: `src/components/world/HeroScene.js`
- New animation? Run `python scripts/make-hero-video.py your-video.mp4 isnet-general-use.onnx` and update `videoMeta.js`.

## Quality notes
- **Performance:** the hero scene and playground are separate chunks; the hero video is ~0.4–0.75 MB. The scene and video
  pause when off-screen or the tab is hidden. Phones get fewer items and a lower pixel ratio. Under `prefers-reduced-motion`
  it shows one still typing frame with the tiles in place. Without WebGL2, a transparent still of Noor with CSS-floating tiles is shown.
- **Accessibility:** skip link, keyboard menus and tabs (arrow keys in Journey and Approach), focus trapping in dialogs,
  visible focus, labelled form with clear errors, no hover-only content (skill notes open on tap/focus).
  The playground has buttons, keyboard controls, an off switch and a skip link.
- **SEO:** title/description, Open Graph & Twitter image (`public/og-image.jpg`), JSON-LD `Person`, canonical,
  manifest, `robots.txt`, `sitemap.xml`, case studies at `#/work/<slug>`.
- **Honesty:** no invented clients, dates, ratings or results. Training tools are marked as such; project usage only when you confirm it.

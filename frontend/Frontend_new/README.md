# Montage Graphics — modular React page (Vite)

The original single HTML file, split into a normal component tree and
wired up as a runnable Vite project.

```
index.html                Vite entry HTML (loads fonts, mounts #root)
package.json               scripts + dependencies
vite.config.js             Vite + React plugin config
src/
  main.jsx                 mounts <MontagePage /> into #root
  MontagePage.jsx           top-level page, composes everything below
  data.js                   all copy/content (client names, skills, reviews...)
  hooks/
    useExpandCard.js        state + handlers for the "card grows to fullscreen" interaction
  styles/
    montage.css             all styles, scoped under .montage-root
  components/
    Header.jsx
    Hero.jsx
    TrustedByReel.jsx        "Trusted by" marquee
    WorkCarousel.jsx         auto-scrolling recent-work cards
    ExpandOverlay.jsx        fullscreen overlay + close button shown on card click
    About.jsx
    Skills.jsx
    Platforms.jsx
    Reviews.jsx
    Footer.jsx
```

## Running it

You'll need [Node.js](https://nodejs.org) 18+ installed. Then, from this
folder:

```bash
npm install
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173`) — open it
in a browser. Changes to any file under `src/` hot-reload automatically.

Other scripts:

```bash
npm run build     # production build, output to dist/
npm run preview   # serve the production build locally to sanity-check it
```

## Fonts

The page uses **Archivo Black** (display) and **Inter** (body) from Google
Fonts. They're already linked in `index.html`'s `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link
  href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

They're loaded at the document level rather than inside a component, since
injecting `<link>` tags from deep in a component tree is generally something
you want to control once, in one place.

## Editing content

Everything text-based — client names, skill percentages, review quotes,
contact info, platform list — lives in `data.js`. Change it there; no need
to touch any component.

## The expand interaction

Clicking (or pressing Enter on) a work card in `WorkCarousel` calls
`onCardOpen`, which is wired to `openExpand` from the `useExpandCard` hook.
That hook:

1. Captures the clicked card's screen position (`getBoundingClientRect`).
2. Renders `ExpandOverlay` positioned exactly over the card.
3. On the next animation frame, expands it to fill the viewport — the CSS
   `transition` on `.expand-overlay` animates the growth.
4. Once the width transition ends, fades in the placeholder tile grid.

`closeExpand` reverses the visible state; the overlay itself unmounts.

# A6 "Cutting Room" port — public site

Replaces the old light "Exhibit" theme and the half-ported A6 CSS with the A6 dark design.

## What changed
- `src/styles/montage.css`: regenerated from `montage-A6-cutting-room.html`, every selector scoped under
  `.montage-root` (no leakage into admin). Spec/review overrides sit at the bottom of the file.
- `src/editBay.js`, `src/hooks/useEditBay.js`: the hero monitor + timeline engine, one rAF loop writing to the DOM
  (no per-frame React renders). Drives monitor scenes, timeline, phone chips/stats, nav REC dot colour (`--acc`) and timecode.
- Components rewritten to A6 markup: Header (fixed nav + drawer), Hero (+ monitor), SplitFlapWord, StudioTimeline,
  TrustedByReel, WorkCarousel, ExpandOverlay, About, Skills (layer stack), Platforms, Reviews, Footer, LoadingScreen.
- `index.html`: Fraunces / Inter / JetBrains Mono added (admin fonts kept).

## Review findings fixed
1. Desktop marquee used an undefined `@keyframes wcx` -> defined and tested.
2. Phone collection clipped by an old 70vh + mask rule -> one rule set per spec breakpoint.
3. Mobile drawer / hamburger / REC text were dark-on-dark -> A6 drawer, visibility-managed, Esc + scroll lock.
4. Header not sticky (position override) -> fixed nav, solid after 40px scroll.
5. Timeline used undefined CSS variables -> A6 tokens defined; tests fail on any undefined var() or missing keyframes.
6. Click after drag swallowed -> gesture state reset on pointerdown; logo images not draggable.
7. Cards popped in (transition:none) -> reveal uses `.in` + `--d` stagger.
8. Timeline ticked at 24 Hz via setState + window event, ignored reduced motion -> rAF engine, reduced-motion safe.
9. Hero word loop held a stale word list and leaked timers -> keyed on word count, cleaned up.
10. REC dot blink restored; duplicate clients fetch removed; marquee repeats short lists so it never shows a gap.
Also: overlay shows its set even when transitions are off (reduced motion), Esc closes it, scroll is locked,
masonry JS replaced by CSS columns (natural image ratios), sessionStorage guarded in the loader.

## Known limits
- Hero words from the admin should stay short (~8 characters); the line clips longer ones.
- Monitor scenes are sample "Nile Sessions" artwork (as in the mockup), not API data.
- Phone collection auto-scrolls vertically (as in the mockup), pauses on touch; with reduced motion it becomes a static stack. Tablet stays a draggable strip per spec.

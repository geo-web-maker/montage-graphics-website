# Skill logos

Drop your logo files into this folder using these exact filenames:

| Tool          | Filename            |
|---------------|---------------------|
| Photoshop     | photoshop.svg       |
| Illustrator   | illustrator.svg     |
| After Effects | after-effects.svg   |
| Cinema 4D     | cinema-4d.svg       |
| Figma         | figma.svg           |
| Canva         | canva.svg           |

Notes:

- SVG is recommended (crisp at any size), but PNG/JPG/WEBP work too — just
  update the extension in `LOGO_FILES` inside `Skills.jsx` to match
  whatever you actually add (e.g. `photoshop.png`).
- Only add files for tools you actually want to override — anything
  missing here just keeps showing the colored-initials fallback badge
  (Ps / Ai / Ae / C4 / Fi / Ca), so there's no broken state either way.
- Recommended source size: at least 128x128px, square, transparent
  background works best since the badge box already has its own
  background color behind it.
- `Skills.jsx` picks these up automatically via Vite's `import.meta.glob`
  — no code changes needed after you add a file, just restart the dev
  server if it doesn't hot-reload on its own.

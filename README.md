# portfolio
# Abdelrahman Ashraf Ahmed — Portfolio

Personal portfolio built with HTML5, CSS3 and vanilla JavaScript. No framework, no build step, no backend. Deploys to GitHub Pages as-is.

**Live:** https://abdelrahman-ashraf-da.github.io/portfolio/

---

## File structure

```
portfolio/
├── index.html                    Homepage
├── style.css                     All styles (14 ordered layers)
├── script.js                     Theme, nav, reveals, project rendering
├── README.md
├── .gitignore
├── .nojekyll                     Stops GitHub Pages running Jekyll
├── robots.txt
├── sitemap.xml
│
├── assets/
│   ├── data/
│   │   └── projects.js           Single source of truth for all projects
│   ├── images/
│   │   ├── profile/
│   │   │   └── profile.jpg       Add your photo here (4:5 ratio)
│   │   ├── og/
│   │   │   ├── og-cover.png      1200 × 630 social card
│   │   │   └── og-flightops.png
│   │   └── projects/
│   │       └── flightops-ai/
│   │           ├── streamlit-prediction.png
│   │           ├── pbi-cover.png
│   │           ├── pbi-overview.png
│   │           ├── pbi-delays.png
│   │           ├── pbi-performance.png
│   │           └── pbi-routes.png
│   ├── icons/
│   │   └── apple-touch-icon.png  180 × 180
│   └── cv/
│       └── Abdelrahman_Ashraf_Ahmed_CV.pdf
│
└── projects/
    ├── flightops-ai.html         Case study
    └── _template.html            Copy this for new case studies
```

Missing images and a missing CV do not break anything. Images fall back to a labelled placeholder; the resume button switches to an email link with a short note.

---

## Design system

**Colour** — dark by default, teal-cyan accent (`#3ECFB2` dark / `#0E8F79` light). Light mode is a separately designed warm-neutral paper theme, not an inversion. All tokens live in `:root` and `[data-theme="light"]` at the top of `style.css`. Never hard-code a colour; add a token.

**Typography** — Instrument Sans (headings), Inter (body), JetBrains Mono (labels, tags, all data figures). Fluid scale via `clamp()`.

**Spacing** — 4px base, `--s-1` through `--s-10`.

**Motion** — `IntersectionObserver` fade-up reveals, 150ms hover transitions. Fully bypassed under `prefers-reduced-motion`.

**Breakpoints** — 480 / 768 / 1024 / 1440, mobile-first `min-width` only.

---

## Adding a project

1. Open `assets/data/projects.js` and append an object:

```js
{
  slug: "my-new-project",
  title: "Project Title",
  category: ["Data Analytics"],
  summary: "One or two sentences.",
  tags: ["Python", "SQL"],
  result: "Optional headline figure",
  featured: false,
  status: "live",
  links: {
    caseStudy: "projects/my-new-project.html",
    github: "https://github.com/...",
    demo: null
  }
}
```

2. Copy `projects/_template.html` to `projects/my-new-project.html` and replace every `{{TOKEN}}`.
3. Add screenshots to `assets/images/projects/my-new-project/`.
4. Add the new URL to `sitemap.xml`.

That is all. `index.html`, `style.css` and `script.js` do not need touching.

**Notes on behaviour:**
- `featured: true` puts a project in the Featured block and keeps it out of the grid. Only one project should be featured at a time.
- The Selected Projects grid stays hidden until at least one non-featured project exists.
- Category filters activate automatically once there are four or more non-featured projects.
- Any `links` value left as `null` simply renders no button.

---

## Adding your photo

Drop a 4:5 portrait at `assets/images/profile/profile.jpg`. Recommended 960 × 1200, compressed to under 200 KB. Until then, a monogram placeholder shows in its place.

## Adding your CV

Drop the PDF at `assets/cv/Abdelrahman_Ashraf_Ahmed_CV.pdf`. The download button detects the file automatically — no code change needed.

---

## Local preview

Open `index.html` directly for a quick look, or run a local server so relative paths and the CV check behave exactly as they will in production:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

---

## Deploying to GitHub Pages

### First time

```bash
cd path/to/portfolio

git init
git add .
git commit -m "Initial portfolio"
git branch -M main
git remote add origin https://github.com/Abdelrahman-Ashraf-DA/portfolio.git
git push -u origin main
```

Then on GitHub:

1. Open the repository → **Settings** → **Pages**
2. Under **Source**, choose **Deploy from a branch**
3. Branch: `main`, folder: `/ (root)`
4. Save

The site goes live at `https://abdelrahman-ashraf-da.github.io/portfolio/` within a minute or two.

### Updating later

```bash
git add .
git commit -m "Describe the change"
git push
```

Pages redeploys automatically.

### Using a custom domain

1. Add a file named `CNAME` at the repository root containing only your domain, e.g. `abdelrahman.dev`
2. At your DNS provider, point an `A` record to GitHub's Pages IPs, or a `CNAME` record to `abdelrahman-ashraf-da.github.io`
3. In Settings → Pages, enter the domain and tick **Enforce HTTPS**
4. Update every absolute URL in `index.html`, `projects/*.html`, `robots.txt` and `sitemap.xml`

---

## Troubleshooting

**CSS or JS not loading (site appears unstyled)**
Paths are relative and case-sensitive on GitHub Pages. `Style.css` will not resolve to `style.css`. Check exact filenames.

**404 on the case study page**
The file must be at `projects/flightops-ai.html` and linked as `projects/flightops-ai.html` from the homepage, `../index.html` going back.

**Changes not appearing**
Pages caches aggressively. Hard-refresh with `Ctrl + Shift + R` (or `Cmd + Shift + R`), and confirm the latest commit shows a green tick under the repository's Actions tab.

**Images showing as grid placeholders**
The file is missing or the filename does not match. Check `assets/images/projects/flightops-ai/` against the names listed above.

**Resume button says "being updated"**
No file at `assets/cv/Abdelrahman_Ashraf_Ahmed_CV.pdf`. Add it and the button restores itself.

**Theme flashing white on load**
The blocking script in `<head>` prevents this. Do not move it into `script.js` or add `defer` to it.

**Anything under `_underscore` folders missing**
`.nojekyll` handles this. Make sure it exists at the repository root and is committed — an empty file is fine.

---

## Content rules

Every figure on this site traces to source documentation. When adding new work: no invented metrics, no invented clients, no invented results. If something is not yet available, leave the component hidden or mark it clearly rather than filling it with a plausible-sounding number.

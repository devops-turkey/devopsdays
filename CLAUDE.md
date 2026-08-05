# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running Locally

There is no build step. The site is plain HTML/CSS/JS served statically. Because `data-loader.js` uses `fetch()` to load YAML files, you must serve via HTTP — opening `index.html` directly in a browser will fail.

```bash
# Any of these work:
python3 -m http.server 8080
npx serve .
php -S localhost:8080
```

The site deploys automatically to GitHub Pages on push to `gh-pages` (the main branch). The custom domain is set via the `CNAME` file (`devopsdays.istanbul`).

## Architecture

This is a **data-driven static site**. All dynamic content lives in YAML files; the HTML is a fixed shell.

### Data Flow

```
data/*.yaml  →  js/data-loader.js (fetch + js-yaml CDN)  →  DOM injection into placeholder <div>s
```

`js/data-loader.js` is loaded at the bottom of `index.html` and on `DOMContentLoaded` calls four loaders:

| Loader | YAML source | Target element(s) |
|---|---|---|
| `loadSpeakers()` | `data/speakers.yaml` | `#keynote-speakers-container`, `#speakers-container` |
| `loadOrganizers()` | `data/organizers.yaml` | `#organizers-container` |
| `loadSchedule()` | `data/schedule.yaml` (+ speakers.yaml for photos) | `#schedule-mobile-container`, `#schedule-desktop-container` |
| `loadSponsors()` | `data/sponsors.yaml` | `#sponsors-media`, `#sponsors-container` |

Each YAML file has a top-level `enabled: true/false`. When `false`, the loader renders a "coming soon" placeholder instead of real content.

### YAML Schema

**`data/speakers.yaml`**
- `type`: `keynote` | `speaker` | `ignite`
- `image`: filename only — resolved to `/images/speakers/<filename>`
- `social`: optional `linkedin`, `twitter`, `other` + `other_icon` (Font Awesome class)
- Ignite speakers use `session_name` for the talk title; they are auto-pulled into the schedule's Ignite Talks slot

**`data/schedule.yaml`**
- Two `tracks`: Track 1 (English) and Track 2 (Turkish)
- Sessions with `type: "Track Sessions"` render as parallel two-column cards on desktop
- All other session types (Keynote, Coffee Break, etc.) span the full width as shared rows
- `speaker` field must exactly match a `name` in `speakers.yaml` to get the photo/popup link
- `type: "Ignite Talks"` auto-populates from `speakers.yaml` ignite entries

**`data/sponsors.yaml`**
- Tiers: `platinum`, `gold`, `silver`, `media` (media tier renders above the rest with a divider)
- `width`: logo width in px — controls size and how many fit per row
- `image`: filename only — resolved to `/images/sponsors/<filename>`
- Per-tier `enabled: false` hides a tier without removing it

### Past Years

Each past edition lives in a numbered subdirectory (`2016/`, `2017/`, ..., `2025/`). These are self-contained static sites with their own `css/` and `js/` and are not affected by root-level changes.

### Image Directories

- Speaker photos → `images/speakers/`
- Sponsor logos → `images/sponsors/`
- The `img/` directory at the root is legacy (used by past editions only)

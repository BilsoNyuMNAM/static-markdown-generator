# How-To Documentation — Website Generator

A static documentation site built with **[Astro](https://astro.build) + [Starlight](https://starlight.astro.build)** that automatically pulls content from a separate **content repository** and deploys to GitHub Pages.

## Architecture

```
┌─────────────────────────┐     repository_dispatch      ┌─────────────────────────┐
│                         │ ──────────────────────────►  │                         │
│   Content Repo          │                              │   This Repo (Engine)    │
│   (Markdown + Images)   │                              │   (Astro + Starlight)   │
│                         │   GitHub Actions clones ──►  │                         │
└─────────────────────────┘                              └──────────┬──────────────┘
                                                                    │ npm run build
                                                                    ▼
                                                         ┌─────────────────────────┐
                                                         │   GitHub Pages          │
                                                         │   (Static HTML/CSS/JS)  │
                                                         └─────────────────────────┘
```

**Content Repo** — where you write markdown:
- One folder per feature (e.g. `dropdown-menu/`, `search-engine/`)
- Each folder contains multiple `.md` / `.mdx` files and an `assets/` folder for images
- No build tools — just plain markdown

**This Repo (Engine)** — what you're looking at:
- Configured with Astro + Starlight
- GitHub Actions clones the content repo on every push (to either repo)
- Builds a fast, searchable static site with offline Pagefind search
- Deploys to GitHub Pages automatically

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Copy env config
cp .env.example .env
# Fill in SITE_URL, GITHUB_REPO_URL, CONTENT_REPO_EDIT_URL

# 3. Start the dev server
npm run dev
# → http://localhost:4321
```

The `src/content/docs/` directory contains a sample `dropdown-menu/` feature to get you started.  
When you connect the content repo, the GitHub Action will replace these with your real content.

## Connecting Your Content Repo

### Step 1 — Set up GitHub Pages

1. In this repo: **Settings → Pages → Source → GitHub Actions**

### Step 2 — Add secrets and variables

In this repo (**Settings → Secrets and variables → Actions**):

| Type | Name | Value |
| --- | --- | --- |
| **Secret** | `CONTENT_REPO_URL` | `https://github.com/your-username/how-to-content.git` |
| **Variable** | `SITE_URL` | `https://your-username.github.io/how-to-documentation` |
| **Variable** | `GITHUB_REPO_URL` | `https://github.com/your-username/how-to-documentation` |
| **Variable** | `CONTENT_REPO_EDIT_URL` | `https://github.com/your-username/how-to-content/edit/main/` |

### Step 3 — Add the dispatch webhook to your content repo

Copy `.github/content-repo-template/notify-site.yml` into your content repo at `.github/workflows/notify-site.yml`.

Then add a secret in the **content repo**:
- Name: `SITE_REPO_TOKEN`
- Value: A GitHub PAT with `repo` scope (or a fine-grained token with "workflows: read/write" on this engine repo)

From now on, every push to `main` in your content repo will automatically trigger a rebuild here.

## Content Repo Structure

```
how-to-content/
├── dropdown-menu/
│   ├── index.md          ← Overview (shows up first in sidebar)
│   ├── html-and-css.md
│   ├── javascript.md
│   ├── accessibility.md
│   └── assets/
│       └── demo.gif
├── search-engine/
│   ├── index.md
│   └── assets/
└── infinite-scroll/
    └── index.md
```

### Markdown Frontmatter

Every `.md` / `.mdx` file should have this frontmatter at the top:

```yaml
---
title: Your Page Title
description: One-sentence description shown in search results and SEO meta.
sidebar:
  order: 1          # Controls position within this folder's sidebar group
  badge:
    text: UI        # Optional badge (UI, System, Algorithm, etc.)
    variant: tip    # tip | note | caution | danger | success
---
```

## Deployment

The GitHub Actions workflow (`.github/workflows/deploy.yml`) handles everything:

- Triggered by: push to `main` in this repo, `repository_dispatch` from content repo, or manual run
- Clones content repo → builds with Astro → deploys to GitHub Pages
- Build time: ~30–60 seconds depending on content size

## Tech Stack

| Layer | Technology |
| --- | --- |
| Static Site Generator | [Astro 5](https://astro.build) |
| Theme / Components | [Starlight](https://starlight.astro.build) |
| Search | [Pagefind](https://pagefind.app) (offline, privacy-first) |
| Image Optimisation | [Sharp](https://sharp.pixelplumbing.com) (via Astro) |
| CI/CD | GitHub Actions |
| Hosting | GitHub Pages |
| Security Headers | `public/_headers` (Cloudflare Pages / Netlify compatible) |

## License

MIT

# codedeviate.github.io

Personal site for Thomas Björk. Plain HTML, CSS, and JavaScript — no build step, no framework. GitHub Pages serves the working tree from `master`.

## Local preview

The site uses `fetch()` for shared header/footer partials and JSON data, which doesn't work on `file://`. Pick one:

```bash
python3 -m http.server 8000
# or, dogfooding my own tools:
webrunner .
recon --serve .
```

Then open http://localhost:8000.

## Editing content

- **Hero quote, "Currently" line, About copy, Contact links** — inline in the relevant `*.html` file.
- **Working experience** — edit `data/experience.json` directly. Each entry has `id` (stable kebab-case slug, used as DOM id), `start`, `end` (or `null` for current), `displayDate`, `role`, `company`, `blurb`, plus optional `tags` (array of strings) and `era`.
- **Repositories** — edit `data/repos.json` directly. Each entry has `id`, `name`, `tagline`, `language` (e.g. `Rust`), `kind` (e.g. `CLI`, `Server`), `url`, plus optional `description`, `tags` (array), `featured` (bool, sorts to top), `archived` (bool, dimmed and sorted last). The `language` and `kind` values drive the filter chips automatically.

## Deploy

```bash
git push origin master
```

GitHub Pages picks up the change in ~30 seconds.

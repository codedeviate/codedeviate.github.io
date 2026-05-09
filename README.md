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
- **Working experience** — edit `docs/experience-source.md`, then run `node tools/md-to-experience.mjs` to regenerate `data/experience.json`. You can also hand-edit the JSON.
- **Repositories** — edit `data/repos.json` directly. See `CLAUDE.md` for the field shape.

## Deploy

```bash
git push origin master
```

GitHub Pages picks up the change in ~30 seconds.

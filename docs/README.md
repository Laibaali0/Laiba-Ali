# Laiba's portfolio and little browser games

This `docs/` folder is the static GitHub Pages site for the repository.

- **Portfolio:** `https://laibaali0.github.io/Laiba-Ali/`
- **Four by Four:** `https://laibaali0.github.io/Laiba-Ali/tiles/`
- **Signal Defender:** `https://laibaali0.github.io/Laiba-Ali/arcade/`

The homepage is a small editorial portfolio with no external dependencies or analytics. The two games use plain JavaScript and have local, browser-only high scores.

## Run locally

```bash
cd docs
python3 -m http.server 8000
# open http://localhost:8000 and visit /tiles/ or /arcade/
```

## Tests

From the repository root:

```bash
node --test tests/test_tiles.cjs
node --test tests/test_arcade_logic.cjs
python3 scripts/validate_site.py
```

## GitHub Pages

Go to **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, `main` and `/docs`, then Save. The profile README links to the published game pages. GitHub doesn't run JavaScript inside profile READMEs, so the game preview on the profile is a clickable graphic leading here.

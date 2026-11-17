# Developer Arcade website

The `docs/` directory is a GitHub Pages-ready static website for `Laibaali0/Laiba-Ali`.

## Publishing

In GitHub: **Settings → Pages → Deploy from a branch → main → /docs → Save**.

After publishing, the URLs will be:

- Portfolio: `https://laibaali0.github.io/Laiba-Ali/`
- Arcade: `https://laibaali0.github.io/Laiba-Ali/arcade/`

Local preview:

```bash
cd docs
python3 -m http.server 8000
# open http://localhost:8000
```

The game itself runs without external libraries, cookies, or analytics. Its high score is saved only in `localStorage` on the player's own device.

Tests:

```bash
node --test tests/test_arcade_logic.cjs
```

The `README.md` in the repository root retains the original ML experiments and explains how to run them.

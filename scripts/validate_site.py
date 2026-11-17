"""Check local HTML asset references before publishing to GitHub Pages."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1] / "docs"


class LocalAssets(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []

    def handle_starttag(self, tag, attrs):
        props = dict(attrs)
        for attr in ("src", "href"):
            value = props.get(attr)
            if value and not (value.startswith(("https://", "http://", "mailto:", "#", "data:"))):
                self.refs.append(value)


def main():
    problems = []
    htmls = sorted(ROOT.rglob("*.html"))
    assert htmls, "Missing HTML pages"
    for page in htmls:
        parser = LocalAssets()
        parser.feed(page.read_text(encoding="utf-8"))
        for ref in parser.refs:
            parsed = urlsplit(ref)
            path = unquote(parsed.path)
            if not path or path.startswith("/"):
                problems.append(f"{page}: absolute or empty path: {ref}")
                continue
            target = (page.parent / path).resolve()
            if not target.is_relative_to(ROOT.resolve()):
                problems.append(f"{page}: path escapes docs/: {ref}")
            elif not target.exists():
                problems.append(f"{page}: missing {ref}")
    if problems:
        raise SystemExit("Broken references:\n" + "\n".join(problems))
    print(f"Validated {len(htmls)} HTML pages and all local asset references.")


if __name__ == "__main__":
    main()

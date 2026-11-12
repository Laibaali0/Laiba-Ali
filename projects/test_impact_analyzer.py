"""Conservative, single-directory Python test selection based on imports.

This does not replace running the full test suite. When source analysis is
ambiguous, it selects every test rather than risk skipping a regression.

Run: python -m projects.test_impact_analyzer
"""
import ast
from pathlib import Path
from tempfile import TemporaryDirectory


def dependencies(source):
    """Get absolute imported module names; reject dynamic import patterns."""
    tree = ast.parse(source)
    imported = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            imported.update(alias.name.split(".")[0] for alias in node.names)
        elif isinstance(node, ast.ImportFrom):
            if node.level:
                raise ValueError("Relative imports need package-aware analysis")
            if node.module:
                imported.add(node.module.split(".")[0])
        elif isinstance(node, ast.Call):
            fn = node.func
            if (isinstance(fn, ast.Name) and fn.id == "__import__") or (
                isinstance(fn, ast.Attribute) and fn.attr == "import_module"
            ):
                raise ValueError("Dynamic import found")
    return imported


def impacted_tests(root, changed):
    """Find directly/transitively affected tests, or conservatively return all.

    This starter supports flat Python source trees. Any unrecognized changed
    path, parse error, or dynamic import triggers an all-tests fallback.
    """
    root = Path(root)
    modules = {path.stem: path for path in root.glob("*.py")}
    tests = sorted(path.name for path in modules.values() if path.stem.startswith("test_"))

    def fallback(reason):
        return {"selected": tests, "fallback": True, "reason": reason}

    if not changed:
        return fallback("No changed files supplied")

    touched = {Path(path).stem for path in changed}
    if not touched.issubset(modules):
        return fallback("Change includes a file outside the known module set")

    try:
        graph = {
            module: dependencies(path.read_text(encoding="utf-8"))
            for module, path in modules.items()
        }
    except (SyntaxError, UnicodeError, ValueError):
        return fallback("Static dependency analysis was inconclusive")

    selected = []
    for test_file in tests:
        test_name = Path(test_file).stem
        seen = set()
        frontier = [test_name]
        while frontier:
            current = frontier.pop()
            if current in seen:
                continue
            seen.add(current)
            frontier.extend(dep for dep in graph.get(current, ()) if dep in modules and dep not in seen)
        if seen & touched:
            selected.append(test_file)

    if not selected:
        return fallback("No test dependency could be established")
    return {"selected": selected, "fallback": False, "reason": "Static import graph"}


if __name__ == "__main__":
    with TemporaryDirectory() as directory:
        root = Path(directory)
        (root / "core.py").write_text("def calculate(): return 1\n")
        (root / "other.py").write_text("def compute(): return 2\n")
        (root / "test_core.py").write_text("import core\n")
        (root / "test_other.py").write_text("import other\n")
        print(impacted_tests(root, ["core.py"]))

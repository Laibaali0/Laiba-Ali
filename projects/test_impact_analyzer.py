"""Conservative import-graph-based Python test selector.
Run: python projects/test_impact_analyzer.py
"""
import ast
from pathlib import Path
from tempfile import TemporaryDirectory

def dependencies(source):
    imports=set()
    for node in ast.walk(ast.parse(source)):
        if isinstance(node,ast.Import):
            imports.update(a.name for a in node.names)
        elif isinstance(node,ast.ImportFrom) and node.module and node.level==0:
            imports.add(node.module)
    return imports

def impacted_tests(root,changed):
    root=Path(root)
    modules={p.stem:p for p in root.glob("*.py")}
    tests=[p for p in modules.values() if p.stem.startswith("test_")]
    touched={Path(p).stem for p in changed}
    selected=[]
    for test in tests:
        seen={test.stem}
        queue=[test.stem]
        while queue:
            current=queue.pop()
            for dependency in dependencies(modules[current].read_text()):
                if dependency in modules and dependency not in seen:
                    seen.add(dependency)
                    queue.append(dependency)
        if seen&touched:
            selected.append(test.name)
    if not selected:
        return {"selected":[p.name for p in tests],"fallback":True}
    return {"selected":selected,"fallback":False}

if __name__=="__main__":
    with TemporaryDirectory() as tmp:
        root=Path(tmp)
        (root/"core.py").write_text("def f(): return 1")
        (root/"other.py").write_text("def g(): return 2")
        (root/"test_core.py").write_text("import core")
        (root/"test_other.py").write_text("import other")
        print(impacted_tests(root,["core.py"]))

"""Read-only, deterministic code review assistant; no GitHub write access.
Refuses to review stale diffs and never posts comments.
Run: python projects/pr_review_assistant.py
"""
import re

CHECKS=[
    ("debug-print",re.compile(r"\b(?:print|console\.log)\s*\(")),
    ("unfinished",re.compile(r"\b(?:TODO|FIXME)\b")),
    ("bare-except",re.compile(r"^\s*except\s*:\s*$"))
]
def review(diff,expected_commit,current_commit):
    if expected_commit!=current_commit:
        return {"status":"stale","findings":[],"posted_comments":0}
    findings=[]
    file_name=""
    for line in diff.splitlines():
        if line.startswith("+++ b/"):
            file_name=line[6:]
        elif line.startswith("+") and not line.startswith("+++"):
            for rule,pattern in CHECKS:
                if pattern.search(line[1:]):
                    findings.append({"file":file_name,"rule":rule,"line":line[1:]})
    return {"status":"reviewed","findings":findings,"posted_comments":0}

if __name__=="__main__":
    sample="+++ b/app.py\n+print('debug')\n+# TODO: add tests\n"
    print(review(sample,"abc123","abc123"))

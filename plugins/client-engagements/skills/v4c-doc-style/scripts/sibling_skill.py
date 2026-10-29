"""Find a folder inside a sibling skill, one installed next to this one, whatever the install
names the skill folders:

    <root>/v4c-doc-style/                    <root>/v4c-deck-style/                    repo, Claude Code
    <root>/client-engagements:v4c-doc-style/ <root>/client-engagements:v4c-deck-style/ claude.ai

The folder must hold every file in `files`. It is:
  1. the first override that is set, in the order given (a CLI argument, then an environment
     variable). A set override is final: if it lacks the files, nothing else is tried;
  2. otherwise the first of these that holds the files:
     a. <root>/<sibling>/<sub>, the bare folder name;
     b. <root>/<prefix><sibling>/<sub>, where <prefix> is whatever this skill's own folder name
        puts before the skill's name ("client-engagements:" for "client-engagements:v4c-doc-style").
Nothing else is searched. When nothing qualifies, the error lists every step in order.

Ported from the claude-enablement repo, where a JavaScript twin
(architecture-slide/scripts/sibling_skill.js) shares this lookup. Stdlib only.
"""
import os
from pathlib import Path


class SiblingNotFound(Exception):
    def __init__(self, message, tried):
        super().__init__(message)
        self.tried = tried


def candidates(skill_dir, name, sibling, sub, overrides=()):
    for label, value in overrides:
        if value:
            return [{"label": label, "dir": Path(os.path.abspath(value)), "override": True}]
    skill_dir = Path(skill_dir)
    folder, root = skill_dir.name, skill_dir.parent
    prefix = folder[:-len(name)] if folder != name and folder.endswith(name) else ""
    return [
        *({"label": label, "dir": None, "unset": "not set"} for label, _ in overrides),
        {"label": "sibling skill, bare folder name", "dir": root / sibling / sub},
        {"label": "sibling skill, plugin-namespaced folder name",
         "dir": root / (prefix + sibling) / sub if prefix else None,
         "unset": f'none: no prefix on this skill\'s folder name, "{folder}"'},
    ]


def find_sibling(skill_dir, name, sibling, sub, files, overrides=()):
    """Return the folder. Raise SiblingNotFound, with `tried`, when nothing qualifies."""
    tried = []
    for c in candidates(skill_dir, name, sibling, sub, overrides):
        if c["dir"]:
            missing = [f for f in files if not (c["dir"] / f).exists()]
            if not missing:
                return c["dir"]
            c["why"] = f"no {', '.join(missing)}" if c["dir"].exists() else "no such folder"
        tried.append(c)
    lines = [f"  {i}. {t['label']}: " + (f"{t['dir']} ({t['why']})" if t["dir"] else t["unset"])
             for i, t in enumerate(tried, 1)]
    labels = [label for label, _ in overrides]
    set_ = next((t for t in tried if t.get("override")), None)
    if set_:
        tail = (f"An override is used as given, so nothing else was tried. Fix the path in {set_['label']}, "
                f"or remove it to use the {sibling} skill installed alongside this one.")
    else:
        tail = (f"Install the {sibling} skill alongside this one"
                + (f", or give the folder's path with {' or '.join(labels)}" if labels else "") + ".")
    raise SiblingNotFound("\n".join([
        f"{name}: can't find the {sibling} skill's {sub}/ folder, which needs {', '.join(files)}. Tried, in order:",
        *lines,
        tail,
    ]), tried)

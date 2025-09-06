# Jupyter Output Mirror – Dev Notes

This extension mirrors Jupyter Notebook stdout/stderr into a VS Code Output channel.
These notes are for **developing and debugging the extension** inside GitHub Codespaces.

---

## 🟢 First-time Setup

1. Open a Codespace for this repo.
2. Run in the terminal:

```shell
npm ci
```

3. Run task: **nuke-rebuild**
4. Press **F5** → launches the Extension Development Host window.
5. Open a notebook (`.ipynb`) in the Dev Host and test with the snippet below.

---

## 🚀 Running the Extension

- Press **F5** → starts an **isolated Extension Development Host** window.
- That Dev Host:

  - Uses its own settings (`.vscode-devhost/user-data`).
  - Shares the Codespace’s global extensions (Jupyter, Python, Pylance, Codespaces).
  - Auto-compiles your extension via the `npm: compile` task.

---

## 🔧 Tasks

Run tasks via **Command Palette → Tasks: Run Task**.

- **npm: compile** → Compile TypeScript into `out/`.
- **nuke** → Hard clean: remove `out/`, `node_modules/`, untracked files (except `.vscode/`).
- **rebuild** → Reinstall dependencies and compile.
- **nuke-rebuild** → Full reset: run `nuke` then `rebuild`.

---

## 🗑️ Git Ignore

`.vscode-devhost/` is ignored — this folder contains Dev Host state and settings.

---

## 🧪 Quick Test Snippet

After pressing **F5** and opening a notebook in the Dev Host, run this in a Python cell:

```python
import sys, time
print("hello stdout")
sys.stderr.write("hello stderr\n")
for i in range(3):
print(f"tick {i}"); time.sleep(0.25)
```

---

Then check **View → Output → Jupyter Stdout/Stderr**.

---

## 💡 Tips

- If something feels “off,” run `Tasks: Run Task → nuke-rebuild`.
- Never commit `.vscode-devhost/`; it’s only local state.

---

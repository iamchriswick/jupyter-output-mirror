# Jupyter Output Mirror

A VS Code extension that **mirrors Jupyter Notebook stdout/stderr** into a dedicated **Output channel**, so you can follow logs alongside code execution.

---

## ✨ Features

- Mirrors `stdout` and `stderr` from Jupyter Notebook cells into VS Code’s **Output** panel.
- Configurable behavior via settings:

  - Single shared channel or per-notebook channels.
  - Optional ISO timestamps.
  - Optional ANSI color stripping.
  - Debounce to smooth bursts of output.
  - Auto-clear channel when notebook outputs are cleared.

- Works with Codespaces, local Jupyter, and remote kernels.

---

## 📖 Usage

1. Open a `.ipynb` file in VS Code.
2. Run a cell that prints or logs to `stdout` / `stderr`.
3. Open **View → Output → Jupyter Stdout/Stderr** to see mirrored logs.

---

## ⚙️ Extension Settings

This extension contributes the following settings:

- `jupyterOutputMirror.channelMode`: "single" (default) or "perNotebook".
- `jupyterOutputMirror.debounceMs`: Debounce window in ms (default: 50).
- `jupyterOutputMirror.clearOnNotebookClear`: Clear channel when notebook outputs are cleared.
- `jupyterOutputMirror.includeTextPlain`: Mirror `text/plain` outputs in addition to stdout/stderr.
- `jupyterOutputMirror.timestamp`: Prefix each chunk with an ISO timestamp.
- `jupyterOutputMirror.activeNotebookOnly`: Mirror only from the active notebook.
- `jupyterOutputMirror.stripAnsi`: Strip ANSI color codes before appending.
- `jupyterOutputMirror.maxChunk`: Max characters per chunk (default: 65536).
- `jupyterOutputMirror.debug`: Verbose debug logging (default: false).

---

## 🧪 Example

Notebook cell:

```python
import sys
print("hello stdout")
sys.stderr.write("hello stderr\n")
```

Output panel (**View → Output → Jupyter Stdout/Stderr**):

```
[2025-09-05T11:30:00.123Z] hello stdout
[2025-09-05T11:30:00.124Z] hello stderr
```

---

## 🛠️ Development

For contributing and debugging the extension, see [README-dev.md](README-dev.md).

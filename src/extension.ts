import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

const STDOUT_MIME = "application/vnd.code.notebook.stdout";
const STDERR_MIME = "application/vnd.code.notebook.stderr";
const TEXT_MIME = "text/plain";

type SeenLens = { outLen: number; errLen: number; txtLen: number };

// Helper functions for demo and quickstart content
function createDemoNotebookContent(): string {
  const demoNotebook = {
    cells: [
      {
        cell_type: "markdown",
        metadata: {},
        source: [
          "# Jupyter Output Mirror Demo\n",
          "\n",
          "This notebook demonstrates the Jupyter Output Mirror extension functionality.\n",
          "\n",
          "**Instructions:**\n",
          "1. Make sure the Jupyter Output Mirror extension is active\n",
          "2. Run the code cell below\n",
          '3. Check the "Jupyter Stdout/Stderr" output channel to see mirrored outputs\n',
          '4. Try different settings in VS Code settings (search for "Jupyter Output Mirror")',
        ],
      },
      {
        cell_type: "code",
        execution_count: null,
        metadata: {},
        outputs: [],
        source: [
          "import sys\n",
          "import time\n",
          "\n",
          'print("hello stdout")\n',
          'sys.stderr.write("hello stderr\\n")\n',
          "for i in range(3):\n",
          '    print(f"tick {i} : {time.sleep(0.25)}")',
        ],
      },
      {
        cell_type: "code",
        execution_count: null,
        metadata: {},
        outputs: [],
        source: [
          "# Additional test: Multiple output types\n",
          "import sys\n",
          "import json\n",
          "\n",
          'print("=== Testing different output types ===")\n',
          'print("Standard output line 1")\n',
          'print("Standard output line 2")\n',
          "\n",
          'sys.stderr.write("Error message 1\\n")\n',
          'sys.stderr.write("Error message 2\\n")\n',
          "\n",
          "# Display some data\n",
          'data = {"status": "success", "count": 42, "items": ["apple", "banana", "cherry"]}\n',
          'print("JSON data:")\n',
          "print(json.dumps(data, indent=2))",
        ],
      },
    ],
    metadata: {
      kernelspec: {
        display_name: "Python 3",
        language: "python",
        name: "python3",
      },
      language_info: {
        name: "python",
        version: "3.8.0",
      },
    },
    nbformat: 4,
    nbformat_minor: 4,
  };

  return JSON.stringify(demoNotebook, null, 2);
}

function getQuickStartContent(): string {
  return `# 🚀 Jupyter Output Mirror - QuickStart Guide

Welcome to **Jupyter Output Mirror**! This extension mirrors Jupyter notebook stdout/stderr outputs to VS Code's Output panel for better visibility and debugging.

## ✨ What This Extension Does

- **Real-time mirroring**: See stdout/stderr outputs in VS Code's Output panel as they happen
- **Multiple output types**: Supports stdout, stderr, and text/plain outputs  
- **Flexible channels**: Choose between single shared channel or per-notebook channels
- **Configurable**: Timestamps, ANSI stripping, debouncing, and more
- **Active notebook focus**: Option to mirror only from the currently active notebook

## 🎯 Quick Demo

Want to see it in action right away? Use the command palette:

1. Press \`Ctrl+Shift+P\` (or \`Cmd+Shift+P\` on Mac)
2. Type: \`Jupyter Output Mirror: Create Demo Notebook\`
3. Run the demo notebook cells and watch the Output panel!

## 📖 How to Use

### Basic Usage

1. Open any Jupyter notebook (\`.ipynb\` file)
2. The extension activates automatically
3. Run cells with \`print()\` or \`sys.stderr.write()\`
4. Check the **"Jupyter Stdout/Stderr"** output channel (View → Output)

### Configuration Options

Open VS Code Settings and search for "Jupyter Output Mirror":

- **Channel Mode**: \`single\` (shared) or \`perNotebook\` (separate channels)
- **Active Notebook Only**: Mirror only from the focused notebook
- **Timestamps**: Add timestamps to each output line  
- **Strip ANSI**: Remove color codes from output
- **Debounce**: Adjust how quickly outputs are processed (default: 50ms)
- **Max Chunk Size**: Limit output size to prevent flooding

### Available Commands

- \`Jupyter Output Mirror: Toggle\` - Enable/disable the extension
- \`Jupyter Output Mirror: Clear Output Channel(s)\` - Clear all output
- \`Jupyter Output Mirror: Create Demo Notebook\` - Bootstrap demo notebook
- \`Jupyter Output Mirror: Open QuickStart\` - Show this guide again

## 🔧 Troubleshooting

**Not seeing outputs?**

- Check that the Jupyter extension is installed and working
- Verify the extension is enabled: \`Jupyter Output Mirror: Toggle\`
- Make sure you're running code that actually produces stdout/stderr

**Too much output?**

- Adjust the "Max Chunk Size" setting
- Enable debouncing with a higher delay
- Use "Active Notebook Only" mode

**Output not appearing immediately?**

- Lower the debounce delay (default: 50ms)
- Check if "Active Notebook Only" is enabled and switch notebook focus

## 🎨 Pro Tips

- **Multiple notebooks**: Use "perNotebook" channel mode for better organization
- **Debugging**: Enable timestamps to track when outputs occurred
- **Performance**: Increase debounce delay for high-volume outputs
- **Clean output**: Enable ANSI stripping for cleaner text output

## 📚 Need More Help?

- Check the extension settings for all available options
- Use the demo notebook to test different scenarios
- Report issues or suggest features on our repository

---

Happy debugging! 🐛→✨`;
}

export async function activate(context: vscode.ExtensionContext) {
  const cfg = () => vscode.workspace.getConfiguration("jupyterOutputMirror");

  const channelSingleton = vscode.window.createOutputChannel(
    "Jupyter Stdout/Stderr"
  );
  const debugOn = () => cfg().get<boolean>("debug", false);
  const dbg = (...args: any[]) => {
    if (!debugOn()) return;
    console.log("[JOM]", ...args);
    channelSingleton.appendLine(`[debug] ${args.map(String).join(" ")}`);
  };

  let enabled = true;

  const channels = new Map<string, vscode.OutputChannel>();
  const pending = new Map<string, ReturnType<typeof setTimeout>>();
  const seen = new WeakMap<vscode.NotebookCell, SeenLens>();
  const decoder = new TextDecoder("utf-8");

  const nowIso = () => new Date().toISOString();
  const label = (doc: vscode.NotebookDocument, cell: vscode.NotebookCell) => {
    const idx = Math.max(0, doc.getCells().indexOf(cell));
    const short = vscode.workspace.asRelativePath(doc.uri);
    return `${short} #${idx + 1}`;
  };
  const stripAnsi = (s: string) =>
    s.replace(/\u001B\[([0-9]{1,3}(;[0-9]{1,3})*)?[mGKHF]/g, "");

  const shouldMirrorDoc = (doc?: vscode.NotebookDocument) => {
    if (!doc) return false;
    if (!cfg().get<boolean>("activeNotebookOnly")) return true;
    const active = vscode.window.activeNotebookEditor?.notebook;
    return !!active && active === doc;
  };

  const getChannel = (doc: vscode.NotebookDocument): vscode.OutputChannel => {
    const mode = cfg().get<"single" | "perNotebook">("channelMode", "single");
    if (mode === "single") return channelSingleton;
    const key = doc.uri.toString();
    let ch = channels.get(key);
    if (!ch) {
      // Sanitize the name more aggressively to avoid URI issues
      const relativePath = vscode.workspace.asRelativePath(doc.uri);
      const sanitizedPath = relativePath
        .replace(/[^\w\-_.]/g, "_") // Remove all special chars except word chars, hyphens, underscores, dots
        .replace(/_{2,}/g, "_"); // Replace multiple underscores with single underscore
      const name = `Jupyter Output ${sanitizedPath}`;
      ch = vscode.window.createOutputChannel(name);
      channels.set(key, ch);
    }
    return ch;
  };

  // UPDATED: respect includeSourceContext
  const append = (
    doc: vscode.NotebookDocument,
    headerKindAndCell: string,
    chunk: string
  ) => {
    if (!enabled || !chunk) return;
    try {
      const ch = getChannel(doc);
      const withTs = cfg().get<boolean>("timestamp") ?? true;
      const withContext = cfg().get<boolean>("includeSourceContext") ?? true;
      const max = cfg().get<number>("maxChunk") ?? 65536;

      let body = chunk;
      if (cfg().get<boolean>("stripAnsi")) body = stripAnsi(body);
      if (body.length > max) body = body.slice(0, max) + " …[truncated]";

      // Build the optional single-line prefix
      const ts = withTs ? `[${nowIso()}] ` : "";
      const prefix = withContext
        ? `${ts}${headerKindAndCell}`
        : withTs
        ? `${ts}`
        : "";

      if (prefix) ch.appendLine(prefix);
      ch.append(body.endsWith("\n") ? body : body + "\n");
      ch.show(true);
    } catch (e) {
      console.error("append failed", e);
    }
  };

  const safeDecode = (data: unknown): string => {
    try {
      if (typeof data === "string") return data;
      if (data instanceof Uint8Array) return decoder.decode(data);
      if (data && typeof (data as any).buffer === "object") {
        return decoder.decode(new Uint8Array((data as any).buffer));
      }
    } catch {
      /* ignore */
    }
    return "";
  };

  const readStreams = (cell: vscode.NotebookCell) => {
    const includeTextPlain = cfg().get<boolean>("includeTextPlain");
    let outText = "",
      errText = "",
      txtText = "";
    try {
      for (const out of cell.outputs ?? []) {
        for (const item of out.items ?? []) {
          const dataStr = safeDecode((item as any).data);
          if (!dataStr) continue;
          const mime = (item as any).mime as string | undefined;
          if (mime === STDOUT_MIME) outText += dataStr;
          else if (mime === STDERR_MIME) errText += dataStr;
          else if (includeTextPlain && mime === TEXT_MIME) txtText += dataStr;
        }
      }
    } catch (e) {
      console.error("readStreams failed", e);
    }
    return { outText, errText, txtText };
  };

  const flushNew = (
    doc?: vscode.NotebookDocument,
    cell?: vscode.NotebookCell
  ) => {
    try {
      if (!doc || !cell || !shouldMirrorDoc(doc)) return;
      const prev = seen.get(cell) ?? { outLen: 0, errLen: 0, txtLen: 0 };
      const { outText, errText, txtText } = readStreams(cell);

      if (outText.length > prev.outLen) {
        const delta = outText.slice(prev.outLen);
        append(doc, `[stdout] ${label(doc, cell)}`, delta);
        prev.outLen = outText.length;
      }
      if (errText.length > prev.errLen) {
        const delta = errText.slice(prev.errLen);
        append(doc, `[stderr] ${label(doc, cell)}`, delta);
        prev.errLen = errText.length;
      }
      if (txtText.length > prev.txtLen) {
        const delta = txtText.slice(prev.txtLen);
        append(doc, `[text/plain] ${label(doc, cell)}`, delta);
        prev.txtLen = txtText.length;
      }
      seen.set(cell, prev);
    } catch (e) {
      console.error("flushNew failed", e);
    }
  };

  const seedDoc = (doc: vscode.NotebookDocument) => {
    try {
      for (const cell of doc.getCells() ?? []) flushNew(doc, cell);
    } catch (e) {
      console.error("seedDoc failed", e);
    }
  };

  const allOutputsEmpty = (doc: vscode.NotebookDocument) =>
    (doc.getCells() ?? []).every(
      (c: vscode.NotebookCell) => (c.outputs ?? []).length === 0
    );

  const scheduleFlushForDoc = (doc?: vscode.NotebookDocument) => {
    try {
      if (!doc) return;
      const key = doc.uri.toString();
      const delay = cfg().get<number>("debounceMs", 50);

      const runFlush = () => {
        try {
          for (const cell of doc.getCells() ?? []) flushNew(doc, cell);
          if (
            cfg().get<boolean>("clearOnNotebookClear") &&
            allOutputsEmpty(doc)
          ) {
            const ch = getChannel(doc);
            ch.clear();
            ch.appendLine(
              `[${nowIso()}] [info] Cleared (notebook outputs cleared)`
            );
          }
        } catch (e) {
          console.error("runFlush failed", e);
        }
      };

      if (delay <= 0) {
        runFlush();
        return;
      }

      clearTimeout(pending.get(key));
      const handle = setTimeout(() => {
        runFlush();
        pending.delete(key);
      }, delay);
      pending.set(key, handle);
    } catch (e) {
      console.error("scheduleFlushForDoc failed", e);
    }
  };

  try {
    for (const doc of vscode.workspace.notebookDocuments ?? []) seedDoc(doc);
  } catch (e) {
    console.error("initial seed failed", e);
  }

  context.subscriptions.push(
    vscode.workspace.onDidOpenNotebookDocument((doc: vscode.NotebookDocument) =>
      seedDoc(doc)
    ),
    vscode.workspace.onDidChangeNotebookDocument(
      (e: vscode.NotebookDocumentChangeEvent) => scheduleFlushForDoc(e.notebook)
    ),
    vscode.workspace.onDidCloseNotebookDocument(
      (doc: vscode.NotebookDocument) => {
        try {
          const key = doc.uri.toString();
          const ch = channels.get(key);
          if (ch) {
            ch.dispose();
            channels.delete(key);
          }
          const timer = pending.get(key);
          if (timer) {
            clearTimeout(timer);
            pending.delete(key);
          }
        } catch (err) {
          console.error("close cleanup failed", err);
        }
      }
    ),
    vscode.window.onDidChangeActiveNotebookEditor(() => {
      try {
        const ed = vscode.window.activeNotebookEditor?.notebook;
        if (ed) getChannel(ed).show(true);
      } catch (err) {
        console.error("activeNotebook change failed", err);
      }
    }),
    vscode.commands.registerCommand("jupyterOutputMirror.toggle", () => {
      enabled = !enabled;
      vscode.window.showInformationMessage(
        `Jupyter Output Mirror: ${enabled ? "ON" : "OFF"}`
      );
    }),
    vscode.commands.registerCommand("jupyterOutputMirror.clear", () => {
      try {
        const mode = cfg().get<"single" | "perNotebook">(
          "channelMode",
          "single"
        );
        if (mode === "single") {
          channelSingleton.clear();
          channelSingleton.appendLine(`[${nowIso()}] [info] Cleared`);
          channelSingleton.show(true);
        } else {
          for (const ch of channels.values()) {
            ch.clear();
            ch.appendLine(`[${nowIso()}] [info] Cleared`);
            ch.show(true);
          }
        }
      } catch (err) {
        console.error("clear command failed", err);
      }
    }),
    vscode.commands.registerCommand(
      "jupyterOutputMirror.createDemo",
      async () => {
        try {
          const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
          if (!workspaceFolder) {
            vscode.window.showErrorMessage(
              "No workspace folder open. Please open a folder first."
            );
            return;
          }

          const demoFileName = "jupyter-output-mirror-demo.ipynb";
          const demoPath = path.join(workspaceFolder.uri.fsPath, demoFileName);

          // Read the embedded demo notebook from the extension
          const extensionPath = context.extensionPath;
          const sourceDemoPath = path.join(
            extensionPath,
            "src",
            "jupyter-output-mirror-demo.ipynb"
          );

          try {
            // Check if demo already exists
            if (fs.existsSync(demoPath)) {
              const result = await vscode.window.showWarningMessage(
                `${demoFileName} already exists. Overwrite it?`,
                "Yes, Overwrite",
                "No, Open Existing"
              );

              if (result === "No, Open Existing") {
                const doc = await vscode.workspace.openNotebookDocument(
                  vscode.Uri.file(demoPath)
                );
                await vscode.window.showNotebookDocument(doc);
                return;
              } else if (result !== "Yes, Overwrite") {
                return; // User cancelled
              }
            }

            // Copy the demo file
            if (fs.existsSync(sourceDemoPath)) {
              fs.copyFileSync(sourceDemoPath, demoPath);
            } else {
              // Fallback: create demo content programmatically
              const demoContent = createDemoNotebookContent();
              fs.writeFileSync(demoPath, demoContent);
            }

            // Open the demo notebook
            const doc = await vscode.workspace.openNotebookDocument(
              vscode.Uri.file(demoPath)
            );
            await vscode.window.showNotebookDocument(doc);

            vscode.window.showInformationMessage(
              `✨ Demo notebook created! Run the cells to see Jupyter Output Mirror in action. Check the "Jupyter Stdout/Stderr" output channel.`
            );
          } catch (error) {
            vscode.window.showErrorMessage(
              `Failed to create demo notebook: ${error}`
            );
          }
        } catch (err) {
          console.error("createDemo command failed", err);
        }
      }
    ),
    vscode.commands.registerCommand(
      "jupyterOutputMirror.showQuickStart",
      async () => {
        try {
          const extensionPath = context.extensionPath;
          const quickStartPath = path.join(
            extensionPath,
            "src",
            "quickstart.md"
          );

          if (fs.existsSync(quickStartPath)) {
            const doc = await vscode.workspace.openTextDocument(
              vscode.Uri.file(quickStartPath)
            );
            await vscode.window.showTextDocument(doc, { preview: true });
          } else {
            // Fallback: show quickstart content in a new untitled document
            const quickStartContent = getQuickStartContent();
            const doc = await vscode.workspace.openTextDocument({
              content: quickStartContent,
              language: "markdown",
            });
            await vscode.window.showTextDocument(doc, { preview: true });
          }
        } catch (err) {
          console.error("showQuickStart command failed", err);
          vscode.window.showErrorMessage("Failed to open QuickStart guide");
        }
      }
    )
  );

  // Show QuickStart on first install
  const isFirstInstall = !context.globalState.get("hasShownQuickStart", false);
  if (isFirstInstall) {
    // Mark as shown
    context.globalState.update("hasShownQuickStart", true);

    // Show welcome message with option to view QuickStart
    const result = await vscode.window.showInformationMessage(
      "🎉 Welcome to Jupyter Output Mirror! Would you like to see the QuickStart guide?",
      "Yes, Show Guide",
      "Maybe Later"
    );

    if (result === "Yes, Show Guide") {
      vscode.commands.executeCommand("jupyterOutputMirror.showQuickStart");
    }
  }

  channelSingleton.show(true);
  channelSingleton.appendLine(
    `[${nowIso()}] [info] Jupyter Output Mirror activated`
  );
}

export function deactivate() {}

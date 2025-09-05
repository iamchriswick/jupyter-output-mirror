import * as vscode from "vscode";

const STDOUT_MIME = "application/vnd.code.notebook.stdout";
const STDERR_MIME = "application/vnd.code.notebook.stderr";
const TEXT_MIME = "text/plain";

type SeenLens = { outLen: number; errLen: number; txtLen: number };

export function activate(context: vscode.ExtensionContext) {
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
  const pending = new Map<string, NodeJS.Timeout>();
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
      const name = `Jupyter Stdout/Stderr — ${vscode.workspace.asRelativePath(
        doc.uri
      )}`;
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

      clearTimeout(pending.get(key) as NodeJS.Timeout);
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
    })
  );

  channelSingleton.show(true);
  channelSingleton.appendLine(
    `[${nowIso()}] [info] Jupyter Output Mirror activated`
  );
}

export function deactivate() {}

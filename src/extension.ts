import * as vscode from 'vscode';

const STDOUT_MIME = 'application/vnd.code.notebook.stdout';
const STDERR_MIME = 'application/vnd.code.notebook.stderr';
const TEXT_MIME = 'text/plain';

type SeenLens = { outLen: number; errLen: number; txtLen: number };

export function activate(context: vscode.ExtensionContext) {
  const channel = vscode.window.createOutputChannel('Jupyter Stdout/Stderr');
  let enabled = true;

  const cfg = () => vscode.workspace.getConfiguration('jupyterOutputMirror');
  const seen = new WeakMap<vscode.NotebookCell, SeenLens>();

  const nowIso = () => new Date().toISOString();
  const label = (doc: vscode.NotebookDocument, cell: vscode.NotebookCell) => {
    const idx = doc.getCells().indexOf(cell);
    const short = vscode.workspace.asRelativePath(doc.uri);
    return `${short} #${idx + 1}`;
  };

  const stripAnsi = (s: string) =>
    s.replace(/\u001B\[([0-9]{1,3}(;[0-9]{1,3})*)?[mGKHF]/g, '');

  const readStreams = (cell: vscode.NotebookCell) => {
    let outText = '';
    let errText = '';
    let txtText = '';
    for (const out of cell.outputs) {
      for (const item of out.items) {
        let data = '';
        try {
          const buf = item.data as Uint8Array;
          data = Buffer.from(buf).toString('utf8');
        } catch {
          continue;
        }
        if (item.mime === STDOUT_MIME) outText += data;
        else if (item.mime === STDERR_MIME) errText += data;
        else if (cfg().get<boolean>('includeTextPlain') && item.mime === TEXT_MIME) txtText += data;
      }
    }
    return { outText, errText, txtText };
  };

  const shouldMirrorDoc = (doc: vscode.NotebookDocument) => {
    if (!cfg().get<boolean>('activeNotebookOnly')) return true;
    const active = vscode.window.activeNotebookEditor?.notebook;
    return !!active && active === doc;
  };

  const append = (header: string, chunk: string) => {
    if (!chunk) return;
    const ts = cfg().get<boolean>('timestamp') ? `[${nowIso()}] ` : '';
    let body = chunk;
    if (cfg().get<boolean>('stripAnsi')) body = stripAnsi(body);
    const max = cfg().get<number>('maxChunk') ?? 65536;
    if (body.length > max) body = body.slice(0, max) + ' …[truncated]';
    channel.appendLine(`${ts}${header}`);
    channel.append(body.endsWith('\n') ? body : body + '\n');
  };

  const flushNew = (doc: vscode.NotebookDocument, cell: vscode.NotebookCell) => {
    if (!enabled || !shouldMirrorDoc(doc)) return;
    const prev = seen.get(cell) ?? { outLen: 0, errLen: 0, txtLen: 0 };
    const { outText, errText, txtText } = readStreams(cell);

    if (outText.length > prev.outLen) {
      append(`[stdout] ${label(doc, cell)}`, outText.slice(prev.outLen));
      prev.outLen = outText.length;
    }
    if (errText.length > prev.errLen) {
      append(`[stderr] ${label(doc, cell)}`, errText.slice(prev.errLen));
      prev.errLen = errText.length;
    }
    if (txtText.length > prev.txtLen) {
      append(`[text/plain] ${label(doc, cell)}`, txtText.slice(prev.txtLen));
      prev.txtLen = txtText.length;
    }
    seen.set(cell, prev);
  };

  const seedDoc = (doc: vscode.NotebookDocument) => {
    for (const cell of doc.getCells()) flushNew(doc, cell);
  };

  // Seed already-open notebooks
  for (const doc of vscode.workspace.notebookDocuments) seedDoc(doc);

  // Events
  context.subscriptions.push(
    vscode.workspace.onDidOpenNotebookDocument(seedDoc),
    vscode.workspace.onDidChangeNotebookDocument(e => {
      for (const cell of e.notebook.getCells()) flushNew(e.notebook, cell);
    }),
    vscode.window.onDidChangeActiveNotebookEditor(() => channel.show(true)),
    vscode.commands.registerCommand('jupyterOutputMirror.toggle', () => {
      enabled = !enabled;
      vscode.window.showInformationMessage(`Jupyter Output Mirror: ${enabled ? 'ON' : 'OFF'}`);
    }),
    vscode.commands.registerCommand('jupyterOutputMirror.clear', () => channel.clear())
  );

  channel.show(true);
}

export function deactivate() {}

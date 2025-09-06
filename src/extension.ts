import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { spawn } from "child_process";

const STDOUT_MIME = "application/vnd.code.notebook.stdout";
const STDERR_MIME = "application/vnd.code.notebook.stderr";
const TEXT_MIME = "text/plain";

type SeenLens = { outLen: number; errLen: number; txtLen: number };

// Helper functions for quickstart content
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
4. Check the **"Jupyter Output Mirror"** output channel (View → Output)

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

function getSetupGuideHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Jupyter Output Mirror - Setup Guide</title>
    <style>
      :root {
        --vscode-font-family: var(--vscode-font-family);
        --container-paddding: 20px;
        --input-padding-vertical: 6px;
        --input-padding-horizontal: 4px;
        --input-margin-vertical: 2px;
        --input-margin-horizontal: 0;
      }

      body {
        padding: 0 var(--container-paddding);
        color: var(--vscode-foreground);
        font-size: var(--vscode-font-size);
        font-weight: var(--vscode-font-weight);
        font-family: var(--vscode-font-family);
        background-color: var(--vscode-editor-background);
        line-height: 1.6;
      }

      h1, h2, h3 {
        color: var(--vscode-foreground);
      }

      .hero {
        text-align: center;
        margin: 2rem 0;
        padding: 2rem;
        background: var(--vscode-textBlockQuote-background);
        border-radius: 8px;
        border-left: 4px solid var(--vscode-textLink-foreground);
      }

      .hero h1 {
        margin: 0 0 1rem 0;
        font-size: 2.5rem;
      }

      .hero p {
        font-size: 1.2rem;
        margin: 0;
        color: var(--vscode-descriptionForeground);
      }

      .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1rem;
        margin: 2rem 0;
      }

      .feature-card {
        padding: 1.5rem;
        background: var(--vscode-textBlockQuote-background);
        border-radius: 6px;
        border: 1px solid var(--vscode-textBlockQuote-border);
      }

      .setting-control {
        margin: 1rem 0;
        padding: 1rem;
        background: var(--vscode-textCodeBlock-background);
        border-radius: 6px;
        border: 1px solid var(--vscode-textBlockQuote-border);
      }

      .setting-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .setting-name {
        font-weight: bold;
        color: var(--vscode-textLink-foreground);
      }

      .setting-description {
        color: var(--vscode-descriptionForeground);
        font-size: 0.9rem;
        margin-bottom: 1rem;
      }

      .demo-section {
        margin: 2rem 0;
        padding: 1.5rem;
        background: var(--vscode-textBlockQuote-background);
        border-radius: 8px;
        border-left: 4px solid var(--vscode-charts-blue);
      }

      .notebook-cell {
        margin: 1rem 0;
        border: 1px solid var(--vscode-textBlockQuote-border);
        border-radius: 6px;
        overflow: hidden;
      }

      .cell-header {
        background: var(--vscode-badge-background);
        color: var(--vscode-badge-foreground);
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
        font-weight: bold;
      }

      .cell-content {
        padding: 1rem;
        background: var(--vscode-textCodeBlock-background);
        position: relative;
      }

      .cell-content pre {
        margin: 0;
        color: var(--vscode-foreground);
        font-family: var(--vscode-editor-font-family);
      }

      .copy-button {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        padding: 0.3rem 0.8rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
      }

      .copy-button:hover {
        background: var(--vscode-button-hoverBackground);
      }

      .action-button {
        background: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        padding: 0.8rem 1.5rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        margin: 0.5rem 0.5rem 0.5rem 0;
        transition: background-color 0.2s;
      }

      .action-button:hover {
        background: var(--vscode-button-hoverBackground);
      }

      .action-button.secondary {
        background: var(--vscode-button-secondaryBackground);
        color: var(--vscode-button-secondaryForeground);
      }

      .action-button.secondary:hover {
        background: var(--vscode-button-secondaryHoverBackground);
      }

      .toggle-switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
      }

      .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--vscode-textBlockQuote-border);
        transition: 0.4s;
        border-radius: 24px;
      }

      .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: var(--vscode-foreground);
        transition: 0.4s;
        border-radius: 50%;
      }

      input:checked + .slider {
        background-color: var(--vscode-textLink-foreground);
      }

      input:checked + .slider:before {
        transform: translateX(26px);
      }

      .output-preview {
        margin: 1rem 0;
        padding: 1rem;
        background: var(--vscode-terminal-background);
        color: var(--vscode-terminal-foreground);
        border-radius: 4px;
        font-family: var(--vscode-editor-font-family);
        font-size: 0.9rem;
        border: 1px solid var(--vscode-textBlockQuote-border);
      }

      .timestamp {
        color: var(--vscode-charts-blue);
      }

      .context-info {
        color: var(--vscode-charts-purple);
      }

      .stdout {
        color: var(--vscode-charts-green);
      }

      .stderr {
        color: var(--vscode-charts-red);
      }

      .quick-actions {
        margin: 2rem 0;
        text-align: center;
      }

      .icon {
        margin-right: 0.5rem;
      }
    </style>
  </head>
  <body>
    <!-- Hero Section -->
    <div class="hero">
      <h1>🚀 Jupyter Output Mirror</h1>
      <p>Real-time stdout/stderr mirroring for Jupyter notebooks in VS Code</p>
    </div>

    <!-- Features Overview -->
    <div class="feature-grid">
      <div class="feature-card">
        <h3>🔄 Real-time Mirroring</h3>
        <p>See stdout/stderr outputs in VS Code's Output panel as they happen</p>
      </div>
      <div class="feature-card">
        <h3>⚙️ Highly Configurable</h3>
        <p>Timestamps, ANSI stripping, channel modes, and more</p>
      </div>
      <div class="feature-card">
        <h3>📊 Multiple Output Types</h3>
        <p>Supports stdout, stderr, and text/plain outputs</p>
      </div>
      <div class="feature-card">
        <h3>🎯 Smart Focusing</h3>
        <p>Option to mirror only from the active notebook</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h2>🎯 Quick Start</h2>
      <button class="action-button" onclick="createDemoNotebook()">
        <span class="icon">📓</span>Create Demo Notebook
      </button>
      <button class="action-button secondary" onclick="openOutputChannel()">
        <span class="icon">📊</span>Open Output Channel
      </button>
    </div>

    <!-- Interactive Settings -->
    <div class="demo-section">
      <h2>⚙️ Interactive Settings Configuration</h2>
      <p>Try changing these settings and see how they affect the output preview below:</p>

      <!-- Timestamp Setting -->
      <div class="setting-control">
        <div class="setting-header">
          <span class="setting-name">Timestamps</span>
          <label class="toggle-switch">
            <input type="checkbox" id="timestamp-toggle" checked onchange="updateSetting('timestamp', this.checked)" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="setting-description">Add ISO timestamps to each output line for better debugging</div>
      </div>

      <!-- Source Context Setting -->
      <div class="setting-control">
        <div class="setting-header">
          <span class="setting-name">Include Source Context</span>
          <label class="toggle-switch">
            <input type="checkbox" id="context-toggle" checked onchange="updateSetting('includeSourceContext', this.checked)" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="setting-description">Show which notebook and cell produced each output</div>
      </div>

      <!-- Active Notebook Only Setting -->
      <div class="setting-control">
        <div class="setting-header">
          <span class="setting-name">Active Notebook Only</span>
          <label class="toggle-switch">
            <input type="checkbox" id="active-only-toggle" checked onchange="updateSetting('activeNotebookOnly', this.checked)" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="setting-description">Mirror outputs only from the currently focused notebook</div>
      </div>

      <!-- Strip ANSI Setting -->
      <div class="setting-control">
        <div class="setting-header">
          <span class="setting-name">Strip ANSI Colors</span>
          <label class="toggle-switch">
            <input type="checkbox" id="strip-ansi-toggle" checked onchange="updateSetting('stripAnsi', this.checked)" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="setting-description">Remove color codes from output for cleaner text</div>
      </div>

      <!-- Live Preview -->
      <h3>📋 Output Preview</h3>
      <div class="output-preview" id="output-preview">
        <!-- Dynamic content will be inserted here -->
      </div>
    </div>

    <!-- Demo Notebook Cells -->
    <div class="demo-section">
      <h2>📓 Try These Notebook Examples</h2>
      <p>Copy and run these cells in a Jupyter notebook to see the extension in action:</p>

      <!-- Basic Example -->
      <div class="notebook-cell">
        <div class="cell-header">Python Cell - Basic Example</div>
        <div class="cell-content">
          <button class="copy-button" onclick="copyToClipboard('basic-example')">Copy</button>
          <pre id="basic-example">import sys
import time

print("Hello from stdout!")
sys.stderr.write("Hello from stderr!\\n")
print("Processing...")
time.sleep(1)
print("✅ Complete!")</pre>
        </div>
      </div>

      <!-- Advanced Example -->
      <div class="notebook-cell">
        <div class="cell-header">Python Cell - Advanced Example</div>
        <div class="cell-content">
          <button class="copy-button" onclick="copyToClipboard('advanced-example')">Copy</button>
          <pre id="advanced-example"># Test multiple output types
import sys
import json

print("=== Testing Output Types ===")
for i in range(3):
    print(f"Step {i+1}: Processing...")
    if i == 1:
        sys.stderr.write("⚠️  Warning: Test warning message\\n")

data = {"status": "success", "items": 42}
print("Result:", json.dumps(data, indent=2))</pre>
        </div>
      </div>

      <!-- Streaming Example -->
      <div class="notebook-cell">
        <div class="cell-header">Python Cell - Streaming Output</div>
        <div class="cell-content">
          <button class="copy-button" onclick="copyToClipboard('streaming-example')">Copy</button>
          <pre id="streaming-example"># Test streaming and real-time updates
import time
import sys

print("🚀 Starting streaming demo...")
for i in range(5):
    print(f"⏳ Progress: {i+1}/5", end="")
    time.sleep(0.5)
    print(" ✓")

print("\\n🎉 Streaming complete!")
sys.stderr.write("ℹ️  Check the Output channel for real-time updates!\\n")</pre>
        </div>
      </div>
    </div>

    <!-- Configuration Guide -->
    <div class="demo-section">
      <h2>🔧 Configuration Options</h2>
      <p>Open VS Code Settings (<kbd>Ctrl+,</kbd>) and search for "Jupyter Output Mirror" to access these options:</p>

      <div class="setting-control">
        <div class="setting-name">Channel Mode</div>
        <div class="setting-description">
          <strong>single</strong>: Use one shared output channel for all notebooks<br />
          <strong>perNotebook</strong>: Create separate channels for each notebook
        </div>
      </div>

      <div class="setting-control">
        <div class="setting-name">Debounce (ms)</div>
        <div class="setting-description">
          Delay between output updates (default: 50ms). Increase for high-volume outputs.
        </div>
      </div>

      <div class="setting-control">
        <div class="setting-name">Max Chunk Size</div>
        <div class="setting-description">
          Maximum characters per output chunk (default: 65536). Prevents output flooding.
        </div>
      </div>
    </div>

    <!-- Troubleshooting -->
    <div class="demo-section">
      <h2>🔍 Troubleshooting</h2>

      <div class="setting-control">
        <div class="setting-name">Not seeing outputs?</div>
        <div class="setting-description">
          • Ensure Jupyter extension is installed and working<br />
          • Check extension is enabled: <code>Jupyter Output Mirror: Toggle</code><br />
          • Verify your code actually produces stdout/stderr
        </div>
      </div>

      <div class="setting-control">
        <div class="setting-name">Too much output?</div>
        <div class="setting-description">
          • Adjust "Max Chunk Size" setting<br />
          • Increase debounce delay<br />
          • Enable "Active Notebook Only" mode
        </div>
      </div>
    </div>

    <script>
      // Initialize the VS Code API
      const vscode = acquireVsCodeApi();

      // Current settings state
      let currentSettings = {
        timestamp: true,
        includeSourceContext: true,
        activeNotebookOnly: true,
        stripAnsi: true,
      };

      function updateSetting(settingName, value) {
        currentSettings[settingName] = value;

        // Send setting update to VS Code
        vscode.postMessage({
          command: "updateSetting",
          setting: \`jupyterOutputMirror.\${settingName}\`,
          value: value,
        });

        // Update the preview
        updateOutputPreview();
      }

      function updateOutputPreview() {
        const preview = document.getElementById("output-preview");
        const timestamp = currentSettings.timestamp ? "[2025-09-05T15:30:45.123Z] " : "";
        const context = currentSettings.includeSourceContext ? "[stdout] demo.ipynb #2" : "";

        let output = "";

        if (currentSettings.timestamp) {
          output += '<span class="timestamp">' + timestamp + "</span>";
        }

        if (currentSettings.includeSourceContext) {
          output += '<span class="context-info">' + context + "</span>";
          if (currentSettings.timestamp) output += "<br>";
        }

        output += '<span class="stdout">Hello from stdout!</span><br>';

        if (currentSettings.timestamp) {
          output += '<span class="timestamp">[2025-09-05T15:30:45.124Z] </span>';
        }

        if (currentSettings.includeSourceContext) {
          output += '<span class="context-info">[stderr] demo.ipynb #2</span>';
          if (currentSettings.timestamp) output += "<br>";
        }

        output += '<span class="stderr">Warning: Test message</span>';

        preview.innerHTML = output;
      }

      function copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        const text = element.textContent;

        navigator.clipboard.writeText(text).then(() => {
          // Show feedback
          const button = element.parentElement.querySelector(".copy-button");
          const originalText = button.textContent;
          button.textContent = "Copied!";
          setTimeout(() => {
            button.textContent = originalText;
          }, 2000);
        });
      }

      function createDemoNotebook() {
        vscode.postMessage({
          command: "createDemo",
        });
      }

      function openOutputChannel() {
        vscode.postMessage({
          command: "openOutput",
        });
      }

      // Initialize the preview
      updateOutputPreview();

      // Listen for messages from the extension
      window.addEventListener("message", (event) => {
        const message = event.data;
        switch (message.command) {
          case "updateSettings":
            // Update UI based on current settings
            Object.assign(currentSettings, message.settings);
            updateControlsFromSettings();
            updateOutputPreview();
            break;
        }
      });

      function updateControlsFromSettings() {
        document.getElementById("timestamp-toggle").checked = currentSettings.timestamp;
        document.getElementById("context-toggle").checked = currentSettings.includeSourceContext;
        document.getElementById("active-only-toggle").checked = currentSettings.activeNotebookOnly;
        document.getElementById("strip-ansi-toggle").checked = currentSettings.stripAnsi;
      }
    </script>
  </body>
</html>`;
}

// Function to get the active Jupyter interpreter
async function getActiveJupyterInterpreter(): Promise<{
  success: boolean;
  interpreterPath?: string;
  displayName?: string;
  error?: string;
}> {
  try {
    // Try to get the Python extension
    const pythonExtension = vscode.extensions.getExtension("ms-python.python");
    if (!pythonExtension) {
      return {
        success: false,
        error: "Python extension not found",
      };
    }

    // Ensure the Python extension is activated
    if (!pythonExtension.isActive) {
      await pythonExtension.activate();
    }

    // Try to get the active interpreter from the Python extension
    const pythonApi = pythonExtension.exports;
    if (pythonApi && pythonApi.environments) {
      // Get the active interpreter for the current workspace
      const activeInterpreter =
        await pythonApi.environments.getActiveEnvironmentPath();
      if (activeInterpreter && activeInterpreter.path) {
        return {
          success: true,
          interpreterPath: activeInterpreter.path,
          displayName: activeInterpreter.displayName || activeInterpreter.path,
        };
      }
    }

    // Fallback: try to detect from active notebook document
    const activeNotebook = vscode.window.activeNotebookEditor?.notebook;
    if (activeNotebook && activeNotebook.notebookType === "jupyter-notebook") {
      // Try to get kernel info
      try {
        const kernelId = (activeNotebook.metadata as any)?.kernelspec?.name;
        if (kernelId) {
          return {
            success: true,
            interpreterPath: "python3", // Fallback to default
            displayName: `Jupyter Kernel: ${kernelId}`,
          };
        }
      } catch (err) {
        console.log("Could not get kernel info:", err);
      }
    }

    return {
      success: false,
      error: "No active Jupyter interpreter detected",
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to detect interpreter: ${error}`,
    };
  }
}

// Function to test Python interpreter
async function testPythonInterpreter(
  pythonPath: string
): Promise<{ success: boolean; version?: string; error?: string }> {
  return new Promise((resolve) => {
    // Test the Python interpreter by getting version info
    const testProcess = spawn(pythonPath, ["--version"], {
      stdio: ["pipe", "pipe", "pipe"],
      shell: true,
    });

    let stdout = "";
    let stderr = "";

    testProcess.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    testProcess.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    testProcess.on("close", (code: number) => {
      if (code === 0) {
        // Python version info often goes to stderr, try both
        const version = (stdout + stderr).trim();
        resolve({
          success: true,
          version: version || "Python (version info not available)",
        });
      } else {
        resolve({
          success: false,
          error: `Exit code ${code}: ${stderr || stdout || "Unknown error"}`,
        });
      }
    });

    testProcess.on("error", (error: Error) => {
      resolve({ success: false, error: `Failed to run: ${error.message}` });
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      testProcess.kill();
      resolve({ success: false, error: "Test timeout (5s)" });
    }, 5000);
  });
}

// Function to execute notebook cells from the setup guide
async function executeNotebookCellInWebview(
  cellId: string,
  code: string,
  pythonPath: string,
  panel: vscode.WebviewPanel
) {
  try {
    // Send initial status to webview
    panel.webview.postMessage({
      command: "cellExecutionStarted",
      cellId: cellId,
    });

    // Use the provided Python path
    const pythonExecutable = pythonPath || "python3";

    // Execute Python code
    const pythonProcess = spawn(pythonExecutable, ["-c", code], {
      stdio: ["pipe", "pipe", "pipe"],
      shell: true,
    });

    let hasOutput = false;

    pythonProcess.stdout.on("data", (data: Buffer) => {
      const output = data.toString();
      hasOutput = true;

      // Send incremental output to webview
      panel.webview.postMessage({
        command: "cellExecutionOutput",
        cellId: cellId,
        output: output,
        stream: "stdout",
      });
    });

    pythonProcess.stderr.on("data", (data: Buffer) => {
      const output = data.toString();
      hasOutput = true;

      // Send incremental output to webview
      panel.webview.postMessage({
        command: "cellExecutionOutput",
        cellId: cellId,
        output: output,
        stream: "stderr",
      });
    });

    pythonProcess.on("close", (code: number) => {
      // Send completion status to webview
      panel.webview.postMessage({
        command: "cellExecutionCompleted",
        cellId: cellId,
        exitCode: code,
        hasOutput: hasOutput,
      });
    });

    pythonProcess.on("error", (error: Error) => {
      // Send error to webview
      panel.webview.postMessage({
        command: "cellExecutionError",
        cellId: cellId,
        error: error.message,
      });
    });
  } catch (error) {
    // Send error to webview
    panel.webview.postMessage({
      command: "cellExecutionError",
      cellId: cellId,
      error: `Failed to execute Python code: ${error}`,
    });
  }
}

export async function activate(context: vscode.ExtensionContext) {
  const cfg = () => vscode.workspace.getConfiguration("jupyterOutputMirror");

  const channelSingleton = vscode.window.createOutputChannel(
    "Jupyter Output Mirror"
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
      const relativePath = vscode.workspace.asRelativePath(doc.uri);
      const name = `Jupyter Output Mirror: ${relativePath}`;
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
      "jupyterOutputMirror.showQuickStart",
      async () => {
        try {
          // Create and show the webview panel
          const panel = vscode.window.createWebviewPanel(
            "jupyterOutputMirrorSetup",
            "Jupyter Output Mirror - Setup Guide",
            vscode.ViewColumn.One,
            {
              enableScripts: true,
              retainContextWhenHidden: true,
              localResourceRoots: [
                vscode.Uri.file(path.join(context.extensionPath, "src")),
              ],
            }
          );

          // Load the HTML content
          // Try to load from assets directory first (packaged extension)
          let setupGuidePath = path.join(
            context.extensionPath,
            "out",
            "assets",
            "setup-guide.html"
          );

          // Fallback to src directory (development)
          if (!fs.existsSync(setupGuidePath)) {
            setupGuidePath = path.join(
              context.extensionPath,
              "src",
              "setup-guide.html"
            );
          }

          let htmlContent = "";

          if (fs.existsSync(setupGuidePath)) {
            htmlContent = fs.readFileSync(setupGuidePath, "utf8");
          } else {
            // Fallback content if file doesn't exist
            htmlContent = getSetupGuideHTML();
          }

          panel.webview.html = htmlContent;

          // Handle messages from the webview
          panel.webview.onDidReceiveMessage(
            async (message) => {
              switch (message.command) {
                case "updateSetting":
                  try {
                    const config = vscode.workspace.getConfiguration();
                    await config.update(
                      message.setting,
                      message.value,
                      vscode.ConfigurationTarget.Global
                    );
                    vscode.window.showInformationMessage(
                      `Updated ${message.setting} to ${message.value}`
                    );
                  } catch (error) {
                    vscode.window.showErrorMessage(
                      `Failed to update setting: ${error}`
                    );
                  }
                  break;

                case "resetSettings":
                  try {
                    const config = vscode.workspace.getConfiguration();
                    // Reset all Jupyter Output Mirror settings to defaults
                    const settingsToReset = [
                      { key: "jupyterOutputMirror.timestamp", default: true },
                      {
                        key: "jupyterOutputMirror.includeSourceContext",
                        default: true,
                      },
                      {
                        key: "jupyterOutputMirror.activeNotebookOnly",
                        default: true,
                      },
                      { key: "jupyterOutputMirror.stripAnsi", default: true },
                      {
                        key: "jupyterOutputMirror.channelMode",
                        default: "single",
                      },
                      { key: "jupyterOutputMirror.debounceMs", default: 50 },
                      {
                        key: "jupyterOutputMirror.maxChunkSize",
                        default: 8192,
                      },
                      {
                        key: "jupyterOutputMirror.clearOnNotebookClear",
                        default: false,
                      },
                      {
                        key: "jupyterOutputMirror.includeTextPlain",
                        default: false,
                      },
                      { key: "jupyterOutputMirror.debug", default: false },
                    ];

                    for (const setting of settingsToReset) {
                      await config.update(
                        setting.key,
                        setting.default,
                        vscode.ConfigurationTarget.Global
                      );
                    }

                    vscode.window.showInformationMessage(
                      "✅ All Jupyter Output Mirror settings reset to defaults"
                    );
                  } catch (error) {
                    vscode.window.showErrorMessage(
                      `Failed to reset settings: ${error}`
                    );
                  }
                  break;

                case "openOutput":
                  // Show the output channel
                  const mode = cfg().get<"single" | "perNotebook">(
                    "channelMode",
                    "single"
                  );
                  if (mode === "single") {
                    channelSingleton.show(true);
                  } else {
                    // Show the most recently active channel
                    const activeEditor = vscode.window.activeNotebookEditor;
                    if (activeEditor) {
                      getChannel(activeEditor.notebook).show(true);
                    } else {
                      channelSingleton.show(true);
                    }
                  }
                  break;

                case "getActiveJupyterInterpreter":
                  try {
                    const result = await getActiveJupyterInterpreter();
                    panel.webview.postMessage({
                      command: "activeJupyterInterpreterResult",
                      success: result.success,
                      interpreterPath: result.interpreterPath,
                      displayName: result.displayName,
                      error: result.error,
                    });
                  } catch (error) {
                    panel.webview.postMessage({
                      command: "activeJupyterInterpreterResult",
                      success: false,
                      error: `Detection failed: ${error}`,
                    });
                  }
                  break;

                case "selectJupyterInterpreter":
                  try {
                    // Trigger the Jupyter interpreter selection command
                    await vscode.commands.executeCommand(
                      "jupyter.selectJupyterInterpreter"
                    );
                    // After selection, get the new active interpreter
                    setTimeout(async () => {
                      const result = await getActiveJupyterInterpreter();
                      panel.webview.postMessage({
                        command: "activeJupyterInterpreterResult",
                        success: result.success,
                        interpreterPath: result.interpreterPath,
                        displayName: result.displayName,
                        error: result.error,
                      });
                    }, 1000); // Give some time for the selection to complete
                  } catch (error) {
                    vscode.window.showErrorMessage(
                      `Failed to open interpreter selection: ${error}`
                    );
                  }
                  break;

                case "testPythonInterpreter":
                  try {
                    const result = await testPythonInterpreter(
                      message.pythonPath
                    );
                    panel.webview.postMessage({
                      command: "pythonTestResult",
                      success: result.success,
                      version: result.version,
                      error: result.error,
                    });
                  } catch (error) {
                    panel.webview.postMessage({
                      command: "pythonTestResult",
                      success: false,
                      error: `Test failed: ${error}`,
                    });
                  }
                  break;

                case "executeNotebookCell":
                  try {
                    await executeNotebookCellInWebview(
                      message.cellId,
                      message.code,
                      message.pythonPath || "python3",
                      panel
                    );
                  } catch (error) {
                    console.error("Cell execution failed:", error);
                    panel.webview.postMessage({
                      command: "cellExecutionResult",
                      cellId: message.cellId,
                      success: false,
                      error: `Execution failed: ${error}`,
                    });
                  }
                  break;
              }
            },
            undefined,
            context.subscriptions
          );

          // Send current settings to the webview
          const currentSettings = {
            timestamp: cfg().get<boolean>("timestamp", true),
            includeSourceContext: cfg().get<boolean>(
              "includeSourceContext",
              true
            ),
            activeNotebookOnly: cfg().get<boolean>("activeNotebookOnly", true),
            stripAnsi: cfg().get<boolean>("stripAnsi", true),
          };

          panel.webview.postMessage({
            command: "updateSettings",
            settings: currentSettings,
          });
        } catch (err) {
          console.error("showQuickStart command failed", err);
          vscode.window.showErrorMessage("Failed to open Setup Guide");
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

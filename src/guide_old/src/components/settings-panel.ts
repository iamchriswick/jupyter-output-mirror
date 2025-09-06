import { VSCodeAPIHandler } from "../utils/vscode-api";

export interface Settings {
  timestamp: boolean;
  includeSourceContext: boolean;
  activeNotebookOnly: boolean;
  stripAnsi: boolean;
  channelMode: "single" | "perNotebook";
  debounceMs: number;
  maxChunkSize: number;
  clearOnNotebookClear: boolean;
  includeTextPlain: boolean;
  debug: boolean;
}

export class SettingsPanel {
  private container: HTMLElement;
  private vscode: VSCodeAPIHandler;
  private settings: Settings;

  constructor(container: HTMLElement, vscode: VSCodeAPIHandler) {
    this.container = container;
    this.vscode = vscode;
    this.settings = this.getDefaultSettings();

    this.setupMessageHandlers();
    this.render();
  }

  private getDefaultSettings(): Settings {
    return {
      timestamp: true,
      includeSourceContext: true,
      activeNotebookOnly: true,
      stripAnsi: true,
      channelMode: "single",
      debounceMs: 50,
      maxChunkSize: 8192,
      clearOnNotebookClear: false,
      includeTextPlain: false,
      debug: false,
    };
  }

  private setupMessageHandlers() {
    this.vscode.onMessage("updateSettings", (message) => {
      Object.assign(this.settings, message.settings);
      this.updateControls();
      this.updateOutputPreview();
    });
  }

  private render() {
    this.container.innerHTML = `
      <h2>⚙️ Interactive Settings Configuration</h2>
      <p>Try changing these settings and see how they affect the output preview below:</p>

      <!-- Timestamp Setting -->
      <div class="setting-control">
        <div class="setting-header">
          <span class="setting-name">Timestamps</span>
          <label class="toggle-switch">
            <input type="checkbox" id="timestamp-toggle" ${
              this.settings.timestamp ? "checked" : ""
            } />
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
            <input type="checkbox" id="context-toggle" ${
              this.settings.includeSourceContext ? "checked" : ""
            } />
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
            <input type="checkbox" id="active-only-toggle" ${
              this.settings.activeNotebookOnly ? "checked" : ""
            } />
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
            <input type="checkbox" id="strip-ansi-toggle" ${
              this.settings.stripAnsi ? "checked" : ""
            } />
            <span class="slider"></span>
          </label>
        </div>
        <div class="setting-description">Remove color codes from output for cleaner text</div>
      </div>

      <!-- Channel Mode Setting -->
      <div class="setting-control">
        <div class="setting-header">
          <span class="setting-name">Channel Mode</span>
          <select id="channel-mode-select" style="
            background: var(--vscode-dropdown-background);
            color: var(--vscode-dropdown-foreground);
            border: 1px solid var(--vscode-dropdown-border);
            padding: 0.3rem;
            border-radius: 2px;
            font-family: inherit;
          ">
            <option value="single" ${
              this.settings.channelMode === "single" ? "selected" : ""
            }>Single Channel</option>
            <option value="perNotebook" ${
              this.settings.channelMode === "perNotebook" ? "selected" : ""
            }>Per-Notebook Channels</option>
          </select>
        </div>
        <div class="setting-description">Choose between a single "Jupyter Output Mirror" channel or separate channels per notebook file</div>
      </div>

      <!-- Additional Settings -->
      <div class="setting-control">
        <div class="setting-header">
          <span class="setting-name">Clear On Notebook Clear</span>
          <label class="toggle-switch">
            <input type="checkbox" id="clear-on-notebook-clear-toggle" ${
              this.settings.clearOnNotebookClear ? "checked" : ""
            } />
            <span class="slider"></span>
          </label>
        </div>
        <div class="setting-description">When a notebook's outputs are cleared, also clear its mirrored Output channel</div>
      </div>

      <div class="setting-control">
        <div class="setting-header">
          <span class="setting-name">Include Text/Plain</span>
          <label class="toggle-switch">
            <input type="checkbox" id="include-text-plain-toggle" ${
              this.settings.includeTextPlain ? "checked" : ""
            } />
            <span class="slider"></span>
          </label>
        </div>
        <div class="setting-description">Also mirror text/plain outputs (not just stdout/stderr)</div>
      </div>

      <div class="setting-control">
        <div class="setting-header">
          <span class="setting-name">Debug Mode</span>
          <label class="toggle-switch">
            <input type="checkbox" id="debug-toggle" ${
              this.settings.debug ? "checked" : ""
            } />
            <span class="slider"></span>
          </label>
        </div>
        <div class="setting-description">Write verbose debug messages to Debug Console and the Output channel</div>
      </div>

      <!-- Reset Button -->
      <div class="reset-section" style="margin: 2rem 0; text-align: center">
        <button class="action-button secondary" id="reset-settings-btn">
          <span class="icon">🔄</span>Reset Settings to Default
        </button>
      </div>

      <!-- Output Preview -->
      <h3>📋 Output Preview</h3>
      <div class="output-preview" id="output-preview">
        <!-- Dynamic content will be inserted here -->
      </div>
    `;

    this.setupEventListeners();
    this.updateOutputPreview();
  }

  private setupEventListeners() {
    // Toggle switches
    const timestampToggle = this.container.querySelector(
      "#timestamp-toggle"
    ) as HTMLInputElement;
    timestampToggle?.addEventListener("change", () => {
      this.updateSetting("timestamp", timestampToggle.checked);
    });

    const contextToggle = this.container.querySelector(
      "#context-toggle"
    ) as HTMLInputElement;
    contextToggle?.addEventListener("change", () => {
      this.updateSetting("includeSourceContext", contextToggle.checked);
    });

    const activeOnlyToggle = this.container.querySelector(
      "#active-only-toggle"
    ) as HTMLInputElement;
    activeOnlyToggle?.addEventListener("change", () => {
      this.updateSetting("activeNotebookOnly", activeOnlyToggle.checked);
    });

    const stripAnsiToggle = this.container.querySelector(
      "#strip-ansi-toggle"
    ) as HTMLInputElement;
    stripAnsiToggle?.addEventListener("change", () => {
      this.updateSetting("stripAnsi", stripAnsiToggle.checked);
    });

    const clearOnNotebookClearToggle = this.container.querySelector(
      "#clear-on-notebook-clear-toggle"
    ) as HTMLInputElement;
    clearOnNotebookClearToggle?.addEventListener("change", () => {
      this.updateSetting(
        "clearOnNotebookClear",
        clearOnNotebookClearToggle.checked
      );
    });

    const includeTextPlainToggle = this.container.querySelector(
      "#include-text-plain-toggle"
    ) as HTMLInputElement;
    includeTextPlainToggle?.addEventListener("change", () => {
      this.updateSetting("includeTextPlain", includeTextPlainToggle.checked);
    });

    const debugToggle = this.container.querySelector(
      "#debug-toggle"
    ) as HTMLInputElement;
    debugToggle?.addEventListener("change", () => {
      this.updateSetting("debug", debugToggle.checked);
    });

    // Channel mode select
    const channelModeSelect = this.container.querySelector(
      "#channel-mode-select"
    ) as HTMLSelectElement;
    channelModeSelect?.addEventListener("change", () => {
      this.updateSetting("channelMode", channelModeSelect.value);
    });

    // Reset button
    const resetBtn = this.container.querySelector(
      "#reset-settings-btn"
    ) as HTMLButtonElement;
    resetBtn?.addEventListener("click", () => {
      this.vscode.resetSettings();
      resetBtn.innerHTML = '<span class="icon">✅</span>Settings Reset!';
      setTimeout(() => {
        resetBtn.innerHTML =
          '<span class="icon">🔄</span>Reset Settings to Default';
      }, 2000);
    });
  }

  private updateSetting(key: keyof Settings, value: any) {
    (this.settings as any)[key] = value;
    this.vscode.updateSetting(`jupyterOutputMirror.${key}`, value);
    this.updateOutputPreview();
  }

  private updateControls() {
    const timestampToggle = this.container.querySelector(
      "#timestamp-toggle"
    ) as HTMLInputElement;
    if (timestampToggle) timestampToggle.checked = this.settings.timestamp;

    const contextToggle = this.container.querySelector(
      "#context-toggle"
    ) as HTMLInputElement;
    if (contextToggle)
      contextToggle.checked = this.settings.includeSourceContext;

    const activeOnlyToggle = this.container.querySelector(
      "#active-only-toggle"
    ) as HTMLInputElement;
    if (activeOnlyToggle)
      activeOnlyToggle.checked = this.settings.activeNotebookOnly;

    const stripAnsiToggle = this.container.querySelector(
      "#strip-ansi-toggle"
    ) as HTMLInputElement;
    if (stripAnsiToggle) stripAnsiToggle.checked = this.settings.stripAnsi;

    const channelModeSelect = this.container.querySelector(
      "#channel-mode-select"
    ) as HTMLSelectElement;
    if (channelModeSelect) channelModeSelect.value = this.settings.channelMode;

    const clearOnNotebookClearToggle = this.container.querySelector(
      "#clear-on-notebook-clear-toggle"
    ) as HTMLInputElement;
    if (clearOnNotebookClearToggle)
      clearOnNotebookClearToggle.checked = this.settings.clearOnNotebookClear;

    const includeTextPlainToggle = this.container.querySelector(
      "#include-text-plain-toggle"
    ) as HTMLInputElement;
    if (includeTextPlainToggle)
      includeTextPlainToggle.checked = this.settings.includeTextPlain;

    const debugToggle = this.container.querySelector(
      "#debug-toggle"
    ) as HTMLInputElement;
    if (debugToggle) debugToggle.checked = this.settings.debug;
  }

  private updateOutputPreview() {
    const preview = this.container.querySelector("#output-preview");
    if (!preview) return;

    const timestamp = this.settings.timestamp
      ? "[2025-09-06T15:30:45.123Z] "
      : "";
    const context = this.settings.includeSourceContext
      ? "[stdout] demo.ipynb #2"
      : "";

    let output = "";

    if (this.settings.timestamp) {
      output += '<span class="timestamp">' + timestamp + "</span>";
    }

    if (this.settings.includeSourceContext) {
      output += '<span class="context-info">' + context + "</span>";
      if (this.settings.timestamp) output += "<br>";
    }

    output += '<span class="stdout">Hello from stdout!</span><br>';

    if (this.settings.timestamp) {
      output += '<span class="timestamp">[2025-09-06T15:30:45.124Z] </span>';
    }

    if (this.settings.includeSourceContext) {
      output += '<span class="context-info">[stderr] demo.ipynb #2</span>';
      if (this.settings.timestamp) output += "<br>";
    }

    output += '<span class="stderr">Warning: Test message</span>';

    preview.innerHTML = output;
  }
}

import { VSCodeAPIHandler } from "../utils/vscode-api";
import { PyodideRunner } from "../utils/pyodide-runner";

export class InterpreterSetup {
  private container: HTMLElement;
  private vscode: VSCodeAPIHandler;
  private pyodideRunner: PyodideRunner;
  private usesPyodide = true; // Default to Pyodide for self-contained experience

  constructor(container: HTMLElement, vscode: VSCodeAPIHandler) {
    this.container = container;
    this.vscode = vscode;
    this.pyodideRunner = new PyodideRunner();

    this.setupMessageHandlers();
    this.render();
    this.initializePyodide();
  }

  private setupMessageHandlers() {
    this.vscode.onMessage("activeJupyterInterpreterResult", (message) => {
      this.handleJupyterInterpreterResult(
        message.success,
        message.interpreterPath,
        message.displayName,
        message.error
      );
    });

    this.vscode.onMessage("pythonTestResult", (message) => {
      this.handlePythonTestResult(
        message.success,
        message.version,
        message.error
      );
    });
  }

  private render() {
    this.container.innerHTML = `
      <h2>🐍 Python Environment Setup</h2>
      <p>Choose your Python environment for running the interactive examples:</p>
      
      <!-- Environment Selection -->
      <div class="setting-control">
        <div class="setting-header">
          <span class="setting-name">Python Environment</span>
          <div style="display: flex; gap: 0.5rem;">
            <button class="action-button" id="use-pyodide-btn">
              <span class="icon">🌐</span> Use Browser Python (Pyodide)
            </button>
            <button class="action-button secondary" id="use-system-btn">
              <span class="icon">🖥️</span> Use System Python
            </button>
          </div>
        </div>
        <div class="setting-description">
          <strong>Browser Python (Recommended):</strong> Self-contained, fast, no setup required<br>
          <strong>System Python:</strong> Uses your local Jupyter environment
        </div>
        
        <!-- Environment Status -->
        <div id="environment-status" style="margin-top: 1rem; padding: 0.8rem; border-radius: 6px; display: none;">
          <div id="environment-info"></div>
        </div>
        
        <!-- System Python Detection -->
        <div id="system-python-section" style="display: none; margin-top: 1rem;">
          <div style="margin-bottom: 1rem;">
            <strong>Detect System Python:</strong>
          </div>
          <button class="action-button secondary" id="detect-jupyter-btn">
            <span class="icon">🔍</span> Auto-detect Jupyter Interpreter
          </button>
          <button class="action-button secondary" id="select-jupyter-btn">
            <span class="icon">🐍</span> Select Jupyter Interpreter
          </button>
          <div style="font-size: 0.8rem; color: var(--vscode-descriptionForeground); margin-top: 0.5rem;">
            Auto-detect uses your active Jupyter session's Python interpreter.
          </div>
        </div>
        
        <!-- Test Section -->
        <div style="margin-top: 1rem;" id="test-section">
          <button class="action-button secondary" id="test-btn">
            <span class="icon">🧪</span> Test Environment
          </button>
          <span id="test-result" style="margin-left: 1rem; font-size: 0.9rem;"></span>
        </div>
      </div>
    `;

    this.setupEventListeners();
    this.updateUI();
  }

  private setupEventListeners() {
    const usePyodideBtn = this.container.querySelector(
      "#use-pyodide-btn"
    ) as HTMLButtonElement;
    usePyodideBtn?.addEventListener("click", () => {
      this.usesPyodide = true;
      this.updateUI();
      this.initializePyodide();
    });

    const useSystemBtn = this.container.querySelector(
      "#use-system-btn"
    ) as HTMLButtonElement;
    useSystemBtn?.addEventListener("click", () => {
      this.usesPyodide = false;
      this.updateUI();
    });

    const detectJupyterBtn = this.container.querySelector(
      "#detect-jupyter-btn"
    ) as HTMLButtonElement;
    detectJupyterBtn?.addEventListener("click", () => {
      this.detectJupyterInterpreter();
    });

    const selectJupyterBtn = this.container.querySelector(
      "#select-jupyter-btn"
    ) as HTMLButtonElement;
    selectJupyterBtn?.addEventListener("click", () => {
      this.vscode.selectJupyterInterpreter();
    });

    const testBtn = this.container.querySelector(
      "#test-btn"
    ) as HTMLButtonElement;
    testBtn?.addEventListener("click", () => {
      this.testEnvironment();
    });
  }

  private updateUI() {
    const usePyodideBtn = this.container.querySelector(
      "#use-pyodide-btn"
    ) as HTMLButtonElement;
    const useSystemBtn = this.container.querySelector(
      "#use-system-btn"
    ) as HTMLButtonElement;
    const systemPythonSection = this.container.querySelector(
      "#system-python-section"
    ) as HTMLElement;

    if (this.usesPyodide) {
      usePyodideBtn?.classList.remove("secondary");
      useSystemBtn?.classList.add("secondary");
      systemPythonSection.style.display = "none";
    } else {
      usePyodideBtn?.classList.add("secondary");
      useSystemBtn?.classList.remove("secondary");
      systemPythonSection.style.display = "block";
    }
  }

  private async initializePyodide() {
    if (!this.usesPyodide) return;

    const statusDiv = this.container.querySelector(
      "#environment-status"
    ) as HTMLElement;
    const infoDiv = this.container.querySelector(
      "#environment-info"
    ) as HTMLElement;

    statusDiv.style.display = "block";
    statusDiv.style.background = "var(--vscode-textCodeBlock-background)";
    statusDiv.style.border = "1px solid var(--vscode-charts-blue)";
    infoDiv.innerHTML = `
      <div style="color: var(--vscode-charts-blue); font-weight: bold; margin-bottom: 0.5rem;">
        ⏳ Initializing Browser Python (Pyodide)...
      </div>
      <div style="font-size: 0.9rem;">
        Loading Python runtime and packages in the browser...
      </div>
    `;

    try {
      await this.pyodideRunner.initialize();

      infoDiv.innerHTML = `
        <div style="color: var(--vscode-charts-green); font-weight: bold; margin-bottom: 0.5rem;">
          ✅ Browser Python Ready
        </div>
        <div style="font-family: var(--vscode-editor-font-family); font-size: 0.9rem;">
          <strong>Environment:</strong> Pyodide (WebAssembly Python)<br>
          <strong>Version:</strong> ${this.pyodideRunner.getVersion()}<br>
          <strong>Packages:</strong> numpy, pandas, and standard library
        </div>
      `;
      statusDiv.style.border = "1px solid var(--vscode-charts-green)";
    } catch (error) {
      infoDiv.innerHTML = `
        <div style="color: var(--vscode-charts-red); font-weight: bold; margin-bottom: 0.5rem;">
          ❌ Failed to Initialize Pyodide
        </div>
        <div style="font-size: 0.9rem;">
          ${error}
        </div>
      `;
      statusDiv.style.border = "1px solid var(--vscode-charts-red)";
    }
  }

  private detectJupyterInterpreter() {
    const detectBtn = this.container.querySelector(
      "#detect-jupyter-btn"
    ) as HTMLButtonElement;
    const statusDiv = this.container.querySelector(
      "#environment-status"
    ) as HTMLElement;
    const infoDiv = this.container.querySelector(
      "#environment-info"
    ) as HTMLElement;

    const originalText = detectBtn.innerHTML;
    detectBtn.innerHTML = '<span class="icon">⏳</span> Detecting...';
    detectBtn.disabled = true;

    statusDiv.style.display = "block";
    statusDiv.style.background = "var(--vscode-textCodeBlock-background)";
    statusDiv.style.border = "1px solid var(--vscode-charts-blue)";
    infoDiv.innerHTML = `
      <div style="color: var(--vscode-charts-blue); font-weight: bold;">
        🔍 Detecting Jupyter interpreter...
      </div>
    `;

    this.vscode.getActiveJupyterInterpreter();

    // Reset button after timeout
    setTimeout(() => {
      if (detectBtn.disabled) {
        detectBtn.innerHTML = originalText;
        detectBtn.disabled = false;
      }
    }, 10000);
  }

  private handleJupyterInterpreterResult(
    success: boolean,
    interpreterPath?: string,
    displayName?: string,
    error?: string
  ) {
    const detectBtn = this.container.querySelector(
      "#detect-jupyter-btn"
    ) as HTMLButtonElement;
    const statusDiv = this.container.querySelector(
      "#environment-status"
    ) as HTMLElement;
    const infoDiv = this.container.querySelector(
      "#environment-info"
    ) as HTMLElement;

    detectBtn.innerHTML =
      '<span class="icon">🔍</span> Auto-detect Jupyter Interpreter';
    detectBtn.disabled = false;

    if (success && interpreterPath) {
      statusDiv.style.border = "1px solid var(--vscode-charts-green)";
      infoDiv.innerHTML = `
        <div style="color: var(--vscode-charts-green); font-weight: bold; margin-bottom: 0.5rem;">
          ✅ Jupyter Interpreter Detected
        </div>
        <div style="font-family: var(--vscode-editor-font-family); font-size: 0.9rem;">
          <strong>Path:</strong> ${interpreterPath}<br>
          <strong>Display Name:</strong> ${displayName || "Unknown"}
        </div>
      `;
    } else {
      statusDiv.style.border = "1px solid var(--vscode-charts-orange)";
      infoDiv.innerHTML = `
        <div style="color: var(--vscode-charts-orange); font-weight: bold; margin-bottom: 0.5rem;">
          ⚠️ Auto-detection Failed
        </div>
        <div style="font-size: 0.9rem;">
          ${error || "Could not detect active Jupyter interpreter"}
        </div>
      `;
    }
  }

  private async testEnvironment() {
    const testBtn = this.container.querySelector(
      "#test-btn"
    ) as HTMLButtonElement;
    const resultSpan = this.container.querySelector(
      "#test-result"
    ) as HTMLElement;

    const originalText = testBtn.innerHTML;
    testBtn.innerHTML = '<span class="icon">⏳</span> Testing...';
    testBtn.disabled = true;
    resultSpan.textContent = "";

    if (this.usesPyodide) {
      try {
        await this.pyodideRunner.initialize();
        const result = await this.pyodideRunner.runCode(
          'import sys; print(f"Python {sys.version}")'
        );

        if (result.success) {
          resultSpan.innerHTML = `<span style="color: var(--vscode-charts-green);">✅ ${result.output?.trim()}</span>`;
        } else {
          resultSpan.innerHTML = `<span style="color: var(--vscode-charts-red);">❌ ${result.error}</span>`;
        }
      } catch (error) {
        resultSpan.innerHTML = `<span style="color: var(--vscode-charts-red);">❌ ${error}</span>`;
      }
    } else {
      // Use system Python test via VS Code API
      this.vscode.testPythonInterpreter("python3"); // This would need the detected path
    }

    testBtn.innerHTML = originalText;
    testBtn.disabled = false;
  }

  private handlePythonTestResult(
    success: boolean,
    version?: string,
    error?: string
  ) {
    const resultSpan = this.container.querySelector(
      "#test-result"
    ) as HTMLElement;

    if (success) {
      resultSpan.innerHTML = `<span style="color: var(--vscode-charts-green);">✅ ${version}</span>`;
    } else {
      resultSpan.innerHTML = `<span style="color: var(--vscode-charts-red);">❌ ${error}</span>`;
    }
  }

  public getRunner(): PyodideRunner | null {
    return this.usesPyodide ? this.pyodideRunner : null;
  }

  public usesPyodideRunner(): boolean {
    return this.usesPyodide;
  }
}

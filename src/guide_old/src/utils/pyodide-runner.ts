// Pyodide Python execution utility
declare global {
  interface Window {
    loadPyodide: any;
  }
}

export class PyodideRunner {
  private pyodide: any = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.doInitialize();
    return this.initPromise;
  }

  private async doInitialize(): Promise<void> {
    try {
      console.log("Loading Pyodide...");
      this.pyodide = await window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
      });

      // Install commonly used packages
      await this.pyodide.loadPackage(["numpy", "pandas"]);

      this.isInitialized = true;
      console.log("Pyodide initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Pyodide:", error);
      throw error;
    }
  }

  async runCode(code: string): Promise<{
    success: boolean;
    output?: string;
    error?: string;
    plots?: string[];
  }> {
    try {
      await this.initialize();

      // Capture stdout/stderr
      this.pyodide.runPython(`
import sys
from io import StringIO
old_stdout = sys.stdout
old_stderr = sys.stderr
sys.stdout = StringIO()
sys.stderr = StringIO()
      `);

      // Execute the user code
      const result = this.pyodide.runPython(code);

      // Get captured output
      const stdout = this.pyodide.runPython("sys.stdout.getvalue()");
      const stderr = this.pyodide.runPython("sys.stderr.getvalue()");

      // Restore stdout/stderr
      this.pyodide.runPython(`
sys.stdout = old_stdout
sys.stderr = old_stderr
      `);

      let output = "";
      if (stdout) output += stdout;
      if (stderr) output += stderr;
      if (result !== undefined && result !== null) {
        output += String(result);
      }

      return {
        success: true,
        output: output || "Code executed successfully (no output)",
        plots: [], // Will be enhanced later for matplotlib plots
      };
    } catch (error) {
      // Restore stdout/stderr in case of error
      try {
        this.pyodide.runPython(`
sys.stdout = old_stdout
sys.stderr = old_stderr
        `);
      } catch (e) {
        // Ignore cleanup errors
      }

      return {
        success: false,
        error: String(error),
      };
    }
  }

  getVersion(): string {
    if (!this.isInitialized) return "Not initialized";
    try {
      return this.pyodide.runPython("import sys; sys.version");
    } catch {
      return "Pyodide (version unknown)";
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

// VS Code API types and utilities
interface VSCodeAPI {
  postMessage(message: any): void;
  getState(): any;
  setState(state: any): void;
}

declare global {
  interface Window {
    acquireVsCodeApi(): VSCodeAPI;
  }
}

export class VSCodeAPIHandler {
  private vscode: any;
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();

  constructor() {
    // @ts-ignore - vscode is injected by VS Code webview
    this.vscode = window.acquireVsCodeApi ? window.acquireVsCodeApi() : null;

    // Listen for messages from extension
    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.type) {
        const handlers = this.messageHandlers.get(message.type);
        if (handlers) {
          handlers.forEach((handler) => handler(message));
        }
      }
    });
  }

  postMessage(message: any): void {
    if (this.vscode) {
      this.vscode.postMessage(message);
    } else {
      console.warn("VS Code API not available");
    }
  }

  onMessage(type: string, handler: (data: any) => void): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler);
  }

  removeMessageHandler(type: string, handler: (data: any) => void): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  getActiveJupyterInterpreter(): void {
    this.postMessage({ type: "getActiveJupyterInterpreter" });
  }

  selectJupyterInterpreter(): void {
    this.postMessage({ type: "selectJupyterInterpreter" });
  }

  testPythonInterpreter(interpreterPath: string): void {
    this.postMessage({
      type: "testPythonInterpreter",
      interpreterPath,
    });
  }

  runPythonCode(code: string, exampleId: string): void {
    this.postMessage({
      type: "runPythonCode",
      code,
      exampleId,
    });
  }

  resetSettings(): void {
    this.postMessage({ type: "resetSettings" });
  }

  updateSetting(key: string, value: any): void {
    this.postMessage({
      type: "updateSetting",
      key,
      value,
    });
  }

  saveSettings(settings: any): void {
    this.postMessage({
      type: "saveSettings",
      settings,
    });
  }

  loadSettings(): void {
    this.postMessage({ type: "loadSettings" });
  }
}

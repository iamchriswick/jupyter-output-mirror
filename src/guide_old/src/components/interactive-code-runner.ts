import { VSCodeAPIHandler } from "../utils/vscode-api";
import { InterpreterSetup } from "./interpreter-setup";

export interface CodeExample {
  id: string;
  title: string;
  description: string;
  code: string;
  expectedOutput?: string;
}

export class InteractiveCodeRunner {
  private container: HTMLElement;
  private vscode: VSCodeAPIHandler;
  private interpreterSetup: InterpreterSetup;

  constructor(
    container: HTMLElement,
    vscode: VSCodeAPIHandler,
    interpreterSetup: InterpreterSetup
  ) {
    this.container = container;
    this.vscode = vscode;
    this.interpreterSetup = interpreterSetup;

    this.render();
  }

  private render() {
    this.container.innerHTML = `
      <h2>🧪 Interactive Examples</h2>
      <p>Test your Python environment with these interactive examples:</p>
      
      <div id="code-examples">
        <!-- Examples will be rendered here -->
      </div>
    `;

    this.renderExamples();
  }

  private renderExamples() {
    const examples: CodeExample[] = [
      {
        id: "basic-test",
        title: "Basic Python Test",
        description: "Verify Python is working and check the version",
        code: `import sys
import platform

print(f"Python version: {sys.version}")
print(f"Platform: {platform.system()} {platform.release()}")
print(f"Executable: {sys.executable}")

# Test basic functionality
numbers = [1, 2, 3, 4, 5]
squares = [x**2 for x in numbers]
print(f"Squares: {squares}")`,
        expectedOutput: "Python version and basic list comprehension output",
      },
      {
        id: "numpy-test",
        title: "NumPy Array Operations",
        description: "Test NumPy functionality for data processing",
        code: `import numpy as np

# Create arrays
arr1 = np.array([1, 2, 3, 4, 5])
arr2 = np.array([6, 7, 8, 9, 10])

print(f"Array 1: {arr1}")
print(f"Array 2: {arr2}")
print(f"Sum: {arr1 + arr2}")
print(f"Element-wise product: {arr1 * arr2}")
print(f"Dot product: {np.dot(arr1, arr2)}")

# Matrix operations
matrix = np.random.rand(3, 3)
print(f"\\nRandom 3x3 matrix:")
print(matrix)
print(f"Matrix determinant: {np.linalg.det(matrix):.4f}")`,
        expectedOutput: "Array operations and matrix calculations",
      },
      {
        id: "pandas-test",
        title: "Pandas DataFrame",
        description: "Test pandas for data manipulation",
        code: `import pandas as pd
import numpy as np

# Create sample data
data = {
    'Name': ['Alice', 'Bob', 'Charlie', 'David', 'Eve'],
    'Age': [25, 30, 35, 28, 32],
    'Score': [85.5, 92.3, 78.1, 88.7, 94.2],
    'City': ['New York', 'London', 'Tokyo', 'Paris', 'Sydney']
}

df = pd.DataFrame(data)
print("Original DataFrame:")
print(df)

print(f"\\nDataFrame shape: {df.shape}")
print(f"Average age: {df['Age'].mean():.1f}")
print(f"Highest score: {df['Score'].max()}")

# Filter data
high_scorers = df[df['Score'] > 85]
print(f"\\nHigh scorers (>85):")
print(high_scorers[['Name', 'Score']])`,
        expectedOutput: "DataFrame display and basic statistics",
      },
    ];

    const examplesContainer = this.container.querySelector(
      "#code-examples"
    ) as HTMLElement;

    examples.forEach((example) => {
      const exampleElement = this.createExampleElement(example);
      examplesContainer.appendChild(exampleElement);
    });
  }

  private createExampleElement(example: CodeExample): HTMLElement {
    const element = document.createElement("div");
    element.className = "code-example";
    element.innerHTML = `
      <div class="example-header">
        <h3>${example.title}</h3>
        <div style="display: flex; gap: 0.5rem;">
          <button class="action-button secondary copy-btn">
            <span class="icon">📋</span> Copy
          </button>
          <button class="action-button run-btn" data-example-id="${example.id}">
            <span class="icon">▶️</span> Run
          </button>
        </div>
      </div>
      
      <p class="example-description">${example.description}</p>
      
      <div class="code-block">
        <pre><code>${this.escapeHtml(example.code)}</code></pre>
      </div>
      
      <div class="output-section" id="output-${
        example.id
      }" style="display: none;">
        <div class="output-header">
          <strong>Output:</strong>
          <span class="execution-time" id="time-${example.id}"></span>
        </div>
        <div class="output-content" id="content-${example.id}"></div>
      </div>
      
      ${
        example.expectedOutput
          ? `
        <div class="expected-output">
          <strong>Expected:</strong> ${example.expectedOutput}
        </div>
      `
          : ""
      }
    `;

    // Add event listeners
    const copyBtn = element.querySelector(".copy-btn") as HTMLButtonElement;
    copyBtn?.addEventListener("click", () => {
      navigator.clipboard.writeText(example.code);
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = '<span class="icon">✅</span> Copied';
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
      }, 2000);
    });

    const runBtn = element.querySelector(".run-btn") as HTMLButtonElement;
    runBtn?.addEventListener("click", () => {
      this.runExample(example);
    });

    return element;
  }

  private async runExample(example: CodeExample) {
    const runBtn = this.container.querySelector(
      `[data-example-id="${example.id}"]`
    ) as HTMLButtonElement;
    const outputSection = this.container.querySelector(
      `#output-${example.id}`
    ) as HTMLElement;
    const timeSpan = this.container.querySelector(
      `#time-${example.id}`
    ) as HTMLElement;
    const contentDiv = this.container.querySelector(
      `#content-${example.id}`
    ) as HTMLElement;

    // Show output section and update button
    outputSection.style.display = "block";
    const originalText = runBtn.innerHTML;
    runBtn.innerHTML = '<span class="icon">⏳</span> Running...';
    runBtn.disabled = true;

    contentDiv.innerHTML =
      '<div style="color: var(--vscode-charts-blue);">Executing code...</div>';

    const startTime = performance.now();

    try {
      if (this.interpreterSetup.usesPyodideRunner()) {
        // Use Pyodide for execution
        const pyodideRunner = this.interpreterSetup.getRunner();
        if (!pyodideRunner) {
          throw new Error("Pyodide runner not available");
        }

        const result = await pyodideRunner.runCode(example.code);
        const endTime = performance.now();

        timeSpan.textContent = `(${(endTime - startTime).toFixed(1)}ms)`;

        if (result.success) {
          contentDiv.innerHTML = `
            <div class="success-output">
              <pre>${this.escapeHtml(
                result.output || "Code executed successfully (no output)"
              )}</pre>
            </div>
          `;

          // Handle any plots or images
          if (result.plots && result.plots.length > 0) {
            result.plots.forEach((plot: string) => {
              const img = document.createElement("img");
              img.src = plot;
              img.style.maxWidth = "100%";
              img.style.marginTop = "1rem";
              contentDiv.appendChild(img);
            });
          }
        } else {
          contentDiv.innerHTML = `
            <div class="error-output">
              <strong>Error:</strong><br>
              <pre>${this.escapeHtml(result.error || "Unknown error")}</pre>
            </div>
          `;
        }
      } else {
        // Use system Python via VS Code extension
        // Set up temporary message handler for this execution
        const handleResult = (result: any) => {
          if (result.exampleId === example.id) {
            const endTime = performance.now();
            timeSpan.textContent = `(${(endTime - startTime).toFixed(1)}ms)`;

            if (result.success) {
              contentDiv.innerHTML = `
                <div class="success-output">
                  <pre>${this.escapeHtml(
                    result.output || "Code executed successfully (no output)"
                  )}</pre>
                </div>
              `;
            } else {
              contentDiv.innerHTML = `
                <div class="error-output">
                  <strong>Error:</strong><br>
                  <pre>${this.escapeHtml(result.error || "Unknown error")}</pre>
                </div>
              `;
            }

            // Clean up handler
            this.vscode.removeMessageHandler("pythonCodeResult", handleResult);
            runBtn.innerHTML = originalText;
            runBtn.disabled = false;
          }
        };

        this.vscode.onMessage("pythonCodeResult", handleResult);
        this.vscode.runPythonCode(example.code, example.id);

        // Timeout fallback
        setTimeout(() => {
          if (runBtn.disabled) {
            const endTime = performance.now();
            timeSpan.textContent = `(timeout after ${(
              endTime - startTime
            ).toFixed(1)}ms)`;
            contentDiv.innerHTML = `
              <div class="error-output">
                <strong>Timeout:</strong> Code execution took too long or failed to respond.
              </div>
            `;
            this.vscode.removeMessageHandler("pythonCodeResult", handleResult);
            runBtn.innerHTML = originalText;
            runBtn.disabled = false;
          }
        }, 30000);
      }
    } catch (error) {
      const endTime = performance.now();
      timeSpan.textContent = `(${(endTime - startTime).toFixed(1)}ms)`;
      contentDiv.innerHTML = `
        <div class="error-output">
          <strong>Execution Error:</strong><br>
          <pre>${this.escapeHtml(String(error))}</pre>
        </div>
      `;
      runBtn.innerHTML = originalText;
      runBtn.disabled = false;
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

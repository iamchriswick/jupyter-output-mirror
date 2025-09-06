var g=Object.defineProperty;var y=(l,e,t)=>e in l?g(l,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):l[e]=t;var d=(l,e,t)=>y(l,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function t(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(s){if(s.ep)return;s.ep=!0;const i=t(s);fetch(s.href,i)}})();class v{constructor(){d(this,"vscode");d(this,"messageHandlers",new Map);this.vscode=window.acquireVsCodeApi?window.acquireVsCodeApi():null,window.addEventListener("message",e=>{const t=e.data;if(t.type){const n=this.messageHandlers.get(t.type);n&&n.forEach(s=>s(t))}})}postMessage(e){this.vscode?this.vscode.postMessage(e):console.warn("VS Code API not available")}onMessage(e,t){this.messageHandlers.has(e)||this.messageHandlers.set(e,[]),this.messageHandlers.get(e).push(t)}removeMessageHandler(e,t){const n=this.messageHandlers.get(e);if(n){const s=n.indexOf(t);s>-1&&n.splice(s,1)}}getActiveJupyterInterpreter(){this.postMessage({type:"getActiveJupyterInterpreter"})}selectJupyterInterpreter(){this.postMessage({type:"selectJupyterInterpreter"})}testPythonInterpreter(e){this.postMessage({type:"testPythonInterpreter",interpreterPath:e})}runPythonCode(e,t){this.postMessage({type:"runPythonCode",code:e,exampleId:t})}resetSettings(){this.postMessage({type:"resetSettings"})}updateSetting(e,t){this.postMessage({type:"updateSetting",key:e,value:t})}saveSettings(e){this.postMessage({type:"saveSettings",settings:e})}loadSettings(){this.postMessage({type:"loadSettings"})}}class m{constructor(e,t){d(this,"container");d(this,"vscode");d(this,"settings");this.container=e,this.vscode=t,this.settings=this.getDefaultSettings(),this.setupMessageHandlers(),this.render()}getDefaultSettings(){return{timestamp:!0,includeSourceContext:!0,activeNotebookOnly:!0,stripAnsi:!0,channelMode:"single",debounceMs:50,maxChunkSize:8192,clearOnNotebookClear:!1,includeTextPlain:!1,debug:!1}}setupMessageHandlers(){this.vscode.onMessage("updateSettings",e=>{Object.assign(this.settings,e.settings),this.updateControls(),this.updateOutputPreview()})}render(){this.container.innerHTML=`
      <h2>⚙️ Interactive Settings Configuration</h2>
      <p>Try changing these settings and see how they affect the output preview below:</p>

      <!-- Timestamp Setting -->
      <div class="setting-control">
        <div class="setting-header">
          <span class="setting-name">Timestamps</span>
          <label class="toggle-switch">
            <input type="checkbox" id="timestamp-toggle" ${this.settings.timestamp?"checked":""} />
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
            <input type="checkbox" id="context-toggle" ${this.settings.includeSourceContext?"checked":""} />
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
            <input type="checkbox" id="active-only-toggle" ${this.settings.activeNotebookOnly?"checked":""} />
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
            <input type="checkbox" id="strip-ansi-toggle" ${this.settings.stripAnsi?"checked":""} />
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
            <option value="single" ${this.settings.channelMode==="single"?"selected":""}>Single Channel</option>
            <option value="perNotebook" ${this.settings.channelMode==="perNotebook"?"selected":""}>Per-Notebook Channels</option>
          </select>
        </div>
        <div class="setting-description">Choose between a single "Jupyter Output Mirror" channel or separate channels per notebook file</div>
      </div>

      <!-- Additional Settings -->
      <div class="setting-control">
        <div class="setting-header">
          <span class="setting-name">Clear On Notebook Clear</span>
          <label class="toggle-switch">
            <input type="checkbox" id="clear-on-notebook-clear-toggle" ${this.settings.clearOnNotebookClear?"checked":""} />
            <span class="slider"></span>
          </label>
        </div>
        <div class="setting-description">When a notebook's outputs are cleared, also clear its mirrored Output channel</div>
      </div>

      <div class="setting-control">
        <div class="setting-header">
          <span class="setting-name">Include Text/Plain</span>
          <label class="toggle-switch">
            <input type="checkbox" id="include-text-plain-toggle" ${this.settings.includeTextPlain?"checked":""} />
            <span class="slider"></span>
          </label>
        </div>
        <div class="setting-description">Also mirror text/plain outputs (not just stdout/stderr)</div>
      </div>

      <div class="setting-control">
        <div class="setting-header">
          <span class="setting-name">Debug Mode</span>
          <label class="toggle-switch">
            <input type="checkbox" id="debug-toggle" ${this.settings.debug?"checked":""} />
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
    `,this.setupEventListeners(),this.updateOutputPreview()}setupEventListeners(){const e=this.container.querySelector("#timestamp-toggle");e==null||e.addEventListener("change",()=>{this.updateSetting("timestamp",e.checked)});const t=this.container.querySelector("#context-toggle");t==null||t.addEventListener("change",()=>{this.updateSetting("includeSourceContext",t.checked)});const n=this.container.querySelector("#active-only-toggle");n==null||n.addEventListener("change",()=>{this.updateSetting("activeNotebookOnly",n.checked)});const s=this.container.querySelector("#strip-ansi-toggle");s==null||s.addEventListener("change",()=>{this.updateSetting("stripAnsi",s.checked)});const i=this.container.querySelector("#clear-on-notebook-clear-toggle");i==null||i.addEventListener("change",()=>{this.updateSetting("clearOnNotebookClear",i.checked)});const r=this.container.querySelector("#include-text-plain-toggle");r==null||r.addEventListener("change",()=>{this.updateSetting("includeTextPlain",r.checked)});const c=this.container.querySelector("#debug-toggle");c==null||c.addEventListener("change",()=>{this.updateSetting("debug",c.checked)});const o=this.container.querySelector("#channel-mode-select");o==null||o.addEventListener("change",()=>{this.updateSetting("channelMode",o.value)});const a=this.container.querySelector("#reset-settings-btn");a==null||a.addEventListener("click",()=>{this.vscode.resetSettings(),a.innerHTML='<span class="icon">✅</span>Settings Reset!',setTimeout(()=>{a.innerHTML='<span class="icon">🔄</span>Reset Settings to Default'},2e3)})}updateSetting(e,t){this.settings[e]=t,this.vscode.updateSetting(`jupyterOutputMirror.${e}`,t),this.updateOutputPreview()}updateControls(){const e=this.container.querySelector("#timestamp-toggle");e&&(e.checked=this.settings.timestamp);const t=this.container.querySelector("#context-toggle");t&&(t.checked=this.settings.includeSourceContext);const n=this.container.querySelector("#active-only-toggle");n&&(n.checked=this.settings.activeNotebookOnly);const s=this.container.querySelector("#strip-ansi-toggle");s&&(s.checked=this.settings.stripAnsi);const i=this.container.querySelector("#channel-mode-select");i&&(i.value=this.settings.channelMode);const r=this.container.querySelector("#clear-on-notebook-clear-toggle");r&&(r.checked=this.settings.clearOnNotebookClear);const c=this.container.querySelector("#include-text-plain-toggle");c&&(c.checked=this.settings.includeTextPlain);const o=this.container.querySelector("#debug-toggle");o&&(o.checked=this.settings.debug)}updateOutputPreview(){const e=this.container.querySelector("#output-preview");if(!e)return;const t=this.settings.timestamp?"[2025-09-06T15:30:45.123Z] ":"",n=this.settings.includeSourceContext?"[stdout] demo.ipynb #2":"";let s="";this.settings.timestamp&&(s+='<span class="timestamp">'+t+"</span>"),this.settings.includeSourceContext&&(s+='<span class="context-info">'+n+"</span>",this.settings.timestamp&&(s+="<br>")),s+='<span class="stdout">Hello from stdout!</span><br>',this.settings.timestamp&&(s+='<span class="timestamp">[2025-09-06T15:30:45.124Z] </span>'),this.settings.includeSourceContext&&(s+='<span class="context-info">[stderr] demo.ipynb #2</span>',this.settings.timestamp&&(s+="<br>")),s+='<span class="stderr">Warning: Test message</span>',e.innerHTML=s}}class f{constructor(){d(this,"pyodide",null);d(this,"isInitialized",!1);d(this,"initPromise",null)}async initialize(){if(!this.isInitialized)return this.initPromise?this.initPromise:(this.initPromise=this.doInitialize(),this.initPromise)}async doInitialize(){try{console.log("Loading Pyodide..."),this.pyodide=await window.loadPyodide({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"}),await this.pyodide.loadPackage(["numpy","pandas"]),this.isInitialized=!0,console.log("Pyodide initialized successfully")}catch(e){throw console.error("Failed to initialize Pyodide:",e),e}}async runCode(e){try{await this.initialize(),this.pyodide.runPython(`
import sys
from io import StringIO
old_stdout = sys.stdout
old_stderr = sys.stderr
sys.stdout = StringIO()
sys.stderr = StringIO()
      `);const t=this.pyodide.runPython(e),n=this.pyodide.runPython("sys.stdout.getvalue()"),s=this.pyodide.runPython("sys.stderr.getvalue()");this.pyodide.runPython(`
sys.stdout = old_stdout
sys.stderr = old_stderr
      `);let i="";return n&&(i+=n),s&&(i+=s),t!=null&&(i+=String(t)),{success:!0,output:i||"Code executed successfully (no output)",plots:[]}}catch(t){try{this.pyodide.runPython(`
sys.stdout = old_stdout
sys.stderr = old_stderr
        `)}catch{}return{success:!1,error:String(t)}}}getVersion(){if(!this.isInitialized)return"Not initialized";try{return this.pyodide.runPython("import sys; sys.version")}catch{return"Pyodide (version unknown)"}}isReady(){return this.isInitialized}}class b{constructor(e,t){d(this,"container");d(this,"vscode");d(this,"pyodideRunner");d(this,"usesPyodide",!0);this.container=e,this.vscode=t,this.pyodideRunner=new f,this.setupMessageHandlers(),this.render(),this.initializePyodide()}setupMessageHandlers(){this.vscode.onMessage("activeJupyterInterpreterResult",e=>{this.handleJupyterInterpreterResult(e.success,e.interpreterPath,e.displayName,e.error)}),this.vscode.onMessage("pythonTestResult",e=>{this.handlePythonTestResult(e.success,e.version,e.error)})}render(){this.container.innerHTML=`
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
    `,this.setupEventListeners(),this.updateUI()}setupEventListeners(){const e=this.container.querySelector("#use-pyodide-btn");e==null||e.addEventListener("click",()=>{this.usesPyodide=!0,this.updateUI(),this.initializePyodide()});const t=this.container.querySelector("#use-system-btn");t==null||t.addEventListener("click",()=>{this.usesPyodide=!1,this.updateUI()});const n=this.container.querySelector("#detect-jupyter-btn");n==null||n.addEventListener("click",()=>{this.detectJupyterInterpreter()});const s=this.container.querySelector("#select-jupyter-btn");s==null||s.addEventListener("click",()=>{this.vscode.selectJupyterInterpreter()});const i=this.container.querySelector("#test-btn");i==null||i.addEventListener("click",()=>{this.testEnvironment()})}updateUI(){const e=this.container.querySelector("#use-pyodide-btn"),t=this.container.querySelector("#use-system-btn"),n=this.container.querySelector("#system-python-section");this.usesPyodide?(e==null||e.classList.remove("secondary"),t==null||t.classList.add("secondary"),n.style.display="none"):(e==null||e.classList.add("secondary"),t==null||t.classList.remove("secondary"),n.style.display="block")}async initializePyodide(){if(!this.usesPyodide)return;const e=this.container.querySelector("#environment-status"),t=this.container.querySelector("#environment-info");e.style.display="block",e.style.background="var(--vscode-textCodeBlock-background)",e.style.border="1px solid var(--vscode-charts-blue)",t.innerHTML=`
      <div style="color: var(--vscode-charts-blue); font-weight: bold; margin-bottom: 0.5rem;">
        ⏳ Initializing Browser Python (Pyodide)...
      </div>
      <div style="font-size: 0.9rem;">
        Loading Python runtime and packages in the browser...
      </div>
    `;try{await this.pyodideRunner.initialize(),t.innerHTML=`
        <div style="color: var(--vscode-charts-green); font-weight: bold; margin-bottom: 0.5rem;">
          ✅ Browser Python Ready
        </div>
        <div style="font-family: var(--vscode-editor-font-family); font-size: 0.9rem;">
          <strong>Environment:</strong> Pyodide (WebAssembly Python)<br>
          <strong>Version:</strong> ${this.pyodideRunner.getVersion()}<br>
          <strong>Packages:</strong> numpy, pandas, and standard library
        </div>
      `,e.style.border="1px solid var(--vscode-charts-green)"}catch(n){t.innerHTML=`
        <div style="color: var(--vscode-charts-red); font-weight: bold; margin-bottom: 0.5rem;">
          ❌ Failed to Initialize Pyodide
        </div>
        <div style="font-size: 0.9rem;">
          ${n}
        </div>
      `,e.style.border="1px solid var(--vscode-charts-red)"}}detectJupyterInterpreter(){const e=this.container.querySelector("#detect-jupyter-btn"),t=this.container.querySelector("#environment-status"),n=this.container.querySelector("#environment-info"),s=e.innerHTML;e.innerHTML='<span class="icon">⏳</span> Detecting...',e.disabled=!0,t.style.display="block",t.style.background="var(--vscode-textCodeBlock-background)",t.style.border="1px solid var(--vscode-charts-blue)",n.innerHTML=`
      <div style="color: var(--vscode-charts-blue); font-weight: bold;">
        🔍 Detecting Jupyter interpreter...
      </div>
    `,this.vscode.getActiveJupyterInterpreter(),setTimeout(()=>{e.disabled&&(e.innerHTML=s,e.disabled=!1)},1e4)}handleJupyterInterpreterResult(e,t,n,s){const i=this.container.querySelector("#detect-jupyter-btn"),r=this.container.querySelector("#environment-status"),c=this.container.querySelector("#environment-info");i.innerHTML='<span class="icon">🔍</span> Auto-detect Jupyter Interpreter',i.disabled=!1,e&&t?(r.style.border="1px solid var(--vscode-charts-green)",c.innerHTML=`
        <div style="color: var(--vscode-charts-green); font-weight: bold; margin-bottom: 0.5rem;">
          ✅ Jupyter Interpreter Detected
        </div>
        <div style="font-family: var(--vscode-editor-font-family); font-size: 0.9rem;">
          <strong>Path:</strong> ${t}<br>
          <strong>Display Name:</strong> ${n||"Unknown"}
        </div>
      `):(r.style.border="1px solid var(--vscode-charts-orange)",c.innerHTML=`
        <div style="color: var(--vscode-charts-orange); font-weight: bold; margin-bottom: 0.5rem;">
          ⚠️ Auto-detection Failed
        </div>
        <div style="font-size: 0.9rem;">
          ${s||"Could not detect active Jupyter interpreter"}
        </div>
      `)}async testEnvironment(){var s;const e=this.container.querySelector("#test-btn"),t=this.container.querySelector("#test-result"),n=e.innerHTML;if(e.innerHTML='<span class="icon">⏳</span> Testing...',e.disabled=!0,t.textContent="",this.usesPyodide)try{await this.pyodideRunner.initialize();const i=await this.pyodideRunner.runCode('import sys; print(f"Python {sys.version}")');i.success?t.innerHTML=`<span style="color: var(--vscode-charts-green);">✅ ${(s=i.output)==null?void 0:s.trim()}</span>`:t.innerHTML=`<span style="color: var(--vscode-charts-red);">❌ ${i.error}</span>`}catch(i){t.innerHTML=`<span style="color: var(--vscode-charts-red);">❌ ${i}</span>`}else this.vscode.testPythonInterpreter("python3");e.innerHTML=n,e.disabled=!1}handlePythonTestResult(e,t,n){const s=this.container.querySelector("#test-result");e?s.innerHTML=`<span style="color: var(--vscode-charts-green);">✅ ${t}</span>`:s.innerHTML=`<span style="color: var(--vscode-charts-red);">❌ ${n}</span>`}getRunner(){return this.usesPyodide?this.pyodideRunner:null}usesPyodideRunner(){return this.usesPyodide}}class S{constructor(e,t,n){d(this,"container");d(this,"vscode");d(this,"interpreterSetup");this.container=e,this.vscode=t,this.interpreterSetup=n,this.render()}render(){this.container.innerHTML=`
      <h2>🧪 Interactive Examples</h2>
      <p>Test your Python environment with these interactive examples:</p>
      
      <div id="code-examples">
        <!-- Examples will be rendered here -->
      </div>
    `,this.renderExamples()}renderExamples(){const e=[{id:"basic-test",title:"Basic Python Test",description:"Verify Python is working and check the version",code:`import sys
import platform

print(f"Python version: {sys.version}")
print(f"Platform: {platform.system()} {platform.release()}")
print(f"Executable: {sys.executable}")

# Test basic functionality
numbers = [1, 2, 3, 4, 5]
squares = [x**2 for x in numbers]
print(f"Squares: {squares}")`,expectedOutput:"Python version and basic list comprehension output"},{id:"numpy-test",title:"NumPy Array Operations",description:"Test NumPy functionality for data processing",code:`import numpy as np

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
print(f"Matrix determinant: {np.linalg.det(matrix):.4f}")`,expectedOutput:"Array operations and matrix calculations"},{id:"pandas-test",title:"Pandas DataFrame",description:"Test pandas for data manipulation",code:`import pandas as pd
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
print(high_scorers[['Name', 'Score']])`,expectedOutput:"DataFrame display and basic statistics"}],t=this.container.querySelector("#code-examples");e.forEach(n=>{const s=this.createExampleElement(n);t.appendChild(s)})}createExampleElement(e){const t=document.createElement("div");t.className="code-example",t.innerHTML=`
      <div class="example-header">
        <h3>${e.title}</h3>
        <div style="display: flex; gap: 0.5rem;">
          <button class="action-button secondary copy-btn">
            <span class="icon">📋</span> Copy
          </button>
          <button class="action-button run-btn" data-example-id="${e.id}">
            <span class="icon">▶️</span> Run
          </button>
        </div>
      </div>
      
      <p class="example-description">${e.description}</p>
      
      <div class="code-block">
        <pre><code>${this.escapeHtml(e.code)}</code></pre>
      </div>
      
      <div class="output-section" id="output-${e.id}" style="display: none;">
        <div class="output-header">
          <strong>Output:</strong>
          <span class="execution-time" id="time-${e.id}"></span>
        </div>
        <div class="output-content" id="content-${e.id}"></div>
      </div>
      
      ${e.expectedOutput?`
        <div class="expected-output">
          <strong>Expected:</strong> ${e.expectedOutput}
        </div>
      `:""}
    `;const n=t.querySelector(".copy-btn");n==null||n.addEventListener("click",()=>{navigator.clipboard.writeText(e.code);const i=n.innerHTML;n.innerHTML='<span class="icon">✅</span> Copied',setTimeout(()=>{n.innerHTML=i},2e3)});const s=t.querySelector(".run-btn");return s==null||s.addEventListener("click",()=>{this.runExample(e)}),t}async runExample(e){const t=this.container.querySelector(`[data-example-id="${e.id}"]`),n=this.container.querySelector(`#output-${e.id}`),s=this.container.querySelector(`#time-${e.id}`),i=this.container.querySelector(`#content-${e.id}`);n.style.display="block";const r=t.innerHTML;t.innerHTML='<span class="icon">⏳</span> Running...',t.disabled=!0,i.innerHTML='<div style="color: var(--vscode-charts-blue);">Executing code...</div>';const c=performance.now();try{if(this.interpreterSetup.usesPyodideRunner()){const o=this.interpreterSetup.getRunner();if(!o)throw new Error("Pyodide runner not available");const a=await o.runCode(e.code),p=performance.now();s.textContent=`(${(p-c).toFixed(1)}ms)`,a.success?(i.innerHTML=`
            <div class="success-output">
              <pre>${this.escapeHtml(a.output||"Code executed successfully (no output)")}</pre>
            </div>
          `,a.plots&&a.plots.length>0&&a.plots.forEach(h=>{const u=document.createElement("img");u.src=h,u.style.maxWidth="100%",u.style.marginTop="1rem",i.appendChild(u)})):i.innerHTML=`
            <div class="error-output">
              <strong>Error:</strong><br>
              <pre>${this.escapeHtml(a.error||"Unknown error")}</pre>
            </div>
          `}else{const o=a=>{if(a.exampleId===e.id){const p=performance.now();s.textContent=`(${(p-c).toFixed(1)}ms)`,a.success?i.innerHTML=`
                <div class="success-output">
                  <pre>${this.escapeHtml(a.output||"Code executed successfully (no output)")}</pre>
                </div>
              `:i.innerHTML=`
                <div class="error-output">
                  <strong>Error:</strong><br>
                  <pre>${this.escapeHtml(a.error||"Unknown error")}</pre>
                </div>
              `,this.vscode.removeMessageHandler("pythonCodeResult",o),t.innerHTML=r,t.disabled=!1}};this.vscode.onMessage("pythonCodeResult",o),this.vscode.runPythonCode(e.code,e.id),setTimeout(()=>{if(t.disabled){const a=performance.now();s.textContent=`(timeout after ${(a-c).toFixed(1)}ms)`,i.innerHTML=`
              <div class="error-output">
                <strong>Timeout:</strong> Code execution took too long or failed to respond.
              </div>
            `,this.vscode.removeMessageHandler("pythonCodeResult",o),t.innerHTML=r,t.disabled=!1}},3e4)}}catch(o){const a=performance.now();s.textContent=`(${(a-c).toFixed(1)}ms)`,i.innerHTML=`
        <div class="error-output">
          <strong>Execution Error:</strong><br>
          <pre>${this.escapeHtml(String(o))}</pre>
        </div>
      `,t.innerHTML=r,t.disabled=!1}}escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}}class x{constructor(){d(this,"vscode");d(this,"interpreterSetup");this.vscode=new v,this.init()}init(){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>this.setup()):this.setup()}setup(){const e=document.getElementById("settings-panel"),t=document.getElementById("interpreter-setup"),n=document.getElementById("code-runner");if(!e||!t||!n){console.error("Required containers not found in DOM");return}new m(e,this.vscode),this.interpreterSetup=new b(t,this.vscode),new S(n,this.vscode,this.interpreterSetup),this.setupNavigation(),this.vscode.loadSettings(),console.log("Setup Guide App initialized")}setupNavigation(){const e=document.querySelectorAll(".nav-link"),t=document.querySelectorAll(".section");e.forEach(s=>{s.addEventListener("click",i=>{var c;i.preventDefault();const r=(c=s.getAttribute("href"))==null?void 0:c.substring(1);r&&(e.forEach(o=>o.classList.remove("active")),s.classList.add("active"),t.forEach(o=>{o.id===r?o.classList.add("active"):o.classList.remove("active")}))})}),document.querySelectorAll(".next-section-btn").forEach(s=>{s.addEventListener("click",()=>{const i=s.closest(".section"),r=i==null?void 0:i.nextElementSibling;if(r&&r.classList.contains("section")){const c=r.id,o=document.querySelector(`[href="#${c}"]`);o&&o.dispatchEvent(new Event("click"))}})})}}new x;

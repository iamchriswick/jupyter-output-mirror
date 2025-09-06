<template>
  <div class="code-runner h-full flex flex-col">
    <!-- Toolbar -->
    <div
      class="toolbar flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-600"
    >
      <div class="flex items-center space-x-2">
        <button
          @click="runCode"
          :disabled="isExecuting || !isInterpreterReady"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <svg v-if="!isExecuting" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 5v10l7-5-7-5z" />
          </svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{{ isExecuting ? 'Running...' : 'Run Code' }}</span>
        </button>

        <button
          @click="clearOutput"
          class="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
        >
          Clear
        </button>

        <button
          @click="loadSampleCode"
          class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
        >
          Sample
        </button>
      </div>

      <div class="flex items-center space-x-2 text-sm">
        <div
          :class="[
            'flex items-center space-x-1',
            isInterpreterReady ? 'text-green-600' : 'text-yellow-600',
          ]"
        >
          <div
            :class="['w-2 h-2 rounded-full', isInterpreterReady ? 'bg-green-500' : 'bg-yellow-500']"
          />
          <span>{{ interpreterStatus }}</span>
        </div>
      </div>
    </div>

    <!-- Code Editor and Output -->
    <div class="flex-1 flex flex-col md:flex-row min-h-0">
      <!-- Code Editor -->
      <div class="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-600">
        <div class="p-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Python Code</h3>
        </div>
        <div ref="editorContainer" class="flex-1 min-h-0"></div>
      </div>

      <!-- Output Panel -->
      <div class="flex-1 flex flex-col">
        <div class="p-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Output</h3>
        </div>
        <div
          ref="outputContainer"
          class="flex-1 p-4 overflow-auto bg-gray-900 text-green-400 font-mono text-sm"
        >
          <div v-if="outputLines.length === 0" class="text-gray-500 italic">
            Output will appear here when you run Python code...
          </div>
          <div
            v-for="(line, index) in outputLines"
            :key="index"
            :class="[
              'mb-1',
              line.type === 'error' ? 'text-red-400' : '',
              line.type === 'warning' ? 'text-yellow-400' : '',
              line.type === 'info' ? 'text-blue-400' : '',
            ]"
          >
            <span class="opacity-60">[{{ formatTime(line.timestamp) }}]</span>
            <span class="ml-2">{{ line.content }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'
import { useInterpreterStore } from '@/stores/interpreter'
import { useCodeExecutionStore } from '@/stores/codeExecution'
import { useVSCodeAPI } from '@/composables/useVSCodeAPI'

// Stores and composables
const interpreterStore = useInterpreterStore()
const codeExecutionStore = useCodeExecutionStore()
const vscodeAPI = useVSCodeAPI()

// Reactive refs
const editorContainer = ref<HTMLElement>()
const outputContainer = ref<HTMLElement>()
const isExecuting = ref(false)
const outputLines = ref<
  Array<{
    content: string
    type: 'output' | 'error' | 'warning' | 'info'
    timestamp: Date
  }>
>([])

// Editor instance
let editorView: EditorView | null = null

// Computed properties
const isInterpreterReady = computed(() => interpreterStore.isReady)
const interpreterStatus = computed(() => {
  if (interpreterStore.isReady) {
    return interpreterStore.interpreterType === 'pyodide' ? 'Pyodide Ready' : 'System Python Ready'
  }
  return interpreterStore.isLoading ? 'Loading Python...' : 'Python Not Ready'
})

// Sample code templates
const sampleCodes = [
  `# Basic Python operations
import math
import datetime

print("Hello from Jupyter Output Mirror!")
print(f"Current time: {datetime.datetime.now()}")

# Some calculations
numbers = [1, 2, 3, 4, 5]
print(f"Numbers: {numbers}")
print(f"Sum: {sum(numbers)}")
print(f"Average: {sum(numbers) / len(numbers)}")

# Math operations
print(f"π = {math.pi}")
print(f"e = {math.e}")
print(f"√16 = {math.sqrt(16)}")`,

  `# Data manipulation example
data = {
    'name': ['Alice', 'Bob', 'Charlie', 'Diana'],
    'age': [25, 30, 35, 28],
    'city': ['New York', 'London', 'Tokyo', 'Paris']
}

print("Sample data:")
for i, name in enumerate(data['name']):
    print(f"{name}, {data['age'][i]}, {data['city'][i]}")

# Simple statistics
ages = data['age']
print(f"\\nAge statistics:")
print(f"Average age: {sum(ages) / len(ages):.1f}")
print(f"Min age: {min(ages)}")
print(f"Max age: {max(ages)}")`,

  `# Error handling demonstration
def safe_divide(a, b):
    try:
        result = a / b
        return f"{a} / {b} = {result}"
    except ZeroDivisionError:
        return f"Error: Cannot divide {a} by zero!"
    except Exception as e:
        return f"Unexpected error: {e}"

# Test cases
test_cases = [(10, 2), (15, 3), (8, 0), (20, 4)]

print("Division tests:")
for a, b in test_cases:
    print(safe_divide(a, b))`,
]

// Methods
function initializeEditor() {
  if (!editorContainer.value) return

  const startDoc = sampleCodes[0]

  editorView = new EditorView({
    state: EditorState.create({
      doc: startDoc,
      extensions: [
        basicSetup,
        python(),
        oneDark,
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '14px',
          },
          '.cm-content': {
            padding: '12px',
            minHeight: '100%',
          },
          '.cm-focused': {
            outline: 'none',
          },
          '.cm-editor': {
            height: '100%',
          },
          '.cm-scroller': {
            height: '100%',
          },
        }),
      ],
    }),
    parent: editorContainer.value,
  })
}

function getEditorContent(): string {
  return editorView?.state.doc.toString() || ''
}

function setEditorContent(content: string) {
  if (!editorView) return

  const transaction = editorView.state.update({
    changes: {
      from: 0,
      to: editorView.state.doc.length,
      insert: content,
    },
  })
  editorView.dispatch(transaction)
}

function addOutput(content: string, type: 'output' | 'error' | 'warning' | 'info' = 'output') {
  outputLines.value.push({
    content,
    type,
    timestamp: new Date(),
  })

  // Auto-scroll to bottom
  nextTick(() => {
    if (outputContainer.value) {
      outputContainer.value.scrollTop = outputContainer.value.scrollHeight
    }
  })
}

function clearOutput() {
  outputLines.value = []
}

function loadSampleCode() {
  // Cycle through sample codes
  const currentContent = getEditorContent()
  let nextIndex = 0

  // Find current sample or default to first
  for (let i = 0; i < sampleCodes.length; i++) {
    if (currentContent.trim() === sampleCodes[i].trim()) {
      nextIndex = (i + 1) % sampleCodes.length
      break
    }
  }

  setEditorContent(sampleCodes[nextIndex])
  addOutput('Sample code loaded', 'info')
}

async function runCode() {
  if (isExecuting.value || !isInterpreterReady.value) return

  const code = getEditorContent().trim()
  if (!code) {
    addOutput('No code to execute', 'warning')
    return
  }

  isExecuting.value = true
  addOutput('Executing Python code...', 'info')

  try {
    // Execute via the interpreter store
    const result = await interpreterStore.executeCode(code)

    if (result.success) {
      if (result.output) {
        // Split output by lines and add each line
        const lines = result.output.split('\n')
        lines.forEach((line) => {
          if (line.trim()) {
            addOutput(line, 'output')
          }
        })
      }

      // Store execution result
      codeExecutionStore.addExecution({
        code,
        output: result.output || '',
        error: null,
        timestamp: new Date(),
        executionTime: result.executionTime || 0,
      })

      addOutput(`Execution completed in ${result.executionTime || 0}ms`, 'info')

      // Send to VS Code if available
      if (vscodeAPI.canCommunicate.value) {
        vscodeAPI.sendMessage('codeExecuted', {
          code,
          output: result.output,
          success: true,
        })
      }
    } else {
      const errorMsg = result.error || 'Unknown execution error'
      addOutput(errorMsg, 'error')

      // Store error result
      codeExecutionStore.addExecution({
        code,
        output: '',
        error: errorMsg,
        timestamp: new Date(),
        executionTime: result.executionTime || 0,
      })

      // Send error to VS Code if available
      if (vscodeAPI.canCommunicate.value) {
        vscodeAPI.sendMessage('codeExecuted', {
          code,
          error: errorMsg,
          success: false,
        })
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Execution failed'
    addOutput(errorMsg, 'error')

    codeExecutionStore.addExecution({
      code,
      output: '',
      error: errorMsg,
      timestamp: new Date(),
      executionTime: 0,
    })
  } finally {
    isExecuting.value = false
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// Lifecycle hooks
onMounted(async () => {
  await nextTick()
  initializeEditor()

  // Initialize interpreter if not already done
  if (!interpreterStore.isReady && !interpreterStore.isLoading) {
    try {
      await interpreterStore.initializePyodide()
      addOutput('Python interpreter initialized successfully', 'info')
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to initialize Python'
      addOutput(errorMsg, 'error')
    }
  }
})

onUnmounted(() => {
  if (editorView) {
    editorView.destroy()
    editorView = null
  }
})
</script>

<style scoped>
.code-runner {
  min-height: 400px;
}

/* Custom scrollbar for output */
.overflow-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #374151;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #6b7280;
  border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    space-y: 2;
  }

  .toolbar .flex:first-child {
    width: 100%;
    justify-content: center;
  }

  .toolbar .flex:last-child {
    width: 100%;
    justify-content: center;
    margin-top: 0.5rem;
  }
}
</style>

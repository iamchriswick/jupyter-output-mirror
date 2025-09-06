import { ref, computed } from 'vue'
import { useSettingsStore, type ExtensionSettings } from '@/stores/settings'
import { useInterpreterStore, type InterpreterType } from '@/stores/interpreter'
import { useCodeExecutionStore } from '@/stores/codeExecution'

// VS Code API types (simplified)
interface VSCodeAPI {
  postMessage(message: unknown): void
  getState(): unknown
  setState(state: unknown): void
}

// Message types for communication with VS Code extension
export interface VSCodeMessage {
  command: string
  payload?: unknown
  requestId?: string
}

export interface VSCodeResponse {
  requestId: string
  success: boolean
  data?: unknown
  error?: string
}

// Event message from VS Code (different from response)
export interface VSCodeEvent {
  command: string
  payload?: unknown
}

// Declare the VS Code API (available in webview context)
declare global {
  interface Window {
    acquireVsCodeApi?: () => VSCodeAPI
  }
}

export function useVSCodeAPI() {
  const vscode = ref<VSCodeAPI | null>(null)
  const isConnected = ref(false)
  const pendingRequests = ref<
    Map<
      string,
      {
        resolve: (value: unknown) => void
        reject: (reason?: unknown) => void
      }
    >
  >(new Map())

  const settingsStore = useSettingsStore()
  const interpreterStore = useInterpreterStore()
  const codeExecutionStore = useCodeExecutionStore()

  // Computed
  const canCommunicate = computed(() => isConnected.value && vscode.value !== null)

  // Initialize VS Code API
  function initialize() {
    if (typeof window !== 'undefined' && window.acquireVsCodeApi) {
      vscode.value = window.acquireVsCodeApi()
      isConnected.value = true

      // Listen for messages from extension
      window.addEventListener('message', handleMessage)

      // Request initial state
      requestInitialState()

      return true
    } else {
      console.warn('VS Code API not available - running in development mode')
      isConnected.value = false
      return false
    }
  }

  // Handle messages from VS Code extension
  function handleMessage(event: MessageEvent) {
    const data = event.data as VSCodeResponse | VSCodeEvent

    // Check if it's a response to a pending request
    if ('requestId' in data && data.requestId && pendingRequests.value.has(data.requestId)) {
      const message = data as VSCodeResponse
      const { resolve, reject } = pendingRequests.value.get(message.requestId)!
      pendingRequests.value.delete(message.requestId)

      if (message.success) {
        resolve(message.data)
      } else {
        reject(new Error(message.error || 'Unknown error'))
      }
      return
    }

    // Handle event messages
    const eventMsg = data as VSCodeEvent
    switch (eventMsg.command) {
      case 'settingsUpdated':
        handleSettingsUpdate(eventMsg.payload)
        break
      case 'interpreterChanged':
        handleInterpreterChange(eventMsg.payload)
        break
      case 'codeExecutionResult':
        handleCodeExecutionResult(eventMsg.payload)
        break
      default:
        console.warn('Unknown message command:', eventMsg.command)
    }
  }

  // Send message to VS Code extension
  function sendMessage(command: string, payload?: unknown): Promise<unknown> {
    if (!canCommunicate.value) {
      return Promise.reject(new Error('VS Code API not available'))
    }

    const requestId = generateRequestId()
    const message: VSCodeMessage = { command, payload, requestId }

    return new Promise((resolve, reject) => {
      pendingRequests.value.set(requestId, { resolve, reject })

      vscode.value!.postMessage(message)

      // Timeout after 30 seconds
      setTimeout(() => {
        if (pendingRequests.value.has(requestId)) {
          pendingRequests.value.delete(requestId)
          reject(new Error('Request timeout'))
        }
      }, 30000)
    })
  }

  // Request initial state from extension
  async function requestInitialState() {
    try {
      const state = (await sendMessage('getInitialState')) as {
        settings?: Partial<ExtensionSettings>
        interpreter?: {
          type: InterpreterType
          systemPath?: string
          systemName?: string
        }
      }

      if (state.settings) {
        // Update individual settings
        Object.entries(state.settings).forEach(([key, value]) => {
          settingsStore.updateSetting(key as keyof ExtensionSettings, value)
        })
      }

      if (state.interpreter) {
        // Update interpreter state based on extension data
        interpreterStore.setInterpreterType(state.interpreter.type)
        if (state.interpreter.systemPath) {
          interpreterStore.setSystemInterpreter(
            state.interpreter.systemPath,
            state.interpreter.systemName,
          )
        }
      }
    } catch (error) {
      console.error('Failed to get initial state:', error)
    }
  }

  // Settings operations
  async function updateExtensionSettings(settings: Partial<ExtensionSettings>) {
    try {
      await sendMessage('updateSettings', settings)
      // Update individual settings in store
      Object.entries(settings).forEach(([key, value]) => {
        settingsStore.updateSetting(key as keyof ExtensionSettings, value)
      })
    } catch (error) {
      console.error('Failed to update settings:', error)
      throw error
    }
  }

  async function resetExtensionSettings() {
    try {
      await sendMessage('resetSettings')
      settingsStore.$reset()
    } catch (error) {
      console.error('Failed to reset settings:', error)
      throw error
    }
  }

  // Interpreter operations
  async function selectSystemInterpreter() {
    try {
      const result = (await sendMessage('selectSystemInterpreter')) as {
        path?: string
        name?: string
      }
      if (result.path) {
        interpreterStore.setSystemInterpreter(result.path, result.name)
        interpreterStore.setInterpreterType('system')
      }
      return result
    } catch (error) {
      console.error('Failed to select system interpreter:', error)
      throw error
    }
  }

  async function validateInterpreter(path: string) {
    try {
      return await sendMessage('validateInterpreter', { path })
    } catch (error) {
      console.error('Failed to validate interpreter:', error)
      throw error
    }
  }

  // Code execution operations
  async function executeCode(code: string, useSystemInterpreter: boolean = false) {
    try {
      codeExecutionStore.startExecution(code)

      const result = (await sendMessage('executeCode', {
        code,
        useSystemInterpreter,
        interpreterPath: interpreterStore.interpreter.systemInterpreterPath,
      })) as {
        output?: string
        error?: string
        mimeType?: string
      }

      return codeExecutionStore.finishExecution({
        code,
        output: result.output,
        error: result.error,
        mimeType: result.mimeType || 'text/plain',
        isPlainText: !result.mimeType || result.mimeType === 'text/plain',
      })
    } catch (error) {
      codeExecutionStore.finishExecution({
        code,
        error: error instanceof Error ? error.message : 'Unknown error',
        isPlainText: true,
      })
      throw error
    }
  }

  // Message handlers
  function handleSettingsUpdate(payload: unknown) {
    const settings = payload as Partial<ExtensionSettings>
    Object.entries(settings).forEach(([key, value]) => {
      settingsStore.updateSetting(key as keyof ExtensionSettings, value)
    })
  }

  function handleInterpreterChange(payload: unknown) {
    const interpreter = payload as {
      type: InterpreterType
      systemPath?: string
      systemName?: string
    }
    interpreterStore.setInterpreterType(interpreter.type)
    if (interpreter.systemPath) {
      interpreterStore.setSystemInterpreter(interpreter.systemPath, interpreter.systemName)
    }
  }

  function handleCodeExecutionResult(payload: unknown) {
    const result = payload as {
      code: string
      output?: string
      error?: string
      mimeType?: string
    }
    codeExecutionStore.finishExecution({
      code: result.code,
      output: result.output,
      error: result.error,
      mimeType: result.mimeType || 'text/plain',
      isPlainText: !result.mimeType || result.mimeType === 'text/plain',
    })
  }

  // Utility functions
  function generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  function cleanup() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('message', handleMessage)
    }
    pendingRequests.value.clear()
    isConnected.value = false
    vscode.value = null
  }

  return {
    // State
    isConnected,
    canCommunicate,

    // Core functions
    initialize,
    cleanup,
    sendMessage,

    // Settings operations
    updateExtensionSettings,
    resetExtensionSettings,

    // Interpreter operations
    selectSystemInterpreter,
    validateInterpreter,

    // Code execution
    executeCode,
  }
}

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { PyodideInterface } from 'pyodide'

export type InterpreterType = 'pyodide' | 'system'

export interface InterpreterState {
  type: InterpreterType
  status: 'idle' | 'initializing' | 'ready' | 'error'
  pyodideInstance?: PyodideInterface
  systemInterpreterPath?: string
  systemInterpreterName?: string
  version?: string
  packages: string[]
  error?: string
}

export const useInterpreterStore = defineStore('interpreter', () => {
  // State
  const interpreter = ref<InterpreterState>({
    type: 'pyodide',
    status: 'idle',
    packages: [],
  })

  const isInitializing = ref(false)
  const initializationProgress = ref(0)

  // Computed
  const isReady = computed(() => interpreter.value.status === 'ready')
  const hasError = computed(() => interpreter.value.status === 'error')
  const canExecuteCode = computed(
    () =>
      isReady.value &&
      (interpreter.value.pyodideInstance || interpreter.value.systemInterpreterPath),
  )

  // Actions
  function setInterpreterType(type: InterpreterType) {
    if (interpreter.value.type !== type) {
      interpreter.value = {
        type,
        status: 'idle',
        packages: [],
      }
    }
  }

  function setStatus(status: InterpreterState['status']) {
    interpreter.value.status = status
  }

  function setError(error: string) {
    interpreter.value.error = error
    interpreter.value.status = 'error'
  }

  function clearError() {
    interpreter.value.error = undefined
    if (interpreter.value.status === 'error') {
      interpreter.value.status = 'idle'
    }
  }

  function setPyodideInstance(pyodide: PyodideInterface) {
    interpreter.value.pyodideInstance = pyodide
    interpreter.value.status = 'ready'

    // Get Python version
    try {
      const version = pyodide.runPython('import sys; sys.version')
      interpreter.value.version = version
    } catch (e) {
      console.warn('Could not get Python version:', e)
    }
  }

  function setSystemInterpreter(path: string, name?: string) {
    interpreter.value.systemInterpreterPath = path
    interpreter.value.systemInterpreterName = name
    interpreter.value.status = 'ready'
  }

  function setVersion(version: string) {
    interpreter.value.version = version
  }

  function addPackage(packageName: string) {
    if (!interpreter.value.packages.includes(packageName)) {
      interpreter.value.packages.push(packageName)
    }
  }

  function removePackage(packageName: string) {
    const index = interpreter.value.packages.indexOf(packageName)
    if (index > -1) {
      interpreter.value.packages.splice(index, 1)
    }
  }

  function setInitializing(initializing: boolean) {
    isInitializing.value = initializing
  }

  function setProgress(progress: number) {
    initializationProgress.value = Math.max(0, Math.min(100, progress))
  }

  function reset() {
    interpreter.value = {
      type: 'pyodide',
      status: 'idle',
      packages: [],
    }
    isInitializing.value = false
    initializationProgress.value = 0
  }

  return {
    // State
    interpreter,
    isInitializing,
    initializationProgress,

    // Computed
    isReady,
    hasError,
    canExecuteCode,

    // Actions
    setInterpreterType,
    setStatus,
    setError,
    clearError,
    setPyodideInstance,
    setSystemInterpreter,
    setVersion,
    addPackage,
    removePackage,
    setInitializing,
    setProgress,
    reset,
  }
})

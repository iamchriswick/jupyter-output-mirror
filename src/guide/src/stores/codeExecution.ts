import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface CodeResult {
  id: string
  code: string
  output?: string
  error?: string
  executionTime: number
  timestamp: Date
  mimeType?: string
  isPlainText: boolean
}

export interface ExecutionState {
  isExecuting: boolean
  currentCode?: string
  executionStartTime?: number
}

export const useCodeExecutionStore = defineStore('codeExecution', () => {
  // State
  const results = ref<CodeResult[]>([])
  const executionState = ref<ExecutionState>({
    isExecuting: false,
  })
  const maxResults = ref(100) // Limit stored results to prevent memory issues

  // Computed
  const isExecuting = computed(() => executionState.value.isExecuting)
  const latestResult = computed(() =>
    results.value.length > 0 ? results.value[results.value.length - 1] : null,
  )
  const successfulResults = computed(() => results.value.filter((r) => !r.error))
  const errorResults = computed(() => results.value.filter((r) => r.error))

  // Actions
  function startExecution(code: string) {
    executionState.value = {
      isExecuting: true,
      currentCode: code,
      executionStartTime: Date.now(),
    }
  }

  function finishExecution(result: Omit<CodeResult, 'id' | 'timestamp' | 'executionTime'>) {
    const executionTime = executionState.value.executionStartTime
      ? Date.now() - executionState.value.executionStartTime
      : 0

    const newResult: CodeResult = {
      ...result,
      id: generateResultId(),
      timestamp: new Date(),
      executionTime,
    }

    addResult(newResult)

    executionState.value = {
      isExecuting: false,
    }

    return newResult
  }

  function addResult(result: CodeResult) {
    results.value.push(result)

    // Limit the number of stored results
    if (results.value.length > maxResults.value) {
      results.value = results.value.slice(-maxResults.value)
    }
  }

  function clearResults() {
    results.value = []
  }

  function removeResult(id: string) {
    const index = results.value.findIndex((r) => r.id === id)
    if (index > -1) {
      results.value.splice(index, 1)
    }
  }

  function getResult(id: string): CodeResult | undefined {
    return results.value.find((r) => r.id === id)
  }

  function getResultsByCode(code: string): CodeResult[] {
    return results.value.filter((r) => r.code === code)
  }

  function setMaxResults(max: number) {
    maxResults.value = Math.max(1, max)

    // Trim existing results if needed
    if (results.value.length > maxResults.value) {
      results.value = results.value.slice(-maxResults.value)
    }
  }

  function cancelExecution() {
    executionState.value = {
      isExecuting: false,
    }
  }

  function getCurrentExecutionTime(): number {
    return executionState.value.executionStartTime
      ? Date.now() - executionState.value.executionStartTime
      : 0
  }

  // Helper function to generate unique IDs
  function generateResultId(): string {
    return `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  return {
    // State
    results,
    executionState,
    maxResults,

    // Computed
    isExecuting,
    latestResult,
    successfulResults,
    errorResults,

    // Actions
    startExecution,
    finishExecution,
    addResult,
    clearResults,
    removeResult,
    getResult,
    getResultsByCode,
    setMaxResults,
    cancelExecution,
    getCurrentExecutionTime,
  }
})

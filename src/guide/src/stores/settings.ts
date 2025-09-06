import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface ExtensionSettings {
  maxOutputLines: number
  maxChunkSize: number
  enableVirtualization: boolean
  enableAutoScroll: boolean
  debugMode: boolean
  outputFontSize: number
  outputFontFamily: string
  cellBorderColor: string
  collapsibleOutput: boolean
  showLineNumbers: boolean
  enableCodeFolding: boolean
  enableMinimapInOutput: boolean
  enableTruncation: boolean
}

export const defaultSettings: ExtensionSettings = {
  maxOutputLines: 1000,
  maxChunkSize: 1024,
  enableVirtualization: true,
  enableAutoScroll: true,
  debugMode: false,
  outputFontSize: 12,
  outputFontFamily: 'Monaco, Menlo, Consolas, monospace',
  cellBorderColor: '#007acc',
  collapsibleOutput: true,
  showLineNumbers: true,
  enableCodeFolding: true,
  enableMinimapInOutput: false,
  enableTruncation: true,
}

export const useSettingsStore = defineStore('settings', () => {
  // State
  const settings = ref<ExtensionSettings>({ ...defaultSettings })
  const isLoading = ref(false)
  const hasChanges = ref(false)

  // Actions
  function updateSetting<K extends keyof ExtensionSettings>(key: K, value: ExtensionSettings[K]) {
    settings.value[key] = value
    hasChanges.value = true
  }

  function resetSettings() {
    settings.value = { ...defaultSettings }
    hasChanges.value = true
  }

  function loadSettings(newSettings: Partial<ExtensionSettings>) {
    settings.value = { ...defaultSettings, ...newSettings }
    hasChanges.value = false
  }

  function markSaved() {
    hasChanges.value = false
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  // Getters
  function getSetting<K extends keyof ExtensionSettings>(key: K): ExtensionSettings[K] {
    return settings.value[key]
  }

  function getAllSettings(): ExtensionSettings {
    return { ...settings.value }
  }

  return {
    // State
    settings,
    isLoading,
    hasChanges,

    // Actions
    updateSetting,
    resetSettings,
    loadSettings,
    markSaved,
    setLoading,

    // Getters
    getSetting,
    getAllSettings,
  }
})

<template>
  <div class="space-y-6">
    <!-- Output Settings -->
    <div class="space-y-4">
      <h3 class="text-sm font-medium text-gray-900 dark:text-white">Output Display</h3>

      <!-- Max Output Lines -->
      <div>
        <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">
          Max Output Lines
        </label>
        <input
          v-model.number="settings.maxOutputLines"
          type="number"
          min="10"
          max="10000"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          @change="updateSetting('maxOutputLines', settings.maxOutputLines)"
        />
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Maximum number of lines to display in output
        </p>
      </div>

      <!-- Output Font Size -->
      <div>
        <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1"> Font Size (px) </label>
        <input
          v-model.number="settings.outputFontSize"
          type="number"
          min="8"
          max="24"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          @change="updateSetting('outputFontSize', settings.outputFontSize)"
        />
      </div>

      <!-- Output Font Family -->
      <div>
        <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1"> Font Family </label>
        <select
          v-model="settings.outputFontFamily"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          @change="updateSetting('outputFontFamily', settings.outputFontFamily)"
        >
          <option value="Monaco, 'Lucida Console', monospace">Monaco</option>
          <option value="'Courier New', Courier, monospace">Courier New</option>
          <option value="'Consolas', 'Courier New', monospace">Consolas</option>
          <option value="'Source Code Pro', monospace">Source Code Pro</option>
          <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
        </select>
      </div>

      <!-- Boolean Settings -->
      <div class="space-y-3">
        <label class="flex items-center">
          <input
            v-model="settings.enableVirtualization"
            type="checkbox"
            class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
            @change="updateSetting('enableVirtualization', settings.enableVirtualization)"
          />
          <span class="ml-2 text-sm text-gray-700 dark:text-gray-300"> Enable Virtualization </span>
        </label>

        <label class="flex items-center">
          <input
            v-model="settings.enableAutoScroll"
            type="checkbox"
            class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
            @change="updateSetting('enableAutoScroll', settings.enableAutoScroll)"
          />
          <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Auto Scroll to New Output
          </span>
        </label>

        <label class="flex items-center">
          <input
            v-model="settings.enableSyntaxHighlighting"
            type="checkbox"
            class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
            @change="updateSetting('enableSyntaxHighlighting', settings.enableSyntaxHighlighting)"
          />
          <span class="ml-2 text-sm text-gray-700 dark:text-gray-300"> Syntax Highlighting </span>
        </label>

        <label class="flex items-center">
          <input
            v-model="settings.enableTruncation"
            type="checkbox"
            class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
            @change="updateSetting('enableTruncation', settings.enableTruncation)"
          />
          <span class="ml-2 text-sm text-gray-700 dark:text-gray-300"> Truncate Long Lines </span>
        </label>
      </div>
    </div>

    <!-- Performance Settings -->
    <div class="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <h3 class="text-sm font-medium text-gray-900 dark:text-white">Performance</h3>

      <div>
        <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">
          Max Chunk Size (KB)
        </label>
        <input
          v-model.number="settings.maxChunkSize"
          type="number"
          min="1"
          max="1000"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          @change="updateSetting('maxChunkSize', settings.maxChunkSize)"
        />
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Maximum size of output chunks for processing
        </p>
      </div>

      <div>
        <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">
          Update Interval (ms)
        </label>
        <input
          v-model.number="settings.updateInterval"
          type="number"
          min="50"
          max="5000"
          step="50"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          @change="updateSetting('updateInterval', settings.updateInterval)"
        />
      </div>

      <div>
        <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">
          Chunk Processing Timeout (ms)
        </label>
        <input
          v-model.number="settings.chunkProcessingTimeout"
          type="number"
          min="100"
          max="30000"
          step="100"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          @change="updateSetting('chunkProcessingTimeout', settings.chunkProcessingTimeout)"
        />
      </div>
    </div>

    <!-- Advanced Settings -->
    <div class="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <h3 class="text-sm font-medium text-gray-900 dark:text-white">Advanced</h3>

      <label class="flex items-center">
        <input
          v-model="settings.debugMode"
          type="checkbox"
          class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
          @change="updateSetting('debugMode', settings.debugMode)"
        />
        <span class="ml-2 text-sm text-gray-700 dark:text-gray-300"> Debug Mode </span>
      </label>

      <label class="flex items-center">
        <input
          v-model="settings.enableContextMenu"
          type="checkbox"
          class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
          @change="updateSetting('enableContextMenu', settings.enableContextMenu)"
        />
        <span class="ml-2 text-sm text-gray-700 dark:text-gray-300"> Context Menu </span>
      </label>

      <label class="flex items-center">
        <input
          v-model="settings.autoSaveResults"
          type="checkbox"
          class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
          @change="updateSetting('autoSaveResults', settings.autoSaveResults)"
        />
        <span class="ml-2 text-sm text-gray-700 dark:text-gray-300"> Auto Save Results </span>
      </label>
    </div>

    <!-- Actions -->
    <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
      <div class="flex space-x-3">
        <button
          @click="resetSettings"
          class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Reset to Defaults
        </button>

        <button
          @click="exportSettings"
          class="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Export Settings
        </button>
      </div>
    </div>

    <!-- Status -->
    <div v-if="updateStatus" class="text-sm text-green-600 dark:text-green-400">
      {{ updateStatus }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSettingsStore, type ExtensionSettings } from '@/stores/settings'
import { useVSCodeAPI } from '@/composables/useVSCodeAPI'

const settingsStore = useSettingsStore()
const vscodeAPI = useVSCodeAPI()
const updateStatus = ref('')

// Local reactive copy of settings for form binding
const settings = computed(() => settingsStore.settings)

async function updateSetting<K extends keyof ExtensionSettings>(
  key: K,
  value: ExtensionSettings[K],
) {
  try {
    settingsStore.updateSetting(key, value)

    if (vscodeAPI.canCommunicate.value) {
      await vscodeAPI.updateExtensionSettings({ [key]: value })
    }

    showUpdateStatus('Settings updated')
  } catch (error) {
    console.error('Failed to update setting:', error)
    showUpdateStatus('Failed to update settings')
  }
}

async function resetSettings() {
  try {
    if (vscodeAPI.canCommunicate.value) {
      await vscodeAPI.resetExtensionSettings()
    } else {
      settingsStore.$reset()
    }

    showUpdateStatus('Settings reset to defaults')
  } catch (error) {
    console.error('Failed to reset settings:', error)
    showUpdateStatus('Failed to reset settings')
  }
}

function exportSettings() {
  const settingsJson = JSON.stringify(settings.value, null, 2)
  const blob = new Blob([settingsJson], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'jupyter-output-mirror-settings.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  showUpdateStatus('Settings exported')
}

function showUpdateStatus(message: string) {
  updateStatus.value = message
  setTimeout(() => {
    updateStatus.value = ''
  }, 3000)
}
</script>

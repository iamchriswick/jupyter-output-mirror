<template>
  <div id="app" class="h-full bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-6 h-full">
      <!-- Header -->
      <header class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Jupyter Output Mirror Setup Guide
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          Configure your Python environment and extension settings
        </p>
      </header>

      <!-- Connection Status -->
      <div
        v-if="!vscodeAPI.isConnected.value"
        class="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg"
      >
        <div class="flex items-center">
          <svg
            class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="text-yellow-800 dark:text-yellow-200">
            Running in development mode - VS Code API not available
          </span>
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <!-- Settings Panel -->
        <div class="lg:col-span-1">
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-full"
          >
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Extension Settings
              </h2>
            </div>
            <div class="p-4">
              <SettingsPanel />
            </div>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="lg:col-span-2 flex flex-col">
          <!-- Interpreter Setup -->
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6"
          >
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Python Environment
              </h2>
            </div>
            <div class="p-4">
              <InterpreterSetup />
            </div>
          </div>

          <!-- Code Runner -->
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex-1"
          >
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Test Python Execution
              </h2>
            </div>
            <div class="p-4 h-full">
              <CodeRunner />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useVSCodeAPI } from '@/composables/useVSCodeAPI'
import SettingsPanel from '@/components/SettingsPanel.vue'
import InterpreterSetup from '@/components/InterpreterSetup.vue'
import CodeRunner from '@/components/CodeRunner.vue'

// Initialize VS Code API
const vscodeAPI = useVSCodeAPI()

onMounted(() => {
  vscodeAPI.initialize()
})

onUnmounted(() => {
  vscodeAPI.cleanup()
})
</script>

<style>
/* Global styles */
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Dark mode adjustments for VS Code */
@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
  }
}

/* Custom scrollbars */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--vscode-scrollbarSlider-background, #f1f1f1);
}

::-webkit-scrollbar-thumb {
  background: var(--vscode-scrollbarSlider-activeBackground, #888);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--vscode-scrollbarSlider-hoverBackground, #555);
}

/* Form elements styling */
input,
select,
textarea {
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--vscode-focusBorder, #007acc);
  box-shadow: 0 0 0 1px var(--vscode-focusBorder, #007acc);
}

/* Button styling */
button {
  transition:
    background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out;
}

/* Code styling */
code,
pre {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>

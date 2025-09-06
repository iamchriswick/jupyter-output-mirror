<template>
  <div class="space-y-6">
    <!-- Interpreter Type Selection -->
    <div>
      <label class="block text-sm font-medium text-gray-900 dark:text-white mb-3">
        Python Environment
      </label>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Pyodide Option -->
        <div
          class="relative border-2 rounded-lg p-4 cursor-pointer transition-all"
          :class="
            interpreterType === 'pyodide'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
          "
          @click="setInterpreterType('pyodide')"
        >
          <div class="flex items-center">
            <input
              type="radio"
              :checked="interpreterType === 'pyodide'"
              class="text-blue-600 focus:ring-blue-500"
              @change="setInterpreterType('pyodide')"
            />
            <div class="ml-3">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                Pyodide (Recommended)
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Python in the browser, no setup required
              </p>
            </div>
          </div>

          <div
            v-if="interpreterType === 'pyodide'"
            class="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700"
          >
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-600 dark:text-gray-400">Status:</span>
                <span class="text-xs font-medium" :class="pyodideStatusClass">
                  {{ pyodideStatusText }}
                </span>
              </div>

              <button
                v-if="!interpreterStore.isReady && !interpreterStore.isInitializing"
                @click="initializePyodide"
                class="w-full mt-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Initialize Pyodide
              </button>

              <div v-if="interpreterStore.isInitializing" class="mt-2">
                <div
                  class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1"
                >
                  <span>Loading...</span>
                  <span>{{ interpreterStore.initializationProgress }}%</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${interpreterStore.initializationProgress}%` }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- System Python Option -->
        <div
          class="relative border-2 rounded-lg p-4 cursor-pointer transition-all"
          :class="
            interpreterType === 'system'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
          "
          @click="setInterpreterType('system')"
        >
          <div class="flex items-center">
            <input
              type="radio"
              :checked="interpreterType === 'system'"
              class="text-blue-600 focus:ring-blue-500"
              @change="setInterpreterType('system')"
            />
            <div class="ml-3">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">System Python</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Use local Python installation
              </p>
            </div>
          </div>

          <div
            v-if="interpreterType === 'system'"
            class="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700"
          >
            <div class="space-y-2">
              <!-- Current Interpreter Path -->
              <div v-if="interpreterStore.interpreter.systemInterpreterPath" class="text-xs">
                <span class="text-gray-600 dark:text-gray-400">Current:</span>
                <code
                  class="ml-1 px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-200"
                >
                  {{
                    interpreterStore.interpreter.systemInterpreterName ||
                    interpreterStore.interpreter.systemInterpreterPath
                  }}
                </code>
              </div>

              <!-- Select Button -->
              <button
                @click="selectSystemInterpreter"
                :disabled="isSelectingInterpreter"
                class="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isSelectingInterpreter ? 'Selecting...' : 'Select Python Interpreter' }}
              </button>

              <!-- Version Info -->
              <div
                v-if="interpreterStore.interpreter.version"
                class="text-xs text-gray-600 dark:text-gray-400"
              >
                Version: {{ interpreterStore.interpreter.version }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Package Management (Pyodide only) -->
    <div v-if="interpreterType === 'pyodide' && interpreterStore.isReady" class="space-y-4">
      <h3 class="text-sm font-medium text-gray-900 dark:text-white">Package Management</h3>

      <div class="flex space-x-2">
        <input
          v-model="newPackageName"
          type="text"
          placeholder="Package name (e.g., numpy, matplotlib)"
          class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          @keyup.enter="installPackage"
        />
        <button
          @click="installPackage"
          :disabled="!newPackageName.trim() || isInstallingPackage"
          class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isInstallingPackage ? 'Installing...' : 'Install' }}
        </button>
      </div>

      <!-- Installed Packages -->
      <div v-if="interpreterStore.interpreter.packages.length > 0" class="space-y-2">
        <h4 class="text-xs font-medium text-gray-700 dark:text-gray-300">Installed Packages:</h4>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="pkg in interpreterStore.interpreter.packages"
            :key="pkg"
            class="inline-flex items-center px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
          >
            {{ pkg }}
            <button
              @click="removePackage(pkg)"
              class="ml-1 text-gray-500 dark:text-gray-400 hover:text-red-500"
            >
              ×
            </button>
          </span>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div
      v-if="interpreterStore.hasError"
      class="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md"
    >
      <div class="flex">
        <svg class="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <div>
          <h4 class="text-sm font-medium text-red-800 dark:text-red-200">Error</h4>
          <p class="text-sm text-red-700 dark:text-red-300 mt-1">
            {{ interpreterStore.interpreter.error }}
          </p>
          <button
            @click="interpreterStore.clearError"
            class="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            Clear error
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useInterpreterStore, type InterpreterType } from '@/stores/interpreter'
import { useVSCodeAPI } from '@/composables/useVSCodeAPI'

const interpreterStore = useInterpreterStore()
const vscodeAPI = useVSCodeAPI()

const newPackageName = ref('')
const isInstallingPackage = ref(false)
const isSelectingInterpreter = ref(false)

// Computed
const interpreterType = computed(() => interpreterStore.interpreter.type)

const pyodideStatusText = computed(() => {
  if (interpreterStore.hasError) return 'Error'
  if (interpreterStore.isInitializing) return 'Initializing...'
  if (interpreterStore.isReady) return 'Ready'
  return 'Not initialized'
})

const pyodideStatusClass = computed(() => {
  if (interpreterStore.hasError) return 'text-red-600 dark:text-red-400'
  if (interpreterStore.isInitializing) return 'text-yellow-600 dark:text-yellow-400'
  if (interpreterStore.isReady) return 'text-green-600 dark:text-green-400'
  return 'text-gray-600 dark:text-gray-400'
})

// Actions
function setInterpreterType(type: InterpreterType) {
  interpreterStore.setInterpreterType(type)
}

async function initializePyodide() {
  try {
    interpreterStore.setInitializing(true)
    interpreterStore.setProgress(0)

    // Dynamic import of Pyodide
    const { loadPyodide } = await import('pyodide')

    interpreterStore.setProgress(30)

    const pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/',
      stdout: (text: string) => console.log(text),
      stderr: (text: string) => console.error(text),
    })

    interpreterStore.setProgress(80)

    // Install commonly used packages
    await pyodide.loadPackage(['numpy', 'matplotlib'])
    interpreterStore.addPackage('numpy')
    interpreterStore.addPackage('matplotlib')

    interpreterStore.setProgress(100)
    interpreterStore.setPyodideInstance(pyodide)
  } catch (error) {
    interpreterStore.setError(
      error instanceof Error ? error.message : 'Failed to initialize Pyodide',
    )
  } finally {
    interpreterStore.setInitializing(false)
    interpreterStore.setProgress(0)
  }
}

async function selectSystemInterpreter() {
  if (!vscodeAPI.canCommunicate.value) {
    interpreterStore.setError('VS Code API not available - cannot select system interpreter')
    return
  }

  try {
    isSelectingInterpreter.value = true
    await vscodeAPI.selectSystemInterpreter()
  } catch (error) {
    interpreterStore.setError(
      error instanceof Error ? error.message : 'Failed to select interpreter',
    )
  } finally {
    isSelectingInterpreter.value = false
  }
}

async function installPackage() {
  if (!newPackageName.value.trim() || !interpreterStore.interpreter.pyodideInstance) return

  try {
    isInstallingPackage.value = true
    const packageName = newPackageName.value.trim()

    await interpreterStore.interpreter.pyodideInstance.loadPackage([packageName])
    interpreterStore.addPackage(packageName)
    newPackageName.value = ''
  } catch (error) {
    interpreterStore.setError(
      `Failed to install package: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  } finally {
    isInstallingPackage.value = false
  }
}

function removePackage(packageName: string) {
  interpreterStore.removePackage(packageName)
  // Note: We can't actually unload packages from Pyodide, just remove from our tracking
}
</script>

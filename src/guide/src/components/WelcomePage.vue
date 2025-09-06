<template>
  <div class="welcome-page">
    <!-- Header Section -->
    <header class="header">
      <div class="logo-container">
        <svg
          alt="Jupyter Logo"
          width="80"
          height="80"
          viewBox="0 0 44 51"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="orange-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color: #ff7043; stop-opacity: 1" />
              <stop offset="100%" style="stop-color: #ff5722; stop-opacity: 1" />
            </linearGradient>
            <linearGradient id="gray-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color: #9e9e9e; stop-opacity: 1" />
              <stop offset="100%" style="stop-color: #757575; stop-opacity: 1" />
            </linearGradient>
          </defs>
          <!-- Jupyter Logo Circles -->
          <circle cx="8" cy="8" r="6" fill="url(#orange-gradient)" />
          <circle cx="36" cy="8" r="6" fill="url(#gray-gradient)" />
          <circle cx="22" cy="43" r="6" fill="url(#orange-gradient)" />
        </svg>
      </div>
      <div class="header-content">
        <h1>
          Jupyter Output Mirror
          <sup
            ><small>{{ version }}</small></sup
          >
        </h1>
        <div class="links">
          <a
            href="https://github.com/iamchriswick/jupyter-output-mirror"
            target="_blank"
            title="GitHub Repository"
            @click="trackLink('github')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              ></path>
            </svg>
            GitHub
          </a>
          <a
            href="https://github.com/iamchriswick/jupyter-output-mirror/releases"
            target="_blank"
            title="Release Notes"
            @click="trackLink('releases')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M21 10.975V8a2 2 0 00-2-2h-6V4.688c.305-.274.5-.668.5-1.11a1.5 1.5 0 00-3 0c0 .442.195.836.5 1.11V6H5a2 2 0 00-2 2v2.998l-.072.005A.999.999 0 002 12v2a1 1 0 001 1v5a2 2 0 002 2h14a2 2 0 002-2v-5a1 1 0 001-1v-1.975a1 1 0 00-.928-.997L21 10.975zm-5 5.025H8v-3h8v3z"
              ></path>
            </svg>
            Releases
          </a>
          <a href="#" title="Extension Settings" @click.prevent="openSettings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12.001 1.993C6.486 1.994 2 6.48 2 11.994c0 5.514 4.486 9.999 10 10 5.515 0 10.001-4.485 10.001-10s-4.486-10-10-10.001zM12 19.994c-4.412 0-8.001-3.589-8.001-8s3.589-8 8-8.001C16.411 3.994 20 7.583 20 11.994c0 4.41-3.589 8-8 8z"
              ></path>
              <path
                d="M12.001 8.994l-4.005 4.005 1.414 1.414 2.591-2.591 2.591 2.591 1.414-1.414-4.005-4.005z"
              ></path>
            </svg>
            Settings
          </a>
          <a href="#" title="Live Demo" @click.prevent="openPlayground">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 00-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 00-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.03.01.06.02.09.01 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-.99 0-1.8-.9-1.8-2s.79-2.01 1.8-2.01c1 0 1.81.9 1.81 2.01-.01 1.1-.8 2-1.81 2zm6.96 0c-.99 0-1.8-.9-1.8-2s.79-2.01 1.8-2.01c1 0 1.81.9 1.81 2.01-.01 1.1-.8 2-1.81 2z"
              ></path>
            </svg>
            Playground
          </a>
        </div>
      </div>
    </header>

    <hr class="divider" />

    <!-- Release Notes Section -->
    <section class="section">
      <h2>💼 Release Notes</h2>
      <div class="card whats-new-card">
        <div v-for="release in releaseNotes" :key="release.version" class="release">
          <h3>{{ release.version }}</h3>
          <ul>
            <li v-for="item in release.items" :key="item">{{ item }}</li>
          </ul>
          <div class="release-footer">
            <a
              :href="release.url"
              target="_blank"
              class="release-link"
              :title="release.url"
              @click="trackLink('release-notes')"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
                ></path>
              </svg>
              Full Release Notes
            </a>
            <div class="release-meta">
              <span>Released: {{ release.date }}</span>
              <span>•</span>
              <span>{{ release.version }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="show-updates-toggle">
        <label>
          <input type="checkbox" v-model="showUpdates" @change="toggleShowUpdates" />
          <span>Show release notes on every significant update</span>
        </label>
      </div>
    </section>

    <!-- Core Features Section -->
    <section class="section">
      <h2>✨ Core Features</h2>
      <div class="features">
        <div v-for="feature in coreFeatures" :key="feature.title" class="feature">
          <div class="feature-icon">{{ feature.icon }}</div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <!-- Examples Section -->
    <section class="section">
      <h2>⚙️ Examples</h2>
      <p>See how the extension synchronizes Jupyter notebook outputs in real-time:</p>
      <div class="video-container">
        <div class="video-placeholder">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
            <path d="M8 5v14l11-7z" />
          </svg>
          <p>Demo Video Coming Soon</p>
        </div>
      </div>
    </section>

    <!-- Interactive Settings Section -->
    <section class="section">
      <h2>⚙️ Interactive Settings</h2>
      <p>Discover the advanced capabilities of the extension:</p>
      <div class="video-container">
        <div class="settings-preview" @click="openSettings">
          <div class="settings-preview-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"
              />
            </svg>
            <h4>Configure Extension Settings</h4>
            <p>Click to open the interactive settings panel</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Playground Section -->
    <section class="section">
      <h2>🎮 Playground</h2>
      <p>Try the extension features in a live environment:</p>
      <div class="video-container">
        <div class="playground-preview" @click="openPlayground">
          <div class="playground-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              />
            </svg>
            <h4>Interactive Demo</h4>
            <p>Test Python code execution and output mirroring</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Required Extensions Section -->
    <section class="section">
      <h2>📚 Required Extensions</h2>
      <ul class="extension-list">
        <li>
          <a
            href="https://marketplace.visualstudio.com/items?itemName=ms-python.python"
            target="_blank"
          >
            Python
          </a>
          - The Python extension offers support for Jupyter notebooks via the
          <a
            href="https://marketplace.visualstudio.com/items?itemName=ms-toolsai.jupyter"
            target="_blank"
          >
            Jupyter extension </a
          >.
        </li>
        <li>
          <a
            href="https://marketplace.visualstudio.com/items?itemName=ms-toolsai.jupyter"
            target="_blank"
          >
            Jupyter
          </a>
          - The Jupyter Extension uses the
          <a
            href="https://code.visualstudio.com/docs/datascience/jupyter-notebooks"
            target="_blank"
          >
            built-in notebook support
          </a>
          from VS Code.
        </li>
      </ul>
    </section>

    <!-- Recommended Extensions Section -->
    <section class="section">
      <h2>📚 Recommended Extensions</h2>
      <ul class="extension-list">
        <li>
          <a
            href="https://marketplace.visualstudio.com/items?itemName=ms-python.pylint"
            target="_blank"
          >
            Pylint
          </a>
          - Python linting for better code quality and error detection.
        </li>
        <li>
          <a
            href="https://marketplace.visualstudio.com/items?itemName=ms-python.black-formatter"
            target="_blank"
          >
            Black Formatter
          </a>
          - Automatic Python code formatting for consistent style.
        </li>
      </ul>
    </section>

    <!-- Troubleshooting Section -->
    <section class="section">
      <h2>🔧 Troubleshooting</h2>
      <div class="troubleshooting">
        <details v-for="item in troubleshootingItems" :key="item.question">
          <summary>{{ item.question }}</summary>
          <div>
            <p v-if="item.description">{{ item.description }}</p>
            <ul v-if="item.steps">
              <li v-for="step in item.steps" :key="step">{{ step }}</li>
            </ul>
          </div>
        </details>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useVSCodeAPI } from '@/composables/useVSCodeAPI'

const vscodeAPI = useVSCodeAPI()

// Reactive data
const version = ref('1.0.5')
const showUpdates = ref(true)

const releaseNotes = ref([
  {
    version: '1.0.5',
    date: 'September 2025',
    url: 'https://github.com/iamchriswick/jupyter-output-mirror/releases/tag/v1.0.5',
    items: [
      '🚀 Real-time output synchronization improvements',
      '✨ Enhanced VS Code webview integration',
      '🐛 Fixed memory leaks in large output handling',
    ],
  },
  {
    version: '1.0.4',
    date: 'August 2025',
    url: 'https://github.com/iamchriswick/jupyter-output-mirror/releases/tag/v1.0.4',
    items: [
      '🚀 Improved performance for large notebooks',
      '🎨 Better dark theme support',
      '🐛 8+ bug fixes',
    ],
  },
  {
    version: '1.0.0',
    date: 'July 2025',
    url: 'https://github.com/iamchriswick/jupyter-output-mirror/releases/tag/v1.0.0',
    items: [
      '🚀 Initial release with core functionality',
      '✨ Real-time Jupyter output mirroring',
      '🌍 Cross-platform support for Windows, macOS, Linux',
      '🎨 VS Code theme integration',
      '⚡ High-performance output rendering',
    ],
  },
])

const coreFeatures = ref([
  {
    icon: '🔄',
    title: 'Real-time Sync',
    description:
      'Automatically mirrors Jupyter notebook outputs to dedicated VS Code panels with instant updates',
  },
  {
    icon: '🎨',
    title: 'Rich Formatting',
    description:
      'Preserves rich text, images, plots, and interactive widgets with full fidelity rendering',
  },
  {
    icon: '⚡',
    title: 'High Performance',
    description: 'Optimized for large outputs with virtualization and efficient memory management',
  },
  {
    icon: '🎯',
    title: 'Smart Filtering',
    description:
      'Intelligent content filtering and truncation options for focused development workflow',
  },
  {
    icon: '🛠️',
    title: 'Customizable',
    description:
      'Extensive configuration options for output display, formatting, and behavior preferences',
  },
  {
    icon: '🔌',
    title: 'Seamless Integration',
    description:
      'Works naturally with existing Jupyter and Python workflows in VS Code environment',
  },
])

const troubleshootingItems = ref([
  {
    question: 'Why is the output not syncing?',
    description: 'Make sure you have:',
    steps: [
      'The latest version of Python and Jupyter extensions installed',
      'A Jupyter kernel running in your notebook',
      'Output mirroring enabled in extension settings',
      'Check that VS Code has permission to access the notebook',
    ],
  },
  {
    question: 'How do I optimize performance for large outputs?',
    description: 'For better performance with large datasets:',
    steps: [
      'Enable output virtualization in settings',
      'Set appropriate output line limits',
      'Use output truncation for very large results',
      'Consider using output filtering options',
    ],
  },
  {
    question: 'Where to report issues?',
    description: 'Please report any problems on our GitHub Issues page with:',
    steps: [
      'Detailed reproduction steps',
      'Screenshots or screencasts if applicable',
      'Your VS Code and extension version information',
      'Sample notebook that demonstrates the issue',
    ],
  },
])

// Methods
function toggleShowUpdates() {
  if (vscodeAPI.canCommunicate.value) {
    vscodeAPI.sendMessage('toggleShowUpdates', { value: showUpdates.value })
  }
}

function trackLink(linkType: string) {
  if (vscodeAPI.canCommunicate.value) {
    vscodeAPI.sendMessage('trackLink', { type: linkType })
  }
}

function openSettings() {
  if (vscodeAPI.canCommunicate.value) {
    vscodeAPI.sendMessage('openSettings')
  } else {
    // In development mode, we could emit an event or use router
    console.log('Would open settings panel')
  }
}

function openPlayground() {
  if (vscodeAPI.canCommunicate.value) {
    vscodeAPI.sendMessage('openPlayground')
  } else {
    // In development mode, we could emit an event or use router
    console.log('Would open playground')
  }
}

// Lifecycle
onMounted(() => {
  if (vscodeAPI.canCommunicate.value) {
    // Get extension version from VS Code
    vscodeAPI
      .sendMessage('getVersion')
      .then((result: unknown) => {
        if (typeof result === 'string') {
          version.value = result
        }
      })
      .catch(() => {
        // Use default version if unable to get from extension
      })
  }
})
</script>

<style scoped>
/* Main container */
.welcome-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  color: var(--vscode-foreground);
  background-color: var(--vscode-editor-background);
}

/* Header */
.header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin: 1rem 0;
  justify-content: center;
  text-align: center;
  flex-wrap: wrap;
}

.logo-container {
  flex-shrink: 0;
}

.header-content h1 {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--vscode-textPreformat-foreground);
}

.header-content h1 sup {
  font-size: 1rem;
  color: var(--vscode-descriptionForeground);
}

.links {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin: 1.5rem 0;
  flex-wrap: wrap;
}

.links a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--vscode-textLink-foreground);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.links a:hover {
  color: var(--vscode-textLink-activeForeground);
  text-decoration: underline;
}

/* Divider */
.divider {
  border: none;
  border-top: 1px solid var(--vscode-widget-border);
  margin: 2rem 0;
}

/* Sections */
.section {
  margin: 2rem 0;
}

.section h2 {
  margin-top: 2rem;
  font-weight: 500;
  color: var(--vscode-terminal-ansiGreen);
  position: relative;
  padding-bottom: 0.75rem;
}

.section h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background-color: var(--vscode-terminal-ansiGreen);
}

/* Cards */
.card {
  border-radius: 12px;
  padding: 2rem;
  background-color: var(--vscode-sideBar-background);
  box-shadow: 0 2px 8px var(--vscode-widget-shadow);
}

.whats-new-card {
  max-height: 250px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Release Notes */
.release {
  margin-bottom: 2rem;
}

.release:last-child {
  margin-bottom: 0;
}

.release h3 {
  color: var(--vscode-textPreformat-foreground);
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.release ul {
  margin: 0;
  padding-left: 1.25rem;
}

.release li {
  margin-bottom: 0.5rem;
}

.release-footer {
  margin-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.release-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--vscode-textLink-foreground);
  text-decoration: none;
}

.release-link:hover {
  color: var(--vscode-textLink-activeForeground);
}

.release-meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.9em;
  color: var(--vscode-descriptionForeground);
}

.show-updates-toggle {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
}

.show-updates-toggle label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

/* Features Grid */
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.feature {
  padding: 1.5rem;
  border-radius: 10px;
  background-color: var(--vscode-sideBar-background);
  transition: transform 0.2s ease;
  box-shadow: 0 2px 8px var(--vscode-widget-shadow);
}

.feature:hover {
  transform: translateY(-3px);
}

.feature-icon {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--vscode-terminal-ansiGreen);
}

.feature h3 {
  color: var(--vscode-textPreformat-foreground);
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.feature p {
  margin: 0;
  color: var(--vscode-descriptionForeground);
}

/* Video Container */
.video-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
  overflow: hidden;
  border-radius: 12px;
  background-color: var(--vscode-sideBar-background);
  box-shadow: 0 4px 12px var(--vscode-widget-shadow);
  margin: 1rem 0;
}

.video-placeholder,
.settings-preview,
.playground-preview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--vscode-descriptionForeground);
  cursor: pointer;
  transition: all 0.2s ease;
}

.settings-preview:hover,
.playground-preview:hover {
  background-color: var(--vscode-list-hoverBackground);
}

.settings-preview-content,
.playground-content {
  text-align: center;
}

.settings-preview-content h4,
.playground-content h4 {
  margin: 0.5rem 0;
  color: var(--vscode-textPreformat-foreground);
}

.settings-preview-content p,
.playground-content p {
  margin: 0;
  font-size: 0.9rem;
}

/* Extension Lists */
.extension-list {
  padding-left: 1.5rem;
}

.extension-list li {
  margin-bottom: 0.75rem;
}

.extension-list a {
  color: var(--vscode-textLink-foreground);
  text-decoration: none;
  font-weight: 500;
}

.extension-list a:hover {
  color: var(--vscode-textLink-activeForeground);
  text-decoration: underline;
}

/* Troubleshooting */
.troubleshooting details {
  margin-bottom: 1rem;
  border-radius: 6px;
  overflow: hidden;
  background-color: var(--vscode-sideBar-background);
}

.troubleshooting summary {
  cursor: pointer;
  font-weight: 500;
  padding: 0.8rem 1rem;
  background-color: var(--vscode-editor-lineHighlightBackground);
  outline: none;
  transition: background-color 0.2s ease;
}

.troubleshooting summary:hover {
  background-color: var(--vscode-editor-lineHighlightBorder);
}

.troubleshooting details[open] summary {
  background-color: var(--vscode-editor-lineHighlightBorder);
}

.troubleshooting details div {
  padding: 1rem;
}

.troubleshooting ul {
  padding-left: 1.5rem;
}

.troubleshooting li {
  margin-bottom: 0.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .welcome-page {
    padding: 1.5rem;
  }

  .header {
    flex-direction: column;
    gap: 1.5rem;
    margin: 2rem 0;
  }

  .header-content h1 {
    font-size: 2rem;
  }

  .card,
  .feature {
    padding: 1.25rem;
  }

  .release-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

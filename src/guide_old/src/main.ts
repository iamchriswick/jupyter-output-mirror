import { VSCodeAPIHandler } from "./utils/vscode-api";
import { SettingsPanel } from "./components/settings-panel";
import { InterpreterSetup } from "./components/interpreter-setup";
import { InteractiveCodeRunner } from "./components/interactive-code-runner";

class SetupGuideApp {
  private vscode: VSCodeAPIHandler;
  private interpreterSetup?: InterpreterSetup;

  constructor() {
    this.vscode = new VSCodeAPIHandler();
    this.init();
  }

  private init() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setup());
    } else {
      this.setup();
    }
  }

  private setup() {
    // Get containers
    const settingsContainer = document.getElementById("settings-panel");
    const interpreterContainer = document.getElementById("interpreter-setup");
    const codeRunnerContainer = document.getElementById("code-runner");

    if (!settingsContainer || !interpreterContainer || !codeRunnerContainer) {
      console.error("Required containers not found in DOM");
      return;
    }

    // Initialize components
    new SettingsPanel(settingsContainer, this.vscode);
    this.interpreterSetup = new InterpreterSetup(
      interpreterContainer,
      this.vscode
    );
    new InteractiveCodeRunner(
      codeRunnerContainer,
      this.vscode,
      this.interpreterSetup
    );

    // Setup navigation
    this.setupNavigation();

    // Load initial settings
    this.vscode.loadSettings();

    console.log("Setup Guide App initialized");
  }

  private setupNavigation() {
    // Handle navigation between sections
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll(".section");

    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        const targetId = link.getAttribute("href")?.substring(1);
        if (!targetId) return;

        // Update active nav link
        navLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");

        // Show target section
        sections.forEach((section) => {
          if (section.id === targetId) {
            section.classList.add("active");
          } else {
            section.classList.remove("active");
          }
        });
      });
    });

    // Auto-advance functionality
    const nextButtons = document.querySelectorAll(".next-section-btn");
    nextButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const currentSection = btn.closest(".section");
        const nextSection = currentSection?.nextElementSibling;

        if (nextSection && nextSection.classList.contains("section")) {
          const targetId = nextSection.id;
          const targetLink = document.querySelector(`[href="#${targetId}"]`);

          if (targetLink) {
            targetLink.dispatchEvent(new Event("click"));
          }
        }
      });
    });
  }
}

// Initialize the app
new SetupGuideApp();

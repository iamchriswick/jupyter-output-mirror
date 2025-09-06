# Custom zsh configuration for Jupyter Output Mirror DevContainer
# This file persists across container rebuilds as it's part of the workspace

# --- Starship prompt setup ---
if command -v starship >/dev/null 2>&1; then
    eval "$(starship init zsh)"
    export STARSHIP_CONFIG="/workspaces/jupyter-output-mirror/.devcontainer/starship.toml"
fi

# --- Utility aliases ---
alias reload="source ~/.zshrc"

# --- lla aliases (Linux, Zsh) ---
if command -v lla >/dev/null 2>&1; then
    # Replace default ls with lla grid view + icons
    alias ls='lla -g --icons'

    # Long, human-readable, directories first
    alias ll='lla -l --icons --sort-dirs-first'

    # Tree view (depth 2, tweak -d as needed)
    alias llt='lla -t -d 2 --icons'

    # Recursive deep dive with details (depth 3)
    alias llr='lla -R -d 3 -l --sort-dirs-first'

    # Git-aware listing (inside repos)
    alias llg='lla -G -l --icons'

    # Storage heatmap (includes dir sizes)
    alias lls='lla -S --include-dirs --icons'
else
    # Fallback to enhanced ls if lla is not available
    alias ll='ls -alF'
    alias la='ls -A'
    alias l='ls -CF'
fi

# --- Development aliases ---
alias npmci='npm ci'
alias npmbuild='npm run compile'
alias pyformat='ruff format .'
alias pylint='ruff check .'

# --- Git aliases ---
alias gs='git status'
alias ga='git add'
alias gc='git commit'
alias gp='git push'
alias gl='git pull'

echo "🚀 Jupyter Output Mirror DevContainer shell loaded!"

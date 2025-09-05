# 🚀 Jupyter Output Mirror - QuickStart Guide

Welcome to **Jupyter Output Mirror**! This extension mirrors Jupyter notebook stdout/stderr outputs to VS Code's Output panel for better visibility and debugging.

## ✨ What This Extension Does

- **Real-time mirroring**: See stdout/stderr outputs in VS Code's Output panel as they happen
- **Multiple output types**: Supports stdout, stderr, and text/plain outputs
- **Flexible channels**: Choose between single shared channel or per-notebook channels
- **Configurable**: Timestamps, ANSI stripping, debouncing, and more
- **Active notebook focus**: Option to mirror only from the currently active notebook

## 🎯 Quick Demo

Want to see it in action right away? Use the command palette:

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type: `Jupyter Output Mirror: Create Demo Notebook`
3. Run the demo notebook cells and watch the Output panel!

## 📖 How to Use

### Basic Usage

1. Open any Jupyter notebook (`.ipynb` file)
2. The extension activates automatically
3. Run cells with `print()` or `sys.stderr.write()`
4. Check the **"Jupyter Stdout/Stderr"** output channel (View → Output)

### Configuration Options

Open VS Code Settings and search for "Jupyter Output Mirror":

- **Channel Mode**: `single` (shared) or `perNotebook` (separate channels)
- **Active Notebook Only**: Mirror only from the focused notebook
- **Timestamps**: Add timestamps to each output line
- **Strip ANSI**: Remove color codes from output
- **Debounce**: Adjust how quickly outputs are processed (default: 50ms)
- **Max Chunk Size**: Limit output size to prevent flooding

### Available Commands

- `Jupyter Output Mirror: Toggle` - Enable/disable the extension
- `Jupyter Output Mirror: Clear Output Channel(s)` - Clear all output
- `Jupyter Output Mirror: Create Demo Notebook` - Bootstrap demo notebook
- `Jupyter Output Mirror: Open QuickStart` - Show this guide again

## 🔧 Troubleshooting

**Not seeing outputs?**

- Check that the Jupyter extension is installed and working
- Verify the extension is enabled: `Jupyter Output Mirror: Toggle`
- Make sure you're running code that actually produces stdout/stderr

**Too much output?**

- Adjust the "Max Chunk Size" setting
- Enable debouncing with a higher delay
- Use "Active Notebook Only" mode

**Output not appearing immediately?**

- Lower the debounce delay (default: 50ms)
- Check if "Active Notebook Only" is enabled and switch notebook focus

## 🎨 Pro Tips

- **Multiple notebooks**: Use "perNotebook" channel mode for better organization
- **Debugging**: Enable timestamps to track when outputs occurred
- **Performance**: Increase debounce delay for high-volume outputs
- **Clean output**: Enable ANSI stripping for cleaner text output

## 📚 Need More Help?

- Check the extension settings for all available options
- Use the demo notebook to test different scenarios
- Report issues or suggest features on our repository

---

**Happy debugging! 🐛→✨**
_This guide is part of the Jupyter Output Mirror extension documentation._

# fixkey-electron

This project mimics fixKey.
It allows fixing grammar and typos with a single shortcuts - no matter which app you are using.
It does it with Electron, so it's a cross-platform (but overkill).
I may convert this project to tauri to have better performance and small installation size.

Usage: Click `Option+S` to fix text.
It will select the text, copy to clipboard and replace the content with AI response from Ollama to fix the text.

https://github.com/nirtamir2/fixkey-electron/assets/16452789/bc41cd0a-b36f-4c87-8ecc-700613a178fb

![demo](./docs/demo.mp4)

## Development
Make sure you have [Ollama](https://ollama.ai/) installed

### Install

```bash
$ pnpm install
```

### Development

```bash
$ pnpm dev
```

### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```

# GifWat

[![vitest](https://github.com/ryanpetrello/gifwat/actions/workflows/test.yml/badge.svg)](https://github.com/ryanpetrello/gifwat/actions/workflows/test.yml)

A macOS menu bar app for cataloging and quickly accessing GIFs. Spiritual successor to [GifWit](https://gifwit.com/).

<video src="https://github.com/user-attachments/assets/b7d41838-e440-40ee-a900-82dbcef0dc61" autoplay loop muted playsinline></video>

## Prerequisites

GifWat is built with [Tauri](https://tauri.app/), a lightweight alternative to Electron that uses a Rust backend with a web-based frontend (specifically, React, for this project).

**Rust**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

**Node.js** (v20+)
```bash
nvm install 20
```

## Development

```bash
npm install
npm run tauri dev
```

First build compiles Rust dependencies and takes a few minutes. Subsequent builds are fast.

## Building a .dmg

```bash
npm run tauri build
```

Output: `src-tauri/target/release/bundle/dmg/GifWat_0.1.0_aarch64.dmg`

> **Note**: The .dmg is unsigned. Recipients will need to right-click → Open to bypass Gatekeeper, or run `xattr -cr /Applications/GifWat.app` after installing.

## Usage

- **Click menu bar icon** → Toggle GIF window
- **Right-click menu bar icon** → Quit
- **Cmd+Shift+G** → Global shortcut to toggle window
- **Search** → Filter by URL or tag
- **Click GIF** → Copy URL to clipboard
- **Hover + X** → Delete GIF

Data stored at `~/Library/Application Support/gifwat/gifs.json`

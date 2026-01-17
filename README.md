# GifWat

A macOS menu bar app for cataloging and quickly accessing GIFs. Spiritual successor to [GifWit](https://gifwit.com/).

![GifWat Screenshot](example.png)

## Prerequisites

**Rust**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

**Node.js** (v18+)
```bash
brew install node
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

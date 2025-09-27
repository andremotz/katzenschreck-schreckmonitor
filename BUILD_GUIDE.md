# Windows App Build Guide

This guide explains how to package your Schreckmonitor Gallery app for Windows.

## Prerequisites

1. **Node.js and npm** must be installed
2. **All dependencies** must be installed:
   ```bash
   npm install
   ```

## Prepare Icons (Optional but recommended)

For a professional app, you should provide icons:

1. **Windows Icon (icon.ico)**: 256x256 pixel .ico file
   - Save as `assets/icon.ico`

2. **macOS Icon (icon.icns)**: .icns file for macOS
   - Save as `assets/icon.icns`

3. **Linux Icon (icon.png)**: 512x512 pixel .png file
   - Save as `assets/icon.png`

**Icon Creation Tools:**
- Online: [ICO Convert](https://icoconvert.com/) for .ico files
- Online: [ICNS Convert](https://cloudconvert.com/png-to-icns) for .icns files
- Software: GIMP, Photoshop, or free online tools

## Build Windows App

### Option 1: Windows Only (Recommended)
```bash
npm run build:win
```

### Option 2: All Platforms
```bash
npm run build:all
```

### Option 3: Specific Windows Targets
```bash
# NSIS Installer only (Standard Windows Installer)
npx electron-builder --win --x64 nsis

# Portable version only (no installation required)
npx electron-builder --win --x64 portable

# Both variants
npx electron-builder --win --x64 nsis portable
```

## What Gets Created?

After the build process, you'll find in the `dist/` folder:

### Windows Builds:
- **NSIS Installer**: `Schreckmonitor Gallery Setup 1.0.0.exe`
  - Complete Windows installer
  - Creates desktop and start menu shortcuts
  - Supports uninstallation

- **Portable Version**: `Schreckmonitor Gallery 1.0.0.exe`
  - Standalone executable
  - No installation required
  - Can be run from USB stick

### Additional Platforms (if using build:all):
- **macOS**: `Schreckmonitor Gallery-1.0.0.dmg`
- **Linux**: `Schreckmonitor Gallery-1.0.0.AppImage` and `schreckmonitor-gallery_1.0.0_amd64.deb`

## Build Configuration

The build configuration in `package.json` creates:

### Windows:
- **Architectures**: x64 and ia32 (32-bit)
- **Formats**: NSIS Installer + Portable
- **Features**: 
  - Desktop shortcut
  - Start menu entry
  - Selectable installation directory
  - Complete uninstallation

### Installer Options:
- **oneClick**: false (user can choose installation folder)
- **allowToChangeInstallationDirectory**: true
- **createDesktopShortcut**: true
- **createStartMenuShortcut**: true

## Distribution

### For End Users:
1. **NSIS Installer** recommended for normal installation
2. **Portable Version** for USB sticks or temporary use

### System Requirements:
- **Windows 10 or higher** (recommended)
- **Windows 8.1** (minimum)
- **64-bit or 32-bit** architecture
- **Administrator rights** for NSIS installation (not required for Portable)

## Troubleshooting

### Build Fails:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear cache
npx electron-builder install-app-deps
```

### Icon Errors:
- Ensure icon files are in the `assets/` folder
- If no icons are available, remove icon references from `package.json`

### Large File Sizes:
The app contains:
- Electron Runtime (~150 MB)
- Node.js modules (MariaDB driver)
- Your app files

This is normal for Electron apps.

## Advanced Options

### Code Signing (for trustworthiness):
```bash
# Requires code signing certificate
npx electron-builder --win --publish never
```

### Auto-Update (optional):
Can be implemented with `electron-updater`.

### Installer Customizations:
Additional NSIS options can be configured in `package.json` under `build.nsis`.

## Next Steps

1. **Test the created app** on different Windows systems
2. **Create icon files** for professional appearance
3. **Document system requirements** for end users
4. **Consider code signing** for trustworthiness

The finished Windows app can be found in the `dist/` folder and can be directly distributed to users!

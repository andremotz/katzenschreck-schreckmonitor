# Windows App Build Anleitung

Diese Anleitung erklärt, wie du deine Schreckmonitor Gallery App für Windows verpackst.

## Voraussetzungen

1. **Node.js und npm** müssen installiert sein
2. **Alle Dependencies** müssen installiert sein:
   ```bash
   npm install
   ```

## Icons vorbereiten (Optional aber empfohlen)

Für eine professionelle App solltest du Icons bereitstellen:

1. **Windows Icon (icon.ico)**: 256x256 pixel .ico Datei
   - Speichere sie als `assets/icon.ico`

2. **macOS Icon (icon.icns)**: .icns Datei für macOS
   - Speichere sie als `assets/icon.icns`

3. **Linux Icon (icon.png)**: 512x512 pixel .png Datei
   - Speichere sie als `assets/icon.png`

**Icon-Erstellung Tools:**
- Online: [ICO Convert](https://icoconvert.com/) für .ico Dateien
- Online: [ICNS Convert](https://cloudconvert.com/png-to-icns) für .icns Dateien
- Software: GIMP, Photoshop, oder kostenlose Online-Tools

## Windows App builden

### Option 1: Nur Windows (Empfohlen)
```bash
npm run build:win
```

### Option 2: Alle Plattformen
```bash
npm run build:all
```

### Option 3: Spezifische Windows-Targets
```bash
# Nur NSIS Installer (Standard Windows Installer)
npx electron-builder --win --x64 nsis

# Nur Portable Version (ohne Installation)
npx electron-builder --win --x64 portable

# Beide Varianten
npx electron-builder --win --x64 nsis portable
```

## Was wird erstellt?

Nach dem Build-Prozess findest du im `dist/` Ordner:

### Windows Builds:
- **NSIS Installer**: `Schreckmonitor Gallery Setup 1.0.0.exe`
  - Vollständiger Windows-Installer
  - Erstellt Desktop- und Startmenü-Verknüpfungen
  - Unterstützt Deinstallation

- **Portable Version**: `Schreckmonitor Gallery 1.0.0.exe`
  - Standalone-Executable
  - Keine Installation erforderlich
  - Kann von USB-Stick ausgeführt werden

### Weitere Plattformen (falls build:all verwendet):
- **macOS**: `Schreckmonitor Gallery-1.0.0.dmg`
- **Linux**: `Schreckmonitor Gallery-1.0.0.AppImage` und `schreckmonitor-gallery_1.0.0_amd64.deb`

## Build-Konfiguration

Die Build-Konfiguration in `package.json` erstellt:

### Windows:
- **Architekturen**: x64 und ia32 (32-bit)
- **Formate**: NSIS Installer + Portable
- **Features**: 
  - Desktop-Shortcut
  - Startmenü-Eintrag
  - Installationsverzeichnis wählbar
  - Vollständige Deinstallation

### Installer-Optionen:
- **oneClick**: false (Benutzer kann Installationsordner wählen)
- **allowToChangeInstallationDirectory**: true
- **createDesktopShortcut**: true
- **createStartMenuShortcut**: true

## Verteilung

### Für Endbenutzer:
1. **NSIS Installer** empfohlen für normale Installation
2. **Portable Version** für USB-Sticks oder temporäre Nutzung

### Systemanforderungen:
- **Windows 10 oder höher** (empfohlen)
- **Windows 8.1** (minimal)
- **64-bit oder 32-bit** Architektur
- **Administratorrechte** für NSIS-Installation (nicht für Portable)

## Troubleshooting

### Build schlägt fehl:
```bash
# Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install

# Cache leeren
npx electron-builder install-app-deps
```

### Icon-Fehler:
- Stelle sicher, dass die Icon-Dateien im `assets/` Ordner liegen
- Falls keine Icons vorhanden sind, entferne die icon-Referenzen aus `package.json`

### Große Dateigrößen:
Die App enthält:
- Electron Runtime (~150 MB)
- Node.js Module (MariaDB-Treiber)
- Deine App-Dateien

Dies ist normal für Electron-Apps.

## Erweiterte Optionen

### Code Signing (für Vertrauenswürdigkeit):
```bash
# Erfordert Code-Signing-Zertifikat
npx electron-builder --win --publish never
```

### Auto-Update (optional):
Kann mit `electron-updater` implementiert werden.

### Installer-Anpassungen:
Weitere NSIS-Optionen können in der `package.json` unter `build.nsis` konfiguriert werden.

## Nächste Schritte

1. **Teste die erstellte App** auf verschiedenen Windows-Systemen
2. **Erstelle Icon-Dateien** für professionelles Aussehen
3. **Dokumentiere Systemanforderungen** für Endbenutzer
4. **Überlege Code-Signing** für Vertrauenswürdigkeit

Die fertige Windows-App findest du im `dist/` Ordner und kann direkt an Benutzer weitergegeben werden!

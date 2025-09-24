# Schreckmonitor Gallery

Eine moderne Electron-Desktop-Anwendung zur Anzeige und Verwaltung von Katzenschreck-Erkennungsbildern aus einer MariaDB-Datenbank.

## Features

- 🖼️ **Moderne Bildergalerie** - Raster- und Listenansicht
- 🔍 **Erweiterte Filterung** - Nach Kamera und Zeitraum
- 📊 **Statistiken** - Überblick über Erkennungen und Kameras
- 🗃️ **Datenbankintegration** - Direkte Anbindung an MariaDB
- 🎨 **Responsive Design** - Funktioniert auf verschiedenen Bildschirmgrößen
- ⚡ **Performance** - Optimiert für große Bildmengen
- 🔒 **Sicherheit** - Sichere IPC-Kommunikation zwischen Prozessen

## Systemanforderungen

- Node.js 16 oder höher
- MariaDB Server
- Windows 10/11, macOS 10.14+ oder Linux

## Installation

1. **Repository klonen**
   ```bash
   git clone <repository-url>
   cd schreckmonitor
   ```

2. **Abhängigkeiten installieren**
   ```bash
   npm install
   ```

3. **Datenbankverbindung konfigurieren**
   
   Kopiere die Beispielkonfiguration und passe sie an:
   ```bash
   cp config.example.js config.js
   ```
   
   Bearbeite `config.js` mit deinen Datenbankdaten:
   ```javascript
   module.exports = {
       database: {
           host: 'localhost',
           port: 3306,
           user: 'dein_benutzer',
           password: 'dein_passwort',
           database: 'katzenschreck'
       }
   };
   ```

4. **Umgebungsvariablen setzen (optional)**
   
   Alternativ können Sie Umgebungsvariablen verwenden:
   ```bash
   export DB_HOST=localhost
   export DB_PORT=3306
   export DB_USER=dein_benutzer
   export DB_PASSWORD=dein_passwort
   export DB_NAME=katzenschreck
   ```

## Verwendung

### Entwicklungsmodus starten
```bash
npm run dev
```

### Produktionsversion starten
```bash
npm start
```

### App builden
```bash
npm run build
```

## Datenbankschema

Die Anwendung erwartet eine MariaDB-Tabelle mit folgendem Schema:

```sql
CREATE TABLE `detections_images` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `camera_name` VARCHAR(50) NOT NULL,
    `accuracy` DECIMAL(3,4) NOT NULL,
    `blob_jpeg` MEDIUMBLOB NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB;
```

## Funktionen im Detail

### 📸 Bildergalerie
- **Rasteransicht**: Übersichtliche Darstellung aller Erkennungen in einem Grid
- **Listenansicht**: Kompakte Darstellung mit zusätzlichen Informationen
- **Sortierung**: Nach Datum, Genauigkeit oder Kamera
- **Lazy Loading**: Optimierte Performance bei vielen Bildern

### 🔍 Filteroptionen
- **Alle Kameras**: Zeigt alle Erkennungen an
- **Nach Kamera**: Filtert Erkennungen einer bestimmten Kamera
- **Genauigkeitsanzeige**: Farbkodierte Badges für verschiedene Genauigkeitsstufen

### 📊 Statistiken
- Gesamtanzahl der Erkennungen
- Anzahl der aktiven Kameras
- Zeitstempel der neuesten und ältesten Erkennung

### 🛠️ Verwaltung
- **Erkennung löschen**: Einzelne Erkennungen können gelöscht werden
- **Verbindungstest**: Überprüfung der Datenbankverbindung
- **Aktualisierung**: Manuelle Aktualisierung der Daten

## Projektstruktur

```
schreckmonitor/
├── assets/                 # App-Ressourcen (Icons, etc.)
├── database/              # Datenbankmodule
│   └── db-manager.js      # MariaDB-Verbindungsmanager
├── renderer/              # Frontend-Dateien
│   ├── index.html         # Haupt-HTML-Datei
│   ├── styles.css         # CSS-Styling
│   └── script.js          # Frontend-JavaScript
├── main.js                # Hauptprozess (Electron)
├── preload.js             # Preload-Script für sichere IPC
├── package.json           # Projektkonfiguration
├── config.example.js      # Beispielkonfiguration
└── README.md              # Diese Datei
```

## Entwicklung

### IPC-Kommunikation
Die App verwendet Electron's IPC (Inter-Process Communication) für sichere Kommunikation zwischen dem Hauptprozess und dem Renderer-Prozess.

**Verfügbare APIs:**
- `getDetections()` - Alle Erkennungen abrufen
- `getDetectionsByCamera(cameraName)` - Erkennungen nach Kamera filtern
- `getCameras()` - Verfügbare Kameras abrufen
- `deleteDetection(id)` - Erkennung löschen
- `testDbConnection()` - Datenbankverbindung testen

### CSS-Variablen
Das Design verwendet CSS Custom Properties für einfache Anpassung der Farben und Abstände:

```css
:root {
    --primary-color: #2563eb;
    --success-color: #059669;
    --error-color: #dc2626;
    /* ... weitere Variablen */
}
```

## Fehlerbehebung

### Datenbankverbindung fehlgeschlagen
1. Überprüfen Sie die Verbindungsdaten in `config.js`
2. Stellen Sie sicher, dass der MariaDB-Server läuft
3. Überprüfen Sie die Firewall-Einstellungen
4. Verwenden Sie den "Verbindung testen" Button in der App

### App startet nicht
1. Überprüfen Sie die Node.js-Version (`node --version`)
2. Löschen Sie `node_modules` und führen Sie `npm install` erneut aus
3. Überprüfen Sie die Konsole auf Fehlermeldungen

### Bilder werden nicht angezeigt
1. Überprüfen Sie, ob die `blob_jpeg`-Spalte gültige JPEG-Daten enthält
2. Überprüfen Sie die Datenbankberechtigungen
3. Schauen Sie in die Entwicklertools (F12) für JavaScript-Fehler

## Lizenz

MIT License - Siehe LICENSE-Datei für Details.

## Beiträge

Beiträge sind willkommen! Bitte erstellen Sie einen Pull Request oder öffnen Sie ein Issue für Verbesserungsvorschläge.

## Support

Bei Fragen oder Problemen erstellen Sie bitte ein Issue im Repository oder kontaktieren Sie den Entwickler.

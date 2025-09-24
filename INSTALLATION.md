# 📦 Installationsanleitung

## Systemanforderungen installieren

### 1. Node.js installieren

**Option A: Über Homebrew (empfohlen für macOS)**
```bash
# Homebrew installieren (falls noch nicht vorhanden)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js installieren
brew install node
```

**Option B: Direkter Download**
1. Besuchen Sie https://nodejs.org/
2. Laden Sie die LTS-Version für macOS herunter
3. Führen Sie den Installer aus

**Option C: Node Version Manager (nvm)**
```bash
# nvm installieren
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Terminal neu starten oder:
source ~/.bashrc

# Neueste LTS-Version installieren
nvm install --lts
nvm use --lts
```

### 2. Installation überprüfen

```bash
node --version   # Sollte v18.x.x oder höher anzeigen
npm --version    # Sollte 9.x.x oder höher anzeigen
```

## Projekt installieren

### 1. In das Projektverzeichnis wechseln
```bash
cd /Users/andremotz/Development/schreckmonitor
```

### 2. Abhängigkeiten installieren
```bash
npm install
```

### 3. Datenbankverbindung konfigurieren
```bash
# Konfigurationsdatei erstellen
cp config.example.js config.js

# Bearbeiten Sie config.js mit Ihren Datenbankdaten
nano config.js  # oder verwenden Sie Ihren bevorzugten Editor
```

### 4. MariaDB vorbereiten

Stellen Sie sicher, dass MariaDB läuft und die Datenbank existiert:

```sql
-- Mit MariaDB verbinden
mysql -u root -p

-- Datenbank erstellen (falls noch nicht vorhanden)
CREATE DATABASE IF NOT EXISTS katzenschreck;
USE katzenschreck;

-- Tabelle erstellen
CREATE TABLE IF NOT EXISTS `detections_images` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `camera_name` VARCHAR(50) NOT NULL,
    `accuracy` DECIMAL(3,4) NOT NULL,
    `blob_jpeg` MEDIUMBLOB NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- Beispieldaten einfügen (optional)
INSERT INTO detections_images (camera_name, accuracy, blob_jpeg) VALUES 
('Kamera 1', 0.95, LOAD_FILE('/path/to/test/image.jpg')),
('Kamera 2', 0.87, LOAD_FILE('/path/to/test/image2.jpg'));
```

## App starten

### Entwicklungsmodus (mit DevTools)
```bash
npm run dev
```

### Produktionsmodus
```bash
npm start
```

### App für Distribution builden
```bash
npm run build
```

## Mögliche Probleme und Lösungen

### "npm: command not found"
- Node.js ist nicht installiert oder nicht im PATH
- Installieren Sie Node.js wie oben beschrieben
- Terminal neu starten nach der Installation

### "Datenbankverbindung fehlgeschlagen"
- Überprüfen Sie MariaDB-Status: `brew services list | grep mariadb`
- MariaDB starten: `brew services start mariadb`
- Verbindungsdaten in `config.js` überprüfen

### "electron: command not found"
- Abhängigkeiten nicht installiert: `npm install`
- Globale Installation: `npm install -g electron`

### Berechtigungsfehler
```bash
# npm-Berechtigungen reparieren
sudo chown -R $(whoami) ~/.npm
```

### Node.js-Version zu alt
```bash
# Mit nvm aktualisieren
nvm install --lts
nvm use --lts

# Oder mit Homebrew
brew upgrade node
```

## Entwicklungstools (optional)

### Git initialisieren
```bash
git init
git add .
git commit -m "Initial commit: Schreckmonitor Gallery App"
```

### VS Code Extensions (empfohlen)
- Electron Debugger
- JavaScript (ES6) code snippets
- Prettier - Code formatter
- ESLint

## Nächste Schritte

Nach erfolgreicher Installation lesen Sie die `QUICK_START.md` für die ersten Schritte mit der Anwendung.

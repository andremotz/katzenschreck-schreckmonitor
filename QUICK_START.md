# 🚀 Schnellstart-Anleitung

## 1. Installation der Abhängigkeiten

```bash
cd /Users/andremotz/Development/schreckmonitor
npm install
```

## 2. Datenbankverbindung konfigurieren

Erstellen Sie eine `config.js` Datei basierend auf `config.example.js`:

```bash
cp config.example.js config.js
```

Bearbeiten Sie `config.js` mit Ihren MariaDB-Verbindungsdaten:

```javascript
module.exports = {
    database: {
        host: 'localhost',        // Ihr MariaDB-Server
        port: 3306,              // Standard MariaDB-Port
        user: 'root',            // Ihr Datenbankbenutzer
        password: '',            // Ihr Datenbankpasswort
        database: 'katzenschreck' // Name Ihrer Datenbank
    }
};
```

## 3. Datenbank vorbereiten

Stellen Sie sicher, dass Ihre MariaDB-Datenbank die Tabelle `detections_images` mit folgendem Schema hat:

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

## 4. App starten

### Entwicklungsmodus (mit DevTools):
```bash
npm run dev
```

### Produktionsmodus:
```bash
npm start
```

## 5. Erste Schritte in der App

1. **Verbindung testen**: Klicken Sie auf "Verbindung testen" um zu überprüfen, ob die Datenbankverbindung funktioniert
2. **Daten laden**: Die App lädt automatisch alle Erkennungen aus der Datenbank
3. **Kameras filtern**: Wählen Sie eine Kamera in der Sidebar aus, um nur deren Erkennungen anzuzeigen
4. **Ansicht wechseln**: Nutzen Sie die Buttons oben rechts um zwischen Raster- und Listenansicht zu wechseln
5. **Bilder betrachten**: Klicken Sie auf ein Bild, um es in der Vollansicht zu öffnen

## 📋 Checkliste für den ersten Start

- [ ] Node.js ist installiert (Version 16+)
- [ ] MariaDB-Server läuft
- [ ] Datenbank `katzenschreck` existiert
- [ ] Tabelle `detections_images` ist erstellt
- [ ] `config.js` ist mit korrekten Verbindungsdaten erstellt
- [ ] Abhängigkeiten sind installiert (`npm install`)
- [ ] App startet ohne Fehler

## 🔧 Fehlerbehebung

**Problem**: "Datenbankverbindung fehlgeschlagen"
- Überprüfen Sie die Verbindungsdaten in `config.js`
- Stellen Sie sicher, dass MariaDB läuft
- Testen Sie die Verbindung mit einem DB-Client

**Problem**: "Keine Bilder gefunden"
- Überprüfen Sie, ob Daten in der Tabelle `detections_images` vorhanden sind
- Stellen Sie sicher, dass die Spalte `blob_jpeg` gültige JPEG-Daten enthält

**Problem**: App startet nicht
- Überprüfen Sie die Node.js-Version: `node --version`
- Löschen Sie `node_modules` und führen Sie `npm install` erneut aus

## 📞 Support

Bei weiteren Fragen schauen Sie in die ausführliche `README.md` oder öffnen Sie ein Issue.

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { DatabaseManager } = require('./database/db-manager');

class SchreckmonitorApp {
    constructor() {
        this.mainWindow = null;
        this.dbManager = new DatabaseManager();
    }

    createMainWindow() {
        this.mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            minWidth: 800,
            minHeight: 600,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js')
            },
            icon: path.join(__dirname, 'assets', 'icon.png'),
            title: 'Schreckmonitor Gallery',
            show: false
        });

        // Lade die HTML-Datei
        this.mainWindow.loadFile('renderer/index.html');

        // Zeige das Fenster erst, wenn es bereit ist
        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow.show();
        });

        // Entwicklungsmodus: Öffne DevTools
        if (process.argv.includes('--dev')) {
            this.mainWindow.webContents.openDevTools();
        }

        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
    }

    setupIpcHandlers() {
        // Hole alle Erkennungsbilder aus der Datenbank
        ipcMain.handle('get-detections', async () => {
            try {
                return await this.dbManager.getDetections();
            } catch (error) {
                console.error('Fehler beim Abrufen der Erkennungen:', error);
                throw error;
            }
        });

        // Hole Erkennungen nach Kamera gefiltert
        ipcMain.handle('get-detections-by-camera', async (event, cameraName) => {
            try {
                return await this.dbManager.getDetectionsByCamera(cameraName);
            } catch (error) {
                console.error('Fehler beim Abrufen der Erkennungen nach Kamera:', error);
                throw error;
            }
        });

        // Hole alle verfügbaren Kameras
        ipcMain.handle('get-cameras', async () => {
            try {
                return await this.dbManager.getCameras();
            } catch (error) {
                console.error('Fehler beim Abrufen der Kameras:', error);
                throw error;
            }
        });

        // Lösche eine Erkennung
        ipcMain.handle('delete-detection', async (event, id) => {
            try {
                return await this.dbManager.deleteDetection(id);
            } catch (error) {
                console.error('Fehler beim Löschen der Erkennung:', error);
                throw error;
            }
        });

        // Teste Datenbankverbindung
        ipcMain.handle('test-db-connection', async () => {
            try {
                return await this.dbManager.testConnection();
            } catch (error) {
                console.error('Datenbankverbindung fehlgeschlagen:', error);
                throw error;
            }
        });

        // Hole Vollbild einer Erkennung
        ipcMain.handle('get-full-image', async (event, id) => {
            try {
                return await this.dbManager.getFullImageById(id);
            } catch (error) {
                console.error('Fehler beim Abrufen des Vollbildes:', error);
                throw error;
            }
        });
    }

    async initialize() {
        // Warte bis die App bereit ist
        await app.whenReady();

        // Initialisiere Datenbankverbindung
        await this.dbManager.initialize();

        // Erstelle Hauptfenster
        this.createMainWindow();

        // Setup IPC-Handler
        this.setupIpcHandlers();

        // App-Event-Handler
        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                this.createMainWindow();
            }
        });
    }

    async cleanup() {
        if (this.dbManager) {
            await this.dbManager.close();
        }
    }
}

// Erstelle und starte die App
const schreckmonitorApp = new SchreckmonitorApp();

// Initialisiere die App
schreckmonitorApp.initialize().catch(console.error);

// Cleanup beim Beenden
app.on('before-quit', async () => {
    await schreckmonitorApp.cleanup();
});

// Verhindere mehrere Instanzen
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        // Jemand hat versucht, eine zweite Instanz zu starten
        if (schreckmonitorApp.mainWindow) {
            if (schreckmonitorApp.mainWindow.isMinimized()) {
                schreckmonitorApp.mainWindow.restore();
            }
            schreckmonitorApp.mainWindow.focus();
        }
    });
}

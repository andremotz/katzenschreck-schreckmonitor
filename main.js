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

        // Load the HTML file
        this.mainWindow.loadFile('renderer/index.html');

        // Show window only when ready
        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow.show();
        });

        // Development mode: Open DevTools
        if (process.argv.includes('--dev')) {
            this.mainWindow.webContents.openDevTools();
        }

        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
    }

    setupIpcHandlers() {
        // Get all detection images from database (thumbnails)
        ipcMain.handle('get-detections', async () => {
            try {
                return await this.dbManager.getDetections();
            } catch (error) {
                console.error('Error retrieving detections:', error);
                throw error;
            }
        });

        // Get detections filtered by camera
        ipcMain.handle('get-detections-by-camera', async (event, cameraName) => {
            try {
                return await this.dbManager.getDetectionsByCamera(cameraName);
            } catch (error) {
                console.error('Error retrieving detections by camera:', error);
                throw error;
            }
        });

        // Get all available cameras
        ipcMain.handle('get-cameras', async () => {
            try {
                return await this.dbManager.getCameras();
            } catch (error) {
                console.error('Error retrieving cameras:', error);
                throw error;
            }
        });

        // Delete a detection
        ipcMain.handle('delete-detection', async (event, id) => {
            try {
                return await this.dbManager.deleteDetection(id);
            } catch (error) {
                console.error('Error deleting detection:', error);
                throw error;
            }
        });

        // Test database connection
        ipcMain.handle('test-db-connection', async () => {
            try {
                return await this.dbManager.testConnection();
            } catch (error) {
                console.error('Database connection failed:', error);
                throw error;
            }
        });

        // Get full-size image of a detection
        ipcMain.handle('get-full-image', async (event, id) => {
            try {
                return await this.dbManager.getFullImageById(id);
            } catch (error) {
                console.error('Error retrieving full-size image:', error);
                throw error;
            }
        });
    }

    async initialize() {
        // Wait until app is ready
        await app.whenReady();

        // Initialize database connection
        await this.dbManager.initialize();

        // Create main window
        this.createMainWindow();

        // Setup IPC handlers
        this.setupIpcHandlers();

        // App event handlers
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

// Create and start the app
const schreckmonitorApp = new SchreckmonitorApp();

// Initialize the app
schreckmonitorApp.initialize().catch(console.error);

// Cleanup on exit
app.on('before-quit', async () => {
    await schreckmonitorApp.cleanup();
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        // Someone tried to run a second instance
        if (schreckmonitorApp.mainWindow) {
            if (schreckmonitorApp.mainWindow.isMinimized()) {
                schreckmonitorApp.mainWindow.restore();
            }
            schreckmonitorApp.mainWindow.focus();
        }
    });
}

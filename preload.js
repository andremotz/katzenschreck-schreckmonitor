const { contextBridge, ipcRenderer } = require('electron');

// Sichere API für den Renderer-Prozess
contextBridge.exposeInMainWorld('electronAPI', {
    // Erkennungen abrufen
    getDetections: () => ipcRenderer.invoke('get-detections'),
    
    // Erkennungen nach Kamera filtern
    getDetectionsByCamera: (cameraName) => ipcRenderer.invoke('get-detections-by-camera', cameraName),
    
    // Verfügbare Kameras abrufen
    getCameras: () => ipcRenderer.invoke('get-cameras'),
    
    // Erkennung löschen
    deleteDetection: (id) => ipcRenderer.invoke('delete-detection', id),
    
    // Datenbankverbindung testen
    testDbConnection: () => ipcRenderer.invoke('test-db-connection'),
    
    // Vollbild einer Erkennung abrufen
    getFullImage: (id) => ipcRenderer.invoke('get-full-image', id)
});

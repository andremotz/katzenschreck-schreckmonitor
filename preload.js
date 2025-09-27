const { contextBridge, ipcRenderer } = require('electron');

// Secure API for the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Get detections (thumbnails)
    getDetections: () => ipcRenderer.invoke('get-detections'),
    
    // Filter detections by camera
    getDetectionsByCamera: (cameraName) => ipcRenderer.invoke('get-detections-by-camera', cameraName),
    
    // Get available cameras
    getCameras: () => ipcRenderer.invoke('get-cameras'),
    
    // Delete detection
    deleteDetection: (id) => ipcRenderer.invoke('delete-detection', id),
    
    // Test database connection
    testDbConnection: () => ipcRenderer.invoke('test-db-connection'),
    
    // Get full-size image of a detection
    getFullImage: (id) => ipcRenderer.invoke('get-full-image', id)
});

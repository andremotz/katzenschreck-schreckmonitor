// Bildergalerie App
class SchreckmonitorGallery {
    constructor() {
        this.currentDetections = [];
        this.currentFilter = 'all';
        this.currentSort = 'newest';
        this.currentView = 'grid';
        this.cameras = [];
        
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            await this.checkConnection();
            await this.loadData();
        } catch (error) {
            console.error('Fehler beim Initialisieren der App:', error);
            this.showError('Fehler beim Initialisieren der Anwendung');
        }
    }

    setupEventListeners() {
        // Verbindungstest
        document.getElementById('testConnectionBtn').addEventListener('click', () => {
            this.checkConnection();
        });

        // Aktualisieren
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadData();
        });

        // Sortierung
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderGallery();
        });

        // Ansicht wechseln
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.closest('.view-btn').dataset.view;
                this.switchView(view);
            });
        });

        // Modal schließen
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('closeModalSecondary').addEventListener('click', () => {
            this.closeModal();
        });

        // Modal Overlay klicken
        document.getElementById('imageModal').addEventListener('click', (e) => {
            if (e.target.id === 'imageModal') {
                this.closeModal();
            }
        });

        // Löschen-Button
        document.getElementById('deleteBtn').addEventListener('click', () => {
            this.deleteCurrentDetection();
        });

        // Retry-Button
        document.getElementById('retryBtn').addEventListener('click', () => {
            this.loadData();
        });

        // Escape-Taste für Modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    async checkConnection() {
        try {
            this.updateConnectionStatus('checking', 'Verbindung wird geprüft...');
            const result = await window.electronAPI.testDbConnection();
            
            if (result.success) {
                this.updateConnectionStatus('connected', 'Verbunden');
                this.showToast('Datenbankverbindung erfolgreich', 'success');
            } else {
                this.updateConnectionStatus('disconnected', 'Verbindung fehlgeschlagen');
                this.showToast('Datenbankverbindung fehlgeschlagen: ' + result.message, 'error');
            }
        } catch (error) {
            this.updateConnectionStatus('disconnected', 'Verbindung fehlgeschlagen');
            this.showToast('Verbindungsfehler: ' + error.message, 'error');
        }
    }

    updateConnectionStatus(status, message) {
        const statusElement = document.getElementById('connectionStatus');
        statusElement.className = `connection-status ${status}`;
        statusElement.querySelector('span').textContent = message;
    }

    async loadData() {
        try {
            this.showLoading(true);
            this.hideError();

            // Lade alle Erkennungen
            this.currentDetections = await window.electronAPI.getDetections();
            
            // Lade Kameras
            this.cameras = await window.electronAPI.getCameras();
            
            // Rendere UI
            this.renderCameraList();
            this.renderGallery();
            this.updateStats();
            
            if (this.currentDetections.length === 0) {
                this.showEmptyState();
            } else {
                this.hideEmptyState();
            }

        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
            this.showError('Fehler beim Laden der Daten: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    renderCameraList() {
        const cameraList = document.getElementById('cameraList');
        const totalDetections = this.currentDetections.length;
        
        // Alle Kameras Element aktualisieren
        const allCamerasElement = cameraList.querySelector('[data-camera="all"]');
        allCamerasElement.querySelector('.count').textContent = totalDetections;

        // Entferne alte Kamera-Items (außer "Alle Kameras")
        const existingItems = cameraList.querySelectorAll('.camera-item:not([data-camera="all"])');
        existingItems.forEach(item => item.remove());

        // Füge Kamera-Items hinzu
        this.cameras.forEach(camera => {
            const cameraItem = document.createElement('div');
            cameraItem.className = 'camera-item';
            cameraItem.dataset.camera = camera.camera_name;
            cameraItem.innerHTML = `
                <i class="fas fa-video"></i>
                <span>${camera.camera_name}</span>
                <span class="count">${camera.detection_count}</span>
            `;
            
            cameraItem.addEventListener('click', () => {
                this.filterByCamera(camera.camera_name);
            });
            
            cameraList.appendChild(cameraItem);
        });
    }

    async filterByCamera(cameraName) {
        try {
            this.showLoading(true);
            this.currentFilter = cameraName;
            
            // Aktualisiere aktive Kamera in der Sidebar
            document.querySelectorAll('.camera-item').forEach(item => {
                item.classList.remove('active');
            });
            
            if (cameraName === 'all') {
                document.querySelector('[data-camera="all"]').classList.add('active');
                this.currentDetections = await window.electronAPI.getDetections();
                document.getElementById('galleryTitle').textContent = 'Neueste 10 Erkennungen';
            } else {
                document.querySelector(`[data-camera="${cameraName}"]`).classList.add('active');
                this.currentDetections = await window.electronAPI.getDetectionsByCamera(cameraName);
                document.getElementById('galleryTitle').textContent = `Neueste 10 Erkennungen: ${cameraName}`;
            }
            
            this.renderGallery();
            
            if (this.currentDetections.length === 0) {
                this.showEmptyState();
            } else {
                this.hideEmptyState();
            }
            
        } catch (error) {
            console.error('Fehler beim Filtern nach Kamera:', error);
            this.showToast('Fehler beim Filtern: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    renderGallery() {
        const galleryGrid = document.getElementById('galleryGrid');
        const sortedDetections = this.sortDetections(this.currentDetections);
        
        galleryGrid.innerHTML = '';
        galleryGrid.className = `gallery-grid ${this.currentView === 'list' ? 'list-view' : ''}`;
        
        sortedDetections.forEach(detection => {
            const imageCard = this.createImageCard(detection);
            galleryGrid.appendChild(imageCard);
        });
    }

    sortDetections(detections) {
        const sorted = [...detections];
        
        switch (this.currentSort) {
            case 'newest':
                return sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            case 'accuracy':
                return sorted.sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0));
            case 'camera':
                return sorted.sort((a, b) => a.camera_name.localeCompare(b.camera_name));
            default:
                return sorted;
        }
    }

    createImageCard(detection) {
        const card = document.createElement('div');
        card.className = 'image-card';
        card.dataset.detectionId = detection.id;
        
        const accuracyClass = this.getAccuracyClass(detection.accuracy);
        // Verwende thumbnail_jpeg_base64 für die Kartenansicht
        const thumbnailUrl = detection.thumbnail_jpeg_base64 
            ? `data:image/jpeg;base64,${detection.thumbnail_jpeg_base64}`
            : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMzUgNzVIMTY1VjEyNUgxMzVWNzVaIiBmaWxsPSIjRDFENURCIi8+CjxjaXJjbGUgY3g9IjEyNSIgY3k9Ijg1IiByPSI1IiBmaWxsPSIjRDFENURCIi8+Cjwvc3ZnPgo=';
        
        card.innerHTML = `
            <div class="image-container">
                <img src="${thumbnailUrl}" alt="Erkennung ${detection.id}" loading="lazy">
                <div class="image-overlay">
                    <span class="accuracy-badge ${accuracyClass}">
                        ${detection.accuracy ? Math.round(detection.accuracy * 100) + '%' : 'N/A'}
                    </span>
                    <div class="thumbnail-indicator">
                        <i class="fas fa-expand" title="Vollbild anzeigen"></i>
                    </div>
                </div>
            </div>
            <div class="image-info">
                <div class="image-title">Erkennung #${detection.id}</div>
                <div class="image-meta">
                    <span><i class="fas fa-calendar"></i> ${this.formatDate(detection.timestamp)}</span>
                    <span><i class="fas fa-video"></i> ${detection.camera_name}</span>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            this.openModal(detection);
        });
        
        return card;
    }

    getAccuracyClass(accuracy) {
        if (!accuracy) return 'accuracy-low';
        if (accuracy >= 0.8) return 'accuracy-high';
        if (accuracy >= 0.6) return 'accuracy-medium';
        return 'accuracy-low';
    }

    formatDate(timestamp) {
        if (!timestamp) return 'Unbekannt';
        try {
            // Wenn es bereits ein formatierter String ist
            if (typeof timestamp === 'string' && timestamp.includes('.')) {
                return timestamp;
            }
            
            const date = new Date(timestamp);
            return date.toLocaleString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Ungültiges Datum';
        }
    }

    switchView(view) {
        this.currentView = view;
        
        // Update UI
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        this.renderGallery();
    }

    async openModal(detection) {
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('modalTitle');
        const modalTimestamp = document.getElementById('modalTimestamp');
        const modalCamera = document.getElementById('modalCamera');
        const modalAccuracy = document.getElementById('modalAccuracy');
        const modalId = document.getElementById('modalId');
        
        // Set modal data
        modal.dataset.detectionId = detection.id;
        modalTitle.textContent = `Erkennung #${detection.id}`;
        modalTimestamp.textContent = this.formatDate(detection.timestamp);
        modalCamera.textContent = detection.camera_name;
        modalAccuracy.textContent = detection.accuracy 
            ? Math.round(detection.accuracy * 100) + '%' 
            : 'Nicht verfügbar';
        modalId.textContent = detection.id;
        
        // Zeige zunächst das Thumbnail während das Vollbild lädt
        if (detection.thumbnail_jpeg_base64) {
            modalImage.src = `data:image/jpeg;base64,${detection.thumbnail_jpeg_base64}`;
        } else {
            modalImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1SDIyNVYxNzVIMTc1VjEyNVoiIGZpbGw9IiNEMUQ1REIiLz4KPGNpcmNsZSBjeD0iMTYwIiBjeT0iMTQwIiByPSI4IiBmaWxsPSIjRDFENURCIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjQ3NDhCIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPktlaW4gQmlsZCB2ZXJmw7xnYmFyPC90ZXh0Pgo8L3N2Zz4K';
        }
        
        // Zeige Modal
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Lade das Vollbild asynchron
        try {
            this.showImageLoading(true);
            const fullImageData = await window.electronAPI.getFullImage(detection.id);
            
            if (fullImageData && fullImageData.blob_jpeg_base64) {
                modalImage.src = `data:image/jpeg;base64,${fullImageData.blob_jpeg_base64}`;
                this.showToast('Vollbild geladen', 'success');
            } else {
                this.showToast('Vollbild konnte nicht geladen werden', 'warning');
            }
        } catch (error) {
            console.error('Fehler beim Laden des Vollbildes:', error);
            this.showToast('Fehler beim Laden des Vollbildes: ' + error.message, 'error');
        } finally {
            this.showImageLoading(false);
        }
    }

    closeModal() {
        const modal = document.getElementById('imageModal');
        modal.classList.remove('show');
        document.body.style.overflow = '';
        
        // Clear modal data
        delete modal.dataset.detectionId;
    }

    async deleteCurrentDetection() {
        const modal = document.getElementById('imageModal');
        const detectionId = modal.dataset.detectionId;
        
        if (!detectionId) return;
        
        if (!confirm('Sind Sie sicher, dass Sie diese Erkennung löschen möchten?')) {
            return;
        }
        
        try {
            const result = await window.electronAPI.deleteDetection(parseInt(detectionId));
            
            if (result.success) {
                this.showToast('Erkennung erfolgreich gelöscht', 'success');
                this.closeModal();
                
                // Remove from current detections
                this.currentDetections = this.currentDetections.filter(
                    detection => detection.id !== parseInt(detectionId)
                );
                
                // Re-render gallery and update stats
                this.renderGallery();
                this.updateStats();
                
                // Reload cameras to update counts
                this.cameras = await window.electronAPI.getCameras();
                this.renderCameraList();
                
                if (this.currentDetections.length === 0) {
                    this.showEmptyState();
                }
            } else {
                this.showToast('Fehler beim Löschen: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Fehler beim Löschen der Erkennung:', error);
            this.showToast('Fehler beim Löschen: ' + error.message, 'error');
        }
    }

    updateStats() {
        const totalImages = document.getElementById('totalImages');
        const totalCameras = document.getElementById('totalCameras');
        
        if (totalImages && totalCameras) {
            totalImages.textContent = this.currentDetections.length;
            totalCameras.textContent = this.cameras.length;
        }
    }

    showLoading(show) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    showImageLoading(show) {
        const modal = document.getElementById('imageModal');
        let imageLoadingElement = modal.querySelector('.image-loading-overlay');
        
        if (show) {
            if (!imageLoadingElement) {
                imageLoadingElement = document.createElement('div');
                imageLoadingElement.className = 'image-loading-overlay';
                imageLoadingElement.innerHTML = `
                    <div class="image-loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Vollbild wird geladen...</p>
                    </div>
                `;
                const modalImageContainer = modal.querySelector('.modal-image-container');
                modalImageContainer.appendChild(imageLoadingElement);
            }
            imageLoadingElement.style.display = 'flex';
        } else {
            if (imageLoadingElement) {
                imageLoadingElement.style.display = 'none';
            }
        }
    }

    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        const galleryContainer = document.getElementById('galleryContainer');
        const emptyState = document.getElementById('emptyState');
        
        errorText.textContent = message;
        errorMessage.style.display = 'block';
        galleryContainer.style.display = 'none';
        emptyState.style.display = 'none';
    }

    hideError() {
        const errorMessage = document.getElementById('errorMessage');
        const galleryContainer = document.getElementById('galleryContainer');
        
        errorMessage.style.display = 'none';
        galleryContainer.style.display = 'block';
    }

    showEmptyState() {
        const emptyState = document.getElementById('emptyState');
        const galleryContainer = document.getElementById('galleryContainer');
        
        emptyState.style.display = 'flex';
        galleryContainer.style.display = 'none';
    }

    hideEmptyState() {
        const emptyState = document.getElementById('emptyState');
        const galleryContainer = document.getElementById('galleryContainer');
        
        emptyState.style.display = 'none';
        galleryContainer.style.display = 'block';
    }

    showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle'
        };
        
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="${icons[type]}"></i>
                <div class="toast-message">${message}</div>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toastContainer.removeChild(toast);
            }
        }, 5000);
        
        // Click to remove
        toast.addEventListener('click', () => {
            if (toast.parentNode) {
                toastContainer.removeChild(toast);
            }
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gallery = new SchreckmonitorGallery();
});

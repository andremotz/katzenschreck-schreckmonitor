const mariadb = require('mariadb');
const path = require('path');

class DatabaseManager {
    constructor() {
        this.pool = null;
        
        // Versuche config.js zu laden, sonst Fallback-Werte
        let config = {};
        try {
            config = require(path.join(__dirname, '..', 'config.js')).database;
        } catch (error) {
            console.log('config.js nicht gefunden, verwende Umgebungsvariablen/Fallback-Werte');
        }
        
        this.config = {
            host: process.env.DB_HOST || config.host || 'localhost',
            port: process.env.DB_PORT || config.port || 3306,
            user: process.env.DB_USER || config.user || 'root',
            password: process.env.DB_PASSWORD || config.password || '',
            database: process.env.DB_NAME || config.database || 'katzenschreck',
            connectionLimit: 5,
            acquireTimeout: 30000,
            timeout: 30000
        };
        
        console.log(`Verbinde zu MariaDB Server: ${this.config.host}:${this.config.port}`);
    }

    async initialize() {
        try {
            this.pool = mariadb.createPool(this.config);
            console.log('MariaDB-Verbindungspool erstellt');
            
            // Teste die Verbindung
            await this.testConnection();
            console.log('Datenbankverbindung erfolgreich getestet');
        } catch (error) {
            console.error('Fehler beim Initialisieren der Datenbankverbindung:', error);
            throw error;
        }
    }

    async testConnection() {
        let conn;
        try {
            conn = await this.pool.getConnection();
            const result = await conn.query('SELECT 1 as test');
            return { success: true, message: 'Datenbankverbindung erfolgreich' };
        } catch (error) {
            console.error('Datenbankverbindungstest fehlgeschlagen:', error);
            return { success: false, message: error.message };
        } finally {
            if (conn) conn.release();
        }
    }

    async getDetections() {
        let conn;
        try {
            conn = await this.pool.getConnection();
            const query = `
                SELECT 
                    id,
                    timestamp,
                    camera_name,
                    accuracy,
                    thumbnail_jpeg
                FROM detections_images 
                ORDER BY timestamp DESC
                LIMIT 10
            `;
            const rows = await conn.query(query);
            
            // Konvertiere Thumbnail BLOB zu Base64 für die Anzeige
            return rows.map(row => ({
                ...row,
                thumbnail_jpeg_base64: row.thumbnail_jpeg ? row.thumbnail_jpeg.toString('base64') : null,
                timestamp: new Date(row.timestamp).toLocaleString('de-DE')
            }));
        } catch (error) {
            console.error('Fehler beim Abrufen der Erkennungen:', error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    async getDetectionsByCamera(cameraName) {
        let conn;
        try {
            conn = await this.pool.getConnection();
            const query = `
                SELECT 
                    id,
                    timestamp,
                    camera_name,
                    accuracy,
                    thumbnail_jpeg
                FROM detections_images 
                WHERE camera_name = ?
                ORDER BY timestamp DESC
                LIMIT 10
            `;
            const rows = await conn.query(query, [cameraName]);
            
            // Konvertiere Thumbnail BLOB zu Base64 für die Anzeige
            return rows.map(row => ({
                ...row,
                thumbnail_jpeg_base64: row.thumbnail_jpeg ? row.thumbnail_jpeg.toString('base64') : null,
                timestamp: new Date(row.timestamp).toLocaleString('de-DE')
            }));
        } catch (error) {
            console.error('Fehler beim Abrufen der Erkennungen nach Kamera:', error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    async getCameras() {
        let conn;
        try {
            conn = await this.pool.getConnection();
            const query = `
                SELECT DISTINCT camera_name, COUNT(*) as detection_count
                FROM detections_images 
                GROUP BY camera_name
                ORDER BY camera_name
            `;
            const rows = await conn.query(query);
            return rows;
        } catch (error) {
            console.error('Fehler beim Abrufen der Kameras:', error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    async deleteDetection(id) {
        let conn;
        try {
            conn = await this.pool.getConnection();
            const query = 'DELETE FROM detections_images WHERE id = ?';
            const result = await conn.query(query, [id]);
            
            return {
                success: result.affectedRows > 0,
                message: result.affectedRows > 0 ? 'Erkennung erfolgreich gelöscht' : 'Erkennung nicht gefunden'
            };
        } catch (error) {
            console.error('Fehler beim Löschen der Erkennung:', error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    async getDetectionById(id) {
        let conn;
        try {
            conn = await this.pool.getConnection();
            const query = `
                SELECT 
                    id,
                    timestamp,
                    camera_name,
                    accuracy,
                    thumbnail_jpeg,
                    blob_jpeg
                FROM detections_images 
                WHERE id = ?
            `;
            const rows = await conn.query(query, [id]);
            
            if (rows.length === 0) {
                return null;
            }

            const row = rows[0];
            return {
                ...row,
                thumbnail_jpeg_base64: row.thumbnail_jpeg ? row.thumbnail_jpeg.toString('base64') : null,
                blob_jpeg_base64: row.blob_jpeg ? row.blob_jpeg.toString('base64') : null,
                timestamp: new Date(row.timestamp).toLocaleString('de-DE')
            };
        } catch (error) {
            console.error('Fehler beim Abrufen der Erkennung:', error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    async getFullImageById(id) {
        let conn;
        try {
            conn = await this.pool.getConnection();
            const query = `
                SELECT 
                    id,
                    timestamp,
                    camera_name,
                    accuracy,
                    blob_jpeg
                FROM detections_images 
                WHERE id = ?
            `;
            const rows = await conn.query(query, [id]);
            
            if (rows.length === 0) {
                return null;
            }

            const row = rows[0];
            return {
                ...row,
                blob_jpeg_base64: row.blob_jpeg ? row.blob_jpeg.toString('base64') : null,
                timestamp: new Date(row.timestamp).toLocaleString('de-DE')
            };
        } catch (error) {
            console.error('Fehler beim Abrufen des Vollbildes:', error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    async getDetectionStats() {
        let conn;
        try {
            conn = await this.pool.getConnection();
            const queries = [
                'SELECT COUNT(*) as total_detections FROM detections_images',
                'SELECT COUNT(DISTINCT camera_name) as total_cameras FROM detections_images',
                'SELECT MAX(timestamp) as latest_detection FROM detections_images',
                'SELECT MIN(timestamp) as earliest_detection FROM detections_images'
            ];

            const results = await Promise.all(
                queries.map(query => conn.query(query))
            );

            return {
                totalDetections: results[0][0].total_detections,
                totalCameras: results[1][0].total_cameras,
                latestDetection: results[2][0].latest_detection,
                earliestDetection: results[3][0].earliest_detection
            };
        } catch (error) {
            console.error('Fehler beim Abrufen der Statistiken:', error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    async close() {
        try {
            if (this.pool) {
                await this.pool.end();
                console.log('Datenbankverbindung geschlossen');
            }
        } catch (error) {
            console.error('Fehler beim Schließen der Datenbankverbindung:', error);
        }
    }
}

module.exports = { DatabaseManager };

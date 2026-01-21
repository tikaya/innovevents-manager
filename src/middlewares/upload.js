/**
 * Middleware Upload - Multer + Cloudinary
 * @module middlewares/upload
 */

const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// Stockage en mémoire (pas sur disque car Render efface les fichiers)
const storage = multer.memoryStorage();

// Filtre : uniquement les images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non autorisé. Utilisez JPG, PNG, GIF ou WebP.'), false);
    }
};

// Middleware Multer
const uploadEvenement = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB max
    }
});

/**
 * Upload un buffer vers Cloudinary
 * @param {Buffer} buffer - Le fichier en mémoire
 * @param {string} folder - Le dossier dans Cloudinary
 * @returns {Promise<Object>} - Résultat Cloudinary avec secure_url
 */
const uploadToCloudinary = (buffer, folder = 'evenements') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { 
                folder: `innovevents/${folder}`,
                resource_type: 'image'
            },
            (error, result) => {
                if (error) {
                    console.error('Erreur Cloudinary upload:', error);
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        Readable.from(buffer).pipe(stream);
    });
};

/**
 * Supprime une image de Cloudinary
 * @param {string} imageUrl - URL complète de l'image Cloudinary
 */
const deleteFromCloudinary = async (imageUrl) => {
    if (!imageUrl || !imageUrl.includes('cloudinary')) return;
    
    try {
        // Extraire le public_id de l'URL Cloudinary
        // URL format: https://res.cloudinary.com/xxx/image/upload/v123/innovevents/evenements/abc123.jpg
        const urlParts = imageUrl.split('/');
        const uploadIndex = urlParts.indexOf('upload');
        
        if (uploadIndex !== -1) {
            // Récupérer tout après 'upload/vXXX/'
            const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
            // Enlever l'extension
            const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
            
            console.log('Suppression Cloudinary public_id:', publicId);
            await cloudinary.uploader.destroy(publicId);
        }
    } catch (err) {
        console.error('Erreur suppression Cloudinary:', err);
    }
};

module.exports = { 
    uploadEvenement, 
    uploadToCloudinary, 
    deleteFromCloudinary 
};
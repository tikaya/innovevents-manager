/**
 * Middleware de gestion des erreurs
 * @module middlewares/errorHandler
 */

/**
 * Classe pour les erreurs API personnalisées
 */
class ApiError extends Error {
    constructor(statusCode, message, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true;
    }
}

/**
 * Middleware 404 - Route non trouvée
 */
const notFound = (req, res, next) => {
    const error = new ApiError(404, `Route non trouvée: ${req.originalUrl}`);
    next(error);
};

/**
 * Middleware principal de gestion des erreurs
 */
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Erreur serveur interne';

    // Log en développement
    if (process.env.NODE_ENV === 'development') {
        console.error('❌ Erreur:', {
            message: err.message,
            stack: err.stack,
            statusCode
        });
    }

    // Erreurs PostgreSQL
    if (err.code) {
        switch (err.code) {
            case '23505': // Violation contrainte unique
                statusCode = 409;
                message = 'Cette donnée existe déjà';
                break;
            case '23503': // Violation clé étrangère
                statusCode = 400;
                message = 'Référence invalide (donnée liée inexistante)';
                break;
            case '23502': // Violation NOT NULL
                statusCode = 400;
                message = 'Données obligatoires manquantes';
                break;
            case '22P02': // Erreur syntaxe
                statusCode = 400;
                message = 'Format de données invalide';
                break;
            case 'ECONNREFUSED':
                statusCode = 503;
                message = 'Service de base de données indisponible';
                break;
        }
    }

    // Réponse
    const response = {
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            code: err.code
        }),
        ...(err.details && { details: err.details })
    };

    res.status(statusCode).json(response);
};

/**
 * Wrapper async pour les contrôleurs
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    ApiError,
    notFound,
    errorHandler,
    asyncHandler
};

/**
 * Export de tous les middlewares
 * @module middlewares
 */

const { authenticate, authorize, optionalAuth } = require('./auth');
const { ApiError, notFound, errorHandler, asyncHandler } = require('./errorHandler');
const validation = require('./validation');

module.exports = {
    // Auth
    authenticate,
    authorize,
    optionalAuth,
    
    // Erreurs
    ApiError,
    notFound,
    errorHandler,
    asyncHandler,
    
    // Validation
    ...validation
};

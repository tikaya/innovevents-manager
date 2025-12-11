/**
 * Middleware d'authentification JWT
 * @module middlewares/auth
 */

const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');

/**
 * Vérifie le token JWT
 */
const authenticate = async (req, res, next) => {
    try {
        // Récupère le token du header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token d\'authentification requis'
            });
        }

        const token = authHeader.split(' ')[1];

        // Vérifie le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Vérifie que l'utilisateur existe toujours
        const user = await Utilisateur.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // Vérifie que le compte est actif
        if (user.statut_utilisateur !== 'actif') {
            return res.status(403).json({
                success: false,
                message: 'Compte suspendu ou inactif'
            });
        }

        // Ajoute l'utilisateur à la requête
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token invalide'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expiré'
            });
        }
        next(error);
    }
};

/**
 * Vérifie les rôles autorisés
 * @param  {...string} roles - Rôles autorisés ('admin', 'employe', 'client')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Non authentifié'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé pour ce rôle'
            });
        }

        next();
    };
};

/**
 * Middleware optionnel - ajoute l'utilisateur si connecté
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await Utilisateur.findById(decoded.id);
            
            if (user && user.statut_utilisateur === 'actif') {
                req.user = user;
            }
        }
        next();
    } catch (error) {
        // En cas d'erreur, on continue sans utilisateur
        next();
    }
};

module.exports = {
    authenticate,
    authorize,
    optionalAuth
};

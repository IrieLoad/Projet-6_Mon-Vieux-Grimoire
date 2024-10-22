// Importation du package jsonwebtoken (JWT) (permet de créer et de vérifier des tokens d'authentification)
const jwt = require('jsonwebtoken');

// Middleware d'authentification qui sera appliqué à certaines routes pour vérifier si l'utilisateur est bien authentifié
module.exports = (req, res, next) => {
    try {
        // Récupération du token d'authentification dans les en-têtes de la requête HTTP
        // Le token est envoyé dans l'en-tête Authorization sous la forme "Bearer <token>"
        const token = req.headers.authorization.split(' ')[1]; // On récupère seulement le token
        
        // Vérification du token avec la clé secrète stockée dans les variables d'environnement (process.env.JWT_SECRET)
        // Cela permet de décoder le token pour récupérer les informations qu'il contient (comme l'userId)
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        
        // Extraction de l'userId du token décodé
        const userId = decodedToken.userId;
        
        // Ajout de l'ID de l'utilisateur authentifié à l'objet req (requête)
        // Cela permet de savoir quel utilisateur a fait la requête dans les prochaines étapes du traitement
        req.auth = { userId: userId };
        
        // Affichage de l'userId authentifié dans la console pour faciliter le débogage
        console.log("Authenticated userId: ", userId);
        
        // Passage au middleware ou à la fonction suivante, car l'utilisateur est bien authentifié
        next();
    } catch (error) {
        // Si une erreur est levée (par exemple, si le token est invalide ou manquant), on renvoie une réponse 401 (Non autorisé)
        // Le message d'erreur est renvoyé sous forme de JSON
        res.status(401).json({ error });
    }
};

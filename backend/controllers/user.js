// Importation de bcrypt pour hasher les mots de passe
const bcrypt = require('bcrypt');

// Importation de jsonwebtoken (JWT) pour créer et vérifier des tokens d'authentification
const jwt = require('jsonwebtoken');

// Importation du modèle User pour interagir avec la collection "users" dans la base de données
const User = require('../models/User');

// Fonction pour l'inscription d'un utilisateur
exports.signup = (req, res, next) => {
    // Hashage du mot de passe avec bcrypt (10 est le nombre de "tours" de sécurité pour le hashage)
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        // Création d'un nouvel utilisateur avec l'adresse e-mail fournie et le mot de passe hashé
        const user = new User({
            email: req.body.email, // Adresse e-mail récupérée du corps de la requête
            password: hash // Mot de passe hashé
        });
        
        // Sauvegarde du nouvel utilisateur dans la base de données
        user.save()
            .then(() => res.status(201).json({ message: 'Utilisateur créé !' })) // Si tout se passe bien, réponse de succès
            .catch(error => res.status(400).json({ error })); // Gestion des erreurs lors de la sauvegarde
    })
    .catch(error => res.status(500).json({ error })); // Gestion des erreurs lors du hashage
};

// Fonction pour la connexion d'un utilisateur
exports.login = (req, res, next) => {
    // Vérification que l'email et le mot de passe sont fournis dans la requête
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ error: 'Email et mot de passe sont requis.' });
    }

    // Recherche de l'utilisateur par son adresse e-mail dans la base de données
    User.findOne({ email: req.body.email })
        .then(user => {
            // Si l'utilisateur n'existe pas, renvoyer une réponse 401 (non autorisé)
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            // Comparaison du mot de passe envoyé avec le mot de passe hashé stocké dans la base de données
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    // Si le mot de passe est incorrect, renvoyer une réponse 401 (non autorisé)
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    // Si le mot de passe est correct, création d'un token JWT qui contient l'ID de l'utilisateur
                    res.status(200).json({
                        userId: user._id, // ID de l'utilisateur renvoyé dans la réponse
                        token: jwt.sign(
                            { userId: user._id }, // Le token contient l'ID de l'utilisateur
                            process.env.JWT_SECRET, // Clé secrète pour signer le token, stockée dans les variables d'environnement
                            { expiresIn: '24h' } // Le token expire après 24 heures
                        )
                    });
                })
                .catch(error => res.status(500).json({ error })); // Gestion des erreurs lors de la comparaison des mots de passe
        })
        .catch(error => res.status(500).json({ error })); // Gestion des erreurs lors de la recherche de l'utilisateur
};
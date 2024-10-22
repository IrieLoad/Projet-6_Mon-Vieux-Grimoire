// Importation d'Express pour créer un routeur
const express = require('express');

// Création d'un routeur avec Express. Le routeur permet de définir des routes pour les requêtes HTTP.
const router = express.Router();

// Importation du contrôleur utilisateur (userCtrl), qui contient la logique métier pour les routes d'authentification
const userCtrl = require('../controllers/user');

// Route pour l'inscription d'un utilisateur
// Quand une requête POST est envoyée à /signup, la fonction signup du contrôleur est appelée
router.post('/signup', userCtrl.signup);

// Route pour la connexion d'un utilisateur
// Quand une requête POST est envoyée à /login, la fonction login du contrôleur est appelée
router.post('/login', userCtrl.login);

// Exportation du routeur pour pouvoir l'utiliser dans d'autres fichiers, comme dans app.js
module.exports = router;

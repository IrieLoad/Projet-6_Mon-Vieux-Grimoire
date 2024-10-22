// Importation d'Express pour créer un routeur
const express = require('express');

// Importation du middleware d'authentification (auth) qui protège certaines routes en vérifiant que l'utilisateur est authentifié
const auth = require('../middleware/auth');

// Création d'un routeur avec Express. Le routeur permet de définir des routes pour les requêtes HTTP liées aux livres
const router = express.Router();

// Importation du middleware multer pour la gestion des fichiers (comme les images associées aux livres)
const multer = require('../middleware/multer-config');

// Importation du contrôleur des livres (bookCtrl), qui contient la logique métier pour les opérations sur les livres
const bookCtrl = require('../controllers/book');

// Route pour récupérer les livres ayant les meilleures notes
// Requête GET sur /bestrating, qui renvoie une liste des livres avec les meilleures évaluations
router.get('/bestrating', bookCtrl.getBestRating);

// Route pour récupérer tous les livres
// Requête GET sur / qui renvoie la liste de tous les livres
router.get('/', bookCtrl.getAllBook);

// Route pour créer un nouveau livre
// Requête POST sur / avec authentification et gestion de fichier (auth, multer)
// Auth : vérifie que l'utilisateur est authentifié
// Multer : gère l'upload d'une image associée au livre
router.post('/', auth, multer, bookCtrl.createBook);

// Route pour récupérer un livre spécifique par son ID
// Requête GET sur /:id, où :id est un paramètre dynamique qui représente l'identifiant du livre
router.get('/:id', bookCtrl.getOneBook);

// Route pour modifier un livre existant
// Requête PUT sur /:id avec authentification et gestion de fichier (auth, multer)
// Auth : vérifie que l'utilisateur est authentifié
// Multer : gère la modification ou l'ajout d'une image associée au livre
router.put('/:id', auth, multer, bookCtrl.modifyBook);

// Route pour supprimer un livre
// Requête DELETE sur /:id avec authentification
// Auth : vérifie que l'utilisateur est authentifié avant de supprimer le livre
router.delete('/:id', auth, bookCtrl.deleteBook);

// Route pour ajouter une évaluation (rating) à un livre
// Requête POST sur /:id/rating avec authentification
// Auth : vérifie que l'utilisateur est authentifié avant d'ajouter une évaluation à un livre
router.post('/:id/rating', auth, bookCtrl.createRating);

// Exportation du routeur pour pouvoir l'utiliser dans d'autres fichiers comme app.js
module.exports = router;


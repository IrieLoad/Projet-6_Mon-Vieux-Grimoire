// Importation du framework Express, (simplifie la création et la gestion d'un serveur Node.js)
const express = require('express');

// Importation du middleware body-parser pour extraire le corps des requêtes HTTP sous format JSON
const bodyParser = require('body-parser');

// Importation de Mongoose, (facilite les interactions avec une base de données MongoDB)
const mongoose = require('mongoose');

// Importation du module path pour travailler avec les chemins de fichiers et de dossiers
const path = require('path');

// Importation des routes pour la gestion des livres et des utilisateurs
const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');

// Chargement des variables d'environnement à partir du fichier .env
require('dotenv').config();

// Connexion à la base de données MongoDB avec Mongoose
mongoose.connect(
  process.env.MONGODB_URI, // URI de connexion à MongoDB, stockée dans le fichier .env
  { 
    useNewUrlParser: true,       // Options pour éviter les avertissements liés à la version de Mongoose
    useUnifiedTopology: true     // Assure une connexion stable avec MongoDB
  }
)
  .then(() => console.log('Connexion à MongoDB réussie !')) // Message de succès si la connexion fonctionne
  .catch(() => console.log('Connexion à MongoDB échouée !')); // Message d'erreur si la connexion échoue

// Création de l'application Express
const app = express();

// Middleware pour analyser les requêtes avec un corps JSON (remplace bodyParser.json() directement)
app.use(express.json());

// Middleware pour gérer les CORS (Cross-Origin Resource Sharing), afin de permettre les requêtes entre différents domaines
app.use((req, res, next) => {
  // Autoriser l'accès à la ressource depuis n'importe quel domaine ('*')
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Autoriser certains en-têtes spécifiques pour les requêtes entrantes
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );

  // Autoriser certains types de requêtes HTTP : GET, POST, PUT, DELETE, PATCH, OPTIONS
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');

  // Appeler `next()` pour passer au middleware suivant
  next();
});

// Utilisation de body-parser pour traiter les données JSON dans les requêtes
app.use(bodyParser.json());

// Middleware pour servir des fichiers statiques (comme les images) depuis le dossier 'images'
app.use('/images', express.static(path.join(__dirname, 'images')));

// Déclaration des routes pour la gestion des livres. Les requêtes commençant par '/api/books' seront dirigées vers `bookRoutes`.
app.use('/api/books', bookRoutes);

// Déclaration des routes pour l'authentification des utilisateurs. Les requêtes commençant par '/api/auth' seront dirigées vers `userRoutes`.
app.use('/api/auth', userRoutes);

// Exportation de l'application pour pouvoir l'utiliser dans d'autres fichiers (notamment `server.js`).
module.exports = app;


// Importation de multer, (gére les fichiers uploadés via des requêtes HTTP)
const multer = require('multer');

// Importation de sharp, (bibliothèque pour manipuler les images (redimensionner, convertir, etc.))
const sharp = require('sharp');

// Importation du module path pour gérer les chemins de fichiers
const path = require('path');

// Importation du module fs (file system) pour travailler avec les fichiers
const fs = require('fs');

// Dictionnaire des types MIME supportés pour les images, afin de gérer correctement les extensions des fichiers uploadés
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

// Configuration de multer pour utiliser memoryStorage
// Cela signifie que les fichiers uploadés sont temporairement stockés en mémoire (plutôt que directement sur le disque)
const storage = multer.memoryStorage();

// Utilisation de multer pour gérer les fichiers envoyés via des formulaires
// .single('image') signifie qu'on s'attend à recevoir un seul fichier avec le champ "image"
const upload = multer({ storage: storage }).single('image');

// Exportation du middleware qui va gérer le traitement des fichiers envoyés
module.exports = (req, res, next) => {
  // Appel de la fonction upload pour gérer l'upload du fichier
  upload(req, res, async (err) => {
    if (err) {
      // Si une erreur se produit pendant l'upload, on renvoie une réponse avec le statut 500 et le message d'erreur
      return res.status(500).json({ error: err.message });
    }

    // Si un fichier est bien fourni dans la requête
    if (req.file) {
      // Génération d'un nom de fichier unique basé sur le nom d'origine et un timestamp pour éviter les conflits
      const filename = `${req.file.originalname.split(' ').join('_').split('.')[0]}_${Date.now()}.webp`;

      // Définition du chemin de sortie du fichier traité
      const outputPath = path.join('images', filename);

      try {
        // Traitement de l'image avec sharp
        // 1. Redimensionnement de l'image à 450x580 pixels
        // 2. Conversion de l'image au format .webp avec une qualité de 80%
        await sharp(req.file.buffer)
          .resize(450, 580) // Redimensionnement de l'image
          .webp({ quality: 80 }) // Conversion au format .webp
          .toFile(outputPath); // Sauvegarde de l'image transformée dans le dossier "images"

        // Mise à jour des informations sur le fichier dans la requête pour les étapes suivantes
        req.file.path = outputPath; // Chemin du fichier sauvegardé
        req.file.filename = path.basename(outputPath); // Nom du fichier sauvegardé

        // Passage au middleware suivant
        next();
      } catch (err) {
        // Si une erreur survient pendant le traitement de l'image avec sharp, on renvoie une erreur 500
        return res.status(500).json({ error: `Erreur lors du traitement de l'image : ${err.message}` });
      }
    } else {
      // Si aucun fichier n'est fourni dans la requête, on continue simplement sans traitement
      next();
    }
  });
};
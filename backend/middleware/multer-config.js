const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

// Utilisation de memoryStorage pour stocker temporairement l'image en mémoire
const storage = multer.memoryStorage();

const upload = multer({ storage: storage }).single('image');

module.exports = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (req.file) {
      // Définition d'un nom de fichier unique
      const filename = `${req.file.originalname.split(' ').join('_').split('.')[0]}_${Date.now()}.webp`;
      const outputPath = path.join('images', filename);

      try {
        // Traitement de l'image avec sharp : redimensionnement et conversion en .webp
        await sharp(req.file.buffer)
          .resize(450, 580) // Taille de l'image en pixels 
          .webp({ quality: 80 }) // Format et qualité de l'image de sortie
          .toFile(outputPath);

        // Mise à jour des informations sur le fichier pour la suite de la requête
        req.file.path = outputPath;
        req.file.filename = path.basename(outputPath);
        next();
      } catch (err) {
        // Gestion des erreurs de traitement avec sharp
        return res.status(500).json({ error: `Erreur lors du traitement de l'image : ${err.message}` });
      }
    } else {
      // Si aucun fichier n'est fourni, continuer
      next();
    }
  });
};
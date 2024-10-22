// Importation du modèle Book, qui représente un livre dans la base de données
const Book = require('../models/Book');

// Importation du module fs (file system) pour gérer les fichiers, notamment pour supprimer les images
const fs = require('fs');

// Fonction pour créer un livre
exports.createBook = (req, res, next) => {
    // Récupération des données du livre depuis le corps de la requête, qui est au format JSON
    const bookObject = JSON.parse(req.body.book);
    
    // Suppression des champs _id et _userId 
    delete bookObject._id;
    delete bookObject._userId;
    
    // Création d'une nouvelle demande de Book avec les données fournies et l'ajout d'informations supplémentaires
    const book = new Book({
        ...bookObject, // Copie les autres propriétés du livre
        userId: req.auth.userId, // Ajoute l'ID de l'utilisateur qui a créé le livre
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`, // Génère l'URL de l'image téléchargée
        averageRating: bookObject.ratings.length > 0 ? bookObject.ratings[0].grade : 0, // Définit la note moyenne initiale
    });

    // Sauvegarde du livre dans la base de données
    book.save()
        .then(() => { res.status(201).json({message: 'Objet enregistré !'}) }) // Réponse de succès
        .catch(error => { res.status(400).json({ error }) }); // Gestion des erreurs
};

// Fonction pour modifier un livre
exports.modifyBook = (req, res, next) => {
    // Si un nouveau fichier (image) est envoyé, il est traité, sinon on récupère les données du corps de la requête
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    // Suppression du champ _userId pour éviter que l'utilisateur ne puisse modifier cet identifiant
    delete bookObject._userId;

    // Recherche du livre à modifier par son ID
    Book.findOne({_id: req.params.id})
       .then((book) => {
           // Vérification que l'utilisateur authentifié est bien le propriétaire du livre
           if (book.userId != req.auth.userId) {
               res.status(401).json({ message: 'Not authorized' }); // Si non autorisé
           } else {
               // Mise à jour du livre avec les nouvelles données
               Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
               .then(() => res.status(200).json({message: 'Objet modifié!'})) // Réponse de succès
               .catch(error => res.status(401).json({ error })); // Gestion des erreurs
           }
       })
       .catch((error) => {
           res.status(400).json({ error }); // Gestion des erreurs de recherche
       });
};

// Fonction pour supprimer un livre
exports.deleteBook = (req, res, next) => {
    // Recherche du livre par son ID
    Book.findOne({ _id: req.params.id })
       .then(book => {
           // Vérification que l'utilisateur authentifié est bien le propriétaire du livre
           if (book.userId != req.auth.userId) {
               res.status(401).json({ message: 'Not authorized' }); // Si non autorisé
           } else {
               // Suppression du fichier image associé au livre
               const filename = book.imageUrl.split('/images/')[1];
               fs.unlink(`images/${filename}`, () => {
                   // Suppression du livre de la base de données
                   Book.deleteOne({_id: req.params.id})
                       .then(() => { res.status(200).json({message: 'Objet supprimé !'}) }) // Réponse de succès
                       .catch(error => res.status(401).json({ error })); // Gestion des erreurs de suppression
               });
           }
       })
       .catch(error => { res.status(500).json({ error }); }); // Gestion des erreurs de recherche
};

// Fonction pour récupérer un livre par son ID
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id }) // Recherche du livre par son ID
        .then(book => res.status(200).json(book)) // Réponse avec le livre trouvé
        .catch(error => res.status(404).json({ error })); // Gestion des erreurs si le livre n'est pas trouvé
};

// Fonction pour récupérer tous les livres
exports.getAllBook = (req, res, next) => {
    Book.find() // Recherche de tous les livres
        .then(books => res.status(200).json(books)) // Réponse avec tous les livres trouvés
        .catch(error => res.status(400).json({ error })); // Gestion des erreurs
};

// Fonction pour ajouter une évaluation (rating) à un livre
exports.createRating = (req, res, next) => {
    const rating = {
        userId: req.auth.userId, // ID de l'utilisateur qui évalue le livre
        grade: req.body.rating // Note donnée par l'utilisateur
    };

    // Vérification que la note est entre 0 et 5
    if (rating.grade < 0 || rating.grade > 5) {
        return res.status(400).json({ message: 'La note doit être entre 0 et 5' });
    }

    // Recherche du livre par son ID
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            // Vérification que l'utilisateur n'a pas déjà évalué ce livre
            if (book.ratings.find(u => u.userId === req.auth.userId)) {
                return res.status(400).json({ message: 'Vous avez déjà évalué ce livre' });
            } else {
                // Ajout de la nouvelle note au tableau des évaluations
                book.ratings.push(rating);
                // Recalcul de la note moyenne du livre
                book.rating = (book.rating * (book.ratings.length - 1) + rating.grade) / book.ratings.length;
                return book.save(); // Sauvegarde du livre avec la nouvelle évaluation
            }
        })
        .then((ratingBook) => res.status(201).json(ratingBook)) // Réponse de succès avec le livre mis à jour
        .catch(error => res.status(400).json({ error })); // Gestion des erreurs
};

// Fonction pour récupérer les 3 livres avec les meilleures notes
exports.getBestRating = (req, res, next) => {
    Book.find()
      .sort({ averageRating: -1 }) // Trie par note moyenne décroissante
      .limit(3) // Limite la réponse à 3 livres
      .then(books => res.status(200).json(books)) // Réponse avec les 3 livres
      .catch(error => res.status(400).json({ error })); // Gestion des erreurs
};
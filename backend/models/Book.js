// Importation de Mongoose, (facilite la définition des schémas de données et les interactions avec MongoDB)
const mongoose = require('mongoose');

// Création d'un schéma de données pour un livre avec Mongoose
// Ce schéma définit la structure des documents de la collection "books" dans la base de données
const bookSchema = mongoose.Schema({
    
    // Identifiant de l'utilisateur qui a ajouté le livre
    // Il est requis pour savoir qui est à l'origine de l'ajout du livre
    userId: { type: String, required: true },
    
    // Titre du livre
    // Le champ est requis, donc il ne peut pas être vide lors de la création d'un document
    title: { type: String, required: true },
    
    // Auteur du livre
    // Ce champ est également requis pour identifier l'auteur
    author: { type: String, required: true },
    
    // URL de l'image de la couverture du livre
    // Cette image sera utilisée dans l'application pour afficher la couverture du livre
    imageUrl: { type: String, required: true },
    
    // Année de publication du livre
    // Il s'agit d'un nombre, et ce champ est obligatoire
    year: { type: Number, required: true },
    
    // Genre littéraire du livre 
    // Ce champ est requis pour classifier le livre
    genre: { type: String, required: true },
    
    // Tableau d'évaluations (ratings) attribuées au livre par les utilisateurs
    ratings: [
        {
            // Identifiant de l'utilisateur qui a donné une évaluation
            userId: { type: String, required: true },

            // Note attribuée par l'utilisateur (grade)
            // Il s'agit d'un nombre qui représente la note donnée par l'utilisateur 
            grade: { type: Number },
        }
    ],

    // Note moyenne du livre, calculée à partir des évaluations
    // Par défaut, la note moyenne est de 0 si aucune évaluation n'a encore été donnée
    averageRating: { type: Number, default: 0 },
});

// Exportation du modèle "Book" basé sur le schéma "bookSchema"
// Ce modèle permet d'interagir avec la collection "books" dans MongoDB
module.exports = mongoose.model('Book', bookSchema);
// Importation de Mongoose, (gére la base de données MongoDB)
const mongoose = require('mongoose');

// Importation du plugin mongoose-unique-validator
// Ce plugin est utilisé pour garantir que certaines valeurs dans la base de données sont uniques (comme les adresses e-mail)
const uniqueValidator = require('mongoose-unique-validator');

// Création d'un schéma de données pour un utilisateur avec Mongoose
// Ce schéma définit la structure des documents de la collection "users" dans la base de données
const userSchema = mongoose.Schema({
    
    // Adresse e-mail de l'utilisateur
    // Ce champ est requis et doit être unique dans la base de données (deux utilisateurs ne peuvent pas avoir la même adresse e-mail)
    email: { type: String, required: true, unique: true },
    
    // Mot de passe de l'utilisateur
    // Ce champ est également requis
    password: { type: String, required: true }
});

// Application du plugin uniqueValidator au schéma utilisateur
// Cela permet d'avoir un meilleur contrôle des erreurs quand un utilisateur tente de s'inscrire avec une adresse e-mail déjà utilisée
userSchema.plugin(uniqueValidator);

// Exportation du modèle "User" basé sur le schéma "userSchema"
// Ce modèle permet d'interagir avec la collection "users" dans MongoDB
module.exports = mongoose.model('User', userSchema);
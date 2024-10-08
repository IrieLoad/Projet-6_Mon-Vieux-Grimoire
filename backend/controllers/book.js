const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        averageRating: bookObject.ratings.length > 0 ? bookObject.ratings[0].grade : 0,
    });

    book.save()
        .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
        .catch(error => { res.status(400).json( { error })})
};

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
       .then((book) => {
           if (book.userId != req.auth.userId) {
               res.status(401).json({ message : 'Not authorized'});
           } else {
               Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
               .then(() => res.status(200).json({message : 'Objet modifié!'}))
               .catch(error => res.status(401).json({ error }));
           }
       })
       .catch((error) => {
           res.status(400).json({ error });
       });
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
       .then(book => {
           if (book.userId != req.auth.userId) {
               res.status(401).json({message: 'Not authorized'});
           } else {
               const filename = book.imageUrl.split('/images/')[1];
               fs.unlink(`images/${filename}`, () => {
                   Book.deleteOne({_id: req.params.id})
                       .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                       .catch(error => res.status(401).json({ error }));
               });
           }
       })
       .catch( error => { res.status(500).json({ error });
       });
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
}

exports.getAllBook = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
}

exports.createRating = (req, res, next) => {
    const { rating } = req.body;  
    const userId = req.auth.userId;

    if (typeof rating !== 'number' || rating < 0 || rating > 5) {
        return res.status(400).json({ error: 'La note doit être comprise entre 0 et 5.' });
    }

    Book.findOne({ _id: req.params.id })
    .then(book => {
        if (!book) {
            return res.status(404).json({ error: 'Livre introuvable.' });
        }

        // Vérifie que l'utilisateur n'a pas déjà noté ce livre
        const userIdArray = book.ratings.map(rating => rating.userId);
        if (userIdArray.includes(userId)) {
            return res.status(403).json({ message : 'Not authorized' });
        }

        // Ajoute la nouvelle note au tableau ratings
        book.ratings.push({ userId: userId, grade: rating });

        // Recalcule la note moyenne
        const totalRatings = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
        book.averageRating = totalRatings / book.ratings.length;

        // Enregistre les modifications
        book.save()
        .then(() => res.status(200).json({ message: 'Evaluation ajoutée avec succès!' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getBestRating = (req, res, next) => {
    Book.find()
      .sort({ averageRating: -1 }) // Trie par note moyenne décroissante
      .limit(3) // Limite à 3 livres
      .then(books => res.status(200).json(books))
      .catch(error => res.status(400).json({ error }));
  };


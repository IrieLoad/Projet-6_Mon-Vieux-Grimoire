const express = require ('express');
const auth = require('../middleware/auth');
const router = express.Router();
const multer = require('../middleware/multer-config')


const bookCtrl = require('../controllers/book')

router.get('/bestrating', bookCtrl.getBestRating);

router.get('/', bookCtrl.getAllBook);
router.post('/', auth, multer, bookCtrl.createBook);
router.get('/:id', bookCtrl.getOneBook);
router.put('/:id', auth, multer, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.post('/:id/rating', auth, bookCtrl.createRating);

module.exports = router;


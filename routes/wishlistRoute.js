const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/user', authMiddleware, wishlistController.getAllWishlistsForAUser);
router.get('/', wishlistController.getAllWishlists);
router.get('/:wishlistId/products', wishlistController.getAllProductsFromWishlist);
router.get('/user', wishlistController.getAllWishlistsForAUser);
router.post('/create', wishlistController.createWishlist);
router.put('/:wishlistId', wishlistController.updateWishlist);
router.delete('/:wishlistId', wishlistController.deleteWishlist);
router.post('/:wishlistId/add/:productId', wishlistController.addProductToWishlist);
router.delete('/:wishlistId/remove/:productId', wishlistController.removeProductFromWishlist);

module.exports = router;
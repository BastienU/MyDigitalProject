const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');

router.get('/', wishlistController.getAllWishlists);
router.get('/:wishlistId/products', wishlistController.getAllProductsFromWishlist);
router.post('/create', wishlistController.createWishlist);
router.put('/:wishlistId', wishlistController.updateWishlist);
router.delete('/:wishlistId', wishlistController.deleteWishlist);
router.post('/:wishlistId/add/:productId', wishlistController.addProductToWishlist);
router.delete('/:wishlistId/remove/:productId', wishlistController.removeProductFromWishlist);

module.exports = router;
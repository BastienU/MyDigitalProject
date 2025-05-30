const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getProductByCode,
  createProduct,
  importCSV,
} = require('../controllers/productController');
const upload = require('../middlewares/uploadMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/authorizeRole');

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/code/:code', getProductByCode);
router.post('/', authMiddleware, authorizeRole('retailer'), createProduct);

router.post(
  '/import',
  authMiddleware,
  authorizeRole('retailer'),
  upload.single('file'),
  importCSV
);

module.exports = router;
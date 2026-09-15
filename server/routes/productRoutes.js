const express = require('express');
const {
  getProducts,
  getProductByIdOrSlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(getProducts).post(protect, admin, createProduct);
router.get('/:id/related', getRelatedProducts);
router.post('/:id/reviews', protect, createProductReview);
router
  .route('/:id')
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);
router.get('/:idOrSlug', getProductByIdOrSlug);

module.exports = router;

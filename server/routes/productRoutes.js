const express = require('express');
const c = require('../controllers/productController');
const { protect, optionalAuth, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(optionalAuth, c.getProducts).post(protect, admin, c.createProduct);
router.get('/meta', c.getProductMeta);
router.get('/:id/related', c.getRelatedProducts);
router.route('/:id/reviews').get(c.getProductReviews).post(protect, c.createProductReview);
router.delete('/:id/reviews/:reviewId', protect, c.deleteProductReview);
router.patch('/:id/stock', protect, admin, c.updateStock);
router.route('/:id').put(protect, admin, c.updateProduct).delete(protect, admin, c.deleteProduct);
router.get('/:idOrSlug', optionalAuth, c.getProductByIdOrSlug);

module.exports = router;

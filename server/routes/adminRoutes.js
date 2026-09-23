const express = require('express');
const c = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, admin);
router.get('/stats', c.getDashboardStats);
router.get('/inventory', c.getInventory);
router.get('/customers', c.getCustomers);
router.route('/customers/:id').get(c.getCustomer).put(c.updateCustomer).delete(c.deleteCustomer);

module.exports = router;

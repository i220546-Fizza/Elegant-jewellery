const express = require('express');
const c = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.put('/profile', protect, c.updateProfile);
router.put('/password', protect, c.changePassword);
router.route('/addresses').get(protect, c.getAddresses).post(protect, c.addAddress);
router.route('/addresses/:addressId').put(protect, c.updateAddress).delete(protect, c.deleteAddress);

module.exports = router;

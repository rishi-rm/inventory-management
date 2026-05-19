const express = require('express');
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const verifyAccessPin = require('../middleware/verifyAccessPin');

const router = express.Router();

router.use(verifyAccessPin);
router.route('/').get(getAllProducts).post(createProduct);
router.route('/:id').put(updateProduct).delete(deleteProduct);

module.exports = router;

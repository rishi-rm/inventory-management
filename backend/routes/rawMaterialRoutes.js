const express = require('express');
const {
  getAllRawMaterials,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
} = require('../controllers/rawMaterialController');
const verifyAccessPin = require('../middleware/verifyAccessPin');

const router = express.Router();

router.use(verifyAccessPin);
router.route('/').get(getAllRawMaterials).post(createRawMaterial);
router.route('/:id').put(updateRawMaterial).delete(deleteRawMaterial);

module.exports = router;

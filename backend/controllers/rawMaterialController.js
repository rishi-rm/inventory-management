const RawMaterial = require('../models/RawMaterial');

exports.getAllRawMaterials = async (req, res, next) => {
  try {
    const materials = await RawMaterial.find({});
    res.json({ success: true, data: materials });
  } catch (err) {
    next(err);
  }
};

exports.createRawMaterial = async (req, res, next) => {
  try {
    const { name, unit, quantity, unitCost, notes } = req.body;

    const material = await RawMaterial.create({
      name,
      unit,
      quantity,
      unitCost,
      notes,
    });

    res.status(201).json({ success: true, data: material });
  } catch (err) {
    next(err);
  }
};

exports.updateRawMaterial = async (req, res, next) => {
  try {
    const material = await RawMaterial.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!material) {
      const error = new Error('Raw material not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json({ success: true, data: material });
  } catch (err) {
    next(err);
  }
};

exports.deleteRawMaterial = async (req, res, next) => {
  try {
    const material = await RawMaterial.findOneAndDelete({ _id: req.params.id });

    if (!material) {
      const error = new Error('Raw material not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

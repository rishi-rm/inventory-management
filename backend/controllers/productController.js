const Product = require('../models/Product');
const RawMaterial = require('../models/RawMaterial');

exports.getAllProducts = async (req, res, next) => {
  try {
    // include ratePerKg on populated raw materials so product calculations on frontend can use it
    const products = await Product.find({}).populate('materials.material', 'itemName unit ratePerKg');
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, quantity, unit, materials, sellingPrice, notes } = req.body;

    const materialIds = materials.map((item) => item.material);
    const rawMaterials = await RawMaterial.find({ _id: { $in: materialIds } });
    const materialMap = new Map(rawMaterials.map((mat) => [mat._id.toString(), mat]));

    for (const item of materials) {
      const mat = materialMap.get(item.material.toString());
      if (!mat) {
        const error = new Error('Raw material not found');
        error.statusCode = 404;
        return next(error);
      }
      if (item.quantity > mat.quantity) {
        const error = new Error(`Insufficient stock for ${mat.itemName || mat.name}`);
        error.statusCode = 400;
        return next(error);
      }
    }

    const product = await Product.create({
      name,
      quantity,
      unit,
      materials,
      sellingPrice,
      notes,
    });

    const bulkUpdates = materials.map((item) => ({
      updateOne: {
        filter: { _id: item.material },
        update: { $inc: { quantity: -item.quantity } },
      },
    }));

    if (bulkUpdates.length) {
      await RawMaterial.bulkWrite(bulkUpdates);
    }

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    // Fetch existing product to compute material quantity diffs
    const existing = await Product.findById(req.params.id);
    if (!existing) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }

    const { name, quantity, materials, sellingPrice, notes, unit } = req.body;

    // Build map of existing material quantities by id
    const existingMap = new Map();
    for (const m of existing.materials) {
      const id = (m.material && m.material.toString()) || m.materialId || m.material;
      existingMap.set(id, (existingMap.get(id) || 0) + Number(m.quantity || 0));
    }

    // Build map of new material quantities by id
    const newMap = new Map();
    for (const m of materials || []) {
      const id = (m.material && m.material.toString()) || m.materialId || m.material;
      newMap.set(id, (newMap.get(id) || 0) + Number(m.quantity || 0));
    }

    // Collect all material ids involved
    const allIds = Array.from(new Set([...existingMap.keys(), ...newMap.keys()]));

    // Load raw materials to validate stock
    const rawMaterials = await RawMaterial.find({ _id: { $in: allIds } });
    const rawMap = new Map(rawMaterials.map((r) => [r._id.toString(), r]));

    // Compute diffs and check availability for increases
    const bulk = [];
    for (const id of allIds) {
      const oldQty = existingMap.get(id) || 0;
      const newQty = newMap.get(id) || 0;
      const delta = newQty - oldQty; // positive -> more used, negative -> less used (return to stock)
      const mat = rawMap.get(id);
      if (!mat) {
        const error = new Error('Raw material not found');
        error.statusCode = 404;
        return next(error);
      }
      if (delta > 0 && delta > mat.quantity) {
        const required = Number(delta.toFixed(6));
        const available = Number(mat.quantity || 0);
        const unit = mat.unit || '';
        const error = new Error(`${mat.itemName || mat.name} has only ${available} ${unit} left and requires ${required} ${unit}`);
        error.statusCode = 400;
        return next(error);
      }
      if (delta !== 0) {
        // decrease raw material by delta (if delta positive) or increase if delta negative
        bulk.push({
          updateOne: {
            filter: { _id: id },
            update: { $inc: { quantity: -delta } },
          },
        });
      }
    }

    // Apply raw material updates
    if (bulk.length) {
      await RawMaterial.bulkWrite(bulk);
    }

    // Prepare updated product payload
    const updated = await Product.findOneAndUpdate(
      { _id: req.params.id },
      { name, quantity, materials, sellingPrice, notes, unit },
      { new: true, runValidators: true }
    ).populate('materials.material', 'itemName unit ratePerKg');

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id });

    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

const Product = require('../models/Product');
const RawMaterial = require('../models/RawMaterial');

exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find({}).populate('materials.material', 'name unit');
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, quantity, materials, sellingPrice, notes } = req.body;

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
        const error = new Error(`Insufficient stock for ${mat.name}`);
        error.statusCode = 400;
        return next(error);
      }
    }

    const product = await Product.create({
      name,
      quantity,
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
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json({ success: true, data: product });
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

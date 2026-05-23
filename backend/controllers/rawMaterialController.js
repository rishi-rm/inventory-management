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
    // accept both name and itemName for compatibility
    const { itemName, name, unit = 'kg', quantity, baseRate, frate = 10, notes } = req.body;

    const cleanName = (itemName || name || '').trim();

    // validations
    if (!cleanName) {
      const error = new Error('Material name is required');
      error.statusCode = 400;
      return next(error);
    }
    const q = Number(quantity || 0);
    if (isNaN(q) || q <= 0) {
      const error = new Error('Quantity must be greater than 0');
      error.statusCode = 400;
      return next(error);
    }
    // `baseRate` is now the rate per unit (e.g. per kg) without GST or freight
    const br = Number(baseRate || 0);
    if (isNaN(br) || br < 0) {
      const error = new Error('Base rate must be 0 or greater');
      error.statusCode = 400;
      return next(error);
    }
    const fr = Number(frate || 0);
    if (isNaN(fr) || fr < 0) {
      const error = new Error('Freight rate must be 0 or greater');
      error.statusCode = 400;
      return next(error);
    }

    // compute using per-unit base rate plus freight, then apply GST on the total amount
    const unitBeforeTax = br + fr;
    const totalBeforeTax = unitBeforeTax * q;
    const gst = totalBeforeTax * 0.18;
    const rateAfterTax = totalBeforeTax + gst; // total amount after tax
    const ratePerKg = q > 0 ? unitBeforeTax * 1.18 : 0;

    const material = await RawMaterial.create({
      itemName: cleanName,
      unit,
      quantity: q,
      baseRate: br,
      rateAfterTax,
      frate: fr,
      ratePerKg,
      notes,
    });

    res.status(201).json({ success: true, data: material });
  } catch (err) {
    next(err);
  }
};

exports.updateRawMaterial = async (req, res, next) => {
  try {
    const { itemName, name, unit, quantity, baseRate, frate, notes } = req.body;

    const update = {};
    if (itemName || name) update.itemName = (itemName || name).trim();
    if (unit) update.unit = unit;
    if (typeof quantity !== 'undefined') update.quantity = Number(quantity);
    if (typeof baseRate !== 'undefined') update.baseRate = Number(baseRate);
    if (typeof frate !== 'undefined') update.frate = Number(frate);
    if (notes) update.notes = notes;

    // fetch existing to compute derived fields
    const existing = await RawMaterial.findById(req.params.id);
    if (!existing) {
      const error = new Error('Raw material not found');
      error.statusCode = 404;
      return next(error);
    }

    const q = typeof update.quantity !== 'undefined' ? update.quantity : existing.quantity;
    // baseRate is rate per unit (e.g. per kg)
    const br = typeof update.baseRate !== 'undefined' ? update.baseRate : existing.baseRate;
    const fr = typeof update.frate !== 'undefined' ? update.frate : existing.frate;

    if (isNaN(q) || q <= 0) {
      const error = new Error('Quantity must be greater than 0');
      error.statusCode = 400;
      return next(error);
    }
    if (isNaN(br) || br < 0) {
      const error = new Error('Base rate must be 0 or greater');
      error.statusCode = 400;
      return next(error);
    }
    if (isNaN(fr) || fr < 0) {
      const error = new Error('Freight rate must be 0 or greater');
      error.statusCode = 400;
      return next(error);
    }

    const unitBeforeTax = br + fr;
    const totalBeforeTax = unitBeforeTax * q;
    const gst = totalBeforeTax * 0.18;
    update.rateAfterTax = totalBeforeTax + gst;
    update.ratePerKg = q > 0 ? unitBeforeTax * 1.18 : 0;

    const material = await RawMaterial.findOneAndUpdate(
      { _id: req.params.id },
      update,
      { new: true, runValidators: true }
    );

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

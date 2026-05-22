const mongoose = require('mongoose');

const rawMaterialSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Material name is required'],
      trim: true,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
      default: 'kg',
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Quantity cannot be negative'],
    },
    baseRate: {
      // user-entered total base cost WITHOUT GST
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Base rate cannot be negative'],
    },
    rateAfterTax: {
      // baseRate + GST (18%) - computed
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Rate after tax cannot be negative'],
    },
    frate: {
      // freight per kg
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Freight rate must be at least 0'],
    },
    ratePerKg: {
      // final computed cost per kg
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Rate per kg cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RawMaterial', rawMaterialSchema);

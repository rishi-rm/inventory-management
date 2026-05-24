const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    unit: {
      type: String,
      required: false,
      trim: true,
      default: '',
    },
    materials: [
      {
        material: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'RawMaterial',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 0,
        },
      },
    ],
    sellingPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);

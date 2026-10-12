import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: [true, 'Please specify category'],
      enum: ['single-origin', 'signature-blends', 'espresso', 'cold-brew', 'pastries', 'equipment'],
      default: 'single-origin',
    },
    tagline: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: 0,
    },
    origin: {
      type: String,
      default: 'Artisan Blend',
    },
    roastLevel: {
      type: String,
      enum: ['Light', 'Medium-Light', 'Medium', 'Medium-Dark', 'Dark', 'N/A'],
      default: 'Medium',
    },
    flavorNotes: {
      type: [String],
      default: [],
    },
    process: {
      type: String,
      default: 'Washed / Natural',
    },
    altitude: {
      type: String,
      default: '1,200m - 2,100m',
    },
    rating: {
      type: Number,
      default: 4.9,
      min: 1,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    badge: {
      type: String,
      default: '',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);

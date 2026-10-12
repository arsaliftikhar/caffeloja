import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  grind: { type: String, default: 'Whole Bean' },
  imageUrl: { type: String, default: '' },
  sku: { type: String, default: '' },
});

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, default: 'Portugal' },
      },
    },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'forwarded_to_dropshipper', 'shipped', 'delivered', 'cancelled'],
      default: 'processing',
    },
    paymentMethod: {
      type: String,
      default: 'Stripe (Credit / Debit Card)',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'failed'],
      default: 'unpaid',
    },
    stripeSessionId: {
      type: String,
      default: null,
    },
    stripePaymentIntentId: {
      type: String,
      default: null,
    },
    // MLM Referral & Commission Details
    referralCode: {
      type: String,
      default: null,
    },
    sponsorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    commissionsDistributed: {
      type: Boolean,
      default: false,
    },
    totalCommissionsPaid: {
      type: Number,
      default: 0,
    },
    // Dropshipping Integration Details (WordPress / oldchicagocoffee.com)
    dropshipping: {
      isForwarded: { type: Boolean, default: false },
      dropshipOrderId: { type: String, default: '' },
      targetUrl: { type: String, default: 'https://oldchicagocoffee.com' },
      status: {
        type: String,
        enum: ['pending', 'forwarded', 'confirmed', 'failed', 'simulated'],
        default: 'pending',
      },
      forwardedAt: { type: Date, default: null },
      responseLog: { type: String, default: '' },
      trackingCode: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);

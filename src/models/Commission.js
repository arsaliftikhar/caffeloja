import mongoose from 'mongoose';

const CommissionSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: false,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    beneficiaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    beneficiaryName: {
      type: String,
      default: '',
    },
    buyerName: {
      type: String,
      default: 'Customer',
    },
    buyerReferralCode: {
      type: String,
      default: '',
    },
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    percentage: {
      type: Number,
      required: true,
    },
    orderAmount: {
      type: Number,
      required: true,
    },
    commissionAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'paid', 'cancelled'],
      default: 'approved',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Commission || mongoose.model('Commission', CommissionSchema);

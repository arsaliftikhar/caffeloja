import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
    },
    phone: {
      type: String,
      default: '',
    },
    referralCode: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
      trim: true,
    },
    sponsorCode: {
      type: String,
      uppercase: true,
      trim: true,
      default: null,
    },
    sponsorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member',
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalWithdrawn: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSalesVolume: {
      type: Number,
      default: 0,
    },
    rank: {
      type: String,
      enum: ['Bronze Barista', 'Silver Roaster', 'Gold Sommelier', 'Platinum Master', 'Diamond Founder'],
      default: 'Bronze Barista',
    },
    payoutDetails: {
      method: { type: String, default: 'Bank Transfer / IBAN' },
      accountNumber: { type: String, default: '' },
      accountName: { type: String, default: '' },
      mbwayPhone: { type: String, default: '' },
      cryptoWallet: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);

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
    shippingAddress: {
      phone: { type: String, default: '' },
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      country: { type: String, default: 'United States' },
    },
    hasActiveSubscription: {
      type: Boolean,
      default: false,
    },
    subscriptionStatus: {
      type: String,
      enum: ['inactive', 'active', 'cancelled'],
      default: 'inactive',
    },
    subscriptionUpdatedAt: {
      type: Date,
      default: null,
    },
    subscriptionCurrentPeriodEnd: {
      type: Date,
      default: null,
    },
    stripeCustomerId: {
      type: String,
      default: '',
    },
    stripeSubscriptionId: {
      type: String,
      default: '',
    },
    paymentMethodSummary: {
      brand: { type: String, default: '' },
      last4: { type: String, default: '' },
      cardholderName: { type: String, default: '' },
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      default: '',
    },
    notificationPreferences: {
      commissions: { type: Boolean, default: true },
      shipping: { type: Boolean, default: true },
      security: { type: Boolean, default: true },
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

if (
  mongoose.models.User &&
  (!mongoose.models.User.schema.path('shippingAddress.street') ||
    !mongoose.models.User.schema.path('twoFactorEnabled') ||
    !mongoose.models.User.schema.path('stripeSubscriptionId') ||
    !mongoose.models.User.schema.path('isEmailVerified'))
) {
  delete mongoose.models.User;
}

export default mongoose.models.User || mongoose.model('User', UserSchema);

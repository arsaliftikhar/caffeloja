import mongoose from 'mongoose';

const LevelRateSchema = new mongoose.Schema({
  level: { type: Number, required: true, min: 1, max: 4 },
  amount: { type: Number, required: true, default: 10 },
  percentage: { type: Number, default: 10 },
  label: { type: String, default: '' },
});

const MLMSettingsSchema = new mongoose.Schema(
  {
    settingKey: {
      type: String,
      default: 'default_mlm_config',
      unique: true,
    },
    // 4 Level Fixed Commission Distribution ($ per box)
    levels: {
      type: [LevelRateSchema],
      default: [
        { level: 1, amount: 10, percentage: 10, label: 'Direct Sponsor (Level 1)' },
        { level: 2, amount: 8, percentage: 8, label: 'Sub-tier 1 (Level 2)' },
        { level: 3, amount: 6, percentage: 6, label: 'Sub-tier 2 (Level 3)' },
        { level: 4, amount: 6, percentage: 6, label: 'Sub-tier 3 (Level 4)' },
      ],
    },
    isMLMActive: {
      type: Boolean,
      default: true,
    },
    minimumPayout: {
      type: Number,
      default: 20,
    },
    // WordPress Dropshipper Configuration (Fulfillment Partner)
    dropshipSettings: {
      targetUrl: {
        type: String,
        default: '',
      },
      consumerKey: {
        type: String,
        default: '',
      },
      consumerSecret: {
        type: String,
        default: '',
      },
      apiMode: {
        type: String,
        enum: ['wc_rest', 'plugin_bridge', 'store_api', 'simulation'],
        default: 'wc_rest',
      },
      autoForward: {
        type: Boolean,
        default: true,
      },
      pluginSecretToken: {
        type: String,
        default: 'hybrid_partner_secure_bridge_2026',
      },
      notifyAdminEmail: {
        type: String,
        default: 'admin@caffeloja.com',
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.MLMSettings || mongoose.model('MLMSettings', MLMSettingsSchema);

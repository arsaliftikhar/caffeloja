import mongoose from 'mongoose';

const LevelRateSchema = new mongoose.Schema({
  level: { type: Number, required: true, min: 1, max: 4 },
  percentage: { type: Number, required: true, min: 0, max: 100 },
  label: { type: String, default: '' },
});

const MLMSettingsSchema = new mongoose.Schema(
  {
    settingKey: {
      type: String,
      default: 'default_mlm_config',
      unique: true,
    },
    // 4 Level Commission Distribution
    levels: {
      type: [LevelRateSchema],
      default: [
        { level: 1, percentage: 10, label: 'Direct Sponsor (Level 1)' },
        { level: 2, percentage: 5, label: 'Sub-tier 1 (Level 2)' },
        { level: 3, percentage: 3, label: 'Sub-tier 2 (Level 3)' },
        { level: 4, percentage: 2, label: 'Sub-tier 3 (Level 4)' },
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
    // WordPress Dropshipper Configuration (oldchicagocoffee.com)
    dropshipSettings: {
      targetUrl: {
        type: String,
        default: 'https://oldchicagocoffee.com',
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
        default: 'hybrid_mlm_secure_bridge_2026',
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

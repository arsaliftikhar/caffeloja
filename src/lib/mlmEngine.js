import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import Commission from '@/models/Commission';
import MLMSettings from '@/models/MLMSettings';

/**
 * Get or create current MLM Commission Settings
 */
export async function getMLMSettings() {
  await connectToDatabase();
  let settings = await MLMSettings.findOne({ settingKey: 'default_mlm_config' });
  if (!settings) {
    settings = await MLMSettings.create({
      settingKey: 'default_mlm_config',
      levels: [
        { level: 1, percentage: 10, label: 'Direct Sponsor (Level 1)' },
        { level: 2, percentage: 5, label: 'Sub-tier 1 (Level 2)' },
        { level: 3, percentage: 3, label: 'Sub-tier 2 (Level 3)' },
        { level: 4, percentage: 2, label: 'Sub-tier 3 (Level 4)' },
      ],
      isMLMActive: true,
      dropshipSettings: {
        targetUrl: 'https://oldchicagocoffee.com',
        autoForward: true,
      },
    });
  }
  return settings;
}

/**
 * Distribute 4-Level MLM Commissions for an Order
 * @param {Object} order - The saved order document
 * @param {String} referralCode - Referral code used by customer (if any)
 * @returns {Array} - List of commissions created
 */
export async function distribute4LevelCommissions(order, referralCode) {
  if (!referralCode) {
    return { success: false, message: 'No referral code associated with order' };
  }

  await connectToDatabase();
  const settings = await getMLMSettings();

  if (!settings.isMLMActive) {
    return { success: false, message: 'MLM system is currently paused in settings' };
  }

  // Find the direct sponsor (Level 1)
  const directSponsor = await User.findOne({
    referralCode: referralCode.toUpperCase().trim(),
  });

  if (!directSponsor) {
    return { success: false, message: `Sponsor with code ${referralCode} not found` };
  }

  const commissionsCreated = [];
  let currentSponsor = directSponsor;
  const orderAmount = order.subtotal || order.total || 0;
  let totalCommissionsDistributed = 0;

  // Traverse up to 4 levels
  for (let currentLevel = 1; currentLevel <= 4; currentLevel++) {
    if (!currentSponsor) break;

    // Find configured percentage for this level
    const levelConfig = settings.levels.find((l) => l.level === currentLevel) || {
      level: currentLevel,
      percentage: currentLevel === 1 ? 10 : currentLevel === 2 ? 5 : currentLevel === 3 ? 3 : 2,
    };

    const percentage = Number(levelConfig.percentage) || 0;
    const commissionAmount = parseFloat(((orderAmount * percentage) / 100).toFixed(2));

    if (commissionAmount > 0) {
      // 1. Create commission record
      const commissionDoc = await Commission.create({
        orderId: order._id,
        orderNumber: order.orderNumber,
        beneficiaryId: currentSponsor._id,
        beneficiaryName: currentSponsor.name,
        buyerName: order.customer?.name || 'Customer',
        buyerReferralCode: referralCode,
        level: currentLevel,
        percentage,
        orderAmount,
        commissionAmount,
        status: 'approved',
      });

      commissionsCreated.push(commissionDoc);
      totalCommissionsDistributed += commissionAmount;

      // 2. Update sponsor wallet balance & total earnings
      await User.findByIdAndUpdate(currentSponsor._id, {
        $inc: {
          walletBalance: commissionAmount,
          totalEarnings: commissionAmount,
          totalSalesVolume: orderAmount,
        },
      });

      // Update rank if milestone reached
      await checkAndUpgradeRank(currentSponsor._id);
    }

    // Move to next sponsor in lineage (Level 2, 3, 4)
    if (currentSponsor.sponsorId) {
      currentSponsor = await User.findById(currentSponsor.sponsorId);
    } else if (currentSponsor.sponsorCode) {
      currentSponsor = await User.findOne({ referralCode: currentSponsor.sponsorCode });
    } else {
      currentSponsor = null;
    }
  }

  return {
    success: true,
    count: commissionsCreated.length,
    totalPaid: totalCommissionsDistributed,
    commissions: commissionsCreated,
  };
}

// Backward compatibility alias
export const distribute5LevelCommissions = distribute4LevelCommissions;

/**
 * Check & Upgrade MLM Rank based on volume
 */
async function checkAndUpgradeRank(userId) {
  const user = await User.findById(userId);
  if (!user) return;

  let newRank = user.rank;
  if (user.totalSalesVolume >= 10000) newRank = 'Diamond Founder';
  else if (user.totalSalesVolume >= 5000) newRank = 'Platinum Master';
  else if (user.totalSalesVolume >= 2000) newRank = 'Gold Sommelier';
  else if (user.totalSalesVolume >= 500) newRank = 'Silver Roaster';

  if (newRank !== user.rank) {
    user.rank = newRank;
    await user.save();
  }
}

/**
 * Fetch complete 4-Level Downline for a User
 */
export async function get4LevelDownline(userId) {
  await connectToDatabase();
  const rootUser = await User.findById(userId).lean();
  if (!rootUser) return null;

  const downline = {
    level1: [],
    level2: [],
    level3: [],
    level4: [],
    totalMembers: 0,
    totalDownlineVolume: 0,
  };

  // Level 1: Direct referrals
  const l1Users = await User.find({
    $or: [{ sponsorId: userId }, { sponsorCode: rootUser.referralCode }],
  }).select('name email referralCode rank totalSalesVolume totalEarnings createdAt').lean();
  downline.level1 = l1Users;

  const getNextLevel = async (parentIds, parentCodes) => {
    if (parentIds.length === 0 && parentCodes.length === 0) return [];
    return await User.find({
      $or: [{ sponsorId: { $in: parentIds } }, { sponsorCode: { $in: parentCodes } }],
    }).select('name email referralCode rank totalSalesVolume totalEarnings createdAt').lean();
  };

  // Level 2
  const l1Ids = l1Users.map((u) => u._id);
  const l1Codes = l1Users.map((u) => u.referralCode);
  downline.level2 = await getNextLevel(l1Ids, l1Codes);

  // Level 3
  const l2Ids = downline.level2.map((u) => u._id);
  const l2Codes = downline.level2.map((u) => u.referralCode);
  downline.level3 = await getNextLevel(l2Ids, l2Codes);

  // Level 4
  const l3Ids = downline.level3.map((u) => u._id);
  const l3Codes = downline.level3.map((u) => u.referralCode);
  downline.level4 = await getNextLevel(l3Ids, l3Codes);

  downline.totalMembers =
    downline.level1.length +
    downline.level2.length +
    downline.level3.length +
    downline.level4.length;

  return downline;
}

// Backward compatibility alias
export const get5LevelDownline = get4LevelDownline;

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import Payout from '@/models/Payout';
import MLMSettings from '@/models/MLMSettings';
import { verifyToken } from '@/lib/auth';
import {
  isStripeConfigured,
  createStripeConnectAccount,
  createStripeAccountLink,
  retrieveStripeConnectAccount,
  createStripeLoginLink,
  createStripeTransfer,
} from '@/lib/stripe';

function getAuthenticatedUser(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  return verifyToken(token);
}

/**
 * GET /api/affiliate/stripe-connect
 * Returns current Stripe Connect onboarding status & payout history
 */
export async function GET(request) {
  try {
    const decoded = getAuthenticatedUser(request);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    let payoutsEnabled = Boolean(user.stripeConnectPayoutsEnabled);
    let detailsSubmitted = Boolean(user.stripeConnectDetailsSubmitted);

    // If account exists, periodically sync from Stripe
    if (user.stripeConnectAccountId && isStripeConfigured()) {
      try {
        const stripeAccount = await retrieveStripeConnectAccount(user.stripeConnectAccountId);
        if (stripeAccount) {
          payoutsEnabled = Boolean(stripeAccount.payouts_enabled);
          detailsSubmitted = Boolean(stripeAccount.details_submitted);
          user.stripeConnectPayoutsEnabled = payoutsEnabled;
          user.stripeConnectDetailsSubmitted = detailsSubmitted;
          user.stripeConnectChargesEnabled = Boolean(stripeAccount.charges_enabled);
          await user.save();
        }
      } catch (err) {
        console.warn('Could not sync Stripe Connect status:', err.message);
      }
    }

    const [payouts, mlmSettings] = await Promise.all([
      Payout.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      MLMSettings.findOne({ settingKey: 'default_mlm_config' }).lean().catch(() => null),
    ]);

    const minimumPayout = Number(mlmSettings?.minimumPayout) || 20;

    return NextResponse.json({
      success: true,
      stripeConnectAccountId: user.stripeConnectAccountId || '',
      payoutsEnabled,
      detailsSubmitted,
      walletBalance: user.walletBalance || 0,
      totalWithdrawn: user.totalWithdrawn || 0,
      totalEarnings: user.totalEarnings || 0,
      minimumPayout,
      payouts,
    });
  } catch (error) {
    console.error('Error fetching stripe connect status:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/affiliate/stripe-connect
 * Actions: 'create_connect_account', 'dashboard_link', 'check_status', 'request_payout'
 */
export async function POST(request) {
  try {
    const decoded = getAuthenticatedUser(request);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const action = body.action || 'create_connect_account';
    const origin =
      request.headers.get('origin') ||
      request.nextUrl.origin ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://caffeloja.com';

    // 1. Action: create onboarding link / create connect account
    if (action === 'create_connect_account' || action === 'onboard') {
      let accountId = user.stripeConnectAccountId;

      // If no account yet, create one
      if (!accountId) {
        const country = user.shippingAddress?.country === 'United States' ? 'US' : 'US';
        const account = await createStripeConnectAccount({
          email: user.email,
          name: user.name,
          country,
          metadata: {
            userId: user._id.toString(),
            referralCode: user.referralCode || '',
          },
        });
        accountId = account.id;
        user.stripeConnectAccountId = accountId;
        user.payoutDetails = {
          ...user.payoutDetails,
          method: 'Stripe Connect',
        };
        await user.save();
      }

      const refreshUrl = `${origin}/user/payouts?connect=refresh`;
      const returnUrl = `${origin}/user/payouts?connect=return`;

      const accountLink = await createStripeAccountLink({
        accountId,
        refreshUrl,
        returnUrl,
        type: 'account_onboarding',
      });

      return NextResponse.json({
        success: true,
        url: accountLink.url,
        stripeConnectAccountId: accountId,
      });
    }

    // 2. Action: check status directly from Stripe
    if (action === 'check_status') {
      if (!user.stripeConnectAccountId) {
        return NextResponse.json({
          success: true,
          connected: false,
          payoutsEnabled: false,
          detailsSubmitted: false,
        });
      }

      const stripeAccount = await retrieveStripeConnectAccount(user.stripeConnectAccountId);
      const payoutsEnabled = Boolean(stripeAccount?.payouts_enabled);
      const detailsSubmitted = Boolean(stripeAccount?.details_submitted);

      user.stripeConnectPayoutsEnabled = payoutsEnabled;
      user.stripeConnectDetailsSubmitted = detailsSubmitted;
      user.stripeConnectChargesEnabled = Boolean(stripeAccount?.charges_enabled);
      await user.save();

      return NextResponse.json({
        success: true,
        connected: true,
        stripeConnectAccountId: user.stripeConnectAccountId,
        payoutsEnabled,
        detailsSubmitted,
        walletBalance: user.walletBalance || 0,
        totalWithdrawn: user.totalWithdrawn || 0,
      });
    }

    // 3. Action: dashboard login link (for users who already completed onboarding)
    if (action === 'dashboard_link') {
      if (!user.stripeConnectAccountId) {
        return NextResponse.json(
          { success: false, message: 'No Stripe Connect account found.' },
          { status: 400 }
        );
      }

      const loginLink = await createStripeLoginLink(user.stripeConnectAccountId);
      return NextResponse.json({
        success: true,
        url: loginLink.url,
      });
    }

    // 4. Action: request payout via Stripe Connect Transfer
    if (action === 'request_payout') {
      if (!user.stripeConnectAccountId) {
        return NextResponse.json(
          {
            success: false,
            message: 'Please connect your Stripe account before requesting a payout.',
          },
          { status: 400 }
        );
      }

      // Check account status with Stripe before transferring
      const stripeAccount = await retrieveStripeConnectAccount(user.stripeConnectAccountId);
      const payoutsEnabled = Boolean(stripeAccount?.payouts_enabled);
      user.stripeConnectPayoutsEnabled = payoutsEnabled;
      user.stripeConnectDetailsSubmitted = Boolean(stripeAccount?.details_submitted);
      await user.save();

      if (!payoutsEnabled) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Your Stripe Connect account onboarding is pending or incomplete. Please finish onboarding to enable payouts.',
          },
          { status: 400 }
        );
      }

      const requestedAmount = Number(body.amount) || Number(user.walletBalance || 0);
      const mlmSettings = await MLMSettings.findOne({ settingKey: 'default_mlm_config' }).lean().catch(() => null);
      const minPayout = Number(mlmSettings?.minimumPayout) || 20;

      if (requestedAmount < minPayout) {
        return NextResponse.json(
          {
            success: false,
            message: `Minimum payout request is $${minPayout.toFixed(2)}. Current balance: $${(user.walletBalance || 0).toFixed(2)}`,
          },
          { status: 400 }
        );
      }

      if (requestedAmount > (user.walletBalance || 0)) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient balance. Available: $${(user.walletBalance || 0).toFixed(2)}`,
          },
          { status: 400 }
        );
      }

      // Create Payout record
      const payout = await Payout.create({
        userId: user._id,
        userEmail: user.email,
        userName: user.name,
        amount: requestedAmount,
        currency: 'USD',
        stripeAccountId: user.stripeConnectAccountId,
        status: 'processing',
      });

      // Deduct balance
      user.walletBalance = Math.max(0, (user.walletBalance || 0) - requestedAmount);
      user.totalWithdrawn = (user.totalWithdrawn || 0) + requestedAmount;
      await user.save();

      // Execute Stripe Transfer
      try {
        const transfer = await createStripeTransfer({
          amount: requestedAmount,
          destinationAccountId: user.stripeConnectAccountId,
          description: `Caffeloja Affiliate Payout - ${user.name}`,
          metadata: {
            userId: user._id.toString(),
            payoutId: payout._id.toString(),
            userEmail: user.email,
          },
        });

        payout.status = 'paid';
        payout.stripeTransferId = transfer.id;
        await payout.save();

        return NextResponse.json({
          success: true,
          message: `Payout of $${requestedAmount.toFixed(2)} successfully sent to your connected Stripe account!`,
          payout,
          walletBalance: user.walletBalance,
          totalWithdrawn: user.totalWithdrawn,
        });
      } catch (stripeError) {
        // Rollback balance on failure
        console.error('Stripe transfer failed:', stripeError);
        user.walletBalance = (user.walletBalance || 0) + requestedAmount;
        user.totalWithdrawn = Math.max(0, (user.totalWithdrawn || 0) - requestedAmount);
        await user.save();

        payout.status = 'failed';
        payout.failureReason = stripeError.message || 'Transfer failed';
        await payout.save();

        return NextResponse.json(
          {
            success: false,
            message: `Stripe Transfer Failed: ${stripeError.message || 'Unknown error'}. Your balance has been restored.`,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in stripe connect route:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

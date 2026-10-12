import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import MLMSettings from '@/models/MLMSettings';
import { getMLMSettings } from '@/lib/mlmEngine';

export async function GET() {
  try {
    const settings = await getMLMSettings();
    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { levels, dropshipSettings, isMLMActive, minimumPayout } = body;

    let settings = await MLMSettings.findOne({ settingKey: 'default_mlm_config' });
    if (!settings) {
      settings = new MLMSettings({ settingKey: 'default_mlm_config' });
    }

    if (levels && Array.isArray(levels)) {
      settings.levels = levels.map((l) => ({
        level: Number(l.level),
        percentage: Number(l.percentage),
        label: l.label || `Level ${l.level}`,
      }));
    }

    if (dropshipSettings) {
      settings.dropshipSettings = {
        ...settings.dropshipSettings,
        ...dropshipSettings,
      };
    }

    if (typeof isMLMActive === 'boolean') {
      settings.isMLMActive = isMLMActive;
    }

    if (minimumPayout) {
      settings.minimumPayout = Number(minimumPayout);
    }

    await settings.save();

    return NextResponse.json({
      success: true,
      message: 'MLM 4-Level Commission & Dropshipping configuration updated successfully!',
      data: settings,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

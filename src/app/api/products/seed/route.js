import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Product from '@/models/Product';
import { initialProducts } from '@/data/coffeeData';

export async function POST() {
  try {
    await connectToDatabase();

    // Remove existing products and reseed
    await Product.deleteMany({});
    const inserted = await Product.insertMany(initialProducts);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with artisan coffee catalog',
      count: inserted.length,
      data: inserted,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: 'Could not connect to MongoDB to seed. Please ensure your MongoDB instance is running and MONGODB_URI is set.',
      },
      { status: 500 }
    );
  }
}

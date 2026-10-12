import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Product from '@/models/Product';
import { initialProducts } from '@/data/coffeeData';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');

  try {
    await connectToDatabase();

    const query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (featured === 'true') {
      query.isFeatured = true;
    }

    let products = await Product.find(query).sort({ isFeatured: -1, createdAt: -1 }).lean();

    // Ensure database products reflect the single Coffee Box (60 Pods) with current price and image
    if (
      products.length === 0 ||
      products.some((p) => p.slug !== 'coffee-box-60-pods' || p.price !== 110 || p.imageUrl !== '/images/coffee-box-60-pods.png')
    ) {
      await Product.deleteMany({});
      await Product.insertMany(initialProducts);
      products = await Product.find(query).sort({ isFeatured: -1 }).lean();
    }

    return NextResponse.json({
      success: true,
      source: 'mongodb',
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.warn('MongoDB query failed, falling back to static catalog:', error.message);
    
    // Graceful fallback if MongoDB is not running locally yet
    let filtered = initialProducts;
    if (category && category !== 'all') {
      filtered = filtered.filter((p) => p.category === category);
    }
    if (featured === 'true') {
      filtered = filtered.filter((p) => p.isFeatured);
    }

    return NextResponse.json({
      success: true,
      source: 'fallback',
      count: filtered.length,
      data: filtered,
      notice: 'Serving data from local cache. Connect MongoDB in .env.local to persist changes.',
    });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    if (!body.name || !body.price || !body.imageUrl) {
      return NextResponse.json(
        { success: false, message: 'Name, price, and imageUrl are required' },
        { status: 400 }
      );
    }

    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newProduct = await Product.create({
      ...body,
      slug,
    });

    return NextResponse.json(
      { success: true, message: 'Product created successfully', data: newProduct },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

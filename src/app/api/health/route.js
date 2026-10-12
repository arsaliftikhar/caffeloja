import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';

export async function GET() {
  try {
    const conn = await connectToDatabase();
    const readyState = conn.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const stateMap = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting',
    };

    return NextResponse.json({
      status: 'ok',
      service: 'caffeloja.com API',
      database: 'MongoDB',
      connectionState: stateMap[readyState] || 'Unknown',
      isConnected: readyState === 1,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'warning',
        service: 'caffeloja.com API',
        database: 'MongoDB',
        isConnected: false,
        error: error.message,
        message: 'MongoDB is configured but connection could not be established. Check MONGODB_URI in .env.local.',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}

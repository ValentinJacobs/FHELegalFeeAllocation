import { NextRequest, NextResponse } from 'next/server';

/**
 * Main FHE operations route handler
 * Provides general FHE operations and status checks
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      status: 'operational',
      endpoints: {
        encrypt: '/api/fhe/encrypt',
        decrypt: '/api/fhe/decrypt',
        compute: '/api/fhe/compute',
        keys: '/api/keys',
      },
      version: '1.0.0',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process FHE operation' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, data } = body;

    // Route to specific operation handler
    switch (operation) {
      case 'encrypt':
        return NextResponse.json({
          message: 'Use /api/fhe/encrypt endpoint',
          redirect: '/api/fhe/encrypt'
        });
      case 'decrypt':
        return NextResponse.json({
          message: 'Use /api/fhe/decrypt endpoint',
          redirect: '/api/fhe/decrypt'
        });
      case 'compute':
        return NextResponse.json({
          message: 'Use /api/fhe/compute endpoint',
          redirect: '/api/fhe/compute'
        });
      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

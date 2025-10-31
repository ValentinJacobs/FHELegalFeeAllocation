import { NextRequest, NextResponse } from 'next/server';

/**
 * Encryption API endpoint
 * Handles encryption of various data types for FHE operations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { value, type, contractAddress, userAddress } = body;

    // Validate required fields
    if (!value || !type || !contractAddress || !userAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: value, type, contractAddress, userAddress' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['uint8', 'uint16', 'uint32', 'uint64', 'bool', 'address'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Note: In a real implementation, encryption would happen on the client side
    // using the @fhevm/sdk. This endpoint can be used for server-side validation
    // or additional processing if needed.

    return NextResponse.json({
      success: true,
      message: 'Encryption should be performed client-side using @fhevm/sdk',
      example: {
        code: `
const client = await FhevmClient.create({ provider, network });
const input = client.createEncryptedInput(contractAddress, userAddress);
input.add${type.charAt(0).toUpperCase() + type.slice(1)}(${value});
const encrypted = input.encrypt();
        `.trim(),
      },
      data: {
        type,
        value,
        contractAddress,
        userAddress,
      },
    });
  } catch (error) {
    console.error('Encryption error:', error);
    return NextResponse.json(
      { error: 'Failed to process encryption request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/fhe/encrypt',
    method: 'POST',
    description: 'Encrypt data for FHE operations (client-side encryption recommended)',
    requiredFields: {
      value: 'The value to encrypt',
      type: 'Data type: uint8, uint16, uint32, uint64, bool, address',
      contractAddress: 'Target contract address',
      userAddress: 'User wallet address',
    },
    example: {
      value: 100,
      type: 'uint32',
      contractAddress: '0x...',
      userAddress: '0x...',
    },
  });
}

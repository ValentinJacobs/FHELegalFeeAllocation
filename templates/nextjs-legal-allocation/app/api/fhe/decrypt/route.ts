import { NextRequest, NextResponse } from 'next/server';

/**
 * Decryption API endpoint
 * Handles decryption of FHE encrypted data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { handle, type, contractAddress, userAddress, isPublic } = body;

    // Validate required fields
    if (!handle || !type || !contractAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: handle, type, contractAddress' },
        { status: 400 }
      );
    }

    // For user decrypt, userAddress is required
    if (!isPublic && !userAddress) {
      return NextResponse.json(
        { error: 'userAddress is required for user decryption' },
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

    // Note: In a real implementation, decryption happens on the client side
    // using the @fhevm/sdk with EIP-712 signature for user decryption

    const decryptMethod = isPublic ? 'publicDecrypt' : 'decrypt';

    return NextResponse.json({
      success: true,
      message: 'Decryption should be performed client-side using @fhevm/sdk',
      example: {
        code: `
const client = await FhevmClient.create({ provider, network });
${isPublic
  ? `const value = await client.publicDecrypt.${type}(handle);`
  : `const value = await client.decrypt.${type}(handle, contractAddress, userAddress);`
}
        `.trim(),
      },
      data: {
        handle,
        type,
        contractAddress,
        userAddress: isPublic ? undefined : userAddress,
        decryptMethod,
      },
    });
  } catch (error) {
    console.error('Decryption error:', error);
    return NextResponse.json(
      { error: 'Failed to process decryption request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/fhe/decrypt',
    method: 'POST',
    description: 'Decrypt FHE encrypted data (client-side decryption recommended)',
    requiredFields: {
      handle: 'Encrypted data handle',
      type: 'Data type: uint8, uint16, uint32, uint64, bool, address',
      contractAddress: 'Contract address',
      userAddress: 'User wallet address (required for user decrypt, optional for public decrypt)',
      isPublic: 'Boolean: true for public decrypt, false for user decrypt (requires EIP-712 signature)',
    },
    example: {
      handle: '0x...',
      type: 'uint32',
      contractAddress: '0x...',
      userAddress: '0x...',
      isPublic: false,
    },
  });
}

import { NextRequest, NextResponse } from 'next/server';

/**
 * Homomorphic Computation API endpoint
 * Provides information about FHE computation operations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, operands, contractAddress } = body;

    // Validate required fields
    if (!operation || !operands || !contractAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: operation, operands, contractAddress' },
        { status: 400 }
      );
    }

    // Validate operation
    const validOperations = [
      'add', 'sub', 'mul', 'div',
      'eq', 'ne', 'lt', 'gt', 'lte', 'gte',
      'and', 'or', 'xor', 'not',
      'min', 'max', 'select'
    ];

    if (!validOperations.includes(operation)) {
      return NextResponse.json(
        { error: `Invalid operation. Must be one of: ${validOperations.join(', ')}` },
        { status: 400 }
      );
    }

    // Note: Homomorphic computations are performed by the smart contract
    // This endpoint provides information and validation

    return NextResponse.json({
      success: true,
      message: 'Homomorphic computations are performed on-chain by smart contracts',
      operation,
      operands,
      contractAddress,
      info: {
        description: 'FHE operations allow computations on encrypted data without decryption',
        supportedOperations: {
          arithmetic: ['add', 'sub', 'mul', 'div'],
          comparison: ['eq', 'ne', 'lt', 'gt', 'lte', 'gte'],
          logical: ['and', 'or', 'xor', 'not'],
          other: ['min', 'max', 'select'],
        },
        example: `
// In your smart contract
euint32 encrypted1 = TFHE.asEuint32(input1);
euint32 encrypted2 = TFHE.asEuint32(input2);
euint32 result = TFHE.add(encrypted1, encrypted2); // Homomorphic addition
        `.trim(),
      },
    });
  } catch (error) {
    console.error('Computation error:', error);
    return NextResponse.json(
      { error: 'Failed to process computation request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/fhe/compute',
    method: 'POST',
    description: 'Information about FHE homomorphic computation operations',
    operations: {
      arithmetic: {
        description: 'Arithmetic operations on encrypted numbers',
        operations: ['add', 'sub', 'mul', 'div'],
        example: 'TFHE.add(euint32 a, euint32 b)',
      },
      comparison: {
        description: 'Comparison operations returning encrypted booleans',
        operations: ['eq', 'ne', 'lt', 'gt', 'lte', 'gte'],
        example: 'TFHE.lt(euint32 a, euint32 b)',
      },
      logical: {
        description: 'Logical operations on encrypted booleans',
        operations: ['and', 'or', 'xor', 'not'],
        example: 'TFHE.and(ebool a, ebool b)',
      },
      other: {
        description: 'Other useful operations',
        operations: ['min', 'max', 'select'],
        example: 'TFHE.select(ebool condition, euint32 a, euint32 b)',
      },
    },
    note: 'All computations are performed on-chain in smart contracts using Zama\'s TFHE library',
  });
}

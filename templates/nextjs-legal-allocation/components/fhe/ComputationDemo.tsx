'use client';

import React, { useState } from 'react';

/**
 * ComputationDemo - Component demonstrating FHE computations
 * Shows information about homomorphic operations on encrypted data
 */
export function ComputationDemo() {
  const [selectedOperation, setSelectedOperation] = useState('add');

  const operations = {
    arithmetic: {
      title: 'Arithmetic Operations',
      ops: [
        { id: 'add', name: 'Addition', example: 'TFHE.add(a, b)', description: 'Add two encrypted numbers' },
        { id: 'sub', name: 'Subtraction', example: 'TFHE.sub(a, b)', description: 'Subtract encrypted numbers' },
        { id: 'mul', name: 'Multiplication', example: 'TFHE.mul(a, b)', description: 'Multiply encrypted numbers' },
        { id: 'div', name: 'Division', example: 'TFHE.div(a, b)', description: 'Divide encrypted numbers' },
      ],
    },
    comparison: {
      title: 'Comparison Operations',
      ops: [
        { id: 'eq', name: 'Equal', example: 'TFHE.eq(a, b)', description: 'Check if encrypted values are equal' },
        { id: 'ne', name: 'Not Equal', example: 'TFHE.ne(a, b)', description: 'Check if encrypted values are not equal' },
        { id: 'lt', name: 'Less Than', example: 'TFHE.lt(a, b)', description: 'Check if a < b' },
        { id: 'gt', name: 'Greater Than', example: 'TFHE.gt(a, b)', description: 'Check if a > b' },
        { id: 'lte', name: 'Less Than or Equal', example: 'TFHE.lte(a, b)', description: 'Check if a <= b' },
        { id: 'gte', name: 'Greater Than or Equal', example: 'TFHE.gte(a, b)', description: 'Check if a >= b' },
      ],
    },
    logical: {
      title: 'Logical Operations',
      ops: [
        { id: 'and', name: 'AND', example: 'TFHE.and(a, b)', description: 'Logical AND on encrypted booleans' },
        { id: 'or', name: 'OR', example: 'TFHE.or(a, b)', description: 'Logical OR on encrypted booleans' },
        { id: 'xor', name: 'XOR', example: 'TFHE.xor(a, b)', description: 'Logical XOR on encrypted booleans' },
        { id: 'not', name: 'NOT', example: 'TFHE.not(a)', description: 'Logical NOT on encrypted boolean' },
      ],
    },
    other: {
      title: 'Other Operations',
      ops: [
        { id: 'min', name: 'Minimum', example: 'TFHE.min(a, b)', description: 'Return minimum of two encrypted values' },
        { id: 'max', name: 'Maximum', example: 'TFHE.max(a, b)', description: 'Return maximum of two encrypted values' },
        { id: 'select', name: 'Select', example: 'TFHE.select(cond, a, b)', description: 'Select a or b based on encrypted condition' },
      ],
    },
  };

  const findOperation = (opId: string) => {
    for (const category of Object.values(operations)) {
      const op = category.ops.find((o) => o.id === opId);
      if (op) return op;
    }
    return null;
  };

  const selectedOp = findOperation(selectedOperation);

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Homomorphic Computation Demo</h2>

      <div className="mb-6">
        <p className="text-gray-700 mb-4">
          FHE allows computations directly on encrypted data without decryption.
          All operations are performed on-chain using Zama's TFHE library.
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(operations).map(([key, category]) => (
          <div key={key}>
            <h3 className="text-lg font-semibold mb-3">{category.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {category.ops.map((op) => (
                <button
                  key={op.id}
                  onClick={() => setSelectedOperation(op.id)}
                  className={`p-3 border rounded text-left transition-colors ${
                    selectedOperation === op.id
                      ? 'bg-blue-100 border-blue-500'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{op.name}</div>
                  <div className="text-sm text-gray-600">{op.description}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedOp && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">Selected Operation: {selectedOp.name}</h3>
          <p className="text-sm text-gray-700 mb-3">{selectedOp.description}</p>
          <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
            {selectedOp.example}
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <p><strong>Note:</strong> This operation is performed on-chain in your smart contract.</p>
            <p>The inputs and outputs remain encrypted throughout the computation.</p>
          </div>
        </div>
      )}
    </div>
  );
}

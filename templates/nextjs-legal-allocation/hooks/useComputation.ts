'use client';

import { useState, useCallback } from 'react';
import { ComputationOperation } from '../lib/fhe/types';

/**
 * useComputation - Hook for FHE computation information
 * Provides information about available homomorphic operations
 */
export function useComputation() {
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);

  const operations: Record<string, ComputationOperation[]> = {
    arithmetic: [
      {
        operation: 'add',
        operands: ['a', 'b'],
        description: 'Add two encrypted numbers: TFHE.add(a, b)',
      },
      {
        operation: 'sub',
        operands: ['a', 'b'],
        description: 'Subtract encrypted numbers: TFHE.sub(a, b)',
      },
      {
        operation: 'mul',
        operands: ['a', 'b'],
        description: 'Multiply encrypted numbers: TFHE.mul(a, b)',
      },
      {
        operation: 'div',
        operands: ['a', 'b'],
        description: 'Divide encrypted numbers: TFHE.div(a, b)',
      },
    ],
    comparison: [
      {
        operation: 'eq',
        operands: ['a', 'b'],
        description: 'Check equality: TFHE.eq(a, b)',
      },
      {
        operation: 'ne',
        operands: ['a', 'b'],
        description: 'Check inequality: TFHE.ne(a, b)',
      },
      {
        operation: 'lt',
        operands: ['a', 'b'],
        description: 'Less than: TFHE.lt(a, b)',
      },
      {
        operation: 'gt',
        operands: ['a', 'b'],
        description: 'Greater than: TFHE.gt(a, b)',
      },
      {
        operation: 'lte',
        operands: ['a', 'b'],
        description: 'Less than or equal: TFHE.lte(a, b)',
      },
      {
        operation: 'gte',
        operands: ['a', 'b'],
        description: 'Greater than or equal: TFHE.gte(a, b)',
      },
    ],
    logical: [
      {
        operation: 'and',
        operands: ['a', 'b'],
        description: 'Logical AND: TFHE.and(a, b)',
      },
      {
        operation: 'or',
        operands: ['a', 'b'],
        description: 'Logical OR: TFHE.or(a, b)',
      },
      {
        operation: 'xor',
        operands: ['a', 'b'],
        description: 'Logical XOR: TFHE.xor(a, b)',
      },
      {
        operation: 'not',
        operands: ['a'],
        description: 'Logical NOT: TFHE.not(a)',
      },
    ],
    other: [
      {
        operation: 'min',
        operands: ['a', 'b'],
        description: 'Minimum: TFHE.min(a, b)',
      },
      {
        operation: 'max',
        operands: ['a', 'b'],
        description: 'Maximum: TFHE.max(a, b)',
      },
      {
        operation: 'select',
        operands: ['condition', 'a', 'b'],
        description: 'Select based on condition: TFHE.select(condition, a, b)',
      },
    ],
  };

  const getAllOperations = useCallback((): ComputationOperation[] => {
    return Object.values(operations).flat();
  }, []);

  const getOperationsByCategory = useCallback(
    (category: string): ComputationOperation[] => {
      return operations[category] || [];
    },
    []
  );

  const getOperation = useCallback(
    (operationName: string): ComputationOperation | undefined => {
      return getAllOperations().find((op) => op.operation === operationName);
    },
    [getAllOperations]
  );

  const selectOperation = useCallback((operationName: string) => {
    setSelectedOperation(operationName);
  }, []);

  return {
    operations,
    selectedOperation,
    selectOperation,
    getAllOperations,
    getOperationsByCategory,
    getOperation,
  };
}

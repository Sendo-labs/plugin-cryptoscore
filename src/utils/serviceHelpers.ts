import type { IAgentRuntime } from '@elizaos/core';
import { CryptoScoreService, CRYPTOSCORE_SERVICE_NAME } from '../services/cryptoScoreService.js';

/**
 * Initialize and validate CryptoScore service
 */
export async function initializeCryptoScoreService(runtime: IAgentRuntime): Promise<CryptoScoreService> {
  const service = runtime.getService(CRYPTOSCORE_SERVICE_NAME) as CryptoScoreService;

  if (!service) {
    throw new Error('CryptoScore service not available');
  }

  return service;
}

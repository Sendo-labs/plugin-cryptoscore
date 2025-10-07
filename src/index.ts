import { Plugin, logger } from '@elizaos/core';
import { CryptoScoreService } from './services/cryptoScoreService.js';
import { getTokenScoreAction, getWalletScoresAction } from './actions/index.js';

export * from './types/index.js';
export { CryptoScoreService };

/**
 * CryptoScore plugin for ElizaOS
 *
 * Provides cryptocurrency token gauges and fundamental analysis
 * through the CryptoScore API integration.
 */
export const cryptoScorePlugin: Plugin = {
  name: 'plugin-cryptoscore',
  description: 'CryptoScore integration for token gauges and fundamental analysis',

  actions: [getWalletScoresAction, getTokenScoreAction],
  providers: [],
  evaluators: [],
  services: [CryptoScoreService],

  init: async (config: Record<string, string>): Promise<void> => {
    logger.info('Initializing CryptoScore plugin');

    // Validate API key is present
    const apiKey = config.CRYPTOSCORE_API_KEY || process.env.CRYPTOSCORE_API_KEY;
    if (!apiKey) {
      logger.warn('CRYPTOSCORE_API_KEY not provided - CryptoScore functionality will be unavailable');
      return;
    }

    logger.info('CryptoScore plugin initialized successfully');
  },
};

export default cryptoScorePlugin;

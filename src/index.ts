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

  init: async (_config: Record<string, string>): Promise<void> => {
    logger.info('Initializing CryptoScore plugin');
    // Note: API key validation is done in the Service constructor via runtime.getSetting()
    // The init function doesn't have access to character secrets, only process.env
    logger.info('CryptoScore plugin initialized successfully');
  },
};

export default cryptoScorePlugin;

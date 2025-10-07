import {
  Action,
  ActionResult,
  HandlerCallback,
  IAgentRuntime,
  logger,
  Memory,
  ModelType,
  State,
} from '@elizaos/core';
import { initializeCryptoScoreService } from '../utils/index.js';
import { walletScoresResponsePrompt } from '../templates/index.js';
import type { TokenScore } from '../types/index.js';

// Solana wallet cache key (from @elizaos/plugin-solana)
const SOLANA_WALLET_DATA_CACHE_KEY = 'solana/walletData';

interface WalletPortfolio {
  totalUsd: string;
  totalSol: string;
  items: Array<{
    name: string;
    symbol: string;
    address: string;
    balance: string;
    uiAmount: string;
    priceUsd: string;
    valueUsd: string;
  }>;
}

export const getWalletScoresAction: Action = {
  name: 'GET_WALLET_CRYPTOSCORES',
  similes: [
    'ANALYZE_WALLET',
    'WALLET_ANALYSIS',
    'PORTFOLIO_ANALYSIS',
    'MY_WALLET',
    'MY_PORTFOLIO',
    'MY_TOKENS',
    'ALL_MY_TOKENS',
    'WALLET_OVERVIEW',
    'PORTFOLIO_OVERVIEW',
  ],
  description: 'Get CryptoScore gauges and fundamental analysis for all tokens in the user Solana wallet.',

  validate: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state?: State,
  ): Promise<boolean> => {
    logger.info('[GET_WALLET_CRYPTOSCORES] Validate called with message:', message.content.text);

    // Check if Solana wallet data is available
    const walletData = await runtime.getCache<WalletPortfolio>(SOLANA_WALLET_DATA_CACHE_KEY);

    logger.info(`[GET_WALLET_CRYPTOSCORES] Wallet data exists: ${!!walletData}`);
    if (walletData) {
      logger.info(`[GET_WALLET_CRYPTOSCORES] Wallet has ${walletData.items.length} tokens`);
    }

    const isValid = !!walletData && walletData.items.length > 0;
    logger.info(`[GET_WALLET_CRYPTOSCORES] Validate result: ${isValid}`);

    return isValid;
  },

  handler: async (
    runtime: IAgentRuntime,
    _message: Memory,
    _state?: State,
    _options?: { [key: string]: unknown },
    _callback?: HandlerCallback,
  ): Promise<ActionResult> => {
    try {
      logger.info('[GET_WALLET_CRYPTOSCORES] Starting wallet scores fetch');

      // Initialize CryptoScore service
      const cryptoScoreService = await initializeCryptoScoreService(runtime);

      // Get wallet data from Solana plugin
      const walletData = await runtime.getCache<WalletPortfolio>(SOLANA_WALLET_DATA_CACHE_KEY);

      if (!walletData || walletData.items.length === 0) {
        const errorText = "Aucun token trouvé dans votre wallet Solana.";

        if (_callback) {
          _callback({
            text: errorText,
            content: { success: false },
          });
        }

        return {
          success: false,
          text: errorText,
        };
      }

      logger.info(`[GET_WALLET_CRYPTOSCORES] Found ${walletData.items.length} tokens in wallet`);

      // Extract token symbols
      const tokenSymbols = walletData.items
        .map(item => item.symbol.toLowerCase())
        .filter(symbol => symbol && symbol !== 'unknown');

      if (tokenSymbols.length === 0) {
        const errorText = "Aucun symbole de token valide trouvé dans votre wallet.";

        if (_callback) {
          _callback({
            text: errorText,
            content: { success: false },
          });
        }

        return {
          success: false,
          text: errorText,
        };
      }

      // Fetch scores for all tokens
      const scores: TokenScore[] = [];
      const notFound: string[] = [];

      for (const symbol of tokenSymbols) {
        const response = await cryptoScoreService.searchToken(symbol);
        if (response) {
          scores.push(cryptoScoreService.formatTokenScore(response));
        } else {
          notFound.push(symbol.toUpperCase());
        }
      }

      logger.info(`[GET_WALLET_CRYPTOSCORES] Retrieved scores for ${scores.length}/${tokenSymbols.length} tokens`);

      // Use LLM to generate natural response
      const prompt = walletScoresResponsePrompt({
        scores,
        notFound,
        totalTokens: tokenSymbols.length,
      });

      const llmResponse = await runtime.useModel(ModelType.TEXT_LARGE, {
        prompt: prompt,
      });

      const responseText = llmResponse || 'Analyse CryptoScore de votre wallet complétée.';

      if (_callback) {
        _callback({
          text: responseText,
          content: {
            success: true,
            data: {
              totalTokens: tokenSymbols.length,
              analyzedTokens: scores.length,
              notFoundTokens: notFound,
              scores,
            },
          },
        });
      }

      return {
        success: true,
        text: responseText,
        data: {
          totalTokens: tokenSymbols.length,
          analyzedTokens: scores.length,
          notFoundTokens: notFound,
          scores,
        },
      };
    } catch (error) {
      logger.error('[GET_WALLET_CRYPTOSCORES] Error:', error instanceof Error ? error.message : String(error));
      const errorText = `Erreur lors de l'analyse du wallet: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;

      if (_callback) {
        _callback({
          text: errorText,
          content: { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' },
        });
      }

      return {
        success: false,
        text: errorText,
      };
    }
  },

  examples: [
    [
      {
        name: '{{user1}}',
        content: { text: 'Analyse les scores de mes tokens' },
      },
      {
        name: '{{agent}}',
        content: {
          text: '**Analyse CryptoScore de votre wallet**\n\n📊 **Score moyen du portefeuille**:\n• Global Gauge: 85.2/100\n• Fundamental Score: 68/100\n\n✅ **Excellents scores** (≥80):\n• SOL - Global: 88.9 | Fundamental: 66\n• USDC - Global: 94.2 | Fundamental: 83',
          action: 'GET_WALLET_CRYPTOSCORES',
        },
      },
    ],
  ],
};

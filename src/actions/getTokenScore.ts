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
import { parseLLMJson, initializeCryptoScoreService } from '../utils/index.js';
import { extractTokenPrompt, tokenScoreResponsePrompt } from '../templates/index.js';
import type { ExtractTokenResponse, TokenScore } from '../types/index.js';

export const getTokenScoreAction: Action = {
  name: 'GET_TOKEN_CRYPTOSCORE',
  similes: [
    'TOKEN_SCORE',
    'CRYPTO_SCORE',
    'TOKEN_GAUGE',
    'TOKEN_ANALYSIS',
    'TOKEN_RATING',
    'SCORE_TOKEN',
    'GAUGE_TOKEN',
  ],
  description: 'Get CryptoScore gauges and fundamental analysis for one or more specific cryptocurrency tokens.',

  validate: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state?: State,
  ): Promise<boolean> => {
    // Similes already handle action matching
    return true;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state?: State,
    _options?: { [key: string]: unknown },
    _callback?: HandlerCallback,
  ): Promise<ActionResult> => {
    try {
      logger.info('[GET_TOKEN_CRYPTOSCORE] Starting token score fetch');

      // Initialize CryptoScore service
      const cryptoScoreService = await initializeCryptoScoreService(runtime);

      const userQuery = message.content.text || '';

      // Use LLM to extract tokens from user query
      const prompt = extractTokenPrompt({ userRequest: userQuery });
      const llmResponse = await runtime.useModel(ModelType.TEXT_LARGE, {
        prompt: prompt,
      });

      let tokenSymbols: string[] = [];

      if (llmResponse) {
        const parsed = parseLLMJson<ExtractTokenResponse>(llmResponse);

        if (parsed && parsed.tokens && Array.isArray(parsed.tokens)) {
          tokenSymbols = parsed.tokens.map(t => t.toLowerCase());
          logger.info(`[GET_TOKEN_CRYPTOSCORE] LLM extracted tokens: ${tokenSymbols.join(', ')} (confidence: ${parsed.confidence})`);
        } else {
          logger.warn('[GET_TOKEN_CRYPTOSCORE] LLM response missing tokens field');
        }
      } else {
        logger.warn('[GET_TOKEN_CRYPTOSCORE] No LLM response received');
      }

      if (tokenSymbols.length === 0) {
        const errorText = "Je n'ai pas pu identifier les tokens à analyser. Pouvez-vous préciser les symboles ? (ex: SOL, ETH, USDC)";

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

      logger.info(`[GET_TOKEN_CRYPTOSCORE] Fetching scores for: ${tokenSymbols.join(', ')}`);

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

      if (scores.length === 0) {
        const errorText = `Aucun des tokens demandés (${tokenSymbols.map(t => t.toUpperCase()).join(', ')}) n'a été trouvé dans la base CryptoScore.`;

        if (_callback) {
          _callback({
            text: errorText,
            content: { success: false, notFound: tokenSymbols },
          });
        }

        return {
          success: false,
          text: errorText,
        };
      }

      logger.info(`[GET_TOKEN_CRYPTOSCORE] Successfully retrieved ${scores.length}/${tokenSymbols.length} scores`);

      // Use LLM to generate natural response
      const responsePrompt = tokenScoreResponsePrompt({ scores, notFound });
      const formattedResponse = await runtime.useModel(ModelType.TEXT_LARGE, {
        prompt: responsePrompt,
      });

      const responseText = formattedResponse || `Scores CryptoScore récupérés pour ${scores.length} token(s).`;

      if (_callback) {
        _callback({
          text: responseText,
          content: {
            success: true,
            data: {
              scores,
              notFound,
              totalRequested: tokenSymbols.length,
            },
          },
        });
      }

      return {
        success: true,
        text: responseText,
        data: {
          scores,
          notFound,
          totalRequested: tokenSymbols.length,
        },
      };
    } catch (error) {
      logger.error('[GET_TOKEN_CRYPTOSCORE] Error:', error instanceof Error ? error.message : String(error));
      const errorText = `Erreur lors de la récupération du score CryptoScore: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;

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
        content: { text: 'Donne-moi le score CryptoScore de SOL' },
      },
      {
        name: '{{agent}}',
        content: {
          text: '**Solana (SOL)**\n\n📊 **Fundamental Score**: 66/100\n\n**Gauges** (0-100):\n• Global: 88.9\n• Community: 99.2\n• Liquidity: 94.3\n• Momentum: 100.0\n• Security: 99.5\n• Technology: 68.5\n• Tokenomics: 71.8',
          action: 'GET_TOKEN_CRYPTOSCORE',
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: { text: 'Analyse le token USDC' },
      },
      {
        name: '{{agent}}',
        content: {
          text: '**USDC (USDC)**\n\n📊 **Fundamental Score**: 83/100\n\n**Gauges** (0-100):\n• Global: 94.2\n• Community: 98.3\n• Liquidity: 88.4\n• Momentum: 92.2\n• Security: 99.9\n• Technology: 89.3\n• Tokenomics: 97.1',
          action: 'GET_TOKEN_CRYPTOSCORE',
        },
      },
    ],
  ],
};

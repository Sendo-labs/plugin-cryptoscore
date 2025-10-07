import { Service, IAgentRuntime, logger } from '@elizaos/core';
import type {
  CryptoScoreConfig,
  GaugeResponse,
  TokenScore,
} from '../types/index.js';
import { getCryptoScoreConfig, CRYPTOSCORE_DEFAULTS } from '../config/index.js';

export const CRYPTOSCORE_SERVICE_NAME = 'cryptoscore';

export class CryptoScoreService extends Service {
  static serviceType = CRYPTOSCORE_SERVICE_NAME;
  private cryptoConfig: CryptoScoreConfig;

  /**
   * Service capability description
   */
  get capabilityDescription(): string {
    return 'CryptoScore service that provides token gauges and fundamental analysis for cryptocurrencies';
  }

  constructor(runtime: IAgentRuntime) {
    super(runtime);

    const config = getCryptoScoreConfig(runtime);

    if (!config) {
      throw new Error('CRYPTOSCORE_API_KEY is required in environment variables');
    }

    this.cryptoConfig = config;

    logger.info(`CryptoScore service initialized with baseUrl: ${this.cryptoConfig.baseUrl}`);
  }

  static async start(runtime: IAgentRuntime): Promise<CryptoScoreService> {
    logger.info('Starting CryptoScore service');
    const service = new CryptoScoreService(runtime);
    return service;
  }

  static async stop(_runtime: IAgentRuntime): Promise<void> {
    logger.info('Stopping CryptoScore service');
  }

  async stop(): Promise<void> {
    logger.info('CryptoScoreService stopped');
  }

  /**
   * Search for a token's gauge data by symbol or name
   */
  async searchToken(query: string): Promise<GaugeResponse | null> {
    try {
      const url = `${this.cryptoConfig.baseUrl}/gauges/v1/search?q=${encodeURIComponent(query)}`;

      // HTTP Basic Auth with API key as username, empty password
      const auth = Buffer.from(`${this.cryptoConfig.apiKey}:`).toString('base64');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        logger.warn(`Token not found in CryptoScore: ${query}`);
        return null;
      }

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`CryptoScore API error: ${response.status} - ${errorText}`);
        return null;
      }

      const data: GaugeResponse = await response.json();
      logger.info(`CryptoScore data retrieved for ${query}: ${data.symbol} (${data.name}) - Global Gauge: ${data.gauges.global_gauge}`);

      return data;
    } catch (error) {
      logger.error(`Error fetching CryptoScore data for ${query}:`, error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  /**
   * Convert GaugeResponse to simplified TokenScore format
   */
  formatTokenScore(response: GaugeResponse): TokenScore {
    return {
      symbol: response.symbol,
      name: response.name,
      fundamentalScore: response.scores.scoringFundamental.fundamental_score,
      globalGauge: response.gauges.global_gauge,
      communityGauge: response.gauges.community_gauge,
      liquidityGauge: response.gauges.liquidity_gauge,
      momentumGauge: response.gauges.momentum_gauge,
      securityGauge: response.gauges.security_gauge,
      technologyGauge: response.gauges.technology_gauge,
      tokenomicsGauge: response.gauges.tokenomics_gauge,
      cgId: response.cgId,
      cmcId: response.cmcId,
    };
  }

  /**
   * Get scores for multiple tokens
   */
  async searchMultipleTokens(queries: string[]): Promise<TokenScore[]> {
    const results: TokenScore[] = [];

    for (const query of queries) {
      const response = await this.searchToken(query);
      if (response) {
        results.push(this.formatTokenScore(response));
      }
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, CRYPTOSCORE_DEFAULTS.RATE_LIMIT_DELAY));
    }

    return results;
  }
}

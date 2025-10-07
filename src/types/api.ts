/**
 * CryptoScore API types based on OpenAPI schema
 */

export interface CryptoScoreConfig {
  apiKey: string;
  baseUrl: string;
}

export interface GaugeSearchParams {
  q: string;
}

export interface ScoringFundamental {
  fundamental_score: number;
}

export interface Scores {
  scoringFundamental: ScoringFundamental;
}

export interface Gauges {
  global_gauge: number;
  community_gauge: number;
  liquidity_gauge: number;
  momentum_gauge: number;
  security_gauge: number;
  technology_gauge: number;
  tokenomics_gauge: number;
}

export interface GaugeResponse {
  name: string;
  symbol: string;
  cgId: string;
  cmcId: string;
  scores: Scores;
  gauges: Gauges;
}

export interface TokenScore {
  symbol: string;
  name: string;
  fundamentalScore: number;
  globalGauge: number;
  communityGauge: number;
  liquidityGauge: number;
  momentumGauge: number;
  securityGauge: number;
  technologyGauge: number;
  tokenomicsGauge: number;
  cgId: string;
  cmcId: string;
}

export interface WalletScoresResult {
  totalTokens: number;
  analyzedTokens: number;
  notFoundTokens: string[];
  averageScore: number;
  scores: TokenScore[];
}
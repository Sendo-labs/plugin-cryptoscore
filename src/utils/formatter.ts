import type { TokenScore } from '../types/index.js';

/**
 * Format a single token score for display
 */
export function formatTokenScore(score: TokenScore): string {
  const lines: string[] = [];

  lines.push(`**${score.name} (${score.symbol.toUpperCase()})**`);
  lines.push('');
  lines.push(`📊 **Fundamental Score**: ${score.fundamentalScore}/100`);
  lines.push('');
  lines.push('**Gauges** (0-100):');
  lines.push(`• Global: ${score.globalGauge.toFixed(1)}`);
  lines.push(`• Community: ${score.communityGauge.toFixed(1)}`);
  lines.push(`• Liquidity: ${score.liquidityGauge.toFixed(1)}`);
  lines.push(`• Momentum: ${score.momentumGauge.toFixed(1)}`);
  lines.push(`• Security: ${score.securityGauge.toFixed(1)}`);

  if (score.technologyGauge !== null) {
    lines.push(`• Technology: ${score.technologyGauge.toFixed(1)}`);
  } else {
    lines.push(`• Technology: N/A`);
  }

  lines.push(`• Tokenomics: ${score.tokenomicsGauge.toFixed(1)}`);
  lines.push('');
  lines.push(`*CoinGecko ID: ${score.cgId}*`);

  return lines.join('\n');
}

/**
 * Get score category label (Excellent, Good, Average, Poor)
 */
export function getScoreCategory(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Average';
  return 'Poor';
}

/**
 * Get score emoji
 */
export function getScoreEmoji(score: number): string {
  if (score >= 80) return '✅';
  if (score >= 65) return '👍';
  if (score >= 50) return '⚠️';
  return '❌';
}

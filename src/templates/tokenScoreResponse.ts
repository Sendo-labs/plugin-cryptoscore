import type { TokenScore } from '../types/index.js';

export const tokenScoreResponsePrompt = ({
  scores,
  notFound,
}: {
  scores: TokenScore[];
  notFound?: string[];
}) => {
  const isSingleToken = scores.length === 1 && (!notFound || notFound.length === 0);

  if (isSingleToken) {
    const score = scores[0];
    return `## TOKEN CRYPTOSCORE ANALYSIS REQUEST

## TOKEN INFORMATION
- Name: ${score.name}
- Symbol: ${score.symbol.toUpperCase()}
- CoinGecko ID: ${score.cgId}
- CMC ID: ${score.cmcId}

## FUNDAMENTAL SCORE
- Score: ${score.fundamentalScore}/100

## GAUGES (0-100 scale)
- Global Gauge: ${score.globalGauge.toFixed(1)}
- Community Gauge: ${score.communityGauge.toFixed(1)}
- Liquidity Gauge: ${score.liquidityGauge.toFixed(1)}
- Momentum Gauge: ${score.momentumGauge.toFixed(1)}
- Security Gauge: ${score.securityGauge.toFixed(1)}
- Technology Gauge: ${score.technologyGauge !== null ? score.technologyGauge.toFixed(1) : 'N/A'}
- Tokenomics Gauge: ${score.tokenomicsGauge.toFixed(1)}

## INSTRUCTIONS
Provide a natural, conversational analysis of this token based on the CryptoScore data above.

RESPONSE GUIDELINES:
- Start with the token name and fundamental score
- Present the gauges in an organized, readable format
- Highlight the strongest metrics (highest scores)
- Mention any weak points if relevant (low scores)
- If technology gauge is N/A, briefly note it
- Use markdown formatting for structure (bold for headers, bullet points for lists)
- Use appropriate emojis sparingly (📊 for scores, ✅ for high scores, ⚠️ for low ones)
- Keep it concise but informative (4-8 lines total)

DO NOT:
- Simply repeat the numbers without context
- Be overly technical
- Give financial advice
- Make predictions about price`;
  }

  // Multiple tokens comparison
  return `## MULTI-TOKEN CRYPTOSCORE ANALYSIS REQUEST

## ANALYZED TOKENS
Total requested: ${scores.length + (notFound?.length || 0)}
Successfully analyzed: ${scores.length}
Not found: ${notFound?.length || 0}

## TOKEN SCORES DATA

${scores.map(score => `
### ${score.name} (${score.symbol.toUpperCase()})
- Fundamental Score: ${score.fundamentalScore}/100
- Global Gauge: ${score.globalGauge.toFixed(1)}/100
- Community: ${score.communityGauge.toFixed(1)}
- Liquidity: ${score.liquidityGauge.toFixed(1)}
- Momentum: ${score.momentumGauge.toFixed(1)}
- Security: ${score.securityGauge.toFixed(1)}
- Technology: ${score.technologyGauge !== null ? score.technologyGauge.toFixed(1) : 'N/A'}
- Tokenomics: ${score.tokenomicsGauge.toFixed(1)}
`).join('\n')}

${notFound && notFound.length > 0 ? `\n## TOKENS NOT FOUND\n${notFound.join(', ')}` : ''}

## INSTRUCTIONS
Provide a natural, conversational comparison of these tokens based on the CryptoScore data above.

RESPONSE GUIDELINES:
- Compare the tokens highlighting key differences
- Identify the strongest performer overall (highest global gauge)
- Mention standout metrics for each token
- If comparing 2-3 tokens, provide detailed comparison
- If comparing 4+ tokens, group by performance tiers (excellent/good/average)
- Use markdown formatting and appropriate emojis
- Be concise but informative
- If tokens weren't found, mention them at the end

DO NOT:
- Simply list the numbers without context
- Give financial advice or investment recommendations
- Make price predictions`;
};

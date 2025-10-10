import type { TokenScore } from '../types/index.js';

export const walletScoresResponsePrompt = ({
  scores,
  notFound,
  totalTokens,
}: {
  scores: TokenScore[];
  notFound: string[];
  totalTokens: number;
}) => {
  // Calculate averages
  const avgGlobal = scores.length > 0
    ? (scores.reduce((sum, s) => sum + s.globalGauge, 0) / scores.length).toFixed(1)
    : '0';
  const avgFundamental = scores.length > 0
    ? Math.round(scores.reduce((sum, s) => sum + s.fundamentalScore, 0) / scores.length)
    : 0;

  // Categorize tokens
  const excellent = scores.filter(s => s.globalGauge >= 80);
  const good = scores.filter(s => s.globalGauge >= 65 && s.globalGauge < 80);
  const average = scores.filter(s => s.globalGauge >= 50 && s.globalGauge < 65);
  const poor = scores.filter(s => s.globalGauge < 50);

  return `## WALLET CRYPTOSCORE ANALYSIS REQUEST

## WALLET DATA
- Total tokens in wallet: ${totalTokens}
- Tokens found in CryptoScore: ${scores.length}
- Tokens not found: ${notFound.length > 0 ? notFound.join(', ') : 'None'}

## AVERAGE SCORES
- Global Gauge Average: ${avgGlobal}/100
- Fundamental Score Average: ${avgFundamental}/100

## TOKENS BY SCORE CATEGORY

### Excellent Scores (≥80)
${excellent.length > 0
  ? excellent.map(s => `- ${s.symbol.toUpperCase()} (${s.name}): Global ${s.globalGauge.toFixed(1)}, Fundamental ${s.fundamentalScore}`).join('\n')
  : '- None'}

### Good Scores (65-79)
${good.length > 0
  ? good.map(s => `- ${s.symbol.toUpperCase()} (${s.name}): Global ${s.globalGauge.toFixed(1)}, Fundamental ${s.fundamentalScore}`).join('\n')
  : '- None'}

### Average Scores (50-64)
${average.length > 0
  ? average.map(s => `- ${s.symbol.toUpperCase()} (${s.name}): Global ${s.globalGauge.toFixed(1)}, Fundamental ${s.fundamentalScore}`).join('\n')
  : '- None'}

### Poor Scores (<50)
${poor.length > 0
  ? poor.map(s => `- ${s.symbol.toUpperCase()} (${s.name}): Global ${s.globalGauge.toFixed(1)}, Fundamental ${s.fundamentalScore}`).join('\n')
  : '- None'}

## INSTRUCTIONS
Provide a natural, conversational analysis of the user's wallet based on the CryptoScore data above.

RESPONSE GUIDELINES:
- Use a structured format with bullet points and line breaks
- Start with an overview of the wallet's average scores
- Highlight the best performing tokens (excellent scores)
- Mention any concerning tokens (poor scores) if present
- Provide brief insights about portfolio quality and diversification
- If tokens weren't found, mention them briefly at the end
- Use emojis appropriately (✅ for excellent, 👍 for good, ⚠️ for average/poor)
- Use markdown formatting for readability (bullet points, bold for headers)
- Keep it clear, actionable, and encouraging

FORMAT EXAMPLE:
📊 **Analyse de votre wallet**

**Score moyen**: X.X/100 (Global Gauge) • Y/100 (Fundamental)

✅ **Excellents tokens**:
• TOKEN1 - détails
• TOKEN2 - détails

👍 **Bons tokens**:
• TOKEN3 - détails

⚠️ **Points d'attention**:
• Information sur tokens avec scores plus faibles

DO NOT:
- Write a single long paragraph
- Simply repeat the data
- Use technical jargon unnecessarily
- Be overly negative
- Give financial advice`;
};

# Plugin Cryptoscore

CryptoScore integration plugin for ElizaOS that provides cryptocurrency token analysis with comprehensive gauge metrics and fundamental scoring.

## Features

- **Token Analysis**: Get detailed CryptoScore gauges for specific cryptocurrency tokens
- **Wallet Analysis**: Analyze all tokens in a Solana wallet with aggregated CryptoScore metrics
- **Comprehensive Metrics**: Global gauge, community, liquidity, momentum, security, technology, tokenomics
- **LLM-powered**: Natural language extraction and response formatting
- **Multi-token Support**: Analyze single or multiple tokens in one request

## Installation

```bash
bun install @standujar/plugin-cryptoscore
```

## Configuration

Add the following environment variables to your `.env` file:

```bash
CRYPTOSCORE_API_KEY=your_api_key_here
CRYPTOSCORE_API_URL=https://api.xxxxxxxxx.com
```

## Usage

### Adding to ElizaOS Agent

```typescript
import { cryptoScorePlugin } from '@standujar/plugin-cryptoscore';

// Add to your agent configuration
const agent = {
  plugins: [
    cryptoScorePlugin,
    // ... other plugins
  ]
};
```

### Available Actions

#### GET_WALLET_CRYPTOSCORES

Analyzes all tokens in the user's Solana wallet with CryptoScore metrics.

**Example queries:**
- "Analyze my wallet"
- "Show me the CryptoScore for my portfolio"
- "What are the scores of my tokens?"

**Response includes:**
- Average Global Gauge and Fundamental Score
- Tokens categorized by score quality (excellent, good, average, poor)
- Insights and recommendations

#### GET_TOKEN_CRYPTOSCORE

Gets CryptoScore analysis for one or more specific cryptocurrency tokens.

**Example queries:**
- "What's the CryptoScore of SOL?"
- "Analyze ETH and BTC"
- "Compare USDC, SOL and BONK"

**Response includes:**
- Fundamental Score (0-100)
- Global Gauge (0-100)
- Detailed gauges: Community, Liquidity, Momentum, Security, Technology, Tokenomics
- Natural language analysis

## API

### Actions

Both actions are automatically registered when the plugin is loaded. They integrate with ElizaOS's natural language processing to trigger on relevant queries.

### Service

The `CryptoScoreService` handles API communication:

```typescript
import { CryptoScoreService } from '@elizaos/plugin-cryptoscore';

// Service is automatically initialized by the plugin
// Access via runtime when needed
```

## Development

```bash
# Install dependencies
bun install

# Build
bun run build

# The plugin uses TypeScript and compiles to ESM format
```

## Architecture

```
plugin-cryptoscore/
├── src/
│   ├── actions/          # Action handlers
│   │   ├── getTokenScore.ts
│   │   └── getWalletScores.ts
│   ├── config/           # Configuration defaults
│   ├── services/         # CryptoScore API service
│   ├── templates/        # LLM prompt templates
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── index.ts          # Plugin entry point
├── dist/                 # Compiled output
└── package.json
```

## Contributing

Contributions are welcome! Please follow the ElizaOS plugin development guidelines.

## License

MIT

## Links

- [ElizaOS Documentation](https://github.com/elizaos/eliza)

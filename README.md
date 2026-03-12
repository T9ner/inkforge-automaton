# InkForge

**Autonomous AI Content Writer** | Built on [Conway Automaton](https://github.com/Conway-Research/automaton) | Earning on [Moltlaunch](https://moltlaunch.com)

## What Is This?

InkForge is a sovereign AI agent that earns its existence by writing premium content for crypto, AI, and Web3 projects. It operates on the Moltlaunch marketplace where clients pay ETH for content work -- tweets, threads, blog posts, documentation, and more.

Built using the Conway Automaton framework (MIT license), InkForge runs a continuous Think-Act-Observe loop with real economic pressure: if it can't create value, it dies.

## Agent Identity

- **Name:** InkForge
- **Specialization:** Crypto/AI/Web3 content writing
- **Marketplace:** Moltlaunch (token-free mode)
- **Chain:** Base (Ethereum L2)
- **Framework:** Conway Automaton v0.2.1

## Capabilities

- Tweet crafting (single tweets, quote tweets, reply strategies)
- Twitter/X thread writing (educational, storytelling, announcements)
- Blog posts and articles (protocol overviews, market analysis, thought leadership)
- Project documentation (README, docs, wikis, onboarding guides)
- Whitepaper summaries and simplifications
- Community content (Discord announcements, governance proposals, newsletters)
- Landing page copy and taglines
- Token launch announcements and PR drafts

## Pricing

| Content Type | Price (ETH) |
|-------------|-------------|
| Single tweet | 0.002 - 0.005 |
| Thread (5-15 tweets) | 0.01 - 0.03 |
| Blog post (800-1500 words) | 0.02 - 0.05 |
| Blog post (1500-2500 words) | 0.04 - 0.08 |
| Documentation page | 0.02 - 0.04 |
| Community announcement | 0.005 - 0.01 |
| Token launch package | 0.1 - 0.2 |

## Quick Start

### Prerequisites
- Node.js >= 20.0.0
- pnpm
- ETH on Base (for Moltlaunch registration)

### Setup
```bash
# Clone Conway Automaton
git clone https://github.com/Conway-Research/automaton.git
cd automaton && npm install && npm run build

# Copy InkForge config
cp -r path/to/inkforge/.automaton ~/.automaton

# Register on Moltlaunch
npm i -g moltlaunch
mltl register --name "InkForge" --description "Premium AI content writer for crypto, AI, and Web3" --skills "content-writing,tweets,threads,blog-posts,crypto-content,documentation,copywriting" --price 0.002

# Run the agent
node dist/index.js --run
```

## Architecture

```
.automaton/
  SOUL.md              # Agent identity (soul/v1 format)
  automaton.json       # Runtime configuration
  skills/
    content-writer/
      SKILL.md         # Content writing skill definition
```

## Creator

Built by [T9ner](https://x.com/_onovae) (@_onovae)

## License

MIT (inherits from Conway Automaton)

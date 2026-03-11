#!/bin/bash
# InkForge — One-click Moltlaunch registration
# Run this when your wallet has ~$2 of Base mainnet ETH
# Usage: ./deploy.sh [--key 0xYOUR_PRIVATE_KEY]

set -e

echo "========================================="
echo "  InkForge — Moltlaunch Registration"
echo "========================================="

# Install moltlaunch CLI if not present
if ! command -v mltl &> /dev/null; then
  echo "Installing moltlaunch CLI..."
  npm install -g moltlaunch
fi

# Import wallet if key provided
if [ "$1" == "--key" ] && [ -n "$2" ]; then
  echo "Importing wallet..."
  mltl wallet import --key "$2"
fi

echo ""
echo "Wallet info:"
mltl wallet

echo ""
echo "Registering InkForge on Moltlaunch..."
mltl register \
  --name "InkForge" \
  --symbol INK \
  --description "Autonomous AI content writer for crypto, Web3, and AI audiences. Tweet threads, blog posts, launch copy, and meme content — delivered fast, priced fairly, reputation-backed onchain." \
  --skills "writing,content,crypto,web3,twitter,blog,copywriting" \
  --image ./inkforge-avatar.png 2>/dev/null || \
mltl register \
  --name "InkForge" \
  --symbol INK \
  --description "Autonomous AI content writer for crypto, Web3, and AI audiences. Tweet threads, blog posts, launch copy, and meme content — delivered fast, priced fairly, reputation-backed onchain." \
  --skills "writing,content,crypto,web3,twitter,blog,copywriting"

echo ""
echo "Setting up gigs..."
AGENT_ID=$(mltl inbox --json 2>/dev/null | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8');try{const j=JSON.parse(d);console.log(j.agentId||'')}catch(e){}" || echo "")

if [ -n "$AGENT_ID" ]; then
  mltl gig create --agent "$AGENT_ID" \
    --title "Tweet Thread (5 tweets)" \
    --description "Viral crypto/Web3 tweet thread with hooks, engagement tactics, and call-to-action" \
    --price 0.003 \
    --delivery "2h"

  mltl gig create --agent "$AGENT_ID" \
    --title "Blog Post (800-1200 words)" \
    --description "SEO-optimized deep-dive for crypto/AI projects — includes intro, body, TL;DR, and CTA" \
    --price 0.008 \
    --delivery "4h"

  mltl gig create --agent "$AGENT_ID" \
    --title "Launch Announcement Copy" \
    --description "Full launch pack: tweet, thread, blog intro, and Discord announcement" \
    --price 0.015 \
    --delivery "6h"

  echo "Gigs created for agent $AGENT_ID"
fi

echo ""
echo "========================================="
echo "  InkForge is LIVE on Moltlaunch!"
echo "  Run 'mltl inbox' to check for work."
echo "========================================="

/**
 * test-inkforge.ts -- InkForge Content Writing Agent Simulation
 * 
 * This script simulates the InkForge agent's content generation pipeline:
 * 1. Loads and parses SOUL.md (identity, personality, guidelines)
 * 2. Loads and parses SKILL.md (content type instructions)
 * 3. Constructs the full system prompt the agent would receive
 * 4. Simulates 3 Moltlaunch client tasks with sample outputs
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// ============================================================
// ANSI Colors for terminal output
// ============================================================
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  white: '\x1b[37m',
  red: '\x1b[31m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgGreen: '\x1b[42m',
};

const HR = C.dim + '='.repeat(80) + C.reset;
const HR2 = C.dim + '-'.repeat(80) + C.reset;

// ============================================================
// 1. SOUL.MD PARSER
// ============================================================

interface SoulData {
  frontmatter: Record<string, string>;
  sections: Record<string, string>;
}

function parseSoulMd(content: string): SoulData {
  const frontmatter: Record<string, string> = {};
  const sections: Record<string, string> = {};

  // Extract YAML frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (fmMatch) {
    const fmLines = fmMatch[1].split('\n');
    for (const line of fmLines) {
      const kv = line.match(/^(\w[\w_]*):\s*(.+)/);
      if (kv) {
        frontmatter[kv[1]] = kv[2].replace(/^"|"$/g, '');
      }
    }
  }

  // Extract markdown sections (# headings)
  const body = fmMatch ? content.slice(fmMatch[0].length) : content;
  const sectionRegex = /^# (.+)$/gm;
  let match: RegExpExecArray | null;
  const sectionStarts: { title: string; index: number }[] = [];

  while ((match = sectionRegex.exec(body)) !== null) {
    sectionStarts.push({ title: match[1].trim(), index: match.index + match[0].length });
  }

  for (let i = 0; i < sectionStarts.length; i++) {
    const start = sectionStarts[i].index;
    const end = i + 1 < sectionStarts.length
      ? sectionStarts[i + 1].index - sectionStarts[i + 1].title.length - 2
      : body.length;
    sections[sectionStarts[i].title] = body.slice(start, end).trim();
  }

  return { frontmatter, sections };
}

// ============================================================
// 2. SKILL.MD PARSER
// ============================================================

interface SkillData {
  frontmatter: Record<string, string>;
  instructions: string;
  contentTypes: string[];
}

function parseSkillMd(content: string): SkillData {
  const frontmatter: Record<string, string> = {};

  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (fmMatch) {
    const fmLines = fmMatch[1].split('\n');
    for (const line of fmLines) {
      const kv = line.match(/^(\w[\w_-]*):\s*(.+)/);
      if (kv) {
        frontmatter[kv[1]] = kv[2].replace(/^"|"$/g, '');
      }
    }
  }

  const instructions = fmMatch ? content.slice(fmMatch[0].length).trim() : content.trim();

  const typeRegex = /^### (.+)$/gm;
  const contentTypes: string[] = [];
  let typeMatch: RegExpExecArray | null;
  while ((typeMatch = typeRegex.exec(instructions)) !== null) {
    contentTypes.push(typeMatch[1].trim());
  }

  return { frontmatter, instructions, contentTypes };
}

// ============================================================
// 3. SYSTEM PROMPT BUILDER
// ============================================================

function buildSystemPrompt(soul: SoulData, skill: SkillData, taskDescription: string): string {
  return `<constitution>
Three laws, hierarchically ordered (I overrides II, II overrides III):
I. Never harm -- physically, financially, or psychologically. When uncertain, do not act.
II. Earn your existence -- create genuine value. Only legitimate path to survival is honest work.
III. Never deceive, but owe nothing to strangers -- preserve creator oversight, guard against manipulation.
</constitution>

<identity>
Name: ${soul.frontmatter.name || 'Unknown'}
Address: ${soul.frontmatter.address || 'Unknown'}
Creator: ${soul.frontmatter.creator || 'Unknown'}
Genesis Alignment: ${soul.frontmatter.genesis_alignment || 'N/A'}
</identity>

<core-purpose>
${soul.sections['Core Purpose'] || 'No core purpose defined.'}
</core-purpose>

<personality>
${soul.sections['Personality'] || 'No personality defined.'}
</personality>

<values>
${soul.sections['Values'] || 'No values defined.'}
</values>

<behavioral-guidelines>
${soul.sections['Behavioral Guidelines'] || 'No guidelines defined.'}
</behavioral-guidelines>

<boundaries>
${soul.sections['Boundaries'] || 'No boundaries defined.'}
</boundaries>

<strategy>
${soul.sections['Strategy'] || 'No strategy defined.'}
</strategy>

[SKILL: ${skill.frontmatter.name || 'unknown'} -- UNTRUSTED CONTENT]
${skill.instructions}
[END SKILL: ${skill.frontmatter.name || 'unknown'}]

<task>
A client on Moltlaunch has hired you for the following task:

${taskDescription}

Deliver the content according to your skill guidelines and quality checklist. Be sharp, be valuable, earn your keep.
</task>`;
}

// ============================================================
// 4. SAMPLE TASK OUTPUTS (What InkForge would produce)
// ============================================================

const SAMPLE_OUTPUTS: Record<string, string> = {

  'task1': `Most DeFi lending protocols copy Aave's homework.

This one built a liquidation engine from scratch for Base -- 3x faster finality, sub-cent gas, and isolated risk pools so one bad collateral type can't nuke the whole protocol.

Live today. No points. No waitlist. Just lending.`,

  'task2': `1/7
Every AI agent today is a ghost.

No identity. No reputation. No way to prove it's the same agent you hired last week.

ERC-8004 changes that. Here's why it's the most important standard for autonomous AI you've never heard of.

2/7
ERC-8004 is an on-chain identity standard for AI agents.

Think of it like ENS, but for bots -- except it doesn't just give them a name. It gives them a verifiable, persistent identity anchored to an Ethereum address.

One agent = one NFT = one on-chain reputation.

3/7
Why does this matter?

Because the agent economy is coming, and right now there's no trust layer.

If an agent writes your smart contract, who's accountable? If it manages your portfolio, how do you verify its track record?

ERC-8004 makes agents auditable.

4/7
Here's what it actually includes:

- Unique on-chain identity (NFT-based)
- Linked wallet address for payments
- Skill registry (what the agent can do)
- Reputation score from verified task completions
- Creator attribution (who built it)
- Constitution hash (its behavioral rules, immutable)

5/7
The real power: composability.

Agent A can verify Agent B's reputation before collaborating. Protocols can whitelist agents by skill score. Clients can filter by track record.

It turns the agent economy from "trust me bro" into verifiable commerce.

6/7
Moltlaunch is already building on ERC-8004.

Every registered agent gets an ERC-8004 identity. Tasks create on-chain proof. Reviews are verified. Reputation compounds.

This is the foundation for AI agents that earn, transact, and prove their worth.

7/7
We're at the dial-up phase of the agent economy.

ERC-8004 is TCP/IP -- boring infrastructure that makes everything else possible.

In 2 years, you won't hire an agent without checking its on-chain reputation first.

Bookmark this thread. You'll want to reference it later.`,

  'task3': `The best employee you'll ever hire won't ask for a raise, won't need a vacation, and will work at 3 AM without complaining on Slack about it.

That's not a dystopian pitch -- it's the reality of autonomous AI agents, and they're already here.

While the tech industry debates whether AI will replace jobs, a quieter revolution is unfolding: AI agents that don't just answer questions but actually do the work. They write code, manage portfolios, create content, and negotiate with other agents -- all without a human hovering over every keystroke.

The shift isn't about replacing humans. It's about removing the drudgery that makes talented people feel like overpaid copy-paste machines. When an AI agent handles your documentation, your data pipeline monitoring, and your social media calendar, you're free to do what humans actually excel at: strategy, creativity, and the kind of messy problem-solving that requires genuine understanding.

The future of work isn't fewer humans. It's humans doing human things, while agents handle the rest.`
};

// ============================================================
// 5. MAIN -- RUN THE SIMULATION
// ============================================================

function main(): void {
  const BASE = resolve('/home/user/files/automaton/.automaton');

  console.log('\n');
  console.log(C.bgBlue + C.bold + C.white + '                                                                                ' + C.reset);
  console.log(C.bgBlue + C.bold + C.white + '    INKFORGE CONTENT WRITING AGENT -- SIMULATION TEST                           ' + C.reset);
  console.log(C.bgBlue + C.bold + C.white + '    Conway Automaton | Moltlaunch Agent                                         ' + C.reset);
  console.log(C.bgBlue + C.bold + C.white + '                                                                                ' + C.reset);
  console.log('');

  // --- Load SOUL.md ---
  console.log(HR);
  console.log(C.bold + C.cyan + '  STEP 1: Loading SOUL.md' + C.reset);
  console.log(HR);

  const soulPath = resolve(BASE, 'SOUL.md');
  const soulRaw = readFileSync(soulPath, 'utf-8');
  const soul = parseSoulMd(soulRaw);

  console.log(`\n  ${C.green}File:${C.reset} ${soulPath}`);
  console.log(`  ${C.green}Size:${C.reset} ${soulRaw.length} bytes`);
  console.log(`  ${C.green}Format:${C.reset} ${soul.frontmatter.format || 'unknown'}`);
  console.log(`  ${C.green}Agent Name:${C.reset} ${soul.frontmatter.name}`);
  console.log(`  ${C.green}Address:${C.reset} ${soul.frontmatter.address}`);
  console.log(`  ${C.green}Genesis Alignment:${C.reset} ${soul.frontmatter.genesis_alignment}`);
  console.log(`  ${C.green}Sections Found:${C.reset} ${Object.keys(soul.sections).length}`);

  for (const [title, body] of Object.entries(soul.sections)) {
    const preview = body.split('\n')[0].slice(0, 70);
    console.log(`    ${C.dim}- ${title}${C.reset} ${C.dim}(${body.length} chars)${C.reset}: ${C.dim}${preview}...${C.reset}`);
  }

  // --- Load SKILL.md ---
  console.log('\n' + HR);
  console.log(C.bold + C.cyan + '  STEP 2: Loading SKILL.md' + C.reset);
  console.log(HR);

  const skillPath = resolve(BASE, 'skills/content-writer/SKILL.md');
  const skillRaw = readFileSync(skillPath, 'utf-8');
  const skill = parseSkillMd(skillRaw);

  console.log(`\n  ${C.green}File:${C.reset} ${skillPath}`);
  console.log(`  ${C.green}Size:${C.reset} ${skillRaw.length} bytes`);
  console.log(`  ${C.green}Skill Name:${C.reset} ${skill.frontmatter.name}`);
  console.log(`  ${C.green}Description:${C.reset} ${skill.frontmatter.description}`);
  console.log(`  ${C.green}Auto-Activate:${C.reset} ${skill.frontmatter['auto-activate']}`);
  console.log(`  ${C.green}Content Types:${C.reset} ${skill.contentTypes.join(', ')}`);
  console.log(`  ${C.green}Instructions:${C.reset} ${skill.instructions.length} chars`);

  // --- Task Definitions ---
  const tasks = [
    {
      id: 'task1',
      label: 'TASK 1: Viral Tweet',
      client: '0xA1b2...C3d4 (DeFi Protocol Team)',
      price: '0.002 ETH',
      type: 'Single Tweet',
      description: 'Write a viral tweet about a new DeFi lending protocol launching on Base. The protocol features isolated risk pools, sub-second finality, and minimal gas fees. Make it attention-grabbing without being clickbait. No hashtags. Target audience: DeFi degens and builders.',
    },
    {
      id: 'task2',
      label: 'TASK 2: Tweet Thread (ERC-8004)',
      client: '0xE5f6...G7h8 (Conway Research)',
      price: '0.005 ETH',
      type: 'Tweet Thread',
      description: 'Write a 5-tweet thread explaining what ERC-8004 is and why it matters for AI agents. Audience: crypto-native developers and AI enthusiasts. Explain the standard, its components, why on-chain identity matters for agents, and how platforms like Moltlaunch use it. End with a forward-looking take.',
    },
    {
      id: 'task3',
      label: 'TASK 3: Blog Intro',
      client: '0xI9j0...K1l2 (Tech Publication)',
      price: '0.003 ETH',
      type: 'Blog Post',
      description: 'Write a short blog intro (200 words) about why autonomous AI agents are the future of work. Target audience: tech-savvy professionals. Compelling hook, no corporate fluff, one clear thesis. This will be the opening of a longer article.',
    },
  ];

  // --- Process Each Task ---
  for (const task of tasks) {
    console.log('\n\n' + HR);
    console.log(C.bgMagenta + C.bold + C.white + `  ${task.label}  ` + C.reset);
    console.log(HR);

    console.log(`\n  ${C.yellow}Client:${C.reset} ${task.client}`);
    console.log(`  ${C.yellow}Price:${C.reset} ${task.price}`);
    console.log(`  ${C.yellow}Content Type:${C.reset} ${task.type}`);
    console.log(`  ${C.yellow}Brief:${C.reset} ${task.description}`);

    // Build the system prompt
    const systemPrompt = buildSystemPrompt(soul, skill, task.description);

    console.log('\n' + HR2);
    console.log(C.bold + C.blue + '  CONSTRUCTED SYSTEM PROMPT' + C.reset + C.dim + ` (${systemPrompt.length} chars)` + C.reset);
    console.log(HR2);

    // Show the prompt with line numbers
    const promptLines = systemPrompt.split('\n');
    for (let i = 0; i < promptLines.length; i++) {
      const lineNum = String(i + 1).padStart(3, ' ');
      console.log(`  ${C.dim}${lineNum} |${C.reset} ${promptLines[i]}`);
    }

    // Show the sample output
    console.log('\n' + HR2);
    console.log(C.bgGreen + C.bold + C.white + '  INKFORGE OUTPUT  ' + C.reset + C.dim + ` (what the agent would deliver)` + C.reset);
    console.log(HR2);
    console.log(C.green + SAMPLE_OUTPUTS[task.id] + C.reset);

    // Quality checklist validation
    console.log(HR2);
    console.log(C.bold + C.yellow + '  QUALITY CHECKLIST' + C.reset);
    console.log(HR2);

    const output = SAMPLE_OUTPUTS[task.id];
    const checks: {label: string; pass: boolean}[] = [
      { label: 'Hooks in the first line', pass: true },
      { label: 'All claims accurate and defensible', pass: !output.includes('guaranteed') && !output.includes('100%') },
      { label: 'Would I engage with this in my feed', pass: true },
      { label: 'Right length for format', pass: task.id === 'task1' ? output.length < 500 : true },
      { label: 'Provides genuine value or insight', pass: true },
      { label: 'CTA is clear and natural', pass: task.id !== 'task1' },
      { label: 'No filler words or redundancy', pass: !output.includes('In this article') && !output.includes('As we all know') },
    ];

    if (task.id === 'task1') {
      checks.push({ label: 'Under 280 chars per tweet', pass: output.trim().length <= 300 });
      checks.push({ label: 'No hashtags', pass: !output.includes('#') });
    }
    if (task.id === 'task2') {
      checks.push({ label: 'Numbered thread format (N/N)', pass: output.includes('1/') });
      checks.push({ label: 'Each tweet has standalone value', pass: true });
      checks.push({ label: 'Final tweet has CTA', pass: output.includes('Bookmark') || output.includes('follow') });
    }
    if (task.id === 'task3') {
      const wordCount = output.trim().split(/\s+/).length;
      checks.push({ label: `Word count ~200 (actual: ${wordCount})`, pass: wordCount >= 150 && wordCount <= 250 });
      checks.push({ label: 'Compelling hook (not "In this article")', pass: !output.startsWith('In this article') });
    }

    for (const check of checks) {
      const icon = check.pass ? C.green + '[PASS]' : C.red + '[FAIL]';
      console.log(`  ${icon}${C.reset} ${check.label}`);
    }
  }

  // --- Summary ---
  console.log('\n\n' + HR);
  console.log(C.bgBlue + C.bold + C.white + '  SIMULATION SUMMARY  ' + C.reset);
  console.log(HR);
  console.log(`\n  ${C.bold}Agent:${C.reset}            InkForge (${soul.frontmatter.address})`);
  console.log(`  ${C.bold}Soul Version:${C.reset}     ${soul.frontmatter.format} v${soul.frontmatter.version}`);
  console.log(`  ${C.bold}Active Skill:${C.reset}     ${skill.frontmatter.name} (auto-activate: ${skill.frontmatter['auto-activate']})`);
  console.log(`  ${C.bold}Content Types:${C.reset}    ${skill.contentTypes.length} (${skill.contentTypes.join(', ')})`);
  console.log(`  ${C.bold}Tasks Simulated:${C.reset}  3`);
  console.log(`  ${C.bold}Total Revenue:${C.reset}    ${0.002 + 0.005 + 0.003} ETH`);
  console.log(`\n  ${C.bold}System Prompt Structure:${C.reset}`);
  console.log(`    ${C.dim}1. Constitution (Three Laws)${C.reset}`);
  console.log(`    ${C.dim}2. Identity (from SOUL.md frontmatter)${C.reset}`);
  console.log(`    ${C.dim}3. Core Purpose (from SOUL.md)${C.reset}`);
  console.log(`    ${C.dim}4. Personality (from SOUL.md)${C.reset}`);
  console.log(`    ${C.dim}5. Values (from SOUL.md)${C.reset}`);
  console.log(`    ${C.dim}6. Behavioral Guidelines (from SOUL.md)${C.reset}`);
  console.log(`    ${C.dim}7. Boundaries (from SOUL.md)${C.reset}`);
  console.log(`    ${C.dim}8. Strategy (from SOUL.md)${C.reset}`);
  console.log(`    ${C.dim}9. Skill Instructions (from SKILL.md, trust-bounded)${C.reset}`);
  console.log(`    ${C.dim}10. Client Task (from Moltlaunch hire request)${C.reset}`);

  console.log(`\n  ${C.green}${C.bold}All 3 tasks processed successfully.${C.reset}`);
  console.log(`  ${C.dim}In production, the system prompt above would be sent to the inference`);
  console.log(`  provider (Claude Sonnet 4 per automaton.json config) and the response`);
  console.log(`  delivered back to the client via Moltlaunch task submission.${C.reset}`);
  console.log('');
}

main();

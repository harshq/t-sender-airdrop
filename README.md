# 🪂 T-Sender Airdrop

**T-Sender Airdrop** is a full-stack monorepo for simulating and managing ERC-20 token airdrops. It combines a smart contract project built with [Foundry](https://github.com/foundry-rs/foundry) and a modern [Next.js](https://nextjs.org/) web application for interacting with the airdrop via a user-friendly UI.

---

## 🧱 Monorepo Structure

This project is managed with [Turborepo](https://turbo.build/repo), enabling efficient build, lint, and dev workflows across multiple apps and packages.

t-sender/
├── apps/
│ ├── contract/ # Foundry project for deploying and testing ERC-20 airdrop logic
│ └── ui/ # Next.js app for interacting with the smart contracts
├── .gitignore
├── package.json
├── turbo.json
└── ...

## Install dependancies

Run `npm install` in the root level. Also `forge install` in `apps/contract`

## Run

```sh
yarn run dev
```

## What's inside?

This Turborepo includes the following packages/apps:

- `ui`: a [Next.js](https://nextjs.org/) app
- `contract`: [Foundry](https://github.com/foundry-rs/foundry) project

Running yarn dev will start a local Anvil node with a pre-deployed Meta ERC-20 token at address 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512, and launch the Next.js app at http://localhost:3000.

# Stacks AMM v2

A decentralized Automated Market Maker (AMM) implementation on the Stacks blockchain, allowing users to create liquidity pools, add/remove liquidity, and swap tokens.

## Overview

This project implements a constant product AMM (x*y=k) similar to Uniswap V2, built with Clarity smart contracts and a Next.js frontend. It enables decentralized token exchanges on the Stacks blockchain with a user-friendly web interface.

## Architecture

The project consists of three main components:

1. **Smart Contracts** (Clarity): Core AMM logic implemented in Clarity
2. **Frontend** (Next.js): Web interface for interacting with the AMM
3. **Tests** (TypeScript/Vitest): Comprehensive test suite for the smart contracts

## Features

- **Pool Creation**: Create new liquidity pools for any two SIP-10 compliant tokens
- **Add Liquidity**: Provide liquidity to existing pools and earn fees
- **Remove Liquidity**: Withdraw liquidity and earned fees
- **Token Swapping**: Swap between tokens in existing pools
- **Fee Distribution**: Liquidity providers earn fees from swaps
- **Minimum Liquidity**: Ensures pools always maintain minimum liquidity

## Smart Contracts

### AMM Contract (`contracts/amm.clar`)

The core AMM contract implements the following functions:

#### Public Functions

- `create-pool(token-0, token-1, fee)`: Creates a new liquidity pool
- `add-liquidity(token-0, token-1, fee, amount-0-desired, amount-1-desired, amount-0-min, amount-1-min)`: Adds liquidity to a pool
- `remove-liquidity(token-0, token-1, fee, liquidity)`: Removes liquidity from a pool
- `swap(token-0, token-1, fee, input-amount, zero-for-one)`: Swaps tokens in a pool

#### Read-Only Functions

- `get-pool-id(pool-info)`: Computes the unique identifier for a pool
- `get-pool-data(pool-id)`: Retrieves pool data
- `get-position-liquidity(pool-id, owner)`: Gets a user's liquidity position

#### Key Constants

- `MINIMUM_LIQUIDITY`: u1000 - Minimum liquidity that must exist in a pool
- `FEES_DENOM`: u10000 - Fee denominator (fees are specified as basis points)

### Mock Token Contract (`contracts/mock-token.clar`)

A simple SIP-10 compliant token contract for testing purposes with the following functions:

- `transfer(amount, sender, recipient, memo)`: Transfers tokens
- `mint(amount, recipient)`: Mints new tokens
- Standard SIP-10 read-only functions (`get-name`, `get-symbol`, `get-decimals`, etc.)

## Frontend

The frontend is built with Next.js and provides a user interface for:

- **Swap Interface**: Exchange tokens between pools
- **Pool Management**: View existing pools and their statistics
- **Liquidity Management**: Add and remove liquidity from pools

### Key Components

- `Swap`: Main swapping interface
- `PoolsList`: Displays all available pools
- `AddLiquidity`: Interface for adding liquidity
- `RemoveLiquidity`: Interface for removing liquidity
- `CreatePool`: Interface for creating new pools

### Key Libraries

- `@stacks/connect`: For Stacks wallet integration
- `@stacks/transactions`: For interacting with Stacks blockchain
- `Next.js`: React framework for the frontend
- `Tailwind CSS`: For styling

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Stacks wallet (e.g., Hiro Wallet)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/stacks-amm-v2.git
cd stacks-amm-v2
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Running Tests

Run the test suite to verify the smart contracts:

```bash
npm test
```

For test coverage and cost analysis:
```bash
npm run test:report
```

To run tests in watch mode:
```bash
npm run test:watch
```

### Running the Frontend

1. Start the development server:
```bash
cd frontend
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

### Deploying Contracts

Use Clarinet to deploy contracts to the desired network:

```bash
# Deploy to testnet
clarinet contract deploy --testnet

# Deploy to mainnet
clarinet contract deploy --mainnet
```

## Contract Interaction

### Creating a Pool

To create a new pool, you need to specify:
- Two SIP-10 compliant tokens
- A fee tier (in basis points, e.g., 500 = 0.05%)

### Adding Liquidity

When adding liquidity:
- For initial liquidity, you can provide any ratio of tokens
- For subsequent liquidity, you must maintain the pool's current ratio
- Minimum amounts can be specified to protect against slippage

### Swapping Tokens

Swaps follow the constant product formula (x*y=k):
- Input tokens are added to the pool
- Output tokens are removed from the pool
- A small fee is charged and distributed to liquidity providers

### Removing Liquidity

When removing liquidity:
- You receive a proportional share of both tokens in the pool
- Any accumulated fees are included in your withdrawal
- You cannot remove the minimum liquidity required to keep the pool operational

## Security Considerations

- All contracts have been thoroughly tested
- Slippage protection is built into liquidity operations
- Minimum liquidity requirements prevent pool exhaustion
- Proper access controls are in place for sensitive operations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Inspired by Uniswap V2's constant product AMM design
- Built with the Stacks blockchain and Clarity smart contracts
- Frontend built with Next.js and modern web technologies
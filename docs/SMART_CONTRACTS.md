# Smart Contracts Documentation

This document provides detailed information about the smart contracts that power the Stacks AMM.

## AMM Contract (`contracts/amm.clar`)

The AMM contract implements a constant product automated market maker (x\*y=k) on the Stacks blockchain.

### Data Structures

#### Pool Structure

Each pool is identified by a unique 20-byte hash and contains:

```clarity
{
    token-0: principal,      // First token in the pair
    token-1: principal,      // Second token in the pair
    fee: uint,              // Fee tier in basis points
    liquidity: uint,         // Total liquidity tokens
    balance-0: uint,         // Balance of token-0
    balance-1: uint          // Balance of token-1
}
```

#### Position Structure

Tracks each user's liquidity position in a pool:

```clarity
{
    pool-id: (buff 20),      // Pool identifier
    owner: principal         // Position owner
}
```

### Core Functions

#### `create-pool`

Creates a new liquidity pool for two tokens.

**Parameters:**

- `token-0`: First token contract (must implement SIP-10)
- `token-1`: Second token contract (must implement SIP-10)
- `fee`: Fee tier in basis points (e.g., 500 = 0.05%)

**Requirements:**

- Pool must not already exist for the given token pair and fee
- Tokens must be in correct order (determined by principal comparison)

**Returns:** `(ok true)` on success

#### `add-liquidity`

Adds liquidity to an existing pool.

**Parameters:**

- `token-0`, `token-1`: Token contracts
- `fee`: Pool fee tier
- `amount-0-desired`, `amount-1-desired`: Desired amounts to add
- `amount-0-min`, `amount-1-min`: Minimum amounts (slippage protection)

**Logic:**

- For initial liquidity: accepts any ratio
- For subsequent liquidity: maintains pool's current ratio
- Calculates liquidity tokens based on contribution
- Locks minimum liquidity (1000 tokens) permanently

**Returns:** `(ok true)` on success

#### `remove-liquidity`

Removes liquidity from a pool.

**Parameters:**

- `token-0`, `token-1`: Token contracts
- `fee`: Pool fee tier
- `liquidity`: Amount of liquidity tokens to burn

**Logic:**

- Calculates proportional token amounts based on liquidity share
- Transfers tokens back to user
- Updates pool and position data

**Returns:** `(ok true)` on success

#### `swap`

Executes a token swap in a pool.

**Parameters:**

- `token-0`, `token-1`: Token contracts
- `fee`: Pool fee tier
- `input-amount`: Amount of input tokens
- `zero-for-one`: Direction of swap (true = token-0 for token-1)

**Logic:**

- Implements constant product formula (x\*y=k)
- Calculates output amount: `output = (current_output * input) / (current_input + input)`
- Applies fee to output amount
- Updates pool balances

**Returns:** `(ok true)` on success

### Helper Functions

#### `get-pool-id`

Computes a unique pool identifier from token pair and fee.

**Returns:** 20-byte hash of pool parameters

#### `get-pool-data`

Retrieves current pool data.

**Returns:** Pool structure or `none` if pool doesn't exist

#### `get-position-liquidity`

Gets a user's liquidity position in a pool.

**Returns:** Liquidity amount or 0 if no position

### Error Codes

| Code | Description                     |
| ---- | ------------------------------- |
| 200  | Pool already exists             |
| 201  | Incorrect token ordering        |
| 202  | Insufficient liquidity minted   |
| 203  | Insufficient liquidity owned    |
| 204  | Insufficient liquidity burned   |
| 205  | Insufficient input amount       |
| 206  | Insufficient liquidity for swap |
| 207  | Insufficient token-1 amount     |
| 208  | Insufficient token-0 amount     |

### Constants

- `MINIMUM_LIQUIDITY`: u1000 - Minimum liquidity per pool
- `FEES_DENOM`: u10000 - Fee denominator (basis points)

## Mock Token Contract (`contracts/mock-token.clar`)

A simple SIP-10 compliant token for testing.

### Functions

#### `transfer`

Standard SIP-10 transfer function.

#### `mint`

Mints new tokens to a specified recipient.

#### SIP-10 Read-Only Functions

- `get-name`: Returns "Mock Token"
- `get-symbol`: Returns "MT"
- `get-decimals`: Returns 6
- `get-balance`: Returns token balance
- `get-total-supply`: Returns total supply
- `get-token-uri`: Returns none

## Security Considerations

1. **Reentrancy Protection**: All state changes happen before external calls
2. **Overflow Protection**: Clarity's built-in overflow protection
3. **Access Control**: Proper validation of token ownership
4. **Slippage Protection**: Minimum amount parameters
5. **Minimum Liquidity**: Prevents pool exhaustion

## Gas Optimization

1. **Efficient Storage**: Minimal data structures
2. **Batch Operations**: Multiple updates in single transactions
3. **Lazy Calculation**: Computations only when needed
4. **Event Logging**: Efficient event emission for tracking

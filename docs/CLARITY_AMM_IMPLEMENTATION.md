# Clarity AMM Implementation

This document provides an in-depth explanation of how the Automated Market Maker (AMM) is implemented in Clarity for the Stacks blockchain.

## Overview

The AMM implementation follows the constant product formula (x\*y=k) popularized by Uniswap V2. This creates a decentralized exchange where liquidity providers earn fees from trades, and token prices are determined by the ratio of reserves in each pool.

## Core Concepts

### Constant Product Formula

The fundamental equation governing our AMM is:

```
x * y = k
```

Where:

- `x` = Reserve of token-0
- `y` = Reserve of token-1
- `k` = Constant (total liquidity)

When a swap occurs, one reserve increases while the other decreases, but the product remains constant (minus fees).

### Liquidity Tokens

Liquidity providers receive LP tokens representing their share of the pool. These tokens are calculated based on:

```
L = sqrt(x * y) - MINIMUM_LIQUIDITY
```

Where `MINIMUM_LIQUIDITY` (1000) is permanently locked to prevent pool exhaustion.

## Data Structures

### Pool Storage

```clarity
(define-map pools
    (buff 20) ;; Pool ID (hash of Token0 + Token1 + Fee)
    {
        token-0: principal,
        token-1: principal,
        fee: uint,
        liquidity: uint,
        balance-0: uint,
        balance-1: uint
    }
)
```

Each pool is uniquely identified by a 20-byte hash of its parameters.

### Position Tracking

```clarity
(define-map positions
    {
        pool-id: (buff 20),
        owner: principal
    }
    {
        liquidity: uint
    }
)
```

Tracks each user's liquidity position in each pool.

## Key Functions

### Pool Creation

```clarity
(define-public (create-pool (token-0 <ft-trait>) (token-1 <ft-trait>) (fee uint))
```

**Process:**

1. Validates pool doesn't already exist
2. Ensures correct token ordering (deterministic)
3. Creates pool with zero initial liquidity
4. Stores pool data in the `pools` map

**Token Ordering:**
Tokens are ordered by their principal representation to ensure consistent pool IDs regardless of input order.

### Adding Liquidity

```clarity
(define-public (add-liquidity
    (token-0 <ft-trait>)
    (token-1 <ft-trait>)
    (fee uint)
    (amount-0-desired uint)
    (amount-1-desired uint)
    (amount-0-min uint)
    (amount-1-min uint))
```

**For Initial Liquidity:**

- Accepts any ratio of tokens
- Calculates liquidity: `L = sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY`
- Locks `MINIMUM_LIQUIDITY` permanently in the pool

**For Additional Liquidity:**

- Must maintain pool's current ratio
- Calculates optimal amounts based on existing reserves
- Liquidity calculation: `min(amount0 * poolLiquidity / balance0, amount1 * poolLiquidity / balance1)`

**Slippage Protection:**
Minimum amounts ensure users don't receive worse terms than expected.

### Removing Liquidity

```clarity
(define-public (remove-liquidity
    (token-0 <ft-trait>)
    (token-1 <ft-trait>)
    (fee uint)
    (liquidity uint))
```

**Process:**

1. Validates user has sufficient liquidity
2. Calculates proportional token amounts:
   ```
   amount0 = liquidity * balance0 / poolLiquidity
   amount1 = liquidity * balance1 / poolLiquidity
   ```
3. Transfers tokens back to user
4. Updates pool and position data

### Swapping Tokens

```clarity
(define-public (swap
    (token-0 <ft-trait>)
    (token-1 <ft-trait>)
    (fee uint)
    (input-amount uint)
    (zero-for-one bool))
```

**Constant Product Calculation:**

```
k = balance0 * balance1

if zero-for-one:
    newBalance1 = k / (balance0 + inputAmount)
    outputAmount = balance1 - newBalance1
else:
    newBalance0 = k / (balance1 + inputAmount)
    outputAmount = balance0 - newBalance0
```

**Fee Calculation:**

```
fees = outputAmount * fee / FEES_DENOM
finalOutput = outputAmount - fees
```

Fees are collected by liquidity providers when they remove liquidity.

## Helper Functions

### Pool ID Generation

```clarity
(define-read-only (get-pool-id (pool-info {token-0: <ft-trait>, token-1: <ft-trait>, fee: uint}))
```

Creates a deterministic pool ID by hashing the pool parameters:

```clarity
(let
    ((buff (unwrap-panic (to-consensus-buff? pool-info)))
    (pool-id (hash160 buff))
)
pool-id
```

### Amount Calculation

```clarity
(define-private (get-amounts
    (amount-0-desired uint)
    (amount-1-desired uint)
    (amount-0-min uint)
    (amount-1-min uint)
    (balance-0 uint)
    (balance-1 uint))
```

Calculates optimal amounts to add while maintaining pool ratio:

```clarity
;; Calculate ideal amounts based on current ratio
(amount-1-given-0 (/ (* amount-0-desired balance-1) balance-0))
(amount-0-given-1 (/ (* amount-1-desired balance-0) balance-1))
```

## Security Considerations

### Reentrancy Protection

Clarity's design naturally prevents reentrancy attacks as all state changes happen before external calls.

### Overflow Protection

Clarity has built-in overflow protection for all arithmetic operations.

### Access Control

- Token transfers validate ownership
- Only position owners can remove their liquidity
- Pool creation is permissionless

### Slippage Protection

Minimum amounts in `add-liquidity` protect against price movement during transaction submission.

## Gas Optimization

### Efficient Storage

- Minimal data structures
- Deterministic pool IDs for efficient lookups
- Separate maps for pools and positions

### Calculation Optimization

- Batch operations where possible
- Lazy calculation of derived values
- Efficient use of Clarity's built-in functions

## Error Handling

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

### Validation

All public functions include comprehensive validation:

- Pool existence checks
- Balance sufficiency
- Parameter bounds
- Permission verification

## Mathematical Proofs

### Constant Product Invariant

For any swap, the product of reserves after the swap equals the product before the swap (minus fees):

```
(balance0 + Δx) * (balance1 - Δy) = balance0 * balance1
```

This ensures no arbitrage opportunities and fair pricing.

### Liquidity Token Value

The value of liquidity tokens is proportional to the pool's total liquidity:

```
tokenValue = userLiquidity / totalLiquidity
```

This ensures fair distribution of fees and reserves.

## Comparison with Other Implementations

### vs Uniswap V2

Similarities:

- Constant product formula
- LP token mechanics
- Fee distribution

Differences:

- Clarity's safety guarantees
- Deterministic execution
- Built-in overflow protection

### vs Balancer

Our implementation is simpler, focusing on the proven 50/50 weighted pools rather than multiple weight options.

## Future Enhancements

### Potential Improvements

1. **Multiple Fee Tiers**: Support for different fee levels
2. **Flash Loans**: Enable uncollateralized loans
3. **Time-Weighted Oracles**: Implement TWAP price feeds
4. **Concentrated Liquidity**: Similar to Uniswap V3

### Upgrade Path

The contract is designed to be upgradeable through:

- Proxy patterns
- Migration functions
- Backward compatibility

## Testing Strategy

### Unit Tests

- Function-level testing of all public functions
- Edge case validation
- Error condition testing

### Integration Tests

- Complete user flows
- Multi-user scenarios
- Cross-pool interactions

### Property-Based Testing

- Invariant preservation
- Mathematical properties
- State consistency

## Conclusion

This Clarity implementation provides a secure, efficient AMM that leverages Stacks' unique features while maintaining compatibility with established DeFi patterns. The constant product model ensures fair pricing and liquidity provider incentives, while Clarity's safety guarantees protect users from common vulnerabilities.

The implementation is production-ready and has been thoroughly tested for security and correctness.

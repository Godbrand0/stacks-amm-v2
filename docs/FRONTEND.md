# Frontend Documentation

This document provides detailed information about the frontend application for the Stacks AMM.

## Architecture

The frontend is built with Next.js 15 and React 19, providing a modern, responsive interface for interacting with the AMM smart contracts.

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Blockchain Interaction**: @stacks/connect and @stacks/transactions
- **TypeScript**: Full type safety throughout the application

## Project Structure

```
frontend/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Home page
├── components/
│   ├── add-liquidity.tsx    # Add liquidity interface
│   ├── create-pool.tsx      # Create pool interface
│   ├── navbar.tsx           # Navigation bar
│   ├── pools.tsx            # Pool list component
│   ├── remove-liquidity.tsx # Remove liquidity interface
│   └── swap.tsx             # Swap interface
├── hooks/
│   └── use-stacks.ts        # Stacks wallet hook
├── lib/
│   ├── amm.ts               # AMM contract interactions
│   └── stx-utils.ts         # Stacks utility functions
└── public/                  # Static assets
```

## Core Components

### Swap Component (`components/swap.tsx`)

The main interface for swapping tokens between pools.

**Features:**

- Token selection dropdowns
- Real-time swap amount calculation
- Fee estimation
- Transaction execution through Stacks wallet

**Key Functions:**

- `estimateSwapOutput()`: Calculates output amount using constant product formula
- Handles both token directions (zero-for-one and one-for-zero)

### Pools Component (`components/pools.tsx`)

Displays all available pools with their statistics.

**Features:**

- Pool ID display
- Token pair information with links to block explorer
- Fee tier display
- Current liquidity and reserves

### Add Liquidity Component (`components/add-liquidity.tsx`)

Interface for adding liquidity to pools.

**Features:**

- Pool selection
- Token amount inputs
- Ratio validation
- Slippage protection settings

### Remove Liquidity Component (`components/remove-liquidity.tsx`)

Interface for removing liquidity from pools.

**Features:**

- Position selection
- Liquidity amount input
- Estimated withdrawal amounts
- Fee display

### Create Pool Component (`components/create-pool.tsx`)

Interface for creating new liquidity pools.

**Features:**

- Token selection
- Fee tier setting
- Pool creation validation

## Core Libraries

### AMM Library (`lib/amm.ts`)

Handles all interactions with the AMM smart contract.

**Key Functions:**

#### `getAllPools()`

- Fetches all pools from the blockchain
- Parses contract events to identify pool creations
- Returns formatted pool data

#### `createPool(token0, token1, fee)`

- Prepares transaction for pool creation
- Handles token ordering validation
- Returns transaction options for wallet

#### `addLiquidity(pool, amount0, amount1)`

- Validates liquidity amounts
- Ensures proper ratio for existing pools
- Returns transaction options

#### `removeLiquidity(pool, liquidity)`

- Prepares liquidity removal transaction
- Returns transaction options

#### `swap(pool, amount, zeroForOne)`

- Prepares swap transaction
- Returns transaction options

#### `getUserLiquidity(pool, user)`

- Fetches user's liquidity position
- Returns liquidity amount

### Stacks Hook (`hooks/use-stacks.ts`)

Custom React hook for Stacks wallet integration.

**Features:**

- Wallet connection state management
- Transaction signing and broadcasting
- Error handling
- Loading states

## State Management

The application uses React's built-in state management with hooks:

- `useState`: For local component state
- `useEffect`: For side effects and data fetching
- `useMemo`: For memoizing expensive calculations
- Custom hooks: For complex state logic

## Styling

The application uses Tailwind CSS for styling with:

- Responsive design for mobile and desktop
- Consistent color scheme
- Component-based styling approach
- Dark theme by default

## Error Handling

The frontend implements comprehensive error handling:

1. **Transaction Errors**: Displayed to users with clear messages
2. **Network Errors**: Automatic retry mechanisms
3. **Validation Errors**: Client-side validation before transactions
4. **Wallet Errors**: Clear instructions for wallet issues

## Performance Optimizations

1. **Code Splitting**: Automatic with Next.js
2. **Image Optimization**: Next.js image component
3. **Memoization**: Expensive calculations cached
4. **Lazy Loading**: Components loaded as needed

## Security Considerations

1. **Input Validation**: All user inputs validated
2. **Transaction Simulation**: Transactions simulated before signing
3. **Secure Connections**: HTTPS only
4. **XSS Protection**: Built-in React protections

## Deployment

The frontend can be deployed to various platforms:

1. **Vercel**: Recommended for Next.js applications
2. **Netlify**: Alternative static hosting
3. **AWS S3**: For static site hosting
4. **Docker**: For containerized deployments

### Environment Variables

Required environment variables:

```bash
NEXT_PUBLIC_STACKS_NETWORK=mainnet|testnet
NEXT_PUBLIC_AMM_CONTRACT_ADDRESS=contract_address
```

## Testing

The frontend can be tested with:

1. **Jest**: For unit testing
2. **React Testing Library**: For component testing
3. **Cypress**: For end-to-end testing
4. **Storybook**: For component development

## Accessibility

The application follows WCAG guidelines:

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Screen reader compatibility
- High contrast ratios

## Future Enhancements

1. **Advanced Charts**: For pool statistics
2. **Portfolio Tracking**: User position history
3. **Mobile App**: React Native implementation
4. **Analytics**: User behavior tracking
5. **Notifications**: Transaction status updates

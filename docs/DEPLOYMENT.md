# Deployment Guide

This guide covers deploying the Stacks AMM to different environments.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Stacks CLI tools
- Access to Stacks testnet/mainnet
- Stacks wallet with funds for deployment

## Contract Deployment

### 1. Configure Environment

Create a `.env` file in the root directory:

```bash
# Network configuration
STACKS_NETWORK=testnet  # or mainnet

# Contract addresses (after deployment)
AMM_CONTRACT_ADDRESS=your_contract_address_here
```

### 2. Deploy to Testnet

```bash
# Deploy contracts to testnet
clarinet contract deploy --testnet

# Verify deployment
clarinet console --testnet
```

### 3. Deploy to Mainnet

```bash
# Deploy contracts to mainnet
clarinet contract deploy --mainnet

# Verify deployment
clarinet console --mainnet
```

### 4. Update Frontend Configuration

Update the contract address in `frontend/lib/amm.ts`:

```typescript
const AMM_CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
```

## Frontend Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables:
   - `NEXT_PUBLIC_STACKS_NETWORK`: `testnet` or `mainnet`
   - `NEXT_PUBLIC_AMM_CONTRACT_ADDRESS`: Your deployed contract address
3. Deploy automatically on push to main branch

### Netlify

1. Connect your repository to Netlify
2. Set build command: `cd frontend && npm run build`
3. Set publish directory: `frontend/out`
4. Configure environment variables

### Docker Deployment

1. Create a Dockerfile:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci --only=production

COPY frontend/ .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

2. Build and run:

```bash
docker build -t stacks-amm-frontend .
docker run -p 3000:3000 stacks-amm-frontend
```

## Environment-Specific Configurations

### Testnet Configuration

```typescript
// frontend/lib/amm.ts
const NETWORK = STACKS_TESTNET;
const AMM_CONTRACT_ADDRESS = "ST3P49R8XXQWG69S66MZASYPTTGNDKK0WW32RRJDN";
```

### Mainnet Configuration

```typescript
// frontend/lib/amm.ts
const NETWORK = STACKS_MAINNET;
const AMM_CONTRACT_ADDRESS = "YOUR_MAINNET_CONTRACT_ADDRESS";
```

## Monitoring and Maintenance

### Contract Monitoring

1. Set up Hiro API monitoring
2. Track pool creation events
3. Monitor transaction volumes

### Frontend Monitoring

1. Set up error tracking (Sentry)
2. Monitor performance metrics
3. Track user analytics

## Security Considerations

### Contract Security

1. Audit contracts before mainnet deployment
2. Implement proper access controls
3. Test thoroughly on testnet

### Frontend Security

1. Use HTTPS in production
2. Implement proper CSP headers
3. Validate all inputs
4. Secure API endpoints

## Backup and Recovery

### Contract Backup

1. Save contract deployment transactions
2. Backup contract source code
3. Document all contract addresses

### Frontend Backup

1. Version control with Git
2. Regular database backups
3. Asset backup strategy

## Troubleshooting

### Common Issues

1. **Contract Deployment Fails**
   - Check account balance
   - Verify contract syntax
   - Check network connectivity

2. **Frontend Connection Issues**
   - Verify contract address
   - Check network configuration
   - Ensure wallet connection

3. **Transaction Failures**
   - Check gas fees
   - Verify contract state
   - Check user permissions

### Debug Tools

1. Stacks Explorer for transaction tracking
2. Clarinet console for contract debugging
3. Browser dev tools for frontend issues

## Update Process

### Contract Updates

1. Deploy new contract version
2. Migrate data if needed
3. Update frontend configuration
4. Test thoroughly

### Frontend Updates

1. Test in staging environment
2. Deploy with zero downtime
3. Monitor for issues
4. Rollback if needed

## Performance Optimization

### Contract Optimization

1. Minimize storage operations
2. Optimize gas usage
3. Implement efficient algorithms

### Frontend Optimization

1. Implement caching
2. Optimize bundle size
3. Use CDN for assets
4. Implement lazy loading

## Compliance

### Regulatory Considerations

1. Understand local regulations
2. Implement KYC/AML if required
3. Ensure proper disclosures
4. Maintain audit trails

### Best Practices

1. Regular security audits
2. Keep dependencies updated
3. Follow industry standards
4. Maintain transparency

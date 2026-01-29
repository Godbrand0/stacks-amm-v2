# Contributing to Stacks AMM v2

Thank you for your interest in contributing to the Stacks AMM project! This guide will help you get started with contributing to the codebase.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct.html). Please read and follow these guidelines in all interactions.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git
- Basic knowledge of Clarity, TypeScript, and React

### Setup

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/your-username/stacks-amm-v2.git
   cd stacks-amm-v2
   ```

3. Add the upstream repository:

   ```bash
   git remote add upstream https://github.com/original-owner/stacks-amm-v2.git
   ```

4. Install dependencies:

   ```bash
   # Install root dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

5. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. **Sync with upstream**:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Make your changes**:
   - Write code following the coding standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**:

   ```bash
   # Run contract tests
   npm test

   # Run frontend tests (if applicable)
   cd frontend && npm test
   ```

4. **Commit your changes**:

   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork**:

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**:
   - Go to the GitHub repository
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template

## Coding Standards

### Clarity Smart Contracts

1. **Naming Conventions**:
   - Use kebab-case for function names: `create-pool`
   - Use descriptive variable names
   - Constants in UPPER_SNAKE_CASE: `MINIMUM_LIQUIDITY`

2. **Code Organization**:
   - Group related functions together
   - Use comments to explain complex logic
   - Define constants at the top of the file

3. **Error Handling**:
   - Use descriptive error codes
   - Include error messages in comments
   - Handle edge cases explicitly

### TypeScript/React

1. **Naming Conventions**:
   - Use PascalCase for components: `SwapComponent`
   - Use camelCase for variables and functions: `getUserBalance`
   - Use UPPER_SNAKE_CASE for constants: `API_BASE_URL`

2. **Code Style**:
   - Use TypeScript for all new code
   - Prefer functional components with hooks
   - Use descriptive variable names

3. **File Organization**:
   - Group related files in directories
   - Use index files for clean imports
   - Keep components focused and small

## Testing

### Contract Testing

1. **Unit Tests**:
   - Test all public functions
   - Test edge cases and error conditions
   - Use descriptive test names

2. **Integration Tests**:
   - Test contract interactions
   - Test complete user flows
   - Test with multiple users

3. **Test Structure**:
   ```typescript
   describe("Feature Name", () => {
     it("should do something specific", () => {
       // Arrange
       // Act
       // Assert
     });
   });
   ```

### Frontend Testing

1. **Component Tests**:
   - Test component rendering
   - Test user interactions
   - Test state changes

2. **Integration Tests**:
   - Test complete user flows
   - Test contract interactions
   - Test error handling

## Documentation

1. **Code Comments**:
   - Comment complex logic
   - Document function parameters
   - Explain design decisions

2. **README Updates**:
   - Update installation instructions
   - Document new features
   - Update configuration examples

3. **API Documentation**:
   - Document new endpoints
   - Include request/response examples
   - Document error codes

## Pull Request Process

### Before Submitting

1. **Code Review**:
   - Review your own code
   - Check for typos and errors
   - Ensure tests pass

2. **Documentation**:
   - Update relevant documentation
   - Add comments to new code
   - Update README if needed

3. **Testing**:
   - All tests must pass
   - Add tests for new features
   - Test edge cases

### Pull Request Template

```markdown
## Description

Brief description of the changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] All tests pass
- [ ] New tests added
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Review Process

1. **Automated Checks**:
   - CI/CD pipeline runs tests
   - Code quality checks
   - Security scans

2. **Peer Review**:
   - At least one maintainer review
   - Address all feedback
   - Update code as needed

3. **Approval**:
   - Maintainer approval required
   - All checks must pass
   - Merge after approval

## Issue Reporting

### Bug Reports

1. **Use the Bug Report Template**:
   - Describe the bug
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment details

2. **Include Relevant Information**:
   - Error messages
   - Screenshots
   - Logs
   - Configuration

### Feature Requests

1. **Use the Feature Request Template**:
   - Problem description
   - Proposed solution
   - Alternatives considered
   - Additional context

2. **Provide Context**:
   - Use case details
   - User stories
   - Acceptance criteria

## Release Process

1. **Version Bumping**:
   - Follow semantic versioning
   - Update package.json
   - Create release notes

2. **Tagging**:
   - Create git tag
   - Push to repository
   - Create GitHub release

3. **Deployment**:
   - Deploy contracts
   - Update frontend
   - Monitor for issues

## Community

1. **Discord/Telegram**:
   - Join community channels
   - Ask questions
   - Help others

2. **GitHub Discussions**:
   - Start discussions
   - Share ideas
   - Get feedback

3. **Contributor Recognition**:
   - Contributors listed in README
   - Recognition in releases
   - Contributor badges

## Resources

- [Clarity Documentation](https://docs.stacks.co/clarity)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

Thank you for contributing to Stacks AMM v2!

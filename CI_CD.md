# CI/CD Documentation

Comprehensive guide to the Continuous Integration and Continuous Deployment workflows for the Confidential Legal Fee Allocation project.

---

## Table of Contents

1. [Overview](#overview)
2. [GitHub Actions Workflows](#github-actions-workflows)
3. [Code Quality Tools](#code-quality-tools)
4. [Setting Up CI/CD](#setting-up-cicd)
5. [Workflow Details](#workflow-details)
6. [Codecov Integration](#codecov-integration)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The project uses GitHub Actions for automated testing, code quality checks, and deployment workflows.

### CI/CD Pipeline Features

✅ **Automated Testing** - Run tests on every push and pull request
✅ **Code Quality Checks** - Linting and formatting validation
✅ **Code Coverage** - Track and report test coverage
✅ **Multi-Platform Testing** - Test on Ubuntu and Windows
✅ **Multi-Version Support** - Test on Node.js 18.x and 20.x
✅ **Security Audits** - Automated dependency vulnerability scanning
✅ **Automated Deployment** - Manual deployment triggers

---

## GitHub Actions Workflows

The project includes 4 comprehensive workflows:

### 1. Test Workflow (`.github/workflows/test.yml`)

**Trigger:** Push to `main` or `develop`, Pull requests

**Runs On:**
- Ubuntu (latest)
- Windows (latest)
- Node.js versions: 18.x, 20.x

**Steps:**
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Run linters (Unix only)
5. Check code formatting (Unix only)
6. Compile contracts
7. Run tests
8. Generate coverage report
9. Upload coverage to Codecov

**Matrix Strategy:**
```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]
    os: [ubuntu-latest, windows-latest]
```

### 2. Coverage Workflow (`.github/workflows/coverage.yml`)

**Trigger:** Push to `main` or `develop`, Pull requests

**Runs On:** Ubuntu (latest)

**Steps:**
1. Checkout code
2. Setup Node.js 20.x
3. Install dependencies
4. Compile contracts
5. Generate coverage report
6. Upload to Codecov (enforced)
7. Archive coverage artifacts

### 3. Code Quality Workflow (`.github/workflows/lint.yml`)

**Trigger:** Push to `main` or `develop`, Pull requests

**Jobs:**

#### Lint Job
- ESLint for JavaScript
- Solhint for Solidity
- Prettier format checking

#### Security Job
- npm audit for vulnerabilities
- Continues on moderate vulnerabilities

### 4. Deployment Workflow (`.github/workflows/deploy.yml`)

**Trigger:** Manual dispatch (workflow_dispatch)

**Input:** Network selection (sepolia/localhost)

**Steps:**
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Compile contracts
5. Run tests
6. Deploy to selected network
7. Verify contract (Sepolia only)

---

## Code Quality Tools

### Solhint (Solidity Linter)

Configuration: `.solhint.json`

```bash
# Run Solhint
npm run lint:sol

# Auto-fix issues
npm run lint:sol:fix
```

**Rules:**
- Code complexity: max 8
- Compiler version: ^0.8.24
- Max line length: 120
- Function visibility required
- State visibility required

### ESLint (JavaScript Linter)

Configuration: `.eslintrc.json`

```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint:fix
```

**Rules:**
- Prettier integration
- No unused variables
- Prefer const over let
- No var declarations

### Prettier (Code Formatter)

Configuration: `.prettierrc.json`

```bash
# Format code
npm run format

# Check formatting
npm run format:check
```

**Settings:**
- Print width: 100 (JS), 120 (Solidity)
- Tab width: 2 (JS), 4 (Solidity)
- Single quotes: false
- Trailing commas: ES5

---

## Setting Up CI/CD

### Step 1: GitHub Repository Setup

1. **Create repository** on GitHub
2. **Push code** to repository
3. **Enable Actions** in repository settings

### Step 2: Configure Secrets

Navigate to `Settings > Secrets and variables > Actions`

Add the following secrets:

| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `PRIVATE_KEY` | Wallet private key | Deployment |
| `SEPOLIA_RPC_URL` | Sepolia RPC endpoint | Deployment |
| `ETHERSCAN_API_KEY` | Etherscan API key | Verification |
| `CODECOV_TOKEN` | Codecov upload token | Coverage reporting |

**Getting Codecov Token:**

1. Visit [codecov.io](https://codecov.io/)
2. Sign in with GitHub
3. Add your repository
4. Copy the upload token
5. Add to GitHub secrets as `CODECOV_TOKEN`

### Step 3: Enable Workflows

Workflows automatically run when:
- Code is pushed to `main` or `develop`
- Pull request is opened
- Manual deployment is triggered

---

## Workflow Details

### Test Workflow Matrix

The test workflow runs 4 jobs in parallel:

```
┌─────────────────┬─────────────────┐
│  Ubuntu + 18.x  │  Ubuntu + 20.x  │
├─────────────────┼─────────────────┤
│ Windows + 18.x  │ Windows + 20.x  │
└─────────────────┴─────────────────┘
```

### Workflow Status Badges

Add to README.md:

```markdown
![Tests](https://github.com/USERNAME/REPO/workflows/Tests/badge.svg)
![Coverage](https://github.com/USERNAME/REPO/workflows/Code%20Coverage/badge.svg)
![Lint](https://github.com/USERNAME/REPO/workflows/Code%20Quality/badge.svg)
```

### Workflow Execution Time

| Workflow | Average Time | Matrix Jobs |
|----------|--------------|-------------|
| Tests | ~3-5 minutes | 4 parallel |
| Coverage | ~2-3 minutes | 1 job |
| Lint | ~1-2 minutes | 2 jobs |
| Deploy | ~4-6 minutes | 1 job |

---

## Codecov Integration

### Configuration

File: `codecov.yml`

**Coverage Targets:**
- Project: 95% (required)
- Patch: 90% (required)
- Precision: 2 decimal places

**Comment Behavior:**
- Posts coverage diff on PRs
- Shows file-by-file changes
- Highlights uncovered lines

### Viewing Coverage

1. **On Codecov:**
   - Visit `https://codecov.io/gh/USERNAME/REPO`
   - View detailed coverage reports
   - Track coverage over time

2. **On Pull Requests:**
   - Codecov bot comments with coverage changes
   - Shows coverage diff
   - Indicates if coverage decreased

3. **Locally:**
   ```bash
   npm run test:coverage
   open coverage/index.html
   ```

### Coverage Exclusions

Excluded from coverage:
- `test/**/*` - Test files
- `scripts/**/*` - Deployment scripts
- `hardhat.config.js` - Configuration
- `**/*.test.js` - Test files

---

## Best Practices

### 1. Before Committing

Run the full CI suite locally:

```bash
npm run ci
```

This runs:
- ESLint
- Solhint
- Prettier check
- Contract compilation
- All tests
- Coverage report

### 2. Writing Commit Messages

Follow conventional commits:

```
feat: add new payment recording feature
fix: resolve settlement timing issue
docs: update deployment guide
test: add edge case tests for boundaries
refactor: optimize gas usage in fee calculation
```

### 3. Pull Request Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make changes and test locally**
   ```bash
   npm run ci
   ```

3. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/new-feature
   ```

4. **Create pull request**
   - Use PR template
   - Wait for CI checks to pass
   - Request review

5. **Address review comments**
   - Make changes
   - Push updates
   - Wait for CI re-run

6. **Merge when approved**
   - All CI checks passed
   - Code reviewed
   - Coverage maintained

### 4. Deployment Workflow

1. **Ensure all tests pass**
   ```bash
   npm test
   ```

2. **Trigger deployment**
   - Go to Actions tab
   - Select "Deploy" workflow
   - Click "Run workflow"
   - Select network (sepolia/localhost)
   - Click "Run"

3. **Monitor deployment**
   - Watch workflow progress
   - Check deployment logs
   - Verify contract address

---

## Troubleshooting

### Common Issues

#### 1. Tests Failing in CI but Passing Locally

**Cause:** Environment differences

**Solution:**
```bash
# Clean and reinstall
rm -rf node_modules
npm ci
npm test
```

#### 2. Linting Failures

**Cause:** Code style violations

**Solution:**
```bash
# Fix automatically
npm run lint:fix
npm run lint:sol:fix
npm run format
```

#### 3. Coverage Below Threshold

**Cause:** Insufficient test coverage

**Solution:**
- Add more tests
- Cover edge cases
- Test error conditions

#### 4. Codecov Upload Failure

**Cause:** Invalid token or configuration

**Solution:**
- Verify `CODECOV_TOKEN` secret
- Check `codecov.yml` configuration
- Review workflow logs

#### 5. Deployment Failure

**Cause:** Missing secrets or invalid configuration

**Solution:**
- Verify all secrets are set
- Check `.env` configuration
- Ensure sufficient ETH balance
- Review deployment logs

### Getting Help

1. **Check workflow logs**
   - Navigate to Actions tab
   - Click on failed workflow
   - Review job logs

2. **Review documentation**
   - Check this CI/CD guide
   - Review GitHub Actions docs
   - Check Hardhat documentation

3. **Run locally**
   ```bash
   # Full CI pipeline
   npm run ci

   # Specific checks
   npm run lint
   npm run test
   npm run test:coverage
   ```

---

## CI/CD Checklist

### Initial Setup
- [x] Create GitHub repository
- [x] Add workflow files
- [x] Configure secrets
- [x] Set up Codecov
- [x] Add status badges

### Before Each Commit
- [ ] Run `npm run ci`
- [ ] All tests pass
- [ ] Linting passes
- [ ] Coverage maintained
- [ ] Code formatted

### Before Each Release
- [ ] All CI checks pass
- [ ] Documentation updated
- [ ] Version bumped
- [ ] Changelog updated
- [ ] Deployment tested

---

## Workflow Files Reference

```
.github/
├── workflows/
│   ├── test.yml          # Main test workflow
│   ├── coverage.yml      # Coverage reporting
│   ├── lint.yml          # Code quality checks
│   └── deploy.yml        # Deployment workflow
└── PULL_REQUEST_TEMPLATE.md
```

---

## Summary

The CI/CD pipeline provides:

✅ **Automated testing** on every push and PR
✅ **Multi-platform support** (Ubuntu, Windows)
✅ **Multi-version testing** (Node 18.x, 20.x)
✅ **Code quality enforcement** (ESLint, Solhint, Prettier)
✅ **Coverage tracking** (Codecov integration)
✅ **Security audits** (npm audit)
✅ **Automated deployment** (manual trigger)
✅ **Pull request templates** (standardized reviews)

All workflows are configured to maintain high code quality and ensure reliability before deployment.

For questions or issues, please open an issue on GitHub or refer to the main README.md.

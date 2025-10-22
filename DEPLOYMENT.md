# NPM Deployment Guide

This guide explains how to deploy packages from this monorepo to npm.

## Prerequisites

1. **NPM Account**: Create an account at [npmjs.com](https://www.npmjs.com)
2. **NPM Token**: Generate an access token with publish permissions
3. **GitHub Secrets**: Add your NPM token to GitHub repository secrets

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Changeset

Initialize changeset (already configured):

```bash
pnpm changeset
```

### 3. GitHub Secrets

Add the following secrets to your GitHub repository:

- `NPM_TOKEN`: Your npm access token with publish permissions

## Deployment Workflows

### Automated Deployment (Recommended)

The GitHub Actions workflow automatically publishes packages when:

1. Changes are pushed to the `main` branch
2. Changes affect files in the `packages/` directory
3. A changeset is present

#### Workflow Steps:

1. **Trigger**: Push to main branch or manual dispatch
2. **Build**: All packages are built
3. **Test**: Tests are run
4. **Version**: Changesets are processed and versions updated
5. **Publish**: Packages are published to npm
6. **Commit**: Version changes are committed back to the repository

### Manual Deployment

#### 1. Create Changeset

```bash
pnpm changeset
```

This will:

- Prompt you to select packages to include
- Ask for the type of change (major, minor, patch)
- Create a changeset file in `.changeset/`

#### 2. Version Packages

```bash
pnpm version-packages
```

This updates package versions based on changesets.

#### 3. Build and Publish

```bash
pnpm release
```

This builds all packages and publishes them to npm.

## Package Configuration

### Font Package (`@angular-utils/font`)

- **Name**: `@angular-utils/font`
- **Current Version**: `2.0.0`
- **Registry**: npm (public)
- **Files Included**: `dist/`, `builders.json`, `README.md`, `package.json`

### Package Structure

```
packages/font/
├── dist/                 # Built package files
├── builders.json         # Angular CLI builders
├── README.md            # Package documentation
├── package.json         # Package metadata
└── src/                 # Source files
```

## Version Management

### Changeset Types

- **patch**: Bug fixes, small improvements
- **minor**: New features, backward compatible
- **major**: Breaking changes

### Version Bumping

Changesets automatically determine version bumps based on:

- **Dependencies**: Internal package dependencies
- **Changes**: Type of changes made
- **Breaking Changes**: Explicit breaking change markers

## Troubleshooting

### Common Issues

1. **Authentication Error**
   - Verify NPM_TOKEN is correctly set in GitHub secrets
   - Ensure token has publish permissions

2. **Version Conflicts**
   - Check if version already exists on npm
   - Use `pnpm changeset` to create proper version bumps

3. **Build Failures**
   - Ensure all dependencies are installed
   - Run `pnpm build` locally to verify

### Manual Override

If automated deployment fails:

1. Check GitHub Actions logs
2. Fix any issues locally
3. Push fixes to trigger new deployment
4. Or use manual deployment process

## Security

- NPM tokens are stored as GitHub secrets
- Tokens have minimal required permissions
- All deployments are logged and auditable

## Monitoring

- GitHub Actions provides deployment logs
- NPM registry shows published versions
- Package download statistics available on npmjs.com

## Support

For issues with deployment:

1. Check GitHub Actions logs
2. Verify npm token permissions
3. Review changeset configuration
4. Test locally before pushing

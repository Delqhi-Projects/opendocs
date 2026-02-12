# Deployment Guide

## Overview

This project uses **GitHub Container Registry (GHCR)** for automated deployments via GitHub Actions.

### Architecture

- **Registry**: GitHub Container Registry (`ghcr.io`)
- **Authentication**: GitHub Actions `GITHUB_TOKEN` (automatic)
- **Staging**: Triggered on `develop` branch → `:staging` tag
- **Production**: Triggered on `main` branch → `:latest` and `:sha` tags

### Image Tags

- `ghcr.io/OWNER/REPO/opendocs:staging` - Latest staging build
- `ghcr.io/OWNER/REPO/opendocs:latest` - Latest production build
- `ghcr.io/OWNER/REPO/opendocs:SHA` - Specific production commit

## One-Time Setup

### 1. Enable GitHub Actions Permissions

Your repository must have write permissions enabled for GITHUB_TOKEN:

1. Go to repository **Settings**
2. Navigate to **Actions** → **General**
3. Scroll to **Workflow permissions**
4. Select **"Read and write permissions"**
5. Check **"Allow GitHub Actions to create and approve pull requests"** (optional)
6. Click **Save**

### 2. Configure Package Visibility

After first deployment, configure package visibility:

1. Go to your GitHub profile → **Packages**
2. Find `opendocs` package
3. Click **Package settings**
4. Set visibility (Public or Private)
5. Optional: Link package to repository

## Automatic Deployments

### Staging Deployment

Automatically triggered when code is pushed to `develop` branch:

```bash
git checkout develop
git add .
git commit -m "Your changes"
git push origin develop
```

This will:

1. Run type-check and tests
2. Build the application
3. Push Docker image to `ghcr.io/OWNER/REPO/opendocs:staging`

### Production Deployment

Automatically triggered when code is pushed to `main` branch:

```bash
git checkout main
git merge develop
git push origin main
```

This will:

1. Run type-check and tests
2. Build the application
3. Push Docker images:
   - `ghcr.io/OWNER/REPO/opendocs:latest`
   - `ghcr.io/OWNER/REPO/opendocs:COMMIT_SHA`

## Manual Deployments

### Pull and Run Staging Image

```bash
docker pull ghcr.io/OWNER/REPO/opendocs:staging
docker run -p 3000:3000 \
  -e VITE_SUPABASE_URL=your_supabase_url \
  -e VITE_SUPABASE_ANON_KEY=your_anon_key \
  ghcr.io/OWNER/REPO/opendocs:staging
```

### Pull and Run Production Image

```bash
docker pull ghcr.io/OWNER/REPO/opendocs:latest
docker run -p 3000:3000 \
  -e VITE_SUPABASE_URL=your_supabase_url \
  -e VITE_SUPABASE_ANON_KEY=your_anon_key \
  ghcr.io/OWNER/REPO/opendocs:latest
```

### Pull Specific Version

```bash
# Replace COMMIT_SHA with actual commit hash
docker pull ghcr.io/OWNER/REPO/opendocs:COMMIT_SHA
docker run -p 3000:3000 \
  -e VITE_SUPABASE_URL=your_supabase_url \
  -e VITE_SUPABASE_ANON_KEY=your_anon_key \
  ghcr.io/OWNER/REPO/opendocs:COMMIT_SHA
```

### Using Docker Compose

Update `docker-compose.yml` to use GHCR images:

```yaml
services:
  app:
    image: ghcr.io/OWNER/REPO/opendocs:latest
    # ... rest of configuration
```

Then run:

```bash
docker-compose up -d
```

## Rollback Procedures

### Rollback to Previous Version

1. **Find the commit SHA** of the previous working version:

   ```bash
   git log --oneline
   ```

2. **Pull and deploy that specific version**:
   ```bash
   docker pull ghcr.io/OWNER/REPO/opendocs:PREVIOUS_SHA
   docker stop opendocs-container
   docker run -d --name opendocs-container -p 3000:3000 \
     -e VITE_SUPABASE_URL=your_supabase_url \
     -e VITE_SUPABASE_ANON_KEY=your_anon_key \
     ghcr.io/OWNER/REPO/opendocs:PREVIOUS_SHA
   ```

### Rollback via Git

If you need to rollback the codebase:

```bash
# Rollback to previous commit
git revert HEAD
git push origin main

# Or rollback to specific commit
git reset --hard COMMIT_SHA
git push origin main --force
```

## Environment Variables

### Required Variables

These must be set when running containers:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Setting Environment Variables

**Docker Run**:

```bash
docker run -p 3000:3000 \
  -e VITE_SUPABASE_URL=https://xxx.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=your_key \
  ghcr.io/OWNER/REPO/opendocs:latest
```

**Docker Compose**:

```yaml
environment:
  - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
  - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
```

**GitHub Actions** (for additional secrets):

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add your secret name and value

## Troubleshooting

### Deployment Fails: "permission denied"

**Problem**: GitHub Actions doesn't have write permissions.

**Solution**: Enable workflow permissions:

1. Settings → Actions → General
2. Workflow permissions → "Read and write permissions"
3. Save changes

### Cannot Pull Image: "unauthorized"

**Problem**: You're not authenticated to GHCR.

**Solution**: Login to GHCR:

```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

Generate a Personal Access Token with `read:packages` scope at:
https://github.com/settings/tokens

### Image Not Found

**Problem**: Package might be private or not yet pushed.

**Solution**:

1. Check workflow logs in Actions tab
2. Verify package exists in your GitHub profile → Packages
3. If private, ensure you're authenticated

### Build Fails in CI

**Problem**: Tests or type-check failing.

**Solution**:

1. Check workflow logs for specific error
2. Run locally: `npm run type-check && npm run test`
3. Fix errors and push again

### Container Starts But App Doesn't Work

**Problem**: Missing environment variables.

**Solution**: Verify all required environment variables are set:

```bash
docker logs CONTAINER_ID
```

## Security Best Practices

### 1. Protect Secrets

- Never commit secrets to repository
- Use GitHub Secrets for sensitive values
- Rotate secrets periodically

### 2. Image Access Control

- Set package visibility appropriately (Public/Private)
- Use GitHub team permissions to control access
- Review package access regularly

### 3. Dependency Security

- Regularly update dependencies: `npm audit fix`
- Monitor Dependabot alerts
- Review security advisories

### 4. Image Scanning

Consider adding security scanning to workflow:

```yaml
- name: Scan image
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ghcr.io/${{ github.repository }}/opendocs:latest
    format: "sarif"
    output: "trivy-results.sarif"
```

## Advanced Configuration

### Multi-Stage Production Environments

To deploy to multiple production environments:

1. Create environment-specific branches (`prod-us`, `prod-eu`)
2. Add environment-specific tags in workflow
3. Configure separate GitHub Environments with protection rules

### Custom Domain Setup

When deploying to cloud providers:

1. Pull image from GHCR
2. Deploy to your platform (AWS ECS, GCP Cloud Run, Azure Container Instances)
3. Configure load balancer and custom domain
4. Set up SSL/TLS certificates

### Monitoring and Logging

Integrate logging and monitoring:

```yaml
services:
  app:
    image: ghcr.io/OWNER/REPO/opendocs:latest
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## CI/CD Pipeline Details

### Workflow Jobs

1. **type-check**: Validates TypeScript types
2. **test**: Runs Vitest with coverage, uploads to Codecov
3. **build**: Compiles application, uploads `dist/` artifact
4. **deploy-staging**: Pushes to GHCR (develop branch only)
5. **deploy-production**: Pushes to GHCR (main branch only)

### Job Dependencies

```
type-check ─┐
            ├─→ build ─→ deploy-staging (develop)
test ───────┘           └─→ deploy-production (main)
```

### Artifact Retention

Build artifacts (`dist/`) are retained for 7 days and can be downloaded from GitHub Actions runs.

## Support

For issues or questions:

- Check [GitHub Issues](https://github.com/OWNER/REPO/issues)
- Review [GitHub Actions logs](https://github.com/OWNER/REPO/actions)
- Consult [GHCR documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

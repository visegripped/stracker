# Stracker

## Local development

1. Install docker
2. Start docker
3. Run `docker-compose up` in your terminal
4. Visit http://localhost:5173 in your browser to access the React app

The Docker setup automatically starts:
- MySQL database
- PHP/Apache server (port 80/443)
- React/Vite dev server (port 5173)
- Adminer database admin tool (port 8000)

All services communicate through Docker's internal network, eliminating CORS issues. The Vite dev server proxies API requests to the PHP service automatically.

## Links

- React app is available at: http://localhost:5173
- PHP/Apache is available at: http://localhost
- Adminer (database admin) is available at: http://localhost:8000

If the API is pointed at the production endpoint, toggle the root and rootb values in endpoints.json

## TokenId

You can grab this from your debug tool in session storage - localhost - tokenId (handy for postman)

## Deployment

### Prerequisites

Before deploying, ensure you have a `.env` file with SSH credentials:
   ```
   SSH_HOST=your.host.com
   SSH_PORT=18765
   SSH_USERNAME=your_username
   SSH_PASSWORD=your_password
   # OR use SSH key authentication:
   SSH_KEY_PATH=/path/to/your/private/key
   SSH_KEY_PASSPHRASE=your_passphrase_if_needed
   ```

### Deploy Commands

The deploy script automatically handles versioning, deployment, and Git tagging for the `master` branch:

```bash
# Deploy with patch version bump (1.0.0 → 1.0.1) - default
pnpm deploy
# or
pnpm deploy:patch

# Deploy with minor version bump (1.0.5 → 1.1.0)
pnpm deploy:minor

# Deploy with major version bump (1.2.3 → 2.0.0)
pnpm deploy:major
```

### Deployment Process (Master Branch Only)

When deploying from `master`, the script:

1. **Validates** - Fetches GitHub tags and ensures `package.json` version matches the latest tag
2. **Bumps Version** - Updates `package.json` locally (not committed yet)
3. **Deploys PHP** - Uploads backend files, includes, vendor, and API files first
4. **Deploys Frontend** - Uploads HTML, CSS, and JS assets (only if PHP succeeds)
5. **Commits & Tags** - After successful deployment:
   - Commits version bump to master
   - Pushes commit to GitHub
   - Creates annotated Git tag (e.g., `v1.0.1`)
   - Pushes tag to GitHub

### Non-Master Branch Deployments

For feature branches, the script creates a canary version (e.g., `1.0.1-canary-feature-branch`) without Git operations.

### Automatic Rollback

The deploy script includes automatic rollback protection:

- ✅ **Connection failure** - `package.json` changes are automatically rolled back
- ✅ **PHP deployment failure** - `package.json` changes are automatically rolled back
- ⚠️  **Frontend deployment failure** - PHP stays deployed (backend is functional), manual intervention may be needed

### Manual Rollback

If you need to rollback a successful deployment:

1. **Revert the version commit:**
   ```bash
   git revert HEAD
   git push origin master
   ```

2. **Delete the Git tag:**
   ```bash
   # Delete locally
   git tag -d v1.0.1
   
   # Delete from GitHub
   git push origin :refs/tags/v1.0.1
   ```

3. **Redeploy the previous version** if needed, or manually fix files on the server via SSH/FTP

### Troubleshooting

**Version mismatch error:**
If deployment fails with "Version mismatch detected", it means `package.json` and the latest GitHub tag are out of sync. Resolve this manually before deploying.

**SSH authentication issues:**
See the error messages in the deploy output for specific guidance on SSH key setup or password authentication.

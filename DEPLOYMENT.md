# SmartOCR.ai — Cloudflare Pages Deployment Guide

This guide covers deploying SmartOCR.ai to Cloudflare Pages with KV-backed analytics, custom domains, and GitHub Actions CI/CD.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [KV Namespace Setup](#kv-namespace-setup)
4. [Deploy to Cloudflare Pages](#deploy-to-cloudflare-pages)
5. [GitHub Actions CI/CD](#github-actions-cicd)
6. [Custom Domain Configuration](#custom-domain-configuration)
7. [Environment Variables](#environment-variables)
8. [Performance Monitoring](#performance-monitoring)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Requirement | Version | Install |
|-------------|---------|---------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| npm | 9+ | Comes with Node.js |
| Wrangler CLI | 3.x | `npm install -g wrangler` |
| Cloudflare account | Free tier or above | [dash.cloudflare.com](https://dash.cloudflare.com) |
| GitHub account | — | [github.com](https://github.com) |

### Verify Installation

```bash
node --version    # v18.x.x or higher
npm --version     # 9.x.x or higher
wrangler --version # 3.x.x
```

---

## Initial Setup

### 1. Clone and install

```bash
git clone https://github.com/your-org/smart-ocr.git
cd smart-ocr
npm install
```

### 2. Authenticate with Cloudflare

```bash
wrangler login
```

This opens a browser for OAuth. After authorizing, the CLI stores credentials locally.

### 3. Verify authentication

```bash
wrangler whoami
```

---

## KV Namespace Setup

The analytics API stores event data in Cloudflare KV. Create the namespace before deploying.

### Create KV Namespace

```bash
# Production namespace
wrangler kv namespace create "KV"
```

Output:

```
 { binding = "KV", id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" }
```

Copy the `id` value.

### Update wrangler.toml

Replace the placeholder in `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "KV"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"  # ← paste your ID here
```

### Preview/Development Namespace (Optional)

For `wrangler pages dev` local testing:

```bash
wrangler kv namespace create "KV" --preview
```

Add the preview ID:

```toml
[[kv_namespaces]]
binding = "KV"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
preview_id = "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"
```

---

## Deploy to Cloudflare Pages

### Option A: Direct Upload (CLI)

```bash
# Build the project
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy ./dist --project-name=smart-ocr
```

On success, Wrangler prints your deployment URL:

```
✨ Successfully deployed the project to https://xxxxxxxx.smart-ocr.pages.dev
```

### Option B: Continuous Deployment (GitHub)

See [GitHub Actions CI/CD](#github-actions-cicd) below.

### After First Deploy

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) > **Workers & Pages** > **smart-ocr**
2. Navigate to **Settings** > **Environment variables**
3. Add production variables:

| Key | Value |
|-----|-------|
| `CORS_ORIGIN` | `https://smartocr.ai` |
| `ENVIRONMENT` | `production` |

4. Under **Functions** > **KV namespace bindings**, confirm the `KV` binding is linked to your namespace

---

## GitHub Actions CI/CD

### 1. Get Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) > **My Profile** > **API Tokens**
2. Click **Create Token**
3. Use the **Edit Cloudflare Workers** template, or create a custom token with:
   - Permissions: `Account > Workers Scripts > Edit`, `Account > KV Storage > Edit`
   - Resources: Include your account
4. Copy the token

### 2. Get Cloudflare Account ID

1. Go to **Workers & Pages** > right sidebar > **Account ID**
2. Copy the value

### 3. Add GitHub Secrets

Go to your GitHub repo > **Settings** > **Secrets and variables** > **Actions** > **New repository secret**:

| Secret Name | Value |
|-------------|-------|
| `CLOUDFLARE_API_TOKEN` | Your API token |
| `CLOUDFLARE_ACCOUNT_ID` | Your account ID |

### 4. Push to trigger deployment

```bash
git add .
git commit -m "chore: add CI/CD pipeline"
git push origin main
```

The workflow in `.github/workflows/deploy.yml` will:
1. Install dependencies
2. Run type checking
3. Run linting
4. Build the project
5. Deploy to Cloudflare Pages

### Workflow File

See [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) for the full configuration.

---

## Custom Domain Configuration

### Prerequisites

- Your domain (`smartocr.ai`) must be managed by Cloudflare DNS, **or**
- You must be able to add DNS records at your registrar

### Step 1: Add Custom Domain in Pages

1. Go to **Cloudflare Dashboard** > **Workers & Pages** > **smart-ocr** > **Custom domains**
2. Click **Set up a custom domain**
3. Enter `smartocr.ai`
4. Click **Continue**

If your domain uses Cloudflare DNS, the CNAME record is created automatically.

If your domain uses an external registrar, add this DNS record:

| Type | Name | Target | Proxy status |
|------|------|--------|--------------|
| CNAME | `@` | `smart-ocr.pages.dev` | Proxied |

### Step 2: Add www subdomain

1. Repeat for `www.smartocr.ai`
2. Add DNS record:

| Type | Name | Target | Proxy status |
|------|------|--------|--------------|
| CNAME | `www` | `smart-ocr.pages.dev` | Proxied |

### Step 3: Verify SSL

Cloudflare provisions SSL certificates automatically. Check:

1. **SSL/TLS** > **Overview** — should show **Full (strict)**
2. **SSL/TLS** > **Edge Certificates** — certificate should be **Active**

### Step 4: Redirect www to apex (optional)

Add to `public/_redirects`:

```
https://www.smartocr.ai/* https://smartocr.ai/:splat 301
```

---

## Environment Variables

### Set via Cloudflare Dashboard

1. **Workers & Pages** > **smart-ocr** > **Settings** > **Environment variables**
2. Click **Add variable**
3. Set for **Production** and/or **Preview** environments

| Variable | Production Value | Preview Value |
|----------|-----------------|---------------|
| `CORS_ORIGIN` | `https://smartocr.ai` | `https://smart-ocr.pages.dev` |
| `ENVIRONMENT` | `production` | `preview` |

### Set via Wrangler CLI

```bash
wrangler pages secret put CORS_ORIGIN --project-name=smart-ocr
# Enter: https://smartocr.ai

wrangler pages secret put ENVIRONMENT --project-name=smart-ocr
# Enter: production
```

### Set in wrangler.toml (Local Dev Only)

Already configured in `wrangler.toml`:

```toml
[vars]
ENVIRONMENT = "production"
CORS_ORIGIN = "https://smartocr.ai"
```

---

## Performance Monitoring

### Cloudflare Web Analytics

Enable free, privacy-friendly analytics:

1. Go to **Cloudflare Dashboard** > **Settings** > **Web Analytics**
2. Click **Enable**
3. Add the tracking script to your `<head>`:

```html
<script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "YOUR_TOKEN"}'></script>
```

Or use the Cloudflare Zaraz integration for more control.

### Real User Monitoring (RUM)

Cloudflare Web Analytics automatically tracks:
- Core Web Vitals (LCP, FID, CLS)
- Page load times
- Visitor metrics

### Custom Analytics

The app's `/api/track` endpoint logs:
- OCR processing events
- Language selection
- Text copy/download actions
- Processing time metrics

Query via KV:

```bash
# List recent events
wrangler kv key list --binding=KV --prefix="evt:"

# Get daily aggregate
wrangler kv key get "daily:2026-06-14" --binding=KV

# Get total counter
wrangler kv key get "counter:total" --binding=KV
```

### Lighthouse Audit

Run a Lighthouse audit to verify performance:

```bash
npx lighthouse https://smartocr.ai --view
```

Target scores:
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

---

## Troubleshooting

### Deploy fails with "Account not found"

```bash
wrangler login
wrangler whoami
```

Verify your account has Pages project permissions.

### KV binding errors in Functions

Ensure:
1. KV namespace exists: `wrangler kv namespace list`
2. Binding name in `wrangler.toml` matches the `Env` interface in `functions/api/track.ts`
3. Namespace ID is correct (not the preview ID)

### CORS errors on analytics endpoint

Set `CORS_ORIGIN` environment variable to your exact production domain:

```bash
wrangler pages secret put CORS_ORIGIN --project-name=smart-ocr
# Enter: https://smartocr.ai
```

### Build succeeds but deploy shows 404

Check `wrangler.toml`:

```toml
pages_build_output_dir = "./dist"
```

Ensure this points to your Vite build output directory.

### Custom domain shows "Pending"

DNS propagation can take up to 24 hours. Verify:

1. DNS records are correct: `dig smartocr.ai CNAME`
2. SSL certificate is active in Cloudflare dashboard

### Functions not deployed

Ensure the `functions/` directory is in the project root (not inside `src/`).

---

## Rollback

To revert to a previous deployment:

1. **Cloudflare Dashboard** > **Workers & Pages** > **smart-ocr** > **Deployments**
2. Find the deployment to revert to
3. Click **...** > **Rollback to this deployment**

Or via CLI:

```bash
wrangler pages deployment rollback --project-name=smart-ocr
```

---

## Cost Estimate

Cloudflare Pages free tier includes:

| Resource | Free Tier |
|----------|-----------|
| Builds | 500/month |
| Deployments | Unlimited |
| Bandwidth | Unlimited |
| Requests | 100,000/day (Functions) |
| KV Reads | 100,000/day |
| KV Writes | 1,000/day |
| KV Storage | 1 GB |

SmartOCR.ai's analytics usage will comfortably fit within the free tier for most applications.

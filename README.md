# SmartOCR.ai

AI-powered OCR web application built with React, Vite, and Tesseract.js. Runs entirely in the browser with no server-side image processing. Deploys to Cloudflare Pages with edge analytics via Pages Functions + KV.

## Features

- **Client-side OCR** — Tesseract.js processes images in the browser via Web Workers; no images leave the user's device
- **Multi-language support** — English, Spanish, French, German, Portuguese, Italian, Dutch, Japanese, Chinese, Korean
- **Drag & drop** — Drop images or paste from clipboard
- **Text export** — Copy to clipboard or download as `.txt`
- **Analytics dashboard** — Real-time usage metrics stored in Cloudflare KV
- **Responsive** — Mobile-first Tailwind CSS design
- **Privacy-first** — All processing happens client-side

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite 5 |
| Styling | Tailwind CSS 3 |
| OCR Engine | Tesseract.js 5 |
| State | Zustand 4 |
| Icons | Lucide React |
| Hosting | Cloudflare Pages |
| Functions | Pages Functions (Workers runtime) |
| Analytics Storage | Cloudflare KV |

## Project Structure

```
smart-ocr/
├── public/
│   ├── _headers          # Security & cache headers
│   └── _redirects        # Cloudflare Pages redirects
├── functions/
│   └── api/
│       └── track.ts      # Analytics API endpoint
├── src/
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilities
│   ├── stores/           # Zustand stores
│   └── styles/           # CSS / Tailwind
├── .env.example          # Environment variables template
├── .github/
│   └── workflows/
│       └── deploy.yml    # GitHub Actions CI/CD
├── wrangler.toml         # Cloudflare configuration
├── package.json
├── tsconfig.json
├── vite.config.ts
├── DEPLOYMENT.md         # Detailed deployment guide
└── README.md
```

## Local Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/smart-ocr.git
cd smart-ocr

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start dev server
npm run dev
```

The app runs at `http://localhost:5173` by default.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build locally |
| `npm run deploy` | Build and deploy to Cloudflare Pages |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript compiler in check mode |

## Build & Deploy

### Quick Deploy (Cloudflare Pages)

```bash
# Install Wrangler globally (if not already)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
npm run deploy
```

### Deploy via GitHub (Recommended)

Push to the `main` branch. GitHub Actions will automatically build and deploy to Cloudflare Pages.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full step-by-step guide.

## Custom Domain

After deployment:

1. Go to **Cloudflare Dashboard** > **Pages** > **smart-ocr** > **Custom domains**
2. Add `smartocr.ai` and `www.smartocr.ai`
3. Cloudflare provisions SSL certificates automatically
4. DNS records are created automatically when using Cloudflare DNS

See [DEPLOYMENT.md](./DEPLOYMENT.md#custom-domain-configuration) for detailed instructions.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `CORS_ORIGIN` | Allowed origin for analytics API | Yes (production) |
| `ENVIRONMENT` | Deployment environment label | No |

Set via Cloudflare Dashboard > Pages > Settings > Environment variables, or via `wrangler.toml` `[vars]` section for local dev.

## Troubleshooting

### Build fails with TypeScript errors

```bash
npm run typecheck
```

Fix any reported errors before deploying.

### OCR not working in production

Ensure `tesseract.js` worker files are served correctly. Check that `node_modules/tesseract.js` is included in the build output or bundled by Vite.

### Analytics API returns CORS errors

Verify `CORS_ORIGIN` is set to your production domain (`https://smartocr.ai`) in Cloudflare Pages environment variables.

### KV binding not found

Create the KV namespace and update the binding in `wrangler.toml`:

```bash
wrangler kv namespace create "KV"
```

Copy the returned ID into `wrangler.toml` under `[[kv_namespaces]]`.

### Deploy command fails with auth error

```bash
wrangler login
```

Ensure your Cloudflare account has Pages project permissions.

## Performance

- **Lighthouse score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Total Blocking Time**: < 200ms
- **Cumulative Layout Shift**: < 0.1

## License

MIT

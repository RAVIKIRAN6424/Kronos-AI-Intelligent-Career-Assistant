# ⚙️ Kronos AI - GitHub Actions CI/CD Pipeline

## Overview
Kronos AI utilizes **GitHub Actions** to automate continuous integration and build verification whenever code is pushed to the `main` branch or a Pull Request is opened.

---

## Workflow Configuration (`.github/workflows/ci-cd.yml`)

```yaml
name: Node.js CI & Production Build Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    name: Build & Verify (Node.js)
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install All Dependencies (Root, Backend, Frontend)
        run: |
          npm install
          npm --prefix backend install
          npm --prefix frontend install

      - name: Build Vite Frontend & Synchronize Assets
        run: npm run build

      - name: Verify Build Artifacts
        run: |
          node -e "if (!require('fs').existsSync('dist/index.html')) { console.error('Missing dist/index.html'); process.exit(1); }"
          console.log('✅ Build verification passed!')
```

---

## Pipeline Execution Steps
1. **Checkout Code**: Retrieves the repository commit.
2. **Setup Node.js**: Matrix builds across Node.js `18.x` and `20.x` LTS.
3. **Install Dependencies**: Installs root, `backend/`, and `frontend/` node modules.
4. **Compile Production Assets**: Runs `npm run build` to execute Vite build and `scripts/sync-dist.js`.
5. **Verify Dist Outputs**: Confirms `dist/index.html` and bundled assets exist.

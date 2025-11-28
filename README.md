# KAGGLE-GOOGLE Monorepo

A Turborepo monorepo for Google Generative AI Capstone projects.

## Structure

```
KAGGLE-GOOGLE/
├── apps/
│   └── tta-1/          # The Teacher's Teacher Assistant
├── packages/
│   └── (shared packages)
├── package.json
├── turbo.json
└── pnpm-workspace.yaml
```

## Apps

### TTA-1 - The Teacher's Teacher Assistant
AI-powered lesson enhancement system using Google Gemini API.

**Features**:
- CSV student data analysis
- AI-powered lesson improvement
- Multi-agent workflow (Analyst, Auditor, Architect)
- Iterative validation and refinement

**Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, Prisma, Google Gemini AI

**Location**: `apps/tta-1/`

## Getting Started

### Prerequisites
- Node.js >= 18
- pnpm >= 9.0.0

### Installation

```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm

# Install dependencies
pnpm install

# Run all apps in development mode
pnpm dev

# Build all apps
pnpm build
```

### Running Specific Apps

```bash
# Run TTA-1
cd apps/tta-1
pnpm dev

# Build TTA-1
cd apps/tta-1
pnpm build
```

## Development

### Adding a New App

```bash
# Create new app directory
mkdir -p apps/my-new-app
cd apps/my-new-app

# Initialize with your framework of choice
# (Next.js, Vite, etc.)
```

### Adding a Shared Package

```bash
# Create new package
mkdir -p packages/my-package
cd packages/my-package

# Initialize package.json
pnpm init
```

## Scripts

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps
- `pnpm lint` - Lint all apps
- `pnpm test` - Run tests for all apps
- `pnpm format` - Format code with Prettier

## Turborepo

This monorepo uses [Turborepo](https://turbo.build/) for:
- Fast, incremental builds
- Remote caching
- Parallel execution
- Dependency graph management

## License

MIT

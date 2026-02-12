# OpenDocs Developer Guide

## Architecture

```
src/
├── components/
│   ├── blocks/         # Block components (21 types)
│   ├── ui/           # Shared UI components
│   └── automation/    # n8n-style builder
├── hooks/             # React hooks
├── lib/              # Utilities
│   ├── automation/   # Rule engine
│   └── openclaw/    # WhatsApp integration
├── store/           # State management
├── styles/          # CSS design tokens
└── types/           # TypeScript types
```

## Adding New Blocks

1. Create component in `src/components/blocks/`
2. Add type to `BlockType` in `src/types/docs.ts`
3. Add case in `BlockRenderer.tsx`
4. Add to SlashMenu options

## Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Visual regression
npm run test:visual
```

## Docker Development

```bash
docker-compose up -d
npm run dev
```

## API Integration

See `src/tests/swagger.ts` for API documentation.

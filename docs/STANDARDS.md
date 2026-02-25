# Engineering Standards

## Merge gate (hard)

PRs must pass:

1. `pnpm format:check`
2. `pnpm lint`
3. `pnpm typecheck`
4. `pnpm test`
5. `pnpm test:e2e`

## Code standards

- TypeScript strict mode only
- No `any`
- Explicit interfaces for external boundaries
- Deterministic tests

## Documentation standards

Any new core module requires:

- Purpose
- Inputs/outputs
- Failure modes
- Security considerations

## Operational standards

- Testnet-only by default for any live tx tests
- Feature flags for dangerous ops
- Human approval hook for high-risk actions

# AGENTS.md

## Mission

Build and maintain OmniWallet as a secure local-first multichain wallet and bridge skill.

## Hard rules

1. Never implement private key export functionality
2. Never log secrets or signing payloads with sensitive fields
3. Policy enforcement must run before signing/broadcast
4. Test + E2E must pass before merge

## Workflow

- Branch from `main`
- Keep commits small and auditable
- Run `pnpm verify` before push
- Add docs for any core behavior changes

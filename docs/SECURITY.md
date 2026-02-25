# OmniWallet Security Standard

## Threat model

- Prompt injection attempts to leak keys
- Unauthorized tx execution
- Bridge route abuse/drain
- CI/log secret leakage

## Controls

### 1) Key non-exportability

`KeyVault` intentionally has no private key export method.

### 2) Policy enforcement

All user actions route through policy checks:

- allowed chain
- max per tx
- bridge provider allowlist
- contract allowlist

### 3) Separation of duties

- Agent: intent + orchestration
- Signer: key custody + signing

### 4) Production recommendations

- Use local HSM / Vault Transit / hardware-backed signer
- Isolate signer process under separate user
- Use short-lived auth token between orchestrator and signer
- Full audit trail for every signature request

### 5) Red lines

- No plaintext private keys in repo or logs
- No `.env` private keys committed
- No key export APIs

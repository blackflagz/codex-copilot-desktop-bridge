# Codex Copilot Desktop Bridge Notes

Codex Desktop notes for GitHub Copilot `gpt-5.5`, unsupported `image_generation`, and weak model fallback.

Small Windows-tested notes for running Codex Desktop against GitHub Copilot's Responses API.

This is not a replacement for [`voidsteed/copilot-proxy-api`](https://github.com/voidsteed/copilot-proxy-api). That project already does most of the hard work and should be the first place to contribute fixes.

This repo captures a narrow Codex Desktop edge case we hit while testing `gpt-5.5` through GitHub Copilot:

- Codex Desktop can send the built-in `image_generation` tool even when the upstream provider does not support it.
- Codex Desktop may hide local/custom `model_catalog_json` models in the picker even when the app server and CLI can see them.
- Codex Desktop can try a lower-quality fallback model during retries. For some workflows, that is worse than failing.
- Steering or interrupting a long stream can close the client connection before the proxy finishes writing.

The bridge in `scripts/codex-copilot-bridge.mjs` is deliberately small. It does only three things:

1. Forwards `/v1/responses` to `https://api.githubcopilot.com/responses`.
2. Removes unsupported `image_generation` tools.
3. Rewrites model requests outside a small allowlist back to a preferred model.

It is intended as a reproducible note for upstream maintainers, not as a full proxy.

## Search terms this repo is meant to answer

- Codex Desktop GitHub Copilot GPT-5.5
- OpenAI Codex GitHub Copilot bridge
- `image_generation` is not supported
- `api.githubcopilot.com/responses`
- Codex Desktop model fallback
- Codex custom provider `model_catalog_json`
- Codex Desktop model picker custom provider

## Why not publish a full proxy?

There are already maintained projects in this space:

- [`voidsteed/copilot-proxy-api`](https://github.com/voidsteed/copilot-proxy-api)
- [`ericc-ch/copilot-api`](https://github.com/ericc-ch/copilot-api)

The better path is to upstream useful Codex Desktop behavior there if maintainers want it.

## Tested shape

Observed with:

- Codex Desktop on Windows
- GitHub Copilot `gpt-5.5`
- `api.githubcopilot.com/responses`
- `model_reasoning_effort = "xhigh"`

The bridge saw Codex Desktop send requests like this:

```text
POST /responses model=gpt-5.5 stream=true tools=...,web_search stripped=image_generation
```

When Codex tried a weaker retry model, the bridge rewrote it:

```text
model:gpt-5.4-mini->gpt-5.5
```

## Use with care

GitHub Copilot is not an unlimited backend. Heavy automated use may trigger abuse or rate-limit systems. Keep request volume reasonable and follow GitHub's terms.

## Files

- `scripts/codex-copilot-bridge.mjs` - minimal local bridge.
- `docs/upstream-issue-draft.md` - issue draft for `voidsteed/copilot-proxy-api`.
- `skills/codex-copilot-bridge-research.md` - short brief for AI agents asked to investigate this setup.

## Local run

The script expects a token helper command to be available through `CODEX_COPILOT_TOKEN_COMMAND` or a PowerShell helper path. In our local test setup, the helper exchanged a stored GitHub device-flow token for a short-lived Copilot API token through:

```text
https://api.github.com/copilot_internal/v2/token
```

Start:

```powershell
node scripts/codex-copilot-bridge.mjs
```

Health check:

```powershell
Invoke-RestMethod http://127.0.0.1:8776/health
```

Codex provider sketch:

```toml
model = "gpt-5.5"
model_provider = "github-copilot-bridge"
model_reasoning_effort = "xhigh"

[model_providers.github-copilot-bridge]
name = "GitHub Copilot Bridge"
base_url = "http://127.0.0.1:8776"
wire_api = "responses"
```

## What should be upstreamed

If `voidsteed/copilot-proxy-api` already covers this by the time you read it, use that instead.

Possible upstream-friendly additions:

- Document Codex Desktop separately from Codex CLI.
- Strip unsupported `image_generation` from Codex Desktop requests.
- Add a safe model policy option: allow, rewrite, or reject fallback models.
- Treat early stream close as normal when Codex steering interrupts a task.
- Add a short Windows setup note.

## Credit

Added by Hamza Atabrour after testing Codex Desktop with GitHub Copilot models on Windows.

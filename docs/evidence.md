# Evidence Notes

These notes are from one Windows setup. They should be treated as reproduction clues, not universal claims.

## Confirmed Sources

- GitHub Copilot supports GPT-5.5, Claude Opus 4.8, Claude Fable 5, and other models depending on plan and client.
- OpenCode uses provider-qualified IDs like `github-copilot/gpt-5.5`.
- The raw GitHub Copilot model ID is `gpt-5.5`.
- GitHub Copilot model discovery happens at `https://api.githubcopilot.com/models`.
- GitHub Copilot Responses requests go to `https://api.githubcopilot.com/responses`.

## Local Observations

Codex Desktop sent request tools including `image_generation`. GitHub Copilot rejected that tool until it was stripped.

Codex Desktop retried once with `gpt-5.4-mini`. A local bridge rewrote that request back to `gpt-5.5`.

Codex Desktop steering can close a stream before the proxy finishes writing. A local bridge should treat early close as normal and avoid writing headers after the client disconnects.

## Existing Work Checked

- `voidsteed/copilot-proxy-api`: active, supports Codex CLI, Responses API, service tier stripping, image generation stripping, and context handling.
- `ericc-ch/copilot-api`: older upstream project.
- `anomalyco/opencode`: official GitHub Copilot provider support.

## Why This Companion Exists

The goal is to give maintainers a small Codex Desktop-specific reproduction, not to split the community across another full proxy.

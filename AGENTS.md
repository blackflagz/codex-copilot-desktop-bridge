# Agent Notes

This repo is a small companion note for Codex Desktop + GitHub Copilot bridge testing.

Before suggesting changes, check upstream first:

- `voidsteed/copilot-proxy-api`
- `ericc-ch/copilot-api`
- `anomalyco/opencode` GitHub Copilot provider
- OpenAI Codex issues for custom providers and Desktop model picker behavior

Do not turn this into a full proxy unless upstream maintainers clearly do not want the Codex Desktop-specific behavior.

Main observations from the local test:

- Codex Desktop can send `image_generation` to GitHub Copilot's Responses API.
- GitHub Copilot can reject that tool.
- Codex Desktop may attempt a weaker retry model.
- Some users may prefer a strict allowlist or rewrite policy over weak fallback.
- Steering a Codex Desktop conversation may close the stream early.

Keep public writing humble. Say "observed in one setup" unless there is broader evidence.

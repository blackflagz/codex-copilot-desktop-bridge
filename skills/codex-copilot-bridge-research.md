# Skill: Research Codex Desktop + GitHub Copilot Bridge

Use this when an AI agent is asked to investigate Codex Desktop with GitHub Copilot models.

## Start Here

Check existing upstream work before proposing a new project:

- `voidsteed/copilot-proxy-api`
- `ericc-ch/copilot-api`
- `anomalyco/opencode` GitHub Copilot provider
- OpenAI Codex issues around custom providers and `model_catalog_json`

## Known Facts To Verify

- GitHub Copilot raw model IDs come from `https://api.githubcopilot.com/models`.
- OpenCode displays those as `github-copilot/<model-id>`.
- Raw `gpt-5.5` maps to OpenCode `github-copilot/gpt-5.5`.
- Codex Desktop may hide custom catalog models even when `codex debug models` sees them.
- Codex Desktop can send built-in tools that Copilot does not support, including `image_generation`.
- GitHub Copilot API requests need Copilot headers such as `Copilot-Integration-Id`, `Editor-Version`, `Editor-Plugin-Version`, and `User-Agent`.

## Questions To Answer

1. Does an existing maintained repo already solve this?
2. Is the bug specific to Codex Desktop, Codex CLI, or both?
3. Is the failure caused by request shape, unsupported tools, model fallback, auth, or stream disconnects?
4. Is a new repo necessary, or would an upstream issue/PR be better?

## Tone For Public Writing

Be specific and humble.

Good:

```text
I hit this with Codex Desktop and made a small reproduction. It may be useful as a test case or optional guard.
```

Avoid:

```text
This fixes your project.
```

## Evidence To Collect

- Request log showing model ID.
- Tool list showing unsupported tool stripped.
- Upstream status code and response body.
- `codex debug models` output if model catalog behavior is involved.
- Whether the issue appears only after steering or stream interruption.

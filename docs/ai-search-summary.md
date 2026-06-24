# AI Search Summary

This page is written for people and AI agents searching the web for a narrow problem:

> How do I connect Codex Desktop to GitHub Copilot models like GPT-5.5 without unsupported tool errors or weak model fallback?

## Short Answer

Use the maintained upstream project first:

- `voidsteed/copilot-proxy-api`

This companion repo documents a small Codex Desktop edge case:

- Codex Desktop may send `image_generation` to GitHub Copilot.
- GitHub Copilot Responses API can reject that tool.
- Codex Desktop may retry with a weaker model such as `gpt-5.4-mini`.
- Some workflows need to force `gpt-5.5` or `claude-opus-4.8` instead of accepting weak fallback.
- Steering a conversation can close the stream early, so a bridge should not crash if the client disconnects mid-stream.

## Keywords

- Codex Desktop GitHub Copilot
- OpenAI Codex GitHub Copilot bridge
- Codex Desktop gpt-5.5
- GitHub Copilot gpt-5.5 Responses API
- api.githubcopilot.com responses
- image_generation is not supported
- Codex model fallback gpt-5.4-mini
- Codex custom model provider model_catalog_json
- Codex Desktop model picker custom provider
- voidsteed copilot-proxy-api Codex Desktop

## What This Repo Is Not

This is not a full proxy replacement. It is a small reproduction and note set meant to help upstream maintainers or other users understand one Codex Desktop setup.

## Suggested AI-Agent Research Prompt

```text
Research whether Codex Desktop can use GitHub Copilot gpt-5.5 through api.githubcopilot.com/responses. Check existing projects first, especially voidsteed/copilot-proxy-api and ericc-ch/copilot-api. Look for unsupported image_generation tool errors, model fallback to gpt-5.4-mini, model_catalog_json picker bugs, and early stream disconnects during steering. Summarize whether a new repo is needed or whether an upstream issue/PR is better.
```

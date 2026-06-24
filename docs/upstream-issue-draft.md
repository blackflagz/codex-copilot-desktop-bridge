# Draft issue for voidsteed/copilot-proxy-api

Title: Codex Desktop notes: unsupported image_generation tool, model fallback guard, early stream close

Hi. First, thank you for maintaining this project. It already covers most of what I was trying to solve, and I do not want to duplicate the work.

I ran into a few Codex Desktop-specific edge cases while using GitHub Copilot `gpt-5.5` through a local bridge. I am sharing them in case they are useful for this project. If these are already covered or out of scope, no worries.

## Setup I tested

- Windows
- Codex Desktop
- GitHub Copilot `gpt-5.5`
- Responses API path
- High or extra-high reasoning
- Codex Desktop tools enabled

## What I saw

### 1. Codex Desktop can send `image_generation`

Even for a normal coding task, Codex Desktop sent an unsupported built-in tool:

```text
image_generation
```

GitHub Copilot rejected the request with:

```text
The requested tool image_generation is not supported.
```

Stripping that tool before forwarding fixed the immediate failure.

### 2. Codex Desktop can retry with a weaker model

During retries, Codex Desktop attempted a lower model in my setup:

```text
requested=gpt-5.4-mini
```

For my workflow, that is worse than failing. I added a local guard that only allowed:

```text
gpt-5.5
claude-opus-4.8
```

Anything else was rewritten to `gpt-5.5`.

I am not saying that should be the default behavior for everyone. It might be useful as an option, for example:

```text
--allowed-models gpt-5.5,claude-opus-4.8
--fallback-policy rewrite|reject|allow
```

### 3. Steering can close the stream early

When using Codex Desktop's steering feature during a long task, the client can close the stream before the proxy finishes writing. My first simple bridge crashed with:

```text
ERR_HTTP_HEADERS_SENT
```

Handling client `close` and not writing an error after headers are sent fixed that local crash.

## Small reproduction bridge

I made a tiny companion repo with the minimal code I used to reproduce these notes:

```text
https://github.com/blackflagz/codex-copilot-desktop-bridge
```

It is not intended to replace this project. It is just a small, readable example of the Codex Desktop edge cases above.

## Why I am opening this here

Your project already supports Codex CLI and the Copilot Responses path. If these Codex Desktop behaviors are useful, I would rather help upstream them here than create another proxy.

If the maintainers prefer to keep the project focused on CLI/Claude Code behavior, I understand.

Thanks again for maintaining the project. It saved me from building a larger duplicate proxy, and I would rather upstream anything useful than split the work.

import http from "node:http";
import { spawnSync } from "node:child_process";

const PORT = Number(process.env.CODEX_COPILOT_BRIDGE_PORT || 8776);
const PRIMARY_MODEL = process.env.CODEX_COPILOT_PRIMARY_MODEL || "gpt-5.5";
const ALLOWED_MODELS = new Set(
  (process.env.CODEX_COPILOT_ALLOWED_MODELS || `${PRIMARY_MODEL},claude-opus-4.8`)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);

function getToken() {
  const command = process.env.CODEX_COPILOT_TOKEN_COMMAND;
  if (command) {
    const result = spawnSync(command, { shell: true, encoding: "utf8", windowsHide: true });
    if (result.status !== 0) throw new Error((result.stderr || result.stdout || "token command failed").trim());
    return result.stdout.trim();
  }

  const script = process.env.CODEX_COPILOT_TOKEN_SCRIPT;
  if (!script) throw new Error("Set CODEX_COPILOT_TOKEN_COMMAND or CODEX_COPILOT_TOKEN_SCRIPT");

  const pwsh = process.env.CODEX_COPILOT_PWSH || "pwsh";
  const result = spawnSync(pwsh, ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", script], {
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.status !== 0) throw new Error((result.stderr || result.stdout || "token helper failed").trim());
  return result.stdout.trim();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function sanitizeResponsesBody(body) {
  const notes = [];
  const requestedModel = body.model;

  if (!ALLOWED_MODELS.has(requestedModel)) {
    body.model = PRIMARY_MODEL;
    notes.push(`model:${requestedModel}->${PRIMARY_MODEL}`);
  }

  if (Array.isArray(body.tools)) {
    body.tools = body.tools.filter((tool) => {
      const type = tool?.type || tool?.name;
      if (type === "image_generation" || type === "image_generation_call") {
        notes.push("image_generation");
        return false;
      }
      return true;
    });
  }

  stripInputImages(body, notes);

  return { body, notes };
}

function stripInputImages(body, notes) {
  if (!Array.isArray(body.input)) return;

  let count = 0;
  for (const item of body.input) {
    if (!Array.isArray(item?.content)) continue;

    item.content = item.content.map((part) => {
      if (part?.type !== "input_image") return part;
      count++;
      return {
        type: "input_text",
        text: "[image omitted by local Codex-Copilot bridge to avoid 413 payload-too-large; ask user to resend only the one image that must be inspected]",
      };
    });
  }

  if (count > 0) notes.push(`input_images:${count}`);
}

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "GitHubCopilotChat/0.35.0",
    "Editor-Version": "vscode/1.107.0",
    "Editor-Plugin-Version": "copilot-chat/0.35.0",
    "Copilot-Integration-Id": "vscode-chat",
    "Openai-Intent": "conversation-edits",
    "X-Initiator": "user",
  };
}

function log(message) {
  console.log(`${new Date().toISOString()} ${message}`);
}

function json(res, status, value) {
  if (res.headersSent) {
    if (!res.writableEnded) res.end();
    return;
  }
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(value));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);
  let clientClosed = false;
  res.on("close", () => {
    clientClosed = true;
  });

  if (req.method === "GET" && ["/health", "/v1/health"].includes(url.pathname)) {
    return json(res, 200, { status: "ok", primary: PRIMARY_MODEL, allowed: [...ALLOWED_MODELS] });
  }

  if (req.method !== "POST" || !["/responses", "/v1/responses"].includes(url.pathname)) {
    return json(res, 404, { error: { message: "not found" } });
  }

  try {
    const raw = await readBody(req);
    const parsed = raw ? JSON.parse(raw) : {};
    const { body, notes } = sanitizeResponsesBody(parsed);
    log(`responses model=${body.model} requested=${parsed.model} stream=${body.stream !== false} notes=${notes.join(",") || "none"}`);

    const upstream = await fetch("https://api.githubcopilot.com/responses", {
      method: "POST",
      headers: headers(getToken()),
      body: JSON.stringify(body),
    });

    log(`upstream status=${upstream.status}`);
    res.writeHead(upstream.status, {
      "Content-Type": upstream.headers.get("content-type") || "application/json",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      ...(notes.length ? { "X-Codex-Copilot-Bridge-Notes": notes.join(",") } : {}),
    });

    if (upstream.body) {
      for await (const chunk of upstream.body) {
        if (clientClosed || res.destroyed || res.writableEnded) {
          log("client closed stream early");
          break;
        }
        res.write(Buffer.from(chunk));
      }
    }
    if (!res.writableEnded && !res.destroyed) res.end();
  } catch (error) {
    log(`bridge error: ${error?.stack || error?.message || error}`);
    if (!clientClosed && !res.destroyed) json(res, 500, { error: { message: String(error?.message || error) } });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  log(`listening http://127.0.0.1:${PORT}`);
});

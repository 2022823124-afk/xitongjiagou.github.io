import http from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync, createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(root, "shared-state.json");
const port = Number(process.env.PORT || 5173);
const clients = new Set();

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

async function readState() {
  if (!existsSync(dataFile)) return null;
  return readFile(dataFile, "utf-8");
}

async function saveState(body) {
  await writeFile(dataFile, body, "utf-8");
  for (const client of clients) {
    client.write(`event: state\n`);
    client.write(`data: ${body.replaceAll("\n", "")}\n\n`);
  }
}

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "content-type": type, "access-control-allow-origin": "*" });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${port}`);

  if (req.method === "GET" && url.pathname === "/api/state") {
    send(res, 200, (await readState()) || "null", "application/json; charset=utf-8");
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/state") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 25_000_000) req.destroy();
    });
    req.on("end", async () => {
      await saveState(body);
      send(res, 200, "{\"ok\":true}", "application/json; charset=utf-8");
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/events") {
    res.writeHead(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      connection: "keep-alive",
      "access-control-allow-origin": "*",
    });
    res.write("\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }

  const requested = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.resolve(root, `.${requested}`);
  if (!filePath.startsWith(root)) {
    send(res, 403, "Forbidden");
    return;
  }
  if (!existsSync(filePath)) {
    send(res, 404, "Not found");
    return;
  }
  res.writeHead(200, { "content-type": mime[path.extname(filePath)] || "application/octet-stream" });
  createReadStream(filePath).pipe(res);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Flow canvas server: http://127.0.0.1:${port}/`);
});

import { existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? "public");
const port = Number(process.argv[3] ?? 3000);
const localOrigin = `http://127.0.0.1:${port}`;
const publishedOrigin = new URL(JSON.parse(readFileSync(path.join(root, "r/registry.json"), "utf8")).homepage).origin;

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
  const filePath = path.resolve(root, `.${pathname}`);
  if (!filePath.startsWith(`${root}${path.sep}`) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.setHeader("content-type", filePath.endsWith(".json") ? "application/json" : "text/plain");
  response.end(readFileSync(filePath, "utf8").replaceAll(publishedOrigin, localOrigin));
}).listen(port, "127.0.0.1");

// Chạy dev server FE (:3000) và BE (:3001) song song.
// Log mỗi bên có tiền tố [fe]/[be]; Ctrl+C hoặc một bên thoát → dừng cả hai.
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const apps = [
  { name: "be", dir: "backend", color: "\x1b[35m" },
  { name: "fe", dir: "frontend", color: "\x1b[36m" },
];

const children = [];
let stopping = false;

function pipe(stream, out, prefix) {
  let buffer = "";
  stream.on("data", (chunk) => {
    buffer += chunk;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop();
    for (const line of lines) out.write(`${prefix} ${line}\n`);
  });
  stream.on("end", () => {
    if (buffer) out.write(`${prefix} ${buffer}\n`);
  });
}

function stopAll(code) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode !== null) continue;
    // Windows: npm chạy qua shell nên phải kill cả cây tiến trình.
    if (process.platform === "win32") spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    else child.kill("SIGTERM");
  }
  process.exitCode = code;
}

for (const app of apps) {
  const prefix = `${app.color}[${app.name}]\x1b[0m`;
  const child = spawn("npm", ["run", "dev"], {
    cwd: join(root, app.dir),
    shell: process.platform === "win32",
    env: { ...process.env, FORCE_COLOR: "1" },
  });
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  pipe(child.stdout, process.stdout, prefix);
  pipe(child.stderr, process.stderr, prefix);
  child.on("exit", (code) => {
    if (!stopping) {
      console.error(`${prefix} đã thoát (mã ${code ?? "?"}), dừng các tiến trình còn lại.`);
      stopAll(code ?? 1);
    }
  });
  children.push(child);
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));

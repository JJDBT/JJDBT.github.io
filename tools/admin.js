/* ============================================================
   博客本地管理面板 - 后端
   用法：双击根目录「管理面板.bat」
   只用 Node 内置模块，不需要 npm install
   ============================================================ */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const POSTS_DIR = path.join(ROOT, "source", "_posts");
const HTML_PATH = path.join(__dirname, "admin.html");
const PORT = Number(process.env.ADMIN_PORT || 4321);
const SITE_PORT = 4000;

const DEFAULT_CATEGORIES = ["二次元", "开发", "网安", "工具", "随笔"];

let previewProc = null;

/* ---------------- 工具 ---------------- */

function json(res, code, obj) {
  const buf = Buffer.from(JSON.stringify(obj), "utf8");
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(buf);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > 32 * 1024 * 1024) {
        reject(new Error("内容太大了（超过 32MB）"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function run(cmd, args) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, {
      cwd: ROOT,
      shell: true,
      windowsHide: true,
      env: process.env
    });
    let out = "";
    let err = "";
    p.stdout.on("data", (d) => (out += d.toString("utf8")));
    p.stderr.on("data", (d) => (err += d.toString("utf8")));
    p.on("close", (code) => resolve({ code, out, err }));
    p.on("error", (e) => resolve({ code: -1, out, err: String(e) }));
  });
}

/* 整条命令交给 shell，参数会提前转义好，避免中文/空格被拆开 */
function quote(s) {
  return '"' + String(s).replace(/"/g, '\\"').replace(/\r?\n/g, " ") + '"';
}

function runShell(cmdline) {
  return new Promise((resolve) => {
    const p = spawn(cmdline, {
      cwd: ROOT,
      shell: true,
      windowsHide: true,
      env: process.env
    });
    let out = "";
    let err = "";
    p.stdout.on("data", (d) => (out += d.toString("utf8")));
    p.stderr.on("data", (d) => (err += d.toString("utf8")));
    p.on("close", (code) => resolve({ code, out, err }));
    p.on("error", (e) => resolve({ code: -1, out, err: String(e) }));
  });
}

/* 解析 front-matter（够用的 YAML 子集） */
  function parseFrontMatter(text) {
    const clean = String(text || "").replace(/^\uFEFF/, "");
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(clean);
  if (!m) return { data: {}, body: clean };
  const data = {};
  let key = null;
  for (const raw of m[1].split(/\r?\n/)) {
    const line = raw.replace(/\s+$/, "");
    if (!line || /^\s*#/.test(line)) continue;

    const item = /^\s*-\s+(.*)$/.exec(line);
    if (item && key) {
      if (!Array.isArray(data[key])) data[key] = [];
      data[key].push(item[1].trim().replace(/^["']|["']$/g, ""));
      continue;
    }

    const kv = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line);
    if (kv) {
      key = kv[1];
      const v = kv[2].trim();
      data[key] = v === "" ? [] : v.replace(/^["']|["']$/g, "");
      if (v !== "" && /^\[.*\]$/.test(v)) {
        data[key] = v
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean);
      }
    }
  }
  return { data, body: clean.slice(m[0].length) };
}

function listPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.toLowerCase().endsWith(".md"))
    .map((f) => {
      const full = path.join(POSTS_DIR, f);
      const stat = fs.statSync(full);
      let data = {};
      let body = "";
      try {
        const parsed = parseFrontMatter(fs.readFileSync(full, "utf8"));
        data = parsed.data;
        body = parsed.body;
      } catch (e) {
        /* ignore */
      }
      return {
        file: f,
        slug: f.replace(/\.md$/i, ""),
        title: typeof data.title === "string" ? data.title : f.replace(/\.md$/i, ""),
        date: typeof data.date === "string" ? data.date : "",
        categories: Array.isArray(data.categories) ? data.categories : data.categories ? [data.categories] : [],
        tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
        chars: body.length,
        mtime: stat.mtimeMs
      };
    })
    .sort((a, b) => b.mtime - a.mtime);
}

function collectCategories(posts) {
  const set = new Set(DEFAULT_CATEGORIES);
  posts.forEach((p) => p.categories.forEach((c) => c && set.add(c)));
  return Array.from(set);
}

function collectTags(posts) {
  const map = new Map();
  posts.forEach((p) =>
    p.tags.forEach((t) => {
      if (!t) return;
      map.set(t, (map.get(t) || 0) + 1);
    })
  );
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/* ---------------- 保存文章 ---------------- */

function buildMarkdown({ title, category, tags, body, date, extra }) {
  const lines = ["---"];
  lines.push("title: " + String(title).trim());
  lines.push("date: " + (date || nowString()));
  if (category) {
    lines.push("categories:");
    lines.push("  - " + String(category).trim());
  }
  const cleanTags = (tags || [])
      .map((t) => String(t && t.name ? t.name : t).trim())
      .filter((t) => t && t !== "[object Object]");
  if (cleanTags.length) {
    lines.push("tags:");
    cleanTags.forEach((t) => lines.push("  - " + t));
  }
    if (extra && typeof extra === "object") {
      Object.keys(extra).forEach(function (k) {
        const v = extra[k];
        if (v === undefined || v === null || v === "") return;
        if (Array.isArray(v)) {
          if (!v.length) return;
          lines.push(k + ":");
          v.forEach(function (x) { lines.push("  - " + String(x).trim()); });
        } else {
          lines.push(k + ": " + String(v).trim());
        }
      });
    }
  lines.push("---");
  lines.push("");
  /* 保证 front-matter 和正文之间一定有一个空行 */
  return lines.join("\r\n") + "\r\n" + String(body || "").replace(/^\s*\r?\n/, "");
}

function nowString() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return (
    d.getFullYear() +
    "-" + p(d.getMonth() + 1) +
    "-" + p(d.getDate()) +
    " " + p(d.getHours()) +
    ":" + p(d.getMinutes()) +
    ":" + p(d.getSeconds())
  );
}

function safeSlug(title) {
  return (
    String(title)
      .replace(/[\\/:*?"<>|]/g, "")
      .replace(/\s+/g, "-")
      .trim() || "untitled"
  );
}

/* ---------------- 预览 / 发布 ---------------- */

function checkSite() {
  return new Promise((resolve) => {
    const req = http.get(
      { host: "127.0.0.1", port: SITE_PORT, path: "/", timeout: 1500 },
      (res) => {
        res.resume();
        resolve(res.statusCode === 200);
      }
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

function startPreview() {
  return new Promise(async (resolve) => {
    if (await checkSite()) {
      resolve({ ok: true, started: false, url: `http://127.0.0.1:${SITE_PORT}/` });
      return;
    }
    try {
      previewProc = spawn("npx", ["hexo", "server", "--port", String(SITE_PORT), "--ip", "127.0.0.1"], {
        cwd: ROOT,
        shell: true,
        windowsHide: true,
        detached: false
      });
      previewProc.stdout.on("data", (d) => process.stdout.write("[hexo] " + d.toString()));
      previewProc.stderr.on("data", (d) => process.stdout.write("[hexo] " + d.toString()));
      previewProc.on("exit", () => (previewProc = null));
    } catch (e) {
      resolve({ ok: false, error: String(e) });
      return;
    }

    /* 轮询等它起来，最多 25 秒 */
    for (let i = 0; i < 25; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      if (await checkSite()) {
        resolve({ ok: true, started: true, url: `http://127.0.0.1:${SITE_PORT}/` });
        return;
      }
    }
    resolve({ ok: false, error: "预览服务没能在 25 秒内启动，看看命令行窗口有没有报错" });
  });
}

async function publish(message) {
  const steps = [];
  const add = await runShell("git add -A");
  steps.push({ cmd: "git add -A", code: add.code, out: add.out + add.err });

  const msg = message && message.trim() ? message.trim() : "update: " + nowString();
  const commit = await runShell("git commit -m " + quote(msg));
  const commitOut = commit.out + commit.err;
  const nothing = /nothing to commit|无文件要提交|没有要提交/i.test(commitOut);
  steps.push({ cmd: "git commit", code: commit.code, out: commitOut, skipped: nothing });

  if (nothing) {
    return { ok: true, pushed: false, steps, note: "没有新改动，不需要提交" };
  }
  if (commit.code !== 0) {
    return { ok: false, steps, error: "git commit 失败" };
  }

  const push = await runShell("git push");
  steps.push({ cmd: "git push", code: push.code, out: push.out + push.err });
  if (push.code !== 0) {
    return { ok: false, steps, error: "git push 失败，检查网络或代理" };
  }
  return { ok: true, pushed: true, steps };
}

/* ---------------- 路由 ---------------- */

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const p = url.pathname;

  try {
    if (p === "/" || p === "/index.html") {
      const html = await fs.promises.readFile(HTML_PATH);
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
      res.end(html);
      return;
    }

    if (p === "/api/meta" && req.method === "GET") {
      const posts = listPosts();
      json(res, 200, {
        ok: true,
        root: ROOT,
        categories: collectCategories(posts),
        tags: collectTags(posts),
        posts,
        siteRunning: await checkSite(),
        siteUrl: `http://127.0.0.1:${SITE_PORT}/`
      });
      return;
    }

    if (p === "/api/read" && req.method === "GET") {
      const file = url.searchParams.get("file") || "";
      const full = path.join(POSTS_DIR, path.basename(file));
      if (!fs.existsSync(full)) return json(res, 404, { ok: false, error: "文件不存在" });
        const text = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
      const parsed = parseFrontMatter(text);
      json(res, 200, {
        ok: true,
        file: path.basename(file),
        title: parsed.data.title || "",
        date: parsed.data.date || "",
        category: (parsed.data.categories || [])[0] || "",
        tags: parsed.data.tags || [],
        body: parsed.body
      });
      return;
    }

    if (p === "/api/save" && req.method === "POST") {
      const payload = JSON.parse(await readBody(req));
      if (!payload.title || !String(payload.title).trim()) {
        return json(res, 400, { ok: false, error: "标题不能为空" });
      }

      /* 带 file 参数 = 编辑已有文章：文件名保持不变（保住永久链接），直接覆盖 */
      const editing = payload.file && String(payload.file).trim();
      let slug;
      if (editing) {
        slug = path.basename(String(editing).trim()).replace(/\.md$/i, "");
      } else {
        slug = payload.slug && payload.slug.trim() ? payload.slug.trim() : safeSlug(payload.title);
      }
      const full = path.join(POSTS_DIR, slug + ".md");

      if (!editing && fs.existsSync(full) && !payload.overwrite) {
        return json(res, 409, { ok: false, exists: true, slug, file: slug + ".md", error: "同名文章已存在" });
      }

      if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });
      let extra = payload.extra && typeof payload.extra === "object" ? Object.assign({}, payload.extra) : {};
      if (editing && fs.existsSync(full)) {
        try {
          const oldData = parseFrontMatter(fs.readFileSync(full, "utf8")).data;
          const known = ["title", "date", "categories", "category", "tags"];
          Object.keys(oldData).forEach(function (k) {
            if (known.indexOf(k) === -1 && (extra[k] === undefined || extra[k] === null || extra[k] === "")) extra[k] = oldData[k];
          });
        } catch (_) {}
      }
      const md = buildMarkdown(Object.assign({}, payload, { date: payload.date, extra: extra }));
      fs.writeFileSync(full, md, { encoding: "utf8" });
      json(res, 200, {
        ok: true,
        file: slug + ".md",
        path: full,
        bytes: Buffer.byteLength(md, "utf8")
      });
      return;
    }

    if (p === "/api/preview" && req.method === "POST") {
      const r = await startPreview();
      return json(res, r.ok ? 200 : 500, r);
    }

    if (p === "/api/publish" && req.method === "POST") {
      const payload = JSON.parse((await readBody(req)) || "{}");
      const r = await publish(payload.message);
      return json(res, r.ok ? 200 : 500, r);
    }

    if (p === "/api/open" && req.method === "POST") {
      const payload = JSON.parse((await readBody(req)) || "{}");
      const target = payload.target || `http://127.0.0.1:${SITE_PORT}/`;
      spawn("cmd", ["/c", "start", "", target], { shell: true, windowsHide: true, detached: true }).unref();
      return json(res, 200, { ok: true });
    }

    json(res, 404, { ok: false, error: "not found" });
  } catch (e) {
    json(res, 500, { ok: false, error: String(e && e.message ? e.message : e) });
  }
});

server.on("error", (e) => {
  if (e && e.code === "EADDRINUSE") {
    /* 面板已经开着了，直接把浏览器叫起来就行 */
    try {
      spawn('cmd', ['/c', 'start', '', 'http://127.0.0.1:' + PORT + '/'], {
        detached: true, stdio: 'ignore', windowsHide: true
      }).unref();
    } catch (_) {}
    console.log("面板已在运行，已为你打开浏览器：" + "http://127.0.0.1:" + PORT + "/");
    setTimeout(() => process.exit(0), 800);
    return;
  }
  console.error("面板启动失败：" + (e && e.message));
  process.exit(1);
});

server.listen(PORT, "127.0.0.1", () => {
  /* 自动打开浏览器 */
  try {
    spawn('cmd', ['/c', 'start', '', 'http://127.0.0.1:' + PORT + '/'], {
      detached: true, stdio: 'ignore', windowsHide: true
    }).unref();
  } catch (_) {}

  console.log("");
  console.log("  博客本地管理面板已启动");
  console.log("  打开： http://127.0.0.1:" + PORT + "/");
  console.log("  博客根目录：" + ROOT);
  console.log("");
  console.log("  关掉这个窗口就等于关掉面板。");
  console.log("");
});

process.on("SIGINT", () => {
  if (previewProc) {
    try {
      previewProc.kill();
    } catch (e) {}
  }
  process.exit(0);
});

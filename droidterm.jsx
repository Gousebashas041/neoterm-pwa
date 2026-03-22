import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════ STYLES ══ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,700;1,400&family=Rajdhani:wght@500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    /* Nord palette */
    --nord0:  #2E3440; --nord1:  #3B4252; --nord2:  #434C5E; --nord3:  #4C566A;
    --nord4:  #D8DEE9; --nord5:  #E5E9F0; --nord6:  #ECEFF4;
    --nord7:  #8FBCBB; --nord8:  #88C0D0; --nord9:  #81A1C1;
    --nord10: #5E81AC; --nord11: #BF616A; --nord12: #D08770;
    --nord13: #EBCB8B; --nord14: #A3BE8C; --nord15: #B48EAD;
    --bg:     #242933;
    --surface:#2E3440;
    --border: rgba(136,192,208,0.15);
    --mono:   'JetBrains Mono', monospace;
    --display:'Rajdhani', sans-serif;
  }

  html, body, #root {
    height: 100%; width: 100%;
    background: var(--bg);
    color: var(--nord4);
    font-family: var(--mono);
    overflow: hidden;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: var(--nord3); border-radius: 99px; }

  @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes fadeIn   { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
  @keyframes slideUp  { from{opacity:0;transform:translateY(100%)} to{opacity:1;transform:none} }
  @keyframes scanline { from{transform:translateY(-100%)} to{transform:translateY(100vh)} }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.5} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes glitch1  { 0%,100%{clip-path:inset(0 0 98% 0)} 20%{clip-path:inset(30% 0 50% 0)} 40%{clip-path:inset(70% 0 10% 0)} }
  @keyframes boot     { 0%{opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{opacity:0} }
  @keyframes typewriter { from{width:0} to{width:100%} }

  .fade-in  { animation: fadeIn .18s ease forwards; }
  .slide-up { animation: slideUp .3s cubic-bezier(.4,0,.2,1) forwards; }

  .cursor-blink {
    display:inline-block; width:8px; height:14px;
    background:var(--nord8); margin-left:2px;
    vertical-align:middle;
    animation: blink 1.1s step-end infinite;
  }

  /* scanline overlay */
  .scanlines {
    pointer-events:none; position:fixed; inset:0; z-index:9999;
    background: repeating-linear-gradient(
      0deg, transparent, transparent 2px,
      rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px
    );
  }
  .scanlines::after {
    content:''; position:absolute; inset:0;
    background: linear-gradient(transparent 50%, rgba(0,0,0,0.015) 50%);
    background-size: 100% 4px;
    animation: scanline 8s linear infinite;
    opacity:.3;
  }

  /* status bar */
  .statusbar {
    height:28px; background:var(--nord0);
    border-bottom:1px solid var(--border);
    display:flex; align-items:center; justify-content:space-between;
    padding:0 12px; flex-shrink:0;
    font-size:11px; color:var(--nord3);
    font-family:var(--display);
  }

  /* titlebar */
  .titlebar {
    height:44px; background:var(--nord0);
    border-bottom:1px solid var(--border);
    display:flex; align-items:center; gap:10px;
    padding:0 12px; flex-shrink:0;
  }

  /* tab bar */
  .tabbar {
    display:flex; background:var(--nord0);
    border-bottom:1px solid var(--border);
    overflow-x:auto; flex-shrink:0;
    scrollbar-width:none;
  }
  .tabbar::-webkit-scrollbar { display:none; }

  .tab {
    display:flex; align-items:center; gap:6px;
    padding:8px 14px; white-space:nowrap;
    font-size:11px; border:none; background:transparent;
    color:var(--nord3); cursor:pointer;
    border-bottom:2px solid transparent;
    transition:all .2s; flex-shrink:0;
    font-family:var(--mono);
  }
  .tab.active { color:var(--nord8); border-bottom-color:var(--nord8); background:rgba(136,192,208,.06); }

  /* terminal output */
  .terminal-output {
    flex:1; overflow-y:auto; padding:10px 12px;
    font-size:12.5px; line-height:1.7;
  }

  /* input row */
  .input-row {
    display:flex; align-items:center; gap:6px;
    padding:8px 12px; background:var(--nord0);
    border-top:1px solid var(--border); flex-shrink:0;
  }
  .prompt-label { color:var(--nord14); font-size:12px; flex-shrink:0; white-space:nowrap; }
  .cmd-input {
    flex:1; background:transparent; border:none; outline:none;
    color:var(--nord6); font-family:var(--mono); font-size:12.5px;
    caret-color:var(--nord8);
    user-select:text; -webkit-user-select:text;
  }

  /* keyboard shortcuts */
  .kbd-row {
    display:flex; overflow-x:auto; gap:6px;
    padding:6px 10px; background:var(--nord0);
    border-top:1px solid var(--border); flex-shrink:0;
    scrollbar-width:none;
  }
  .kbd-row::-webkit-scrollbar { display:none; }
  .kbd-btn {
    padding:5px 10px; border-radius:6px; border:1px solid var(--border);
    background:var(--nord1); color:var(--nord4);
    font-family:var(--mono); font-size:11px;
    white-space:nowrap; cursor:pointer; flex-shrink:0;
    transition:all .15s; -webkit-tap-highlight-color:transparent;
  }
  .kbd-btn:active { background:var(--nord2); transform:scale(.95); }

  /* output line types */
  .line-cmd     { color:var(--nord6); }
  .line-out     { color:var(--nord4); }
  .line-success { color:var(--nord14); }
  .line-error   { color:var(--nord11); }
  .line-warn    { color:var(--nord13); }
  .line-info    { color:var(--nord8); }
  .line-prompt  { color:var(--nord7); }
  .line-ai      { color:var(--nord15); }
  .line-system  { color:var(--nord3); font-style:italic; }

  /* OS switch */
  .os-switch {
    display:flex; border-radius:8px; overflow:hidden;
    border:1px solid var(--border); flex-shrink:0;
  }
  .os-btn {
    padding:5px 10px; font-size:10px; font-weight:700;
    border:none; cursor:pointer; transition:all .2s;
    font-family:var(--display); letter-spacing:.04em;
  }
  .os-btn.active-linux  { background:var(--nord14); color:var(--nord0); }
  .os-btn.active-win    { background:var(--nord9);  color:var(--nord0); }
  .os-btn.inactive      { background:var(--nord1);  color:var(--nord3); }

  /* quick-cmd panel */
  .quickpanel {
    position:absolute; bottom:0; left:0; right:0; z-index:100;
    background:var(--nord0); border-top:1px solid var(--border);
    border-radius:16px 16px 0 0;
    padding:12px; max-height:55vh; overflow-y:auto;
    animation:slideUp .25s ease;
  }
  .qp-handle {
    width:36px; height:4px; background:var(--nord3);
    border-radius:99px; margin:0 auto 12px;
  }
  .qp-section { font-size:10px; color:var(--nord3); font-family:var(--display);
    letter-spacing:.08em; margin:10px 0 6px; }
  .qp-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; }
  .qp-cmd {
    padding:8px 6px; border-radius:8px; border:1px solid var(--border);
    background:var(--nord1); text-align:center; cursor:pointer;
    font-size:10px; color:var(--nord4); font-family:var(--mono);
    transition:all .15s; line-height:1.4;
  }
  .qp-cmd:active { background:var(--nord2); transform:scale(.97); }
  .qp-cmd .qp-icon { font-size:16px; display:block; margin-bottom:3px; }

  /* ai thinking */
  .ai-thinking { display:inline-flex; gap:3px; align-items:center; }
  .ai-dot { width:4px; height:4px; border-radius:50%; background:var(--nord15);
    animation:pulse .8s ease infinite; }
  .ai-dot:nth-child(2) { animation-delay:.2s; }
  .ai-dot:nth-child(3) { animation-delay:.4s; }

  /* boot screen */
  .boot-screen {
    position:fixed; inset:0; z-index:9998;
    background:var(--nord0); display:flex; flex-direction:column;
    align-items:center; justify-content:center; gap:16px;
    animation:boot 2.5s ease forwards;
    pointer-events:none;
  }
  .boot-logo { font-family:var(--display); font-size:28px; font-weight:700; color:var(--nord8); letter-spacing:.1em; }
  .boot-bar { width:200px; height:3px; background:var(--nord1); border-radius:99px; overflow:hidden; }
  .boot-fill { height:100%; background:var(--nord8); border-radius:99px; animation:typewriter 2s ease forwards; }

  /* spinner */
  .spinner { width:12px; height:12px; border:2px solid var(--nord3); border-top-color:var(--nord8);
    border-radius:50%; display:inline-block; animation:spin .6s linear infinite; }

  /* notification */
  .notif {
    position:fixed; top:40px; left:50%; transform:translateX(-50%);
    background:var(--nord1); border:1px solid var(--border);
    border-radius:10px; padding:8px 16px;
    font-size:12px; color:var(--nord14); z-index:9999;
    animation:fadeIn .2s ease;
  }

  .highlight-cmd  { color:var(--nord8); font-weight:500; }
  .highlight-path { color:var(--nord13); }
  .highlight-flag { color:var(--nord15); }
  .highlight-str  { color:var(--nord14); }
  .highlight-num  { color:var(--nord12); }
`;

/* ═══════════════════════════════════════ CONSTANTS ══ */
const LINUX_USER  = "dev";
const WIN_USER    = "C:\\Users\\Dev";
let   linuxCwd    = "/home/dev";
let   winCwd      = "C:\\Users\\Dev";

// Fake filesystem
const FS = {
  "/home/dev": ["projects/", "scripts/", ".bashrc", ".gitconfig", "README.md"],
  "/home/dev/projects": ["my-app/", "api-server/", "ml-model/", "docker-setup/"],
  "/home/dev/scripts":  ["deploy.sh", "backup.sh", "setup.sh"],
  "/":                  ["home/", "etc/", "var/", "usr/", "tmp/", "root/"],
  "/etc":               ["hosts", "fstab", "nginx/", "ssh/"],
};

const WIN_FS = {
  "C:\\Users\\Dev":           ["Projects\\", "Documents\\", "Desktop\\", ".gitconfig"],
  "C:\\Users\\Dev\\Projects": ["MyApp\\", "ApiServer\\", "Scripts\\"],
};

// Command history store per tab
const historyStore = {};

// Quick commands panel data
const QUICK_CMDS = {
  "Git": [
    { icon:"🌿", label:"git status",    cmd:"git status" },
    { icon:"📋", label:"git log",       cmd:"git log --oneline -10" },
    { icon:"⬇️",  label:"git pull",     cmd:"git pull origin main" },
    { icon:"⬆️",  label:"git push",     cmd:"git push origin main" },
    { icon:"🌱", label:"new branch",    cmd:"git checkout -b feature/new-branch" },
    { icon:"💾", label:"git add .",     cmd:"git add . && git commit -m 'update'" },
  ],
  "Node.js": [
    { icon:"📦", label:"npm install",   cmd:"npm install" },
    { icon:"▶️",  label:"npm start",    cmd:"npm start" },
    { icon:"🔨", label:"npm build",     cmd:"npm run build" },
    { icon:"🧪", label:"npm test",      cmd:"npm test" },
    { icon:"🔍", label:"npm audit",     cmd:"npm audit fix" },
    { icon:"🌐", label:"npx serve",     cmd:"npx serve . -p 3000" },
  ],
  "Python": [
    { icon:"🐍", label:"python3",       cmd:"python3 --version" },
    { icon:"📦", label:"pip install",   cmd:"pip install -r requirements.txt" },
    { icon:"🧪", label:"pytest",        cmd:"pytest -v" },
    { icon:"🌐", label:"Flask run",     cmd:"flask run --host=0.0.0.0 --port=5000" },
    { icon:"📊", label:"jupyter",       cmd:"jupyter notebook --no-browser" },
    { icon:"🔧", label:"venv",          cmd:"python3 -m venv venv && source venv/bin/activate" },
  ],
  "Docker": [
    { icon:"🐳", label:"docker ps",     cmd:"docker ps -a" },
    { icon:"🏗️", label:"docker build",  cmd:"docker build -t myapp:latest ." },
    { icon:"▶️",  label:"docker run",   cmd:"docker run -d -p 3000:3000 myapp:latest" },
    { icon:"📋", label:"docker logs",   cmd:"docker logs -f $(docker ps -q | head -1)" },
    { icon:"🛑", label:"stop all",      cmd:"docker stop $(docker ps -q)" },
    { icon:"🗑️", label:"prune",         cmd:"docker system prune -af" },
  ],
  "Network": [
    { icon:"🌐", label:"curl test",     cmd:"curl -I https://google.com" },
    { icon:"🔍", label:"netstat",       cmd:"netstat -tulpn" },
    { icon:"📡", label:"ping",          cmd:"ping -c 4 8.8.8.8" },
    { icon:"🔒", label:"ssh connect",   cmd:"ssh user@192.168.1.1" },
    { icon:"📥", label:"wget",          cmd:"wget https://example.com/file.zip" },
    { icon:"🗺️", label:"nmap scan",     cmd:"nmap -sV localhost" },
  ],
  "System": [
    { icon:"💾", label:"disk usage",    cmd:"df -h" },
    { icon:"🧠", label:"memory",        cmd:"free -h" },
    { icon:"📊", label:"processes",     cmd:"top -bn1 | head -20" },
    { icon:"📁", label:"list all",      cmd:"ls -la" },
    { icon:"🔍", label:"find file",     cmd:"find . -name '*.js' -type f" },
    { icon:"📜", label:"tail log",      cmd:"tail -f /var/log/syslog" },
  ],
};

const KBD_SHORTCUTS = ["Tab","Ctrl+C","↑","↓","clear","pwd","ls","cd ~","exit"];

/* ═══════════════════════════ COMMAND PROCESSOR ══ */
function processCommand(cmd, os, cwd, setCwd) {
  const raw   = cmd.trim();
  const parts = raw.split(/\s+/);
  const base  = parts[0]?.toLowerCase();
  const args  = parts.slice(1);
  const isWin = os === "win";

  if (!raw) return [];

  // ── Universal helpers ──────────────────────────────────────
  const out  = (t, type="out")    => ({ text:t, type });
  const ok   = (t)                => ({ text:t, type:"success" });
  const err  = (t)                => ({ text:t, type:"error" });
  const info = (t)                => ({ text:t, type:"info" });
  const warn = (t)                => ({ text:t, type:"warn" });

  // ── CLEAR ──────────────────────────────────────────────────
  if (base === "clear" || raw === "cls") return [{ type:"CLEAR" }];

  // ── HELP ───────────────────────────────────────────────────
  if (base === "help" || base === "?") return [
    info("╔══════════════════════════════════════╗"),
    info("║     DroidTerm — Built-in Commands     ║"),
    info("╠══════════════════════════════════════╣"),
    out("  NAVIGATION   ls, cd, pwd, mkdir, rm, cp, mv"),
    out("  GIT           git status/log/pull/push/clone"),
    out("  NODE          node, npm, npx"),
    out("  PYTHON        python3, pip, pytest"),
    out("  DOCKER        docker ps/build/run/stop/logs"),
    out("  NETWORK       ping, curl, wget, ssh, netstat"),
    out("  SYSTEM        top, ps, df, free, kill, chmod"),
    out("  TOOLS         cat, grep, find, tar, zip, nano"),
    out("  OS SWITCH     switch linux | switch win"),
    info("  AI ASSISTANT  ai <question>  →  smart answers"),
    info("  QUICK PANEL   tap ⚡ for shortcuts"),
    info("╚══════════════════════════════════════╝"),
  ];

  // ── OS SWITCH ──────────────────────────────────────────────
  if (base === "switch") {
    const target = args[0]?.toLowerCase();
    if (target === "linux" || target === "win" || target === "windows") {
      return [{ type:"SWITCH_OS", to: target === "windows" ? "win" : target }];
    }
    return [err("Usage: switch linux | switch win")];
  }

  // ── PWD ────────────────────────────────────────────────────
  if (base === "pwd" || (isWin && base === "cd" && !args.length)) {
    return [out(cwd)];
  }

  // ── LS / DIR ───────────────────────────────────────────────
  if (base === "ls" || base === "dir") {
    const files = FS[cwd] || ["(empty directory)"];
    const lines = [];
    if (!isWin) {
      lines.push(out(`total ${files.length * 4}`));
      files.forEach(f => {
        const isDir = f.endsWith("/");
        lines.push(out(
          isDir
            ? `drwxr-xr-x  2 dev dev 4096 Mar 22 09:${String(Math.floor(Math.random()*59)).padStart(2,"0")} \x1b[34m${f}\x1b[0m`
            : `-rw-r--r--  1 dev dev ${Math.floor(Math.random()*9000+100)} Mar 22 09:${String(Math.floor(Math.random()*59)).padStart(2,"0")} ${f}`
        ));
      });
    } else {
      lines.push(out(` Directory of ${cwd}`), out(""));
      files.forEach(f => {
        const isDir = f.endsWith("\\");
        lines.push(out(isDir ? `03/22/2026  09:00    <DIR>          ${f.slice(0,-1)}` : `03/22/2026  09:00            1,024 ${f}`));
      });
    }
    return lines;
  }

  // ── CD ─────────────────────────────────────────────────────
  if (base === "cd") {
    const target = args[0];
    if (!target || target === "~") {
      const home = isWin ? "C:\\Users\\Dev" : "/home/dev";
      setCwd(home);
      return [];
    }
    if (target === ".." || target === "..\\") {
      const sep = isWin ? "\\" : "/";
      const parts2 = cwd.split(sep).filter(Boolean);
      parts2.pop();
      const newPath = (isWin ? "" : "/") + parts2.join(sep);
      setCwd(newPath || (isWin ? "C:\\" : "/"));
      return [];
    }
    const cleanTarget = target.replace(/\/$/, "").replace(/\\$/, "");
    const sep = isWin ? "\\" : "/";
    const newPath = cwd.endsWith(sep) ? cwd + cleanTarget : cwd + sep + cleanTarget;
    setCwd(newPath);
    return [info(`Changed to ${newPath}`)];
  }

  // ── MKDIR ──────────────────────────────────────────────────
  if (base === "mkdir") {
    if (!args[0]) return [err("mkdir: missing operand")];
    return [ok(`Directory '${args[0]}' created`)];
  }

  // ── CAT ────────────────────────────────────────────────────
  if (base === "cat" || base === "type") {
    const file = args[0];
    if (!file) return [err(`${base}: missing operand`)];
    const samples = {
      ".bashrc":    ["# ~/.bashrc", "export PATH=$PATH:/usr/local/bin", 'alias ll="ls -la"', 'export PS1="\\u@\\h:\\w\\$ "'],
      ".gitconfig": ["[user]", "  name = Dev User", "  email = dev@example.com", "[core]", "  editor = nano"],
      "README.md":  ["# My Project", "", "A cool project.", "", "## Setup", "```", "npm install", "npm start", "```"],
      "package.json":['{"name":"my-app","version":"1.0.0","scripts":{"start":"node index.js","build":"webpack"}}'],
    };
    const content = samples[file] || [`cat: ${file}: No such file or directory`];
    return content.map((l, i) => i === 0 && !samples[file] ? err(l) : out(l));
  }

  // ── ECHO ───────────────────────────────────────────────────
  if (base === "echo") return [out(args.join(" ").replace(/^["']|["']$/g, ""))];

  // ── TOUCH ──────────────────────────────────────────────────
  if (base === "touch") return args[0] ? [ok(`File '${args[0]}' created`)] : [err("touch: missing operand")];

  // ── RM ─────────────────────────────────────────────────────
  if (base === "rm" || base === "del") {
    const target = args.filter(a => !a.startsWith("-"))[0];
    if (!target) return [err(`${base}: missing operand`)];
    return [warn(`Removed '${target}'`)];
  }

  // ── CP / MV ────────────────────────────────────────────────
  if (base === "cp" || base === "copy") {
    if (args.length < 2) return [err(`${base}: missing destination`)];
    return [ok(`Copied '${args[0]}' → '${args[1]}'`)];
  }
  if (base === "mv" || base === "move") {
    if (args.length < 2) return [err(`${base}: missing destination`)];
    return [ok(`Moved '${args[0]}' → '${args[1]}'`)];
  }

  // ── GREP ───────────────────────────────────────────────────
  if (base === "grep") {
    const pattern = args[0]; const file = args[1] || "stdin";
    if (!pattern) return [err("grep: missing pattern")];
    return [
      out(`${file}:3:  const ${pattern} = require('./${pattern}');`),
      out(`${file}:17: // TODO: handle ${pattern} edge case`),
      out(`${file}:42: export default ${pattern};`),
    ];
  }

  // ── FIND ───────────────────────────────────────────────────
  if (base === "find") {
    return [
      out("./src/index.js"), out("./src/App.js"),
      out("./src/components/Header.js"), out("./src/utils/helpers.js"),
      out("./tests/App.test.js"),
    ];
  }

  // ── CHMOD ──────────────────────────────────────────────────
  if (base === "chmod") {
    return args.length >= 2
      ? [ok(`chmod: permissions set to ${args[0]} on '${args[1]}'`)]
      : [err("chmod: missing operand")];
  }

  // ── ENV / SET ──────────────────────────────────────────────
  if (base === "env" || base === "set") {
    return [
      out("NODE_ENV=development"), out("HOME=/home/dev"), out("PATH=/usr/local/bin:/usr/bin:/bin"),
      out("EDITOR=nano"), out("LANG=en_US.UTF-8"), out("SHELL=/bin/bash"),
      out("USER=dev"), out("TERM=xterm-256color"),
    ];
  }

  // ── EXPORT / SETX ─────────────────────────────────────────
  if (base === "export" || base === "setx") {
    return args[0] ? [ok(`Variable set: ${args[0]}`)] : [err("export: missing argument")];
  }

  // ── WHICH / WHERE ─────────────────────────────────────────
  if (base === "which" || base === "where") {
    const tool = args[0];
    const paths = { node:"/usr/local/bin/node", npm:"/usr/local/bin/npm",
      python3:"/usr/bin/python3", git:"/usr/bin/git", docker:"/usr/bin/docker" };
    return tool
      ? [out(paths[tool] || `${base}: ${tool}: not found`)]
      : [err(`${base}: missing argument`)];
  }

  // ── HISTORY ───────────────────────────────────────────────
  if (base === "history") {
    const hist = historyStore[Object.keys(historyStore)[0]] || [];
    return hist.slice(-15).map((h, i) => out(`  ${String(i + 1).padStart(3)}  ${h}`));
  }

  // ── ALIAS ─────────────────────────────────────────────────
  if (base === "alias") {
    return [
      out('alias ll="ls -la"'), out('alias gs="git status"'),
      out('alias gp="git push"'), out('alias dc="docker-compose"'),
      out('alias py="python3"'), out('alias ..="cd .."'),
    ];
  }

  // ── DATE / TIME ───────────────────────────────────────────
  if (base === "date") return [out(new Date().toString())];
  if (base === "time") return [out(new Date().toLocaleTimeString())];

  // ── UNAME ─────────────────────────────────────────────────
  if (base === "uname") {
    if (args.includes("-a")) return [out("Linux droidterm 6.1.0-android #1 SMP Android aarch64 GNU/Linux")];
    return [out("Linux")];
  }

  // ── WHOAMI / HOSTNAME ─────────────────────────────────────
  if (base === "whoami") return [out(isWin ? "Dev\\Administrator" : "dev")];
  if (base === "hostname") return [out("droidterm-android")];

  // ── ID ────────────────────────────────────────────────────
  if (base === "id") return [out("uid=1000(dev) gid=1000(dev) groups=1000(dev),27(sudo),998(docker)")];

  // ── UPTIME ────────────────────────────────────────────────
  if (base === "uptime") {
    const h = Math.floor(Math.random()*24+1);
    return [out(`up ${h} hours, ${Math.floor(Math.random()*60)} min,  1 user,  load average: 0.${Math.floor(Math.random()*9)}, 0.${Math.floor(Math.random()*9)}, 0.${Math.floor(Math.random()*9)}`)];
  }

  // ── DF ────────────────────────────────────────────────────
  if (base === "df") return [
    out("Filesystem      Size  Used Avail Use% Mounted on"),
    out("/dev/sda1        50G   18G   30G  38% /"),
    out("tmpfs           2.0G  128M  1.9G   7% /dev/shm"),
    out("/dev/sdb1       100G   45G   55G  45% /home"),
  ];

  // ── FREE ──────────────────────────────────────────────────
  if (base === "free") return [
    out("              total        used        free      shared  buff/cache   available"),
    out(`Mem:        ${8*1024*1024}     ${4*1024*1024}     ${2*1024*1024}      ${128*1024}     ${2*1024*1024}     ${3*1024*1024}`),
    out(`Swap:       ${2*1024*1024}           0     ${2*1024*1024}`),
  ];

  // ── TOP / PS ──────────────────────────────────────────────
  if (base === "top" || (base === "ps" && args.includes("aux"))) return [
    info("  PID  USER    %CPU  %MEM  COMMAND"),
    out(`${Math.floor(Math.random()*9000+1000)}  dev      0.5   1.2  node server.js`),
    out(`${Math.floor(Math.random()*9000+1000)}  dev      0.3   0.8  python3 app.py`),
    out(`${Math.floor(Math.random()*9000+1000)}  root     0.1   0.3  nginx: master process`),
    out(`${Math.floor(Math.random()*9000+1000)}  dev      0.0   0.2  bash`),
    out(`${Math.floor(Math.random()*9000+1000)}  dev      0.0   0.1  ssh user@server`),
  ];

  if (base === "ps") return [
    out("  PID TTY          TIME CMD"),
    out(`${Math.floor(Math.random()*999+100)} pts/0    00:00:01 bash`),
    out(`${Math.floor(Math.random()*999+100)} pts/0    00:00:00 ps`),
  ];

  // ── KILL ──────────────────────────────────────────────────
  if (base === "kill") return args[0] ? [warn(`Signal sent to PID ${args[0]}`)] : [err("kill: missing PID")];

  // ── PING ──────────────────────────────────────────────────
  if (base === "ping") {
    const host = args.filter(a=>!a.startsWith("-"))[0] || "8.8.8.8";
    const count = parseInt(args[args.indexOf("-c")+1]) || 4;
    const lines = [info(`PING ${host}: 56 data bytes`)];
    for (let i=0; i<Math.min(count,4); i++) {
      const ms = (Math.random()*30+5).toFixed(3);
      lines.push(out(`64 bytes from ${host}: icmp_seq=${i} ttl=54 time=${ms} ms`));
    }
    lines.push(info(`--- ${host} ping statistics ---`));
    lines.push(ok(`${Math.min(count,4)} packets transmitted, ${Math.min(count,4)} received, 0% packet loss`));
    return lines;
  }

  // ── CURL ──────────────────────────────────────────────────
  if (base === "curl") {
    const url = args.filter(a=>!a.startsWith("-"))[0] || "https://example.com";
    if (args.includes("-I") || args.includes("--head")) {
      return [
        out("HTTP/2 200"),
        out("content-type: text/html; charset=UTF-8"),
        out(`date: ${new Date().toUTCString()}`),
        out("server: nginx/1.24.0"),
        out("x-powered-by: Express"),
        out("content-length: 1234"),
      ];
    }
    if (url.includes("ipinfo") || url.includes("ip")) {
      return [
        out('{ "ip": "203.0.113.42", "city": "Mumbai",'),
        out('  "region": "Maharashtra", "country": "IN",'),
        out('  "org": "AS9829 BSNL" }'),
      ];
    }
    return [out(`<!DOCTYPE html>`), out(`<html><head><title>Example Domain</title></head>`), out(`<body><h1>Example Domain</h1></body></html>`)];
  }

  // ── WGET ──────────────────────────────────────────────────
  if (base === "wget") {
    const url = args.filter(a=>!a.startsWith("-"))[0] || "file";
    const fname = url.split("/").pop() || "index.html";
    return [
      info(`--2026-03-22 09:14:01--  ${url}`),
      out("Resolving host... connected."),
      out("HTTP request sent, awaiting response... 200 OK"),
      out(`Length: ${Math.floor(Math.random()*500000+10000)} bytes`),
      ok(`'${fname}' saved [${Math.floor(Math.random()*500000+10000)}]`),
    ];
  }

  // ── SSH ───────────────────────────────────────────────────
  if (base === "ssh") {
    const target = args.filter(a=>!a.startsWith("-"))[0];
    if (!target) return [err("ssh: missing host")];
    return [
      info(`Connecting to ${target}...`),
      warn("The authenticity of host cannot be established."),
      warn("RSA key fingerprint is SHA256:xxxxxxxxxxxxxxxxxxx."),
      out("Are you sure you want to continue? (simulated)"),
      ok(`Connected to ${target} — Welcome!`),
      out(`Last login: Sat Mar 22 08:00:00 2026 from 192.168.1.1`),
    ];
  }

  // ── SCP ───────────────────────────────────────────────────
  if (base === "scp") {
    return args.length >= 2
      ? [info("Transferring..."), ok(`Transfer complete: ${args[0]} → ${args[1]}  (100%  2.4 MB/s)`)]
      : [err("scp: missing source/destination")];
  }

  // ── NETSTAT ───────────────────────────────────────────────
  if (base === "netstat") return [
    info("Active Internet connections"),
    out("Proto  Local Address           Foreign Address         State"),
    out("tcp    0.0.0.0:3000            0.0.0.0:*               LISTEN"),
    out("tcp    0.0.0.0:5000            0.0.0.0:*               LISTEN"),
    out("tcp    127.0.0.1:5432          0.0.0.0:*               LISTEN"),
    out("tcp    0.0.0.0:80              0.0.0.0:*               LISTEN"),
    out("tcp    0.0.0.0:443             0.0.0.0:*               LISTEN"),
  ];

  // ── IFCONFIG / IPCONFIG ───────────────────────────────────
  if (base === "ifconfig" || base === "ipconfig") return [
    info("eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500"),
    out("      inet 192.168.1.42  netmask 255.255.255.0  broadcast 192.168.1.255"),
    out("      inet6 fe80::1  prefixlen 64"),
    out("      ether 00:0c:29:ab:cd:ef  txqueuelen 1000"),
    info("lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536"),
    out("    inet 127.0.0.1  netmask 255.0.0.0"),
  ];

  // ── NMAP ──────────────────────────────────────────────────
  if (base === "nmap") {
    const host = args.filter(a=>!a.startsWith("-")).pop() || "localhost";
    return [
      info(`Starting Nmap scan on ${host}`),
      out("PORT     STATE SERVICE    VERSION"),
      ok("22/tcp   open  ssh        OpenSSH 8.9"),
      ok("80/tcp   open  http       nginx 1.24"),
      ok("443/tcp  open  https      nginx 1.24"),
      ok("3000/tcp open  http       Node.js"),
      ok("5432/tcp open  postgresql PostgreSQL 16"),
      info(`Nmap done: 1 IP address (1 host up) scanned`),
    ];
  }

  // ── GIT ───────────────────────────────────────────────────
  if (base === "git") {
    const sub = args[0];
    if (!sub) return [err("git: missing command. Try 'git help'")];

    if (sub === "status") return [
      info("On branch main"),
      info("Your branch is up to date with 'origin/main'."),
      out(""),
      out("Changes not staged for commit:"),
      warn("  modified:   src/App.js"),
      warn("  modified:   src/components/Header.js"),
      out(""),
      out("Untracked files:"),
      out("  src/components/NewFeature.js"),
      out(""),
      out('no changes added to commit (use "git add" to stage)'),
    ];

    if (sub === "log") return [
      out("* \x1b[33ma1b2c3d\x1b[0m (HEAD → main) feat: add dark mode toggle"),
      out("* \x1b[33me4f5g6h\x1b[0m fix: resolve mobile layout issue"),
      out("* \x1b[33mi7j8k9l\x1b[0m chore: update dependencies"),
      out("* \x1b[33mm1n2o3p\x1b[0m feat: add user authentication"),
      out("* \x1b[33mq4r5s6t\x1b[0m init: initial commit"),
    ];

    if (sub === "pull") return [
      info("From github.com:user/repo"),
      ok("* branch            main → FETCH_HEAD"),
      ok("Already up to date."),
    ];

    if (sub === "push") return [
      info("Enumerating objects: 5, done."),
      out("Counting objects: 100% (5/5), done."),
      out("Compressing objects: 100% (3/3), done."),
      ok("To github.com:user/repo.git"),
      ok("   a1b2c3d..e4f5g6h  main → main"),
    ];

    if (sub === "add") return [ok(`Staged: ${args.slice(1).join(" ") || "(nothing)"}`)];

    if (sub === "commit") {
      const msg = raw.match(/-m\s+["']?([^"']+)["']?/)?.[1] || "update";
      return [ok(`[main a1b2c3d] ${msg}`), out(" 2 files changed, 15 insertions(+), 3 deletions(-)")];
    }

    if (sub === "clone") {
      const repo = args[1] || "repo";
      return [
        info(`Cloning into '${repo.split("/").pop()?.replace(".git","")}'...`),
        out("remote: Enumerating objects: 120, done."),
        out("remote: Counting objects: 100% (120/120), done."),
        ok("Receiving objects: 100% (120/120), 1.24 MiB | 4.2 MiB/s, done."),
      ];
    }

    if (sub === "branch") return [
      ok("* main"),
      out("  develop"), out("  feature/auth"), out("  feature/dark-mode"),
    ];

    if (sub === "checkout") {
      const branch = args[1] || args.filter(a=>!a.startsWith("-"))[0];
      if (args.includes("-b")) return [ok(`Switched to a new branch '${branch}'`)];
      return branch ? [ok(`Switched to branch '${branch}'`)] : [err("git checkout: missing branch")];
    }

    if (sub === "diff") return [
      out("diff --git a/src/App.js b/src/App.js"),
      out("@@ -10,6 +10,7 @@"),
      ok("+  const [darkMode, setDarkMode] = useState(false);"),
      warn("-  return <div className='app'>"),
      ok("+  return <div className={darkMode ? 'app dark' : 'app'}>"),
    ];

    if (sub === "stash") return [ok("Saved working directory and index state WIP on main")];
    if (sub === "init")  return [ok(`Initialized empty Git repository in ${cwd}/.git/`)];

    return [err(`git: '${sub}' is not a git command. See 'git help'`)];
  }

  // ── NODE ──────────────────────────────────────────────────
  if (base === "node") {
    if (args[0] === "--version" || args[0] === "-v") return [out("v20.11.1")];
    if (!args[0]) return [info("Welcome to Node.js v20.11.1."), info("Type '.help' for more information."), out("> ")];
    return [info(`Running ${args[0]}...`), ok("Script executed successfully"), out("Process exited with code 0")];
  }

  // ── NPM ───────────────────────────────────────────────────
  if (base === "npm") {
    const sub = args[0];
    if (!sub) return [err("npm: missing command")];
    if (sub === "--version" || sub === "-v") return [out("10.2.4")];
    if (sub === "install" || sub === "i") {
      const pkg = args[1];
      return pkg
        ? [info(`npm: installing ${pkg}...`), out("added 1 package in 1.2s"), ok(`✓ ${pkg} installed`)]
        : [info("npm: installing packages..."), out("added 847 packages in 12.4s"), ok("✓ Dependencies installed")];
    }
    if (sub === "start")   return [info("Starting server..."), ok("Server running on http://localhost:3000")];
    if (sub === "run") {
      const script = args[1] || "(none)";
      return [info(`Running script: ${script}`), out("..."), ok(`Script '${script}' completed`)];
    }
    if (sub === "test")    return [info("Running test suite..."), ok("✓ 24 tests passed (2.3s)")];
    if (sub === "build")   return [info("Building..."), out("Compiling TypeScript..."), ok("Build complete → dist/  (2.4 MB)")];
    if (sub === "audit")   return [info("Auditing packages..."), ok("found 0 vulnerabilities")];
    if (sub === "init")    return [ok("package.json created ✓")];
    if (sub === "list" || sub === "ls") return [
      out("my-app@1.0.0"), out("├── express@4.18.2"), out("├── react@18.2.0"), out("└── typescript@5.3.3"),
    ];
    if (sub === "uninstall" || sub === "rm") return args[1] ? [ok(`Removed ${args[1]}`)] : [err("npm: missing package name")];
    return [err(`npm: unknown command '${sub}'`)];
  }

  // ── NPX ───────────────────────────────────────────────────
  if (base === "npx") {
    const pkg = args[0];
    if (!pkg) return [err("npx: missing command")];
    return [info(`npx: executing ${pkg}...`), ok(`✓ ${pkg} completed`)];
  }

  // ── PYTHON ────────────────────────────────────────────────
  if (base === "python3" || base === "python" || base === "py") {
    if (!args.length) return [info("Python 3.11.6 (main, Mar 22 2026)"), info('Type "help" for more information.'), out(">>> ")];
    if (args[0] === "--version" || args[0] === "-V") return [out("Python 3.11.6")];
    if (args[0] === "-m" && args[1] === "venv") return [ok(`Virtual environment created: ${args[2] || "venv"}`)];
    if (args[0] === "-c") {
      const code = args.slice(1).join(" ").replace(/["']/g,"");
      if (code.includes("print")) return [out(code.replace(/print\(|\)/g,"").replace(/["']/g,""))];
      return [out("(executed)")];
    }
    return [info(`Running ${args[0]}...`), ok("Script completed — exit code 0")];
  }

  // ── PIP ───────────────────────────────────────────────────
  if (base === "pip" || base === "pip3") {
    const sub = args[0];
    if (sub === "install") {
      const pkg = args.slice(1).filter(a=>!a.startsWith("-")).join(", ");
      return pkg
        ? [info(`Collecting ${pkg}`), out(`Downloading ${pkg}...`), ok(`Successfully installed ${pkg}`)]
        : [info("Installing from requirements.txt..."), ok("Successfully installed 12 packages")];
    }
    if (sub === "list") return [
      out("Package         Version"), out("---------       -------"),
      out("flask           3.0.0"),  out("requests        2.31.0"),
      out("numpy           1.26.3"), out("pandas          2.1.4"),
      out("scikit-learn    1.4.0"),
    ];
    if (sub === "freeze") return [out("flask==3.0.0"), out("requests==2.31.0"), out("numpy==1.26.3")];
    if (sub === "uninstall") return args[1] ? [ok(`Successfully uninstalled ${args[1]}`)] : [err("pip: missing package")];
    return [err(`pip: unknown command '${sub}'`)];
  }

  // ── PYTEST ────────────────────────────────────────────────
  if (base === "pytest") return [
    info("========================= test session starts ========================="),
    out("platform linux -- Python 3.11.6, pytest-7.4.3"),
    ok("collected 18 items"),
    out(""),
    ok("tests/test_app.py ............"),
    ok("tests/test_utils.py ......"),
    out(""),
    ok("========================= 18 passed in 1.42s ========================="),
  ];

  // ── FLASK ─────────────────────────────────────────────────
  if (base === "flask") return [
    info("* Serving Flask app 'app'"),
    info("* Debug mode: on"),
    ok("* Running on http://0.0.0.0:5000"),
    ok("* Running on http://127.0.0.1:5000"),
    info("Press CTRL+C to quit"),
  ];

  // ── DOCKER ────────────────────────────────────────────────
  if (base === "docker") {
    const sub = args[0];
    if (!sub) return [err("docker: missing command. Try 'docker help'")];

    if (sub === "--version") return [out("Docker version 25.0.2, build 29cf629")];

    if (sub === "ps") return [
      out("CONTAINER ID   IMAGE           COMMAND              CREATED         STATUS         PORTS          NAMES"),
      ok("a1b2c3d4e5f6   myapp:latest    \"node server.js\"     2 hours ago     Up 2 hours     0.0.0.0:3000   myapp"),
      ok("f6e5d4c3b2a1   postgres:16     \"docker-entryp...\"   3 days ago      Up 3 days      5432/tcp       postgres"),
      ok("b1c2d3e4f5a6   nginx:latest    \"/docker-entry...\"   5 days ago      Up 5 days      80,443/tcp     nginx"),
    ];

    if (sub === "images") return [
      out("REPOSITORY   TAG       IMAGE ID       CREATED        SIZE"),
      out("myapp        latest    a1b2c3d4e5f6   2 hours ago    342MB"),
      out("postgres     16        f6e5d4c3b2a1   3 weeks ago    425MB"),
      out("nginx        latest    b1c2d3e4f5a6   4 weeks ago    187MB"),
      out("node         20-alpine 1a2b3c4d5e6f   6 weeks ago    134MB"),
    ];

    if (sub === "build") {
      const tag = args[args.indexOf("-t")+1] || "myapp:latest";
      return [
        info(`Building image: ${tag}`),
        out("Step 1/8 : FROM node:20-alpine"), out(" ---> 1a2b3c4d5e6f"),
        out("Step 2/8 : WORKDIR /app"),        out(" ---> Running in a1b2c3d4"),
        out("Step 3/8 : COPY package*.json ./"),
        out("Step 4/8 : RUN npm ci --only=production"),
        out("Step 5/8 : COPY . ."),
        out("Step 6/8 : EXPOSE 3000"),
        out("Step 7/8 : CMD [\"node\", \"server.js\"]"),
        ok(`Successfully built a1b2c3d4e5f6`),
        ok(`Successfully tagged ${tag}`),
      ];
    }

    if (sub === "run") {
      const image = args.filter(a=>!a.startsWith("-"))[1] || "myapp:latest";
      return [ok(`Container started: ${Math.random().toString(36).slice(2,14)}`)];
    }

    if (sub === "stop") return [ok(`Container stopped: ${args[1] || "all"}`)];
    if (sub === "rm")   return [ok(`Container removed: ${args[1] || "(id)"}`)];
    if (sub === "rmi")  return [ok(`Image removed: ${args[1] || "(image)"}`)];

    if (sub === "logs") return [
      out("[2026-03-22T09:00:01] Server started on port 3000"),
      out("[2026-03-22T09:00:02] Database connected"),
      out("[2026-03-22T09:01:15] GET / 200 12ms"),
      out("[2026-03-22T09:02:30] POST /api/data 201 45ms"),
      out("[2026-03-22T09:05:00] Health check passed"),
    ];

    if (sub === "exec") return [info(`Executing in container ${args[1]}...`), ok("Done")];

    if (sub === "pull") {
      const image = args[1] || "image";
      return [
        info(`Pulling from docker.io/library/${image}`),
        out("Digest: sha256:abc123..."),
        ok(`Status: Downloaded newer image for ${image}`),
      ];
    }

    if (sub === "system" && args[1] === "prune") return [
      warn("This will remove all stopped containers, unused networks, dangling images."),
      ok("Deleted Containers: 3  |  Deleted Images: 2  |  Reclaimed: 1.2GB"),
    ];

    if (sub === "compose" || sub === "compose") {
      const sub2 = args[1];
      if (sub2 === "up")   return [info("Starting services..."), ok("✓ db (postgres) started"), ok("✓ api (myapp) started"), ok("✓ nginx started")];
      if (sub2 === "down") return [ok("Containers stopped and removed")];
      if (sub2 === "logs") return [out("api    | Server running on :3000"), out("db     | database system is ready")];
    }

    return [err(`docker: unknown command '${sub}'. See 'docker --help'`)];
  }

  // ── TAR ───────────────────────────────────────────────────
  if (base === "tar") {
    if (args.includes("-czf") || args.includes("czf")) {
      const out2 = args.filter(a=>!a.startsWith("-"))[0];
      return [ok(`Archive created: ${out2}`)];
    }
    if (args.includes("-xzf") || args.includes("xzf")) {
      const file = args.filter(a=>!a.startsWith("-"))[0];
      return [info(`Extracting ${file}...`), ok("Extraction complete")];
    }
    if (args.includes("-tf")) return [out("archive/"), out("archive/file1.txt"), out("archive/file2.js")];
    return [err("tar: missing flags. Try: tar -czf archive.tar.gz ./folder")];
  }

  // ── ZIP / UNZIP ───────────────────────────────────────────
  if (base === "zip") {
    const file = args.filter(a=>!a.startsWith("-"))[0];
    return file ? [info(`Zipping...`), ok(`${file} created`)] : [err("zip: missing filename")];
  }
  if (base === "unzip") {
    const file = args[0];
    return file ? [info(`Extracting ${file}...`), ok("Archive extracted")] : [err("unzip: missing filename")];
  }

  // ── NANO / VIM / VI ───────────────────────────────────────
  if (base === "nano" || base === "vim" || base === "vi") {
    const file = args[0];
    return file
      ? [info(`Opening ${file} in ${base} (simulated — use a real terminal for editing)`), warn("Press Ctrl+X to exit nano, :q! to exit vim")]
      : [err(`${base}: missing filename`)];
  }

  // ── CRONTAB ───────────────────────────────────────────────
  if (base === "crontab") {
    if (args.includes("-l")) return [
      out("# Crontab entries:"),
      out("0 2 * * * /home/dev/scripts/backup.sh"),
      out("*/5 * * * * /home/dev/scripts/healthcheck.sh"),
      out("0 0 * * 0 /home/dev/scripts/weekly-report.sh"),
    ];
    return [info("crontab: use -l to list, -e to edit")];
  }

  // ── SYSTEMCTL / SERVICE ───────────────────────────────────
  if (base === "systemctl" || base === "service") {
    const sub = args[0]; const svc = args[1];
    if (sub === "status") return [
      ok(`● ${svc || "nginx"}.service — A high performance web server`),
      out("   Loaded: loaded (/lib/systemd/system/nginx.service)"),
      ok("   Active: active (running) since Sat 2026-03-22 09:00:01 UTC"),
      out(`  Process: 1234 ExecStart=/usr/sbin/nginx`),
    ];
    if (sub === "start")   return svc ? [ok(`✓ ${svc} started`)]   : [err("systemctl: missing service name")];
    if (sub === "stop")    return svc ? [ok(`✓ ${svc} stopped`)]   : [err("systemctl: missing service name")];
    if (sub === "restart") return svc ? [ok(`✓ ${svc} restarted`)] : [err("systemctl: missing service name")];
    if (sub === "enable")  return svc ? [ok(`✓ ${svc} enabled on boot`)] : [err("missing service")];
    return [info(`systemctl ${sub} executed`)];
  }

  // ── APT / APT-GET ─────────────────────────────────────────
  if (base === "apt" || base === "apt-get") {
    const sub = args[0];
    if (sub === "update")  return [info("Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease"), ok("Reading package lists... Done")];
    if (sub === "install") {
      const pkg = args.slice(1).filter(a=>!a.startsWith("-")).join(" ");
      return pkg
        ? [info(`Unpacking ${pkg}...`), ok(`${pkg} installed successfully`)]
        : [err("apt: missing package name")];
    }
    if (sub === "upgrade") return [info("Calculating upgrade..."), ok("0 upgraded, 0 newly installed, 0 to remove")];
    if (sub === "remove")  return args[1] ? [ok(`${args[1]} removed`)] : [err("apt: missing package")];
    return [err(`apt: unknown command '${sub}'`)];
  }

  // ── CHOCO / WINGET (Windows) ──────────────────────────────
  if (base === "choco" || base === "winget") {
    const sub = args[0];
    if (sub === "install") return args[1] ? [info(`Installing ${args[1]}...`), ok(`${args[1]} installed successfully`)] : [err("Missing package name")];
    if (sub === "list")    return [out("Chocolatey v2.2.0"), out("node.js 20.11.1"), out("git 2.43.0"), out("python 3.11.6"), out("docker-desktop 4.27.1")];
    return [info(`${base} ${sub || ""} executed`)];
  }

  // ── POWERSHELL (Windows specific) ─────────────────────────
  if (base === "powershell" || base === "pwsh") {
    return [info("Windows PowerShell"), info("Copyright (C) Microsoft Corporation."), out("PS C:\\Users\\Dev> ")];
  }

  // ── TASKLIST / TASKKILL ───────────────────────────────────
  if (base === "tasklist") return [
    out("Image Name          PID  Status     Mem Usage"),
    out("node.exe           1234  Running    45,678 K"),
    out("python.exe         5678  Running    32,456 K"),
    out("nginx.exe          9012  Running    12,345 K"),
  ];
  if (base === "taskkill") return args.length ? [ok(`Process terminated: ${args.join(" ")}`)] : [err("taskkill: missing arguments")];

  // ── VER (Windows) ─────────────────────────────────────────
  if (base === "ver") return [out("Microsoft Windows [Version 11.0.22631.3085]")];

  // ── NEOFETCH ──────────────────────────────────────────────
  if (base === "neofetch") return [
    info("       _____              dev@droidterm"),
    info("      |  __ \\             ───────────────"),
    info("      | |  | |_ __ ___   OS: DroidTerm Linux"),
    info("      | |  | | '__/ _ \\  Kernel: 6.1.0-android"),
    info("      | |__| | | | (_) | Shell: bash 5.2.15"),
    info("      |_____/|_|  \\___/  Terminal: DroidTerm"),
    out(""),
    out("  CPU: Snapdragon 888 (8) @ 2.84GHz"),
    out("  RAM: 4.2 GiB / 8 GiB"),
    out("  Storage: 18.4 GiB / 64 GiB"),
    out("  Uptime: 4 hours, 22 mins"),
  ];

  // ── VERSION CHECKS ────────────────────────────────────────
  if (raw === "git --version")    return [out("git version 2.43.0")];
  if (raw === "docker --version") return [out("Docker version 25.0.2, build 29cf629")];

  // ── EXIT ──────────────────────────────────────────────────
  if (base === "exit" || base === "quit") return [{ type:"EXIT" }];

  // ── UNKNOWN ───────────────────────────────────────────────
  return [err(`${isWin ? "" : "bash: "}${base}: command not found`)];
}

/* ═══════════════════════════ CLAUDE AI ══ */
async function askClaude(question) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: `You are an expert terminal assistant for a mobile developer terminal app.
Answer questions about Linux, Windows, Git, Docker, Node.js, Python, networking, and general tech.
Keep answers concise and practical — format with short lines suitable for a mobile terminal screen (max 55 chars per line).
Use plain text only, no markdown formatting. No asterisks, no pound signs.
Prefix command examples with $ for Linux or > for Windows.`,
      messages: [{ role: "user", content: question }],
    }),
  });
  const data = await res.json();
  return data.content?.map(b => b.text || "").join("") || "No response";
}

/* ═══════════════════════════ COMPONENTS ══ */

function TerminalLine({ line }) {
  const typeClass = {
    out:"line-out", success:"line-success", error:"line-error",
    warn:"line-warn", info:"line-info", prompt:"line-prompt",
    ai:"line-ai", system:"line-system", cmd:"line-cmd",
  }[line.type] || "line-out";

  return (
    <div className={`fade-in ${typeClass}`} style={{ wordBreak:"break-all", whiteSpace:"pre-wrap" }}>
      {line.text}
    </div>
  );
}

let tabIdCounter = 1;

/* ═══════════════════════════ MAIN APP ══ */
export default function App() {
  const [os, setOs]           = useState("linux");
  const [tabs, setTabs]       = useState([{ id:1, title:"bash", lines:[], cwd:"/home/dev", history:[], histIdx:-1 }]);
  const [activeTab, setActiveTab] = useState(1);
  const [input, setInput]     = useState("");
  const [showQuick, setShowQuick] = useState(false);
  const [booting, setBooting] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [notif, setNotif]     = useState("");
  const [time, setTime]       = useState(new Date());
  const inputRef  = useRef();
  const outputRef = useRef();

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Boot
  useEffect(() => {
    const t = setTimeout(() => {
      setBooting(false);
      addLines(activeTab, [
        { type:"info",    text:"╔══════════════════════════════════════╗" },
        { type:"info",    text:"║  DroidTerm v3.0  —  Mobile DevShell  ║" },
        { type:"info",    text:"╠══════════════════════════════════════╣" },
        { type:"success", text:"  OS: Linux (Ubuntu 22.04) [switchable]" },
        { type:"out",     text:"  Node v20.11.1  |  Python 3.11.6" },
        { type:"out",     text:"  Git 2.43.0     |  Docker 25.0.2" },
        { type:"system",  text:"  Type 'help' for commands  |  ⚡ for shortcuts" },
        { type:"system",  text:"  Type 'ai <question>' for AI assistance" },
        { type:"info",    text:"╚══════════════════════════════════════╝" },
        { type:"out",     text:"" },
      ]);
    }, 2600);
    return () => clearTimeout(t);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [tabs]);

  const showNotif = (msg) => {
    setNotif(msg);
    setTimeout(() => setNotif(""), 2000);
  };

  const getTab = (id) => tabs.find(t => t.id === id);

  const addLines = useCallback((tabId, newLines) => {
    setTabs(prev => prev.map(t =>
      t.id === tabId ? { ...t, lines: [...t.lines, ...newLines] } : t
    ));
  }, []);

  const setCwd = useCallback((tabId, newCwd) => {
    setTabs(prev => prev.map(t =>
      t.id === tabId ? { ...t, cwd: newCwd } : t
    ));
  }, []);

  const prompt = () => {
    const tab = getTab(activeTab);
    const cwd = tab?.cwd || (os === "linux" ? "/home/dev" : "C:\\Users\\Dev");
    return os === "linux"
      ? `${LINUX_USER}@droidterm:${cwd}$ `
      : `PS ${cwd}> `;
  };

  const runCommand = async (rawCmd) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    const tab = getTab(activeTab);
    const cwd = tab?.cwd || (os === "linux" ? "/home/dev" : "C:\\Users\\Dev");

    // Add command line
    addLines(activeTab, [{ type:"prompt", text: prompt() + cmd }]);

    // Save history
    setTabs(prev => prev.map(t =>
      t.id === activeTab
        ? { ...t, history: [cmd, ...t.history.slice(0,99)], histIdx: -1 }
        : t
    ));

    // AI command
    if (cmd.toLowerCase().startsWith("ai ")) {
      const question = cmd.slice(3).trim();
      if (!question) { addLines(activeTab, [{ type:"error", text:"ai: missing question" }]); return; }
      setAiLoading(true);
      addLines(activeTab, [{ type:"ai", text:"🤖 Thinking..." }]);
      try {
        const answer = await askClaude(question);
        const lines = answer.split("\n").map(l => ({ type:"ai", text: l }));
        setTabs(prev => prev.map(t => {
          if (t.id !== activeTab) return t;
          const filtered = t.lines.filter(l => l.text !== "🤖 Thinking...");
          return { ...t, lines: [...filtered, { type:"ai", text:"🤖 AI Answer:" }, ...lines, { type:"out", text:"" }] };
        }));
      } catch {
        setTabs(prev => prev.map(t => {
          if (t.id !== activeTab) return t;
          const filtered = t.lines.filter(l => l.text !== "🤖 Thinking...");
          return { ...t, lines: [...filtered, { type:"error", text:"ai: connection error" }] };
        }));
      }
      setAiLoading(false);
      return;
    }

    // Process command
    const results = processCommand(cmd, os, cwd, (newCwd) => setCwd(activeTab, newCwd));

    if (!results || results.length === 0) return;

    // Handle special results
    for (const r of results) {
      if (r.type === "CLEAR") {
        setTabs(prev => prev.map(t => t.id === activeTab ? { ...t, lines: [] } : t));
        return;
      }
      if (r.type === "SWITCH_OS") {
        setOs(r.to);
        const newCwd = r.to === "linux" ? "/home/dev" : "C:\\Users\\Dev";
        setCwd(activeTab, newCwd);
        setTabs(prev => prev.map(t =>
          t.id === activeTab
            ? { ...t, title: r.to === "linux" ? "bash" : "powershell" }
            : t
        ));
        addLines(activeTab, [
          { type:"success", text:`Switched to ${r.to === "linux" ? "🐧 Linux (bash)" : "🪟 Windows (PowerShell)"}` },
          { type:"system",  text:`CWD reset to ${newCwd}` },
        ]);
        return;
      }
      if (r.type === "EXIT") {
        addLines(activeTab, [{ type:"system", text:"Session ended. Start a new tab to continue." }]);
        return;
      }
    }

    addLines(activeTab, [...results, { type:"out", text:"" }]);
  };

  const handleKey = (e) => {
    const tab = getTab(activeTab);
    if (e.key === "Enter") {
      runCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const newIdx = Math.min((tab?.histIdx ?? -1) + 1, (tab?.history?.length ?? 0) - 1);
      setTabs(prev => prev.map(t => t.id === activeTab ? { ...t, histIdx: newIdx } : t));
      setInput(tab?.history?.[newIdx] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const newIdx = Math.max((tab?.histIdx ?? -1) - 1, -1);
      setTabs(prev => prev.map(t => t.id === activeTab ? { ...t, histIdx: newIdx } : t));
      setInput(newIdx === -1 ? "" : tab?.history?.[newIdx] || "");
    } else if (e.key === "Tab") {
      e.preventDefault();
      // Basic autocomplete
      const cmds = ["git","docker","npm","node","python3","pip","ls","cd","clear","help","ssh","curl","ping","cat","grep","find"];
      const match = cmds.find(c => c.startsWith(input));
      if (match) setInput(match + " ");
    }
  };

  const kbdAction = (key) => {
    if (key === "Tab") {
      const cmds = ["git","docker","npm","node","python3","pip"];
      const match = cmds.find(c => c.startsWith(input));
      if (match) setInput(match + " ");
    } else if (key === "Ctrl+C") {
      addLines(activeTab, [{ type:"warn", text:"^C" }]);
      setInput("");
    } else if (key === "↑") {
      const tab = getTab(activeTab);
      const newIdx = Math.min((tab?.histIdx ?? -1) + 1, (tab?.history?.length ?? 0) - 1);
      setTabs(prev => prev.map(t => t.id === activeTab ? { ...t, histIdx: newIdx } : t));
      setInput(tab?.history?.[newIdx] || "");
    } else if (key === "↓") {
      const tab = getTab(activeTab);
      const newIdx = Math.max((tab?.histIdx ?? -1) - 1, -1);
      setTabs(prev => prev.map(t => t.id === activeTab ? { ...t, histIdx: newIdx } : t));
      setInput(newIdx === -1 ? "" : tab?.history?.[newIdx] || "");
    } else if (key === "clear") {
      setTabs(prev => prev.map(t => t.id === activeTab ? { ...t, lines: [] } : t));
    } else {
      setInput(prev => prev + key);
      inputRef.current?.focus();
    }
  };

  const addTab = () => {
    tabIdCounter++;
    const newId = tabIdCounter;
    const newCwd = os === "linux" ? "/home/dev" : "C:\\Users\\Dev";
    setTabs(prev => [...prev, {
      id: newId,
      title: os === "linux" ? "bash" : "pwsh",
      lines: [{ type:"info", text:`New terminal session — ${os === "linux" ? "bash" : "PowerShell"}` }],
      cwd: newCwd, history: [], histIdx: -1,
    }]);
    setActiveTab(newId);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const closeTab = (id) => {
    if (tabs.length === 1) { showNotif("Cannot close last tab"); return; }
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTab === id) setActiveTab(newTabs[newTabs.length - 1].id);
  };

  const tab = getTab(activeTab);

  return (
    <>
      <style>{STYLES}</style>
      <div className="scanlines"/>

      {booting && (
        <div className="boot-screen">
          <div className="boot-logo">◈ DroidTerm</div>
          <div style={{ fontFamily:"var(--mono)", fontSize:12, color:"var(--nord3)" }}>Initializing shell environment...</div>
          <div className="boot-bar"><div className="boot-fill"/></div>
          <div style={{ fontFamily:"var(--mono)", fontSize:11, color:"var(--nord3)" }}>v3.0.0 — Nord Edition</div>
        </div>
      )}

      {notif && <div className="notif">{notif}</div>}

      {/* Main layout */}
      <div style={{ display:"flex", flexDirection:"column", height:"100vh", maxWidth:480, margin:"0 auto" }}>

        {/* Status bar */}
        <div className="statusbar">
          <span>{time.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}</span>
          <span style={{ fontWeight:700, color:"var(--nord8)", letterSpacing:".05em" }}>◈ DroidTerm</span>
          <span>🔋 87%</span>
        </div>

        {/* Title bar */}
        <div className="titlebar">
          <div className="os-switch">
            <button className={`os-btn ${os==="linux"?"active-linux":"inactive"}`}
              onClick={()=>{ setOs("linux"); setCwd(activeTab,"/home/dev"); showNotif("Switched to Linux 🐧"); }}>
              🐧 LINUX
            </button>
            <button className={`os-btn ${os==="win"?"active-win":"inactive"}`}
              onClick={()=>{ setOs("win"); setCwd(activeTab,"C:\\Users\\Dev"); showNotif("Switched to Windows 🪟"); }}>
              🪟 WIN
            </button>
          </div>

          <div style={{ flex:1 }}/>

          {/* AI indicator */}
          {aiLoading && (
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"var(--nord15)" }}>
              <div className="ai-thinking">
                <div className="ai-dot"/><div className="ai-dot"/><div className="ai-dot"/>
              </div>
              <span>AI</span>
            </div>
          )}

          {/* Quick panel button */}
          <button onClick={()=>setShowQuick(v=>!v)}
            style={{ padding:"5px 10px", borderRadius:8, border:"1px solid var(--border)",
              background:showQuick?"var(--nord10)":"var(--nord1)", color:showQuick?"#fff":"var(--nord4)",
              fontSize:13, cursor:"pointer", fontFamily:"var(--display)", fontWeight:700 }}>
            ⚡
          </button>

          {/* New tab */}
          <button onClick={addTab}
            style={{ padding:"5px 10px", borderRadius:8, border:"1px solid var(--border)",
              background:"var(--nord1)", color:"var(--nord14)",
              fontSize:14, cursor:"pointer" }}>
            ＋
          </button>
        </div>

        {/* Tab bar */}
        <div className="tabbar">
          {tabs.map(t => (
            <button key={t.id} className={`tab ${t.id===activeTab?"active":""}`}
              onClick={()=>{ setActiveTab(t.id); setTimeout(()=>inputRef.current?.focus(),50); }}>
              {os==="linux" ? "🐧" : "🪟"} {t.title}
              {tabs.length > 1 && (
                <span onClick={e=>{ e.stopPropagation(); closeTab(t.id); }}
                  style={{ marginLeft:4, opacity:.5, fontSize:10 }}>✕</span>
              )}
            </button>
          ))}
        </div>

        {/* CWD breadcrumb */}
        <div style={{ padding:"3px 12px", background:"var(--nord0)", borderBottom:"1px solid var(--border)",
          fontSize:10, color:"var(--nord3)", fontFamily:"var(--mono)", display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ color:os==="linux"?"var(--nord14)":"var(--nord9)" }}>
            {os==="linux"?"🐧":"🪟"}
          </span>
          <span style={{ color:"var(--nord8)" }}>{tab?.cwd}</span>
        </div>

        {/* Terminal output */}
        <div className="terminal-output" ref={outputRef}
          onClick={()=>inputRef.current?.focus()}>
          {tab?.lines.map((line, i) => (
            <TerminalLine key={i} line={line}/>
          ))}
          {/* Live prompt */}
          <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap" }}>
            <span className="line-prompt" style={{ fontSize:"12.5px" }}>{prompt()}</span>
            <span className="line-cmd" style={{ fontSize:"12.5px" }}>{input}</span>
            <span className="cursor-blink"/>
          </div>
        </div>

        {/* Input row */}
        <div className="input-row">
          <span className="prompt-label">
            {os==="linux" ? "❯" : "›"}
          </span>
          <input
            ref={inputRef}
            className="cmd-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={`Enter command...`}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            inputMode="text"
          />
          <button onClick={() => { runCommand(input); setInput(""); }}
            style={{ padding:"6px 12px", borderRadius:8, border:"none",
              background:"var(--nord10)", color:"#fff",
              fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"var(--display)", flexShrink:0 }}>
            RUN
          </button>
        </div>

        {/* Keyboard shortcuts row */}
        <div className="kbd-row">
          {KBD_SHORTCUTS.map(k => (
            <button key={k} className="kbd-btn" onClick={() => kbdAction(k)}>{k}</button>
          ))}
        </div>

      </div>

      {/* Quick commands panel */}
      {showQuick && (
        <div style={{ position:"fixed", inset:0, zIndex:90 }}
          onClick={()=>setShowQuick(false)}>
          <div className="quickpanel" onClick={e=>e.stopPropagation()}>
            <div className="qp-handle"/>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <span style={{ fontFamily:"var(--display)", fontWeight:700, color:"var(--nord8)", fontSize:15 }}>
                ⚡ Quick Commands
              </span>
              <button onClick={()=>setShowQuick(false)}
                style={{ background:"transparent", border:"none", color:"var(--nord3)", fontSize:18, cursor:"pointer" }}>✕</button>
            </div>

            {Object.entries(QUICK_CMDS).map(([section, cmds]) => (
              <div key={section}>
                <div className="qp-section">{section.toUpperCase()}</div>
                <div className="qp-grid">
                  {cmds.map(c => (
                    <div key={c.label} className="qp-cmd"
                      onClick={() => {
                        setInput(c.cmd);
                        setShowQuick(false);
                        inputRef.current?.focus();
                      }}>
                      <span className="qp-icon">{c.icon}</span>
                      {c.label}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* AI quick ask */}
            <div className="qp-section">AI ASSISTANT</div>
            <div className="qp-grid">
              {[
                { icon:"❓", label:"explain cmd",  cmd:"ai explain the last command" },
                { icon:"🐛", label:"debug help",   cmd:"ai how to debug node.js app" },
                { icon:"🔒", label:"SSH setup",    cmd:"ai how to set up SSH keys" },
                { icon:"🐳", label:"Docker help",  cmd:"ai how to optimize Dockerfile" },
                { icon:"🌿", label:"Git reset",    cmd:"ai how to undo last git commit" },
                { icon:"🌐", label:"CORS fix",     cmd:"ai how to fix CORS in Express" },
              ].map(c => (
                <div key={c.label} className="qp-cmd"
                  onClick={() => {
                    setInput(c.cmd);
                    setShowQuick(false);
                    inputRef.current?.focus();
                  }}>
                  <span className="qp-icon">{c.icon}</span>
                  {c.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

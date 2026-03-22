import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* ═══════════════════════════════════════════ STYLES ══ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,700;1,400&family=Space+Grotesk:wght@400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0a0e1a;--s1:#0f1629;--s2:#151d35;--s3:#1c2640;
  --border:rgba(99,179,237,.13);--border2:rgba(99,179,237,.22);
  --accent:#63b3ed;--accent2:#68d391;--accent3:#f6ad55;
  --accent4:#fc8181;--accent5:#b794f4;--accent6:#76e4f7;
  --text:#e2e8f0;--muted:#4a5568;--mono:'JetBrains Mono',monospace;
  --sans:'Space Grotesk',sans-serif;
}
html,body,#root{height:100%;width:100%;background:var(--bg);color:var(--text);font-family:var(--mono);overflow:hidden;-webkit-tap-highlight-color:transparent;user-select:none;}
::-webkit-scrollbar{width:2px;height:2px}
::-webkit-scrollbar-thumb{background:var(--muted);border-radius:99px}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes slideLeft{from{transform:translateX(100%);opacity:0}to{transform:none;opacity:1}}
@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:none;opacity:1}}
@keyframes glow{0%,100%{box-shadow:0 0 8px rgba(99,179,237,.3)}50%{box-shadow:0 0 20px rgba(99,179,237,.6)}}
@keyframes progress{from{width:0}to{width:100%}}
@keyframes scanline{from{transform:translateY(-100%)}to{transform:translateY(100vh)}}
.fade-up{animation:fadeUp .25s ease forwards}
.fade-in{animation:fadeIn .2s ease forwards}
.slide-left{animation:slideLeft .3s cubic-bezier(.4,0,.2,1) forwards}
.slide-up{animation:slideUp .3s cubic-bezier(.4,0,.2,1) forwards}
.cursor{display:inline-block;width:8px;height:13px;background:var(--accent);margin-left:1px;vertical-align:middle;animation:blink 1s step-end infinite}
.spinner{width:14px;height:14px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .6s linear infinite;display:inline-block}
/* SCANLINES */
.scanlines{pointer-events:none;position:fixed;inset:0;z-index:9000;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.025) 2px,rgba(0,0,0,.025) 4px)}
/* NAV DOCK */
.dock{display:flex;background:rgba(10,14,26,.92);backdrop-filter:blur(20px);border-top:1px solid var(--border);padding:4px 0 2px;flex-shrink:0}
.dock-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 2px;border:none;background:transparent;color:var(--muted);cursor:pointer;transition:all .2s;font-size:9px;font-family:var(--sans);font-weight:600;letter-spacing:.04em;-webkit-tap-highlight-color:transparent}
.dock-btn.active{color:var(--accent)}
.dock-btn .dock-icon{font-size:18px;transition:transform .2s}
.dock-btn.active .dock-icon{transform:scale(1.15)}
.dock-pip{width:4px;height:4px;border-radius:50%;background:var(--accent);margin-top:1px;opacity:0;transition:opacity .2s}
.dock-btn.active .dock-pip{opacity:1}
/* TABS */
.tabstrip{display:flex;overflow-x:auto;background:var(--s1);border-bottom:1px solid var(--border);scrollbar-width:none;flex-shrink:0}
.tabstrip::-webkit-scrollbar{display:none}
.tab-item{display:flex;align-items:center;gap:5px;padding:7px 12px;white-space:nowrap;border:none;background:transparent;color:var(--muted);font-family:var(--mono);font-size:11px;cursor:pointer;border-bottom:2px solid transparent;transition:all .15s;flex-shrink:0}
.tab-item.active{color:var(--accent);border-bottom-color:var(--accent);background:rgba(99,179,237,.05)}
/* TERMINAL */
.term-out{flex:1;overflow-y:auto;padding:10px 12px;font-size:12.5px;line-height:1.75;word-break:break-all;white-space:pre-wrap}
.term-input-row{display:flex;align-items:center;gap:6px;padding:7px 10px;background:var(--s1);border-top:1px solid var(--border);flex-shrink:0}
.term-input{flex:1;background:transparent;border:none;outline:none;color:var(--text);font-family:var(--mono);font-size:12.5px;caret-color:var(--accent);user-select:text;-webkit-user-select:text}
.run-btn{padding:6px 12px;border-radius:8px;border:none;background:var(--accent);color:#0a0e1a;font-family:var(--sans);font-weight:700;font-size:11px;cursor:pointer;flex-shrink:0;transition:all .15s}
.run-btn:active{transform:scale(.95)}
/* KBD */
.kbd-strip{display:flex;overflow-x:auto;gap:5px;padding:5px 8px;background:var(--s1);border-top:1px solid var(--border);flex-shrink:0;scrollbar-width:none}
.kbd-strip::-webkit-scrollbar{display:none}
.kbd-k{padding:5px 9px;border-radius:7px;border:1px solid var(--border);background:var(--s2);color:var(--text);font-family:var(--mono);font-size:11px;white-space:nowrap;cursor:pointer;flex-shrink:0;transition:all .12s;-webkit-tap-highlight-color:transparent}
.kbd-k:active{background:var(--s3);transform:scale(.93)}
/* AUTOCOMPLETE */
.autocomplete{position:absolute;bottom:100%;left:0;right:0;background:var(--s2);border:1px solid var(--border2);border-radius:10px 10px 0 0;max-height:160px;overflow-y:auto;z-index:100}
.ac-item{padding:8px 14px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:10px;transition:background .12s}
.ac-item:hover,.ac-item.selected{background:rgba(99,179,237,.1)}
.ac-type{font-size:10px;color:var(--muted);font-family:var(--sans)}
/* GLASS CARD */
.glass{background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:14px;backdrop-filter:blur(12px)}
/* FILE MANAGER */
.fm-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.04);cursor:pointer;transition:background .15s;-webkit-tap-highlight-color:transparent}
.fm-item:active{background:rgba(99,179,237,.07)}
/* EDITOR */
.editor-area{flex:1;background:transparent;border:none;outline:none;color:var(--text);font-family:var(--mono);font-size:13px;line-height:1.8;resize:none;padding:12px;user-select:text;-webkit-user-select:text;white-space:pre;overflow-wrap:normal;overflow-x:auto}
/* PLUGINS */
.plugin-card{border-radius:12px;background:var(--s2);border:1px solid var(--border);padding:14px;transition:all .2s}
.plugin-card:hover{border-color:var(--border2)}
.install-btn{padding:5px 12px;border-radius:8px;border:none;font-family:var(--sans);font-size:11px;font-weight:700;cursor:pointer;transition:all .15s}
/* CRON */
.cron-row{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.04)}
/* THEMES */
.theme-swatch{width:40px;height:40px;border-radius:10px;cursor:pointer;border:2px solid transparent;transition:all .2s;flex-shrink:0}
.theme-swatch.selected{border-color:var(--accent);transform:scale(1.1)}
/* SSH */
.ssh-host{padding:12px 14px;border-radius:10px;background:var(--s2);border:1px solid var(--border);cursor:pointer;transition:all .15s}
.ssh-host:active{background:var(--s3)}
/* NOTIF */
.notif{position:fixed;top:36px;left:50%;transform:translateX(-50%);background:var(--s2);border:1px solid var(--border2);border-radius:10px;padding:8px 16px;font-size:12px;color:var(--accent2);z-index:9999;animation:fadeIn .2s ease;white-space:nowrap;font-family:var(--sans)}
/* OVERLAY */
.overlay{position:fixed;inset:0;z-index:500;background:rgba(4,8,20,.7);backdrop-filter:blur(4px);display:flex;align-items:flex-end}
.sheet{width:100%;background:var(--s1);border-radius:20px 20px 0 0;border-top:1px solid var(--border);max-height:85vh;overflow-y:auto;animation:slideUp .25s ease}
.sheet-handle{width:36px;height:4px;background:var(--muted);border-radius:99px;margin:10px auto 14px}
/* LINE TYPES */
.lo{color:var(--text)}.ls{color:var(--accent2)}.le{color:var(--accent4)}.lw{color:var(--accent3)}.li{color:var(--accent)}.lp{color:#68d391}.la{color:var(--accent5)}.lc{color:var(--text)}.lsys{color:var(--muted);font-style:italic}
/* STATUS BAR */
.statusbar{height:26px;background:var(--s1);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 12px;font-size:10px;color:var(--muted);font-family:var(--sans);flex-shrink:0}
/* PROGRESS BAR */
.pbar{height:3px;background:var(--s3);border-radius:99px;overflow:hidden;margin:6px 0}
.pfill{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--accent),var(--accent5));animation:progress var(--dur,2s) ease forwards}
/* TOGGLE */
.toggle{width:38px;height:20px;border-radius:99px;border:none;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0}
.toggle::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .2s}
.toggle.on{background:var(--accent2)}
.toggle.on::after{transform:translateX(18px)}
.toggle.off{background:var(--muted)}
/* INPUT FIELD */
.field{background:var(--s2);border:1px solid var(--border);border-radius:9px;padding:9px 12px;color:var(--text);font-family:var(--mono);font-size:12px;width:100%;outline:none;transition:border-color .2s;user-select:text;-webkit-user-select:text}
.field:focus{border-color:var(--accent)}
.field::placeholder{color:var(--muted)}
select.field option{background:var(--s2)}
/* SECTION TITLE */
.sec{font-family:var(--sans);font-size:10px;font-weight:700;color:var(--muted);letter-spacing:.08em;margin:14px 0 8px;padding:0 14px;text-transform:uppercase}
/* BTN */
.btn{padding:10px 18px;border-radius:10px;border:none;font-family:var(--sans);font-weight:700;font-size:13px;cursor:pointer;transition:all .15s}
.btn-accent{background:var(--accent);color:#0a0e1a}
.btn-green{background:var(--accent2);color:#0a0e1a}
.btn-danger{background:var(--accent4);color:#0a0e1a}
.btn-ghost{background:var(--s3);color:var(--text)}
.btn:active{transform:scale(.96)}
/* BROWSER */
.browser-bar{display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--s1);border-bottom:1px solid var(--border);flex-shrink:0}
.browser-input{flex:1;background:var(--s2);border:1px solid var(--border);border-radius:20px;padding:7px 14px;color:var(--text);font-family:var(--sans);font-size:12px;outline:none;user-select:text;-webkit-user-select:text}
iframe{border:none;flex:1;background:#fff}
`;

/* ════════════════════════════════════ DATA ══ */
const THEMES = [
  {id:"default", name:"Nord Night",   bg:"#0a0e1a", accent:"#63b3ed", accent2:"#68d391"},
  {id:"dracula", name:"Dracula",      bg:"#1e1e2e", accent:"#bd93f9", accent2:"#50fa7b"},
  {id:"gruvbox", name:"Gruvbox",      bg:"#1d2021", accent:"#fabd2f", accent2:"#b8bb26"},
  {id:"monokai", name:"Monokai",      bg:"#272822", accent:"#f92672", accent2:"#a6e22e"},
  {id:"solarized",name:"Solarized",   bg:"#002b36", accent:"#268bd2", accent2:"#2aa198"},
  {id:"tokyo",   name:"Tokyo Night",  bg:"#1a1b2e", accent:"#7aa2f7", accent2:"#9ece6a"},
  {id:"catppuccin",name:"Catppuccin", bg:"#1e1e2e", accent:"#cba6f7", accent2:"#a6e3a1"},
  {id:"ayu",     name:"Ayu Dark",     bg:"#0a0e14", accent:"#e6b450", accent2:"#7fd962"},
];

const PLUGINS = [
  {id:"autopair",  name:"Auto Pair",       desc:"Auto-close brackets & quotes",     icon:"🔗", installed:true,  version:"1.2.0"},
  {id:"gitgraph",  name:"Git Graph",       desc:"Visual git branch tree",           icon:"🌿", installed:false, version:"2.0.1"},
  {id:"snippets",  name:"Code Snippets",   desc:"80+ language snippets library",    icon:"📋", installed:true,  version:"3.1.2"},
  {id:"linter",    name:"Shell Linter",    desc:"Real-time bash/sh linting",        icon:"✅", installed:false, version:"1.0.5"},
  {id:"sftp",      name:"SFTP Manager",    desc:"Visual SFTP file transfers",       icon:"📡", installed:false, version:"1.3.0"},
  {id:"docker-ui", name:"Docker UI",       desc:"Visual container management",      icon:"🐳", installed:false, version:"2.2.0"},
  {id:"ai-chat",   name:"AI Chat",         desc:"Inline AI assistant in terminal",  icon:"🤖", installed:true,  version:"4.0.0"},
  {id:"colorizer", name:"Colorizer",       desc:"Syntax coloring for output",       icon:"🎨", installed:true,  version:"1.1.0"},
];

const SSH_HOSTS = [
  {id:"h1", name:"Production",  host:"prod.myserver.com",  user:"deploy", port:22,   status:"online"},
  {id:"h2", name:"Staging",     host:"staging.example.io", user:"admin",  port:2222, status:"online"},
  {id:"h3", name:"Raspberry Pi",host:"192.168.1.42",       user:"pi",     port:22,   status:"offline"},
];

const CRON_JOBS = [
  {id:"c1", schedule:"0 2 * * *",    cmd:"./backup.sh",        name:"Daily Backup",    enabled:true},
  {id:"c2", schedule:"*/5 * * * *",  cmd:"./healthcheck.sh",   name:"Health Check",    enabled:true},
  {id:"c3", schedule:"0 0 * * 0",    cmd:"./weekly-report.sh", name:"Weekly Report",   enabled:false},
  {id:"c4", schedule:"30 8 * * 1-5", cmd:"git pull origin main",name:"Auto Git Pull",  enabled:true},
];

const FILE_TREE = {
  "/home/neo": {
    type:"dir", children:{
      "projects":{ type:"dir", children:{
        "my-app":{ type:"dir", children:{
          "src":{ type:"dir", children:{
            "index.js":{type:"file",size:"4.2KB",content:'const express = require("express");\nconst app = express();\n\napp.get("/", (req,res) => res.send("Hello World!"));\n\napp.listen(3000, () => console.log("Server running on :3000"));'},
            "App.jsx":{type:"file",size:"2.1KB",content:'import React from "react";\n\nexport default function App() {\n  return (\n    <div className="app">\n      <h1>Hello NeoTerm!</h1>\n    </div>\n  );\n}'},
          }},
          "package.json":{type:"file",size:"512B",content:'{\n  "name": "my-app",\n  "version": "1.0.0",\n  "scripts": {\n    "start": "node src/index.js",\n    "dev": "nodemon src/index.js"\n  },\n  "dependencies": {\n    "express": "^4.18.2"\n  }\n}'},
          "Dockerfile":{type:"file",size:"340B",content:'FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nEXPOSE 3000\nCMD ["node","src/index.js"]'},
        }},
        "api-server":{ type:"dir", children:{
          "main.py":{type:"file",size:"1.8KB",content:'from flask import Flask, jsonify\n\napp = Flask(__name__)\n\n@app.route("/")\ndef index():\n    return jsonify({"status":"ok"})\n\nif __name__ == "__main__":\n    app.run(host="0.0.0.0", port=5000, debug=True)'},
        }},
      }},
      "scripts":{ type:"dir", children:{
        "deploy.sh":{type:"file",size:"890B",content:'#!/bin/bash\nset -e\necho "Deploying..."\ngit pull origin main\nnpm install\nnpm run build\npm2 restart app\necho "✅ Deploy complete!"'},
        "backup.sh":{type:"file",size:"620B",content:'#!/bin/bash\nDATE=$(date +%Y%m%d)\ntar -czf backup-$DATE.tar.gz ~/projects/\necho "Backup created: backup-$DATE.tar.gz"'},
        "setup.sh":{type:"file",size:"1.1KB",content:'#!/bin/bash\napt update && apt upgrade -y\napt install -y git node npm python3 pip docker.io\nnpm install -g pm2 nodemon\necho "✅ Setup complete!"'},
      }},
      ".bashrc":{type:"file",size:"256B",content:'# NeoTerm bashrc\nexport PATH=$PATH:/usr/local/bin\nalias ll="ls -la"\nalias gs="git status"\nalias dc="docker-compose"\nexport EDITOR=nano\nexport TERM=xterm-256color\nPS1="\\[\\033[01;32m\\]\\u@neoterm\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\$ "'},
      ".gitconfig":{type:"file",size:"180B",content:'[user]\n  name = Neo Dev\n  email = dev@neoterm.io\n[core]\n  editor = nano\n[alias]\n  st = status\n  lg = log --oneline --graph'},
      "README.md":{type:"file",size:"780B",content:'# NeoTerm Workspace\n\nWelcome to your NeoTerm environment!\n\n## Quick Start\n\n```bash\ncd projects/my-app\nnpm install\nnpm start\n```\n\n## Available Tools\n- Node.js v20.11.1\n- Python 3.11.6\n- Git 2.43.0\n- Docker 25.0.2'},
    }
  }
};

const PACKAGES_DB = {
  git:     {version:"2.43.0",  size:"32MB",  deps:["curl","openssl"],    installed:true},
  nodejs:  {version:"20.11.1", size:"48MB",  deps:["npm"],               installed:true},
  python3: {version:"3.11.6",  size:"28MB",  deps:["pip"],               installed:true},
  docker:  {version:"25.0.2",  size:"120MB", deps:["containerd","runc"], installed:true},
  nginx:   {version:"1.24.0",  size:"3.2MB", deps:[],                    installed:false},
  postgresql:{version:"16.1",  size:"58MB",  deps:[],                    installed:false},
  redis:   {version:"7.2.3",   size:"4.1MB", deps:[],                    installed:false},
  vim:     {version:"9.0",     size:"8.4MB", deps:[],                    installed:false},
  htop:    {version:"3.2.2",   size:"1.1MB", deps:[],                    installed:false},
  tmux:    {version:"3.3a",    size:"2.8MB", deps:[],                    installed:true},
  curl:    {version:"8.4.0",   size:"1.8MB", deps:[],                    installed:true},
  wget:    {version:"1.21.4",  size:"1.2MB", deps:[],                    installed:true},
  zsh:     {version:"5.9",     size:"3.4MB", deps:[],                    installed:false},
  fish:    {version:"3.6.1",   size:"5.2MB", deps:[],                    installed:false},
  golang:  {version:"1.21.6",  size:"68MB",  deps:[],                    installed:false},
  rust:    {version:"1.75.0",  size:"88MB",  deps:[],                    installed:false},
  java:    {version:"21.0.1",  size:"210MB", deps:[],                    installed:false},
  php:     {version:"8.3.1",   size:"22MB",  deps:[],                    installed:false},
  ruby:    {version:"3.3.0",   size:"18MB",  deps:[],                    installed:false},
  sqlite3: {version:"3.44.2",  size:"2.2MB", deps:[],                    installed:false},
  ffmpeg:  {version:"6.1",     size:"44MB",  deps:[],                    installed:false},
  nmap:    {version:"7.94",    size:"6.8MB", deps:[],                    installed:false},
};

const COMPLETIONS = [
  {cmd:"git",     subs:["status","log","pull","push","clone","checkout","branch","commit","diff","stash","merge","rebase","remote","fetch","add","rm","init"]},
  {cmd:"docker",  subs:["ps","build","run","stop","rm","rmi","images","pull","exec","logs","compose","network","volume","inspect","system"]},
  {cmd:"npm",     subs:["install","start","run","test","build","audit","init","list","uninstall","update","publish"]},
  {cmd:"apt",     subs:["install","update","upgrade","remove","purge","search","list","show","autoremove"]},
  {cmd:"pip",     subs:["install","list","freeze","uninstall","show","search","download"]},
  {cmd:"python3", subs:["-c","-m","--version","app.py","main.py","manage.py"]},
  {cmd:"ssh",     subs:["-i","user@host","-p","-L","-R","-N"]},
  {cmd:"systemctl",subs:["start","stop","restart","status","enable","disable","reload","list-units"]},
];

const ALL_CMDS = [
  "ls","cd","pwd","mkdir","rm","cp","mv","cat","echo","touch","grep","find","chmod","chown","chgrp","ln",
  "git","docker","npm","npx","node","python3","pip","pip3","pytest","flask","uvicorn",
  "apt","apt-get","pkg","dpkg","snap","flatpak","brew",
  "ssh","scp","sftp","rsync","curl","wget","ping","netstat","ifconfig","ip","nmap","traceroute","dig","nslookup",
  "ps","top","htop","kill","killall","jobs","bg","fg","nohup","screen","tmux",
  "df","du","free","uptime","uname","whoami","id","hostname","date","cal",
  "tar","zip","unzip","gzip","gunzip","7z","rar","unrar",
  "nano","vim","vi","emacs","less","more","head","tail","wc","sort","uniq","cut","awk","sed",
  "env","export","source","alias","history","crontab","systemctl","service","journalctl",
  "mount","umount","fdisk","mkfs","lsblk","lsusb","lspci",
  "git-lfs","gh","hub","tig","lazygit",
  "node","nodemon","pm2","yarn","pnpm","bun",
  "python","python3","ipython","jupyter","conda","venv","pipenv","poetry",
  "docker","docker-compose","kubectl","helm","terraform","ansible",
  "mysql","psql","redis-cli","mongo","sqlite3",
  "nginx","apache2","certbot","supervisord",
  "help","clear","exit","neofetch","banner","figlet","lolcat","cowsay",
  "ai","pkg","install","switch","theme","plugins","cron","browser","edit",
];

/* ════════════════════════════ COMMAND ENGINE ══ */
let _pkgs = {...PACKAGES_DB};
let _crons = [...CRON_JOBS];
let _plugins = [...PLUGINS];
let _aliases = {ll:"ls -la", gs:"git status", dc:"docker-compose", py:"python3", k:"kubectl"};
let _envVars = {NODE_ENV:"development",HOME:"/home/neo",USER:"neo",SHELL:"/bin/bash",TERM:"xterm-256color",PATH:"/usr/local/bin:/usr/bin:/bin"};

function processCmd(raw, cwd, setCwd, os) {
  const trimmed = raw.trim();
  const parts   = trimmed.split(/\s+/);
  const base    = parts[0]?.toLowerCase();
  const args    = parts.slice(1);
  const isWin   = os === "win";
  if (!trimmed) return [];

  const o  = (t,type="lo")=>({text:t,type});
  const ok = t=>({text:t,type:"ls"});
  const er = t=>({text:t,type:"le"});
  const wa = t=>({text:t,type:"lw"});
  const inf= t=>({text:t,type:"li"});
  const sy = t=>({text:t,type:"lsys"});

  // Alias resolution
  if (_aliases[base]) {
    const resolved = _aliases[base] + " " + args.join(" ");
    return processCmd(resolved, cwd, setCwd, os);
  }

  // CLEAR
  if (base==="clear"||raw==="cls") return [{type:"CLEAR"}];

  // HELP
  if (base==="help") return [
    inf("╔══════════════════════════════════════════════════╗"),
    inf("║          NeoTerm — Beyond Termux                 ║"),
    inf("╠══════════════════════════════════════════════════╣"),
    o("  📦 PKG      pkg install <name>  |  apt install"),
    o("  📁 FILES    ls, cd, pwd, mkdir, rm, cp, mv, cat"),
    o("  🌿 GIT      git status/log/pull/push/clone/..."),
    o("  ⚡ NODE     node, npm, npx, pm2, nodemon"),
    o("  🐍 PYTHON   python3, pip, pytest, flask"),
    o("  🐳 DOCKER   docker ps/build/run/stop/logs/..."),
    o("  🌐 NETWORK  ping, curl, wget, ssh, nmap, netstat"),
    o("  ⚙️  SYSTEM   top, ps, df, free, kill, systemctl"),
    o("  🔧 TOOLS    grep, find, tar, awk, sed, nano"),
    o("  ⏰ CRON     crontab -l | -e | -r"),
    inf("  🤖 AI       ai <any question>"),
    inf("  🌐 BROWSER  browser <url>"),
    inf("  📝 EDITOR   edit <file>"),
    inf("  🎨 THEME    theme list | theme set <name>"),
    inf("  🔌 PLUGINS  plugins list | plugins install <id>"),
    inf("  🔑 SSH      ssh-keygen | ssh-copy-id"),
    inf("╚══════════════════════════════════════════════════╝"),
  ];

  // NEOFETCH
  if (base==="neofetch") return [
    inf("          ████████          neo@neoterm"),
    inf("       ██░░░░░░░░██         ──────────────────────"),
    inf("      ██░░░░░░░░░░██        OS: NeoTerm Linux 3.0"),
    inf("     ██░░░░░░░░░░░░██       Kernel: 6.6.0-neoterm"),
    inf("    ██░░░░░░░░░░░░░░██      Shell: bash 5.2.21"),
    inf("   ██████████████████       Terminal: NeoTerm PWA"),
    o("  ██░░░░░░░░░░░░░░░░░░██     Packages: 247 (pkg)"),
    o(" ██░░░░░░░░░░░░░░░░░░░░██    Node: v20.11.1"),
    o("  ████████████████████       Python: 3.11.6"),
    o(""),
    o("  CPU: Snapdragon 8 Gen 2 (8) @ 3.2GHz"),
    o("  RAM: 5.8 GiB / 12 GiB"),
    o("  Storage: 22.4 GiB / 256 GiB (Android)"),
  ];

  // PWD
  if (base==="pwd") return [o(cwd)];

  // CD
  if (base==="cd") {
    const t=args[0];
    if (!t||t==="~") { setCwd("/home/neo"); return []; }
    if (t==="..") {
      const p=cwd.split("/").filter(Boolean);
      p.pop();
      setCwd("/"+p.join("/")||"/");
      return [];
    }
    const newPath = t.startsWith("/") ? t : cwd+"/"+t;
    setCwd(newPath);
    return [];
  }

  // LS
  if (base==="ls"||base==="dir") {
    const path=args.filter(a=>!a.startsWith("-"))[0]||cwd;
    const showAll=args.includes("-a")||args.includes("-la")||args.includes("-al");
    const long=args.includes("-l")||args.includes("-la")||args.includes("-al");
    const entries=[
      ...(showAll?[sy(".  ..  .bashrc  .gitconfig")]:[]),
      "projects/","scripts/","README.md",".gitconfig",".bashrc",
    ];
    if (long) {
      const lines=[o(`total ${entries.length*4}`)];
      entries.forEach(e=>{
        const isDir=e.endsWith("/");
        const size=Math.floor(Math.random()*8000+500);
        lines.push(o(
          `${isDir?"drwxr-xr-x":"‑rw‑r‑‑r‑‑"}  neo neo ${String(size).padStart(6)} Mar 22 09:00 ${isDir?"\x1b[34m"+e+"\x1b[0m":e}`
        ));
      });
      return lines;
    }
    return [o(entries.join("  "))];
  }

  // MKDIR
  if (base==="mkdir") return args[0]?[ok(`Directory '${args.join(" ")}' created`)]:[er("mkdir: missing operand")];

  // CAT
  if (base==="cat"||base==="type") {
    const file=args[0];
    if (!file) return [er(`${base}: missing operand`)];
    // find in tree
    const content = findFileContent(file, FILE_TREE);
    if (content) return content.split("\n").map(l=>o(l));
    return [er(`cat: ${file}: No such file or directory`)];
  }

  // ECHO
  if (base==="echo") {
    const text=args.join(" ").replace(/\$(\w+)/g,(_,k)=>_envVars[k]||"");
    return [o(text.replace(/^["']|["']$/g,""))];
  }

  // RM
  if (base==="rm"||base==="del") {
    const t=args.filter(a=>!a.startsWith("-"))[0];
    return t?[wa(`removed '${t}'`)]:[er(`${base}: missing operand`)];
  }

  // CP / MV
  if (base==="cp"||base==="copy") return args.length>=2?[ok(`'${args[0]}' → '${args[1]}'`)]:[er("cp: missing destination")];
  if (base==="mv"||base==="move") return args.length>=2?[ok(`'${args[0]}' → '${args[1]}'`)]:[er("mv: missing destination")];

  // TOUCH
  if (base==="touch") return args[0]?[ok(`'${args[0]}' created`)]:[er("touch: missing operand")];

  // CHMOD/CHOWN
  if (base==="chmod") return args.length>=2?[ok(`chmod ${args[0]} applied to '${args[1]}'`)]:[er("chmod: missing operand")];
  if (base==="chown") return args.length>=2?[ok(`chown ${args[0]} applied to '${args[1]}'`)]:[er("chown: missing operand")];

  // GREP
  if (base==="grep") {
    const pat=args[0];
    if (!pat) return [er("grep: missing pattern")];
    return [
      o(`src/index.js:3:  const ${pat} = require('./${pat}');`),
      o(`src/App.js:12:   import { ${pat} } from './utils';`),
      o(`tests/app.test.js:8: describe('${pat}', ...)`),
    ];
  }

  // FIND
  if (base==="find") {
    const name=args[args.indexOf("-name")+1]||"*.js";
    return ["./src/index.js","./src/App.jsx","./src/utils/helpers.js","./tests/app.test.js"].map(f=>o(f));
  }

  // CAT / HEAD / TAIL
  if (base==="head"||base==="tail") {
    const file=args.filter(a=>!a.startsWith("-"))[0];
    if (!file) return [er(`${base}: missing file`)];
    const lines=["line 1: import express","line 2: const app = express()","line 3: app.listen(3000)"];
    return [inf(`==> ${file} <==`),...lines.map(l=>o(l))];
  }

  // WC / SORT / AWK / SED / CUT / UNIQ
  if (["wc","sort","awk","sed","cut","uniq"].includes(base)) {
    return [o(`${base}: processed input → 42 lines, 128 words, 1024 bytes`)];
  }

  // ENV/EXPORT
  if (base==="env"||base==="printenv") return Object.entries(_envVars).map(([k,v])=>o(`${k}=${v}`));
  if (base==="export") {
    if (args[0]) {
      const [k,v]=(args[0]||"").split("=");
      if (k&&v) _envVars[k]=v;
      return [ok(`export: ${args[0]}`)];
    }
    return [er("export: missing argument")];
  }

  // ALIAS
  if (base==="alias") {
    if (!args[0]) return Object.entries(_aliases).map(([k,v])=>o(`alias ${k}='${v}'`));
    const [k,v]=(args[0]||"").split("=");
    if (k&&v) { _aliases[k]=v.replace(/^['"]|['"]$/g,""); return [ok(`alias ${k} set`)]; }
    return [er("alias: invalid format. Use: alias name='command'")];
  }

  // HISTORY
  if (base==="history") return [{type:"HISTORY"}];

  // DATE / TIME / CAL
  if (base==="date") return [o(new Date().toString())];
  if (base==="cal") {
    const d=new Date();
    return [inf(`   March ${d.getFullYear()}`),o("Su Mo Tu We Th Fr Sa"),o(" 1  2  3  4  5  6  7"),o(" 8  9 10 11 12 13 14"),o("15 16 17 18 19 20 21"),o("22 23 24 25 26 27 28"),o("29 30 31")];
  }

  // UNAME / WHOAMI / HOSTNAME / ID
  if (base==="uname") return [o(args.includes("-a")?"Linux neoterm 6.6.0-neoterm #1 SMP Android aarch64 GNU/Linux":"Linux")];
  if (base==="whoami") return [o("neo")];
  if (base==="hostname") return [o("neoterm-android")];
  if (base==="id") return [o("uid=1000(neo) gid=1000(neo) groups=1000(neo),27(sudo),998(docker)")];
  if (base==="uptime") return [o(`up ${Math.floor(Math.random()*24+1)} hours,  load average: 0.${Math.floor(Math.random()*9)}, 0.${Math.floor(Math.random()*9)}, 0.${Math.floor(Math.random()*9)}`)];

  // SYSTEM STATS
  if (base==="df") return [
    inf("Filesystem      Size  Used Avail Use% Mounted on"),
    o("/dev/sda1       256G   22G  234G   9% /"),
    o("tmpfs           6.0G   45M  6.0G   1% /dev/shm"),
    o("/dev/sdb1       100G   48G   52G  48% /home"),
  ];
  if (base==="free") return [
    inf("              total        used        free      shared  buff/cache   available"),
    o("Mem:          12287        5821        2341         412        4125        5801"),
    o("Swap:          4095           0        4095"),
  ];
  if (base==="top"||base==="htop") return [
    inf("  PID  USER     %CPU %MEM    COMMAND"),
    o(`${Math.floor(Math.random()*9999+1000)} neo       1.2  2.1  node server.js`),
    o(`${Math.floor(Math.random()*9999+1000)} neo       0.8  1.4  python3 app.py`),
    o(`${Math.floor(Math.random()*9999+1000)} root      0.3  0.5  nginx: master`),
    o(`${Math.floor(Math.random()*9999+1000)} neo       0.1  0.2  bash`),
    o(`${Math.floor(Math.random()*9999+1000)} neo       0.0  0.1  tmux`),
  ];
  if (base==="ps") return [
    inf("  PID TTY          TIME CMD"),
    o(`${Math.floor(Math.random()*999+100)} pts/0    00:00:02 bash`),
    o(`${Math.floor(Math.random()*999+100)} pts/0    00:00:00 ps`),
  ];
  if (base==="kill") return args[0]?[wa(`Signal sent to PID ${args[0]}`)]:[er("kill: missing PID")];
  if (base==="killall") return args[0]?[wa(`Killed all ${args[0]} processes`)]:[er("killall: missing process name")];

  // LSBLK / DF / DU
  if (base==="lsblk") return [
    inf("NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS"),
    o("sda      8:0    0   256G  0 disk"),
    o("└─sda1   8:1    0   256G  0 part /"),
    o("sr0     11:0    1  1024M  0 rom"),
  ];
  if (base==="du") return [
    o("4.2M    ./src"),o("1.8M    ./node_modules/express"),
    o("890K    ./public"),o("6.9M    ."),
  ];

  // NETWORK
  if (base==="ping") {
    const host=args.filter(a=>!a.startsWith("-"))[0]||"8.8.8.8";
    const count=parseInt(args[args.indexOf("-c")+1])||4;
    const lines=[inf(`PING ${host} 56(84) bytes of data.`)];
    for(let i=0;i<Math.min(count,4);i++) lines.push(o(`64 bytes from ${host}: icmp_seq=${i+1} ttl=54 time=${(Math.random()*30+5).toFixed(3)} ms`));
    lines.push(inf(`--- ${host} ping statistics ---`));
    lines.push(ok(`${Math.min(count,4)} packets transmitted, ${Math.min(count,4)} received, 0% packet loss`));
    return lines;
  }
  if (base==="curl") {
    const url=args.filter(a=>!a.startsWith("-"))[0]||"https://example.com";
    if (args.includes("-I")||args.includes("--head")) return [
      inf("HTTP/2 200"),o(`content-type: text/html`),o(`server: nginx/1.24.0`),
      o(`date: ${new Date().toUTCString()}`),o("content-length: 1234"),
    ];
    if (url.includes("ip")) return [o('{"ip":"203.0.113.42","city":"Mumbai","country":"IN"}')];
    return [o("<!DOCTYPE html>"),o("<html><head><title>Example</title></head>"),o("<body><p>Hello!</p></body></html>")];
  }
  if (base==="wget") {
    const url=args.filter(a=>!a.startsWith("-"))[0]||"file";
    const fname=url.split("/").pop()||"index.html";
    return [inf(`--${new Date().toISOString()}--  ${url}`),o("Resolving... connected."),o("HTTP 200 OK"),ok(`'${fname}' saved`)];
  }
  if (base==="netstat") return [
    inf("Proto  Local Address     State"),
    o("tcp    0.0.0.0:3000      LISTEN"),
    o("tcp    0.0.0.0:5000      LISTEN"),
    o("tcp    127.0.0.1:5432    LISTEN"),
    o("tcp    0.0.0.0:80        LISTEN"),
  ];
  if (base==="ifconfig"||base==="ip") return [
    inf("eth0:  inet 192.168.1.42  netmask 255.255.255.0"),
    o("       inet6 fe80::1  prefixlen 64"),
    o("       ether 00:0c:29:ab:cd:ef"),
    inf("lo:    inet 127.0.0.1  netmask 255.0.0.0"),
  ];
  if (base==="nmap") {
    const host=args.filter(a=>!a.startsWith("-")).pop()||"localhost";
    return [inf(`Nmap scan on ${host}`),ok("22/tcp  open ssh"),ok("80/tcp  open http"),ok("443/tcp open https"),ok("3000/tcp open node"),inf("Scan done in 0.42s")];
  }
  if (base==="dig"||base==="nslookup") {
    const host=args[0]||"google.com";
    return [inf(`; <<>> DiG 9.18 <<>> ${host}`),o("; ANSWER SECTION:"),ok(`${host}. 300 IN A 142.250.194.46`),ok(`${host}. 300 IN AAAA 2607:f8b0:4004::200e`)];
  }
  if (base==="traceroute") return [
    inf(`traceroute to ${args[0]||"google.com"}`),
    o("1  192.168.1.1  1.234ms"),o("2  10.0.0.1  4.567ms"),o("3  142.250.194.46  12.890ms"),
  ];

  // SSH
  if (base==="ssh") {
    if (args[0]==="user@prod.myserver.com"||args[0]==="deploy@prod.myserver.com") {
      return [inf(`Connecting to ${args[0]}...`),ok("Connected! Welcome to prod server."),o("Last login: Sat Mar 22 08:00:00 2026"),sy("Tip: Use SSH panel for saved connections")];
    }
    const t=args.filter(a=>!a.startsWith("-"))[0];
    return t?[inf(`Connecting to ${t}...`),ok(`Connected to ${t}`),sy("Session established")]:[er("ssh: missing host")];
  }
  if (base==="ssh-keygen") return [
    inf("Generating public/private ed25519 key pair."),
    o("Enter file: /home/neo/.ssh/id_ed25519"),
    ok("Your public key: /home/neo/.ssh/id_ed25519.pub"),
    ok("SHA256:xK8jN2mP4qR6sT8vWx... neo@neoterm"),
  ];
  if (base==="ssh-copy-id") return args[0]?[inf(`Copying key to ${args[0]}...`),ok("Key installed! You can now login without password")]:[er("ssh-copy-id: missing host")];
  if (base==="scp") return args.length>=2?[inf("Transferring..."),ok(`Transferred: ${args[0]} → ${args[1]} (100%  4.2 MB/s)`)]:[er("scp: missing source/destination")];
  if (base==="rsync") return [inf("Syncing..."),o("sending incremental file list"),ok("sent 2.4MB  received 32B  1.2MB/s"),ok("total size 8.4MB  speedup 3.5")];

  // GIT
  if (base==="git") {
    const sub=args[0];
    if (!sub) return [er("git: missing subcommand. Try 'git help'")];
    if (sub==="status") return [inf("On branch main"),inf("Your branch is up to date with 'origin/main'."),o(""),wa("  modified:   src/index.js"),wa("  modified:   src/App.jsx"),o(""),o('no changes added to commit')];
    if (sub==="log") return [o("* \x1b[33ma1b2c3d\x1b[0m (HEAD → main) feat: add dark mode"),o("* \x1b[33me4f5g6h\x1b[0m fix: mobile layout"),o("* \x1b[33mi7j8k9l\x1b[0m chore: update deps"),o("* \x1b[33mm1n2o3p\x1b[0m feat: auth system"),o("* \x1b[33mq4r5s6t\x1b[0m init: initial commit")];
    if (sub==="pull") return [inf("From github.com:user/repo"),ok("Already up to date.")];
    if (sub==="push") return [inf("Enumerating objects: 5"),o("Compressing 100%"),ok("To github.com:user/repo"),ok("   a1b2c3d..e4f5g6h  main → main")];
    if (sub==="add") return [ok(`Staged: ${args.slice(1).join(" ")||"(all)"}`)];
    if (sub==="commit") { const m=raw.match(/‑m\s+["']?([^"']+)["']?/)?.[1]||args.slice(2).join(" ")||"update"; return [ok(`[main a1b2c3d] ${m}`),o(" 2 files changed, 15 insertions(+)")]; }
    if (sub==="clone") { const r=args[1]||"repo"; return [inf(`Cloning into '${r.split("/").pop()?.replace(".git","")}'...`),o("remote: Counting objects: 120"),ok("Receiving: 100% (120/120)  1.2MB")]; }
    if (sub==="branch") return [ok("* main"),o("  develop"),o("  feature/auth"),o("  feature/dark-mode")];
    if (sub==="checkout") { const b=args.filter(a=>!a.startsWith("-"))[0]; return args.includes("-b")?[ok(`Switched to new branch '${b}'`)]:[ok(`Switched to branch '${b||"main"}'`)]; }
    if (sub==="diff") return [o("diff --git a/src/App.jsx b/src/App.jsx"),o("@@ -10,6 +10,7 @@"),ok("+  const [theme, setTheme] = useState('dark');"),wa("-  return <App/>"),ok("+  return <App theme={theme}/>")];
    if (sub==="stash") return [ok("Saved working directory state: WIP on main")];
    if (sub==="init") return [ok(`Initialized empty Git repository in ${cwd}/.git/`)];
    if (sub==="remote") return [o("origin  git@github.com:neo/my-app.git (fetch)"),o("origin  git@github.com:neo/my-app.git (push)")];
    if (sub==="fetch") return [ok("Fetched from origin"),o("* branch main → FETCH_HEAD")];
    if (sub==="merge") return args[1]?[ok(`Merge branch '${args[1]}' into main`),ok("Already up to date.")]:[er("git merge: missing branch")];
    if (sub==="rebase") return args[1]?[ok(`Rebasing on ${args[1]}`),ok("Successfully rebased")]:[er("git rebase: missing branch")];
    if (sub==="tag") return args[1]?[ok(`Tag '${args[1]}' created`)]:[o("v1.0.0"),o("v1.1.0"),o("v2.0.0")];
    return [er(`git: '${sub}' is not a git command`)];
  }

  // NODE/NPM/NPX
  if (base==="node") {
    if (args[0]==="--version"||args[0]==="-v") return [o("v20.11.1")];
    if (!args[0]) return [inf("Welcome to Node.js v20.11.1."),inf('Type ".help" for more information.'),o("> ")];
    return [inf(`Running ${args[0]}...`),ok("Script completed — exit code 0")];
  }
  if (base==="npm") {
    const sub=args[0];
    if (!sub) return [er("npm: missing command")];
    if (sub==="--version"||sub==="-v") return [o("10.2.4")];
    if (sub==="install"||sub==="i") {
      const pkg=args[1];
      return pkg?[inf(`+ ${pkg}`),o("added 1 package in 1.2s"),ok(`✓ ${pkg} installed`)]:[{type:"INSTALL_ANIM",pkg:"dependencies"}];
    }
    if (sub==="start")   return [inf("starting..."),ok("Server running on http://localhost:3000")];
    if (sub==="run")     return [inf(`> ${args[1]||"script"}`),ok("Script completed")];
    if (sub==="test")    return [inf("Running tests..."),ok("✓ 24 tests passed in 2.3s")];
    if (sub==="build")   return [inf("Building..."),ok("Build complete → dist/ (2.4MB)")];
    if (sub==="audit")   return [ok("found 0 vulnerabilities")];
    if (sub==="init")    return [ok("package.json created ✓")];
    if (sub==="list"||sub==="ls") return [o("my-app@1.0.0"),o("├── express@4.18.2"),o("├── react@18.2.0"),o("└── typescript@5.3.3")];
    if (sub==="update")  return [ok("Updated 3 packages")];
    return [er(`npm: unknown command '${sub}'`)];
  }
  if (base==="npx")     return args[0]?[inf(`Executing ${args[0]}...`),ok(`✓ ${args[0]} done`)]:[er("npx: missing command")];
  if (base==="nodemon") return args[0]?[ok(`nodemon watching: ${args[0]}`),inf("restarting due to changes..."),ok("Server running")]:[ok("nodemon: watching .")];
  if (base==="pm2")     {
    const sub=args[0];
    if (sub==="list"||sub==="ls") return [inf("┌─id─┬──name────┬─status──┬─cpu─┬─mem─┐"),o("│ 0  │ my-app   │ online  │ 0%  │ 45MB│"),o("│ 1  │ api-serv │ online  │ 1%  │ 62MB│"),inf("└────┴──────────┴─────────┴─────┴─────┘")];
    if (sub==="start")   return args[1]?[ok(`PM2: ${args[1]} started`)]:[er("pm2 start: missing file")];
    if (sub==="restart") return args[1]?[ok(`PM2: ${args[1]} restarted`)]:[ok("PM2: all restarted")];
    if (sub==="stop")    return args[1]?[ok(`PM2: ${args[1]} stopped`)]:[ok("PM2: all stopped")];
    if (sub==="logs")    return [o("[0] my-app  | GET / 200 12ms"),o("[1] api-srv | POST /api 201 45ms")];
    if (sub==="save")    return [ok("PM2 config saved to ~/.pm2/dump.pm2")];
    if (sub==="startup") return [ok("PM2 startup configured")];
    return [er(`pm2: unknown command '${sub}'`)];
  }
  if (base==="bun") return args[0]==="--version"?[o("1.0.25")]:[inf(`bun ${args.join(" ")} ...`),ok("Done!")];
  if (base==="pnpm"||base==="yarn") return [inf(`${base} ${args.join(" ")}...`),ok("Done!")];

  // PYTHON
  if (base==="python3"||base==="python"||base==="py") {
    if (!args.length) return [inf("Python 3.11.6"),inf('Type "help()" for help.'),o(">>> ")];
    if (args[0]==="--version"||args[0]==="-V") return [o("Python 3.11.6")];
    if (args[0]==="-m"&&args[1]==="venv") return [ok(`Virtual environment '${args[2]||"venv"}' created`)];
    if (args[0]==="-m"&&args[1]==="http.server") return [ok(`Serving HTTP on 0.0.0.0 port ${args[2]||8000}`)];
    if (args[0]==="-c") return [o((args.slice(1).join(" ").replace(/print\(["']?|["']?\)/g,"")))];
    return [inf(`Running ${args[0]}...`),ok("Script completed — exit code 0")];
  }
  if (base==="pip"||base==="pip3") {
    const sub=args[0];
    if (sub==="install") {
      const pkg=args.slice(1).filter(a=>!a.startsWith("-")).join(", ");
      return pkg?[inf(`Collecting ${pkg}`),o(`Downloading ${pkg}...`),ok(`Successfully installed ${pkg}`)]:[{type:"INSTALL_ANIM",pkg:"requirements.txt"}];
    }
    if (sub==="list") return [inf("Package       Version"),o("──────────── ───────"),o("flask         3.0.0"),o("requests      2.31.0"),o("numpy         1.26.3"),o("pandas        2.1.4"),o("scikit-learn  1.4.0"),o("fastapi       0.109.0")];
    if (sub==="freeze") return [o("flask==3.0.0"),o("requests==2.31.0"),o("numpy==1.26.3"),o("pandas==2.1.4")];
    if (sub==="uninstall") return args[1]?[ok(`Uninstalled ${args[1]}`)]:[er("pip: missing package")];
    if (sub==="show") return args[1]?[inf(`Name: ${args[1]}`),o("Version: 1.0.0"),o("Location: /usr/local/lib/python3.11/site-packages")]:[er("pip show: missing package")];
    return [er(`pip: unknown command '${sub}'`)];
  }
  if (base==="pytest") return [inf("========================= test session starts ========================="),ok("collected 18 items"),o(""),ok("tests/test_app.py ............"),ok("tests/test_utils.py ......"),o(""),ok("========================= 18 passed in 1.42s =========================")];
  if (base==="flask") return [inf("* Serving Flask app 'app'"),inf("* Debug mode: on"),ok("* Running on http://0.0.0.0:5000"),ok("* Running on http://127.0.0.1:5000")];
  if (base==="uvicorn") return [inf(`Starting uvicorn on ${args[0]||"main:app"}`),ok("Application startup complete."),ok("Uvicorn running on http://127.0.0.1:8000")];
  if (base==="jupyter") return [ok("Jupyter Notebook started"),inf("http://localhost:8888/?token=abc123"),sy("Open URL in built-in browser")];

  // DOCKER
  if (base==="docker") {
    const sub=args[0];
    if (!sub) return [er("docker: missing command")];
    if (sub==="--version") return [o("Docker version 25.0.2, build 29cf629")];
    if (sub==="ps") return [
      inf("CONTAINER ID   IMAGE           STATUS         PORTS          NAMES"),
      ok("a1b2c3d4e5f6   myapp:latest    Up 2 hours     0.0.0.0:3000   myapp"),
      ok("f6e5d4c3b2a1   postgres:16     Up 3 days      5432/tcp       postgres"),
      ok("b1c2d3e4f5a6   nginx:latest    Up 5 days      80,443/tcp     nginx"),
    ];
    if (sub==="images") return [inf("REPOSITORY   TAG       SIZE     CREATED"),o("myapp        latest    342MB    2h ago"),o("postgres     16        425MB    3wk ago"),o("nginx        latest    187MB    4wk ago"),o("node         20-alpine 134MB    6wk ago")];
    if (sub==="build") { const t=args[args.indexOf("-t")+1]||"myapp:latest"; return [inf(`Building ${t}`),o("Step 1/8: FROM node:20-alpine"),o("Step 2/8: WORKDIR /app"),o("Step 3/8: COPY package*.json ./"),o("Step 4/8: RUN npm ci"),o("Step 5/8: COPY . ."),o("Step 6/8: EXPOSE 3000"),ok(`Successfully built & tagged ${t}`)]; }
    if (sub==="run") return [ok(`Container started: ${Math.random().toString(36).slice(2,14)}`)];
    if (sub==="stop") return [ok(`Stopped: ${args[1]||"all containers"}`)];
    if (sub==="rm") return [ok(`Removed: ${args[1]||"(container)"}`)];
    if (sub==="rmi") return [ok(`Removed image: ${args[1]||"(image)"}`)];
    if (sub==="logs") return [o("[2026-03-22] Server started"),o("[2026-03-22] DB connected"),o("[2026-03-22] GET / 200 12ms"),o("[2026-03-22] POST /api 201 45ms")];
    if (sub==="exec") return args.length>=2?[ok(`Executing in ${args[1]}...`),o("Command output here")]:[er("docker exec: missing container")];
    if (sub==="pull") { const img=args[1]||"image"; return [inf(`Pulling from docker.io/${img}`),o("Digest: sha256:abc..."),ok(`Status: Downloaded newer image for ${img}`)]; }
    if (sub==="inspect") return [o('[\n  {\n    "Id": "a1b2c3d4...",\n    "State": { "Status": "running" },\n    "NetworkSettings": { "IPAddress": "172.17.0.2" }\n  }\n]')];
    if (sub==="system"&&args[1]==="prune") return [wa("Removing stopped containers, unused networks, dangling images..."),ok("Reclaimed: 1.24GB")];
    if (sub==="compose"||sub==="‑‑compose") {
      const s=args[1];
      if (s==="up")   return [inf("Starting services..."),ok("✓ db started"),ok("✓ api started"),ok("✓ nginx started")];
      if (s==="down") return [ok("Containers stopped and removed")];
      if (s==="logs") return [o("api  | Server :3000"),o("db   | database ready")];
      if (s==="build") return [inf("Building images..."),ok("All images built")];
    }
    if (sub==="network") return [inf("NETWORK ID     NAME      DRIVER    SCOPE"),o("a1b2c3d4       bridge    bridge    local"),o("e4f5g6h7       host      host      local"),o("f8g9h0i1       myapp_net bridge    local")];
    if (sub==="volume") return [inf("DRIVER    VOLUME NAME"),o("local     myapp_postgres_data"),o("local     myapp_uploads")];
    return [er(`docker: unknown command '${sub}'`)];
  }

  // KUBECTL
  if (base==="kubectl"||base==="k") {
    const sub=args[0];
    if (!sub) return [er("kubectl: missing command")];
    if (sub==="get") return [inf("NAME                READY   STATUS    RESTARTS   AGE"),ok("myapp-7d4f9b-xk2p  1/1     Running   0          2h"),ok("postgres-5c6d8e-mn3  1/1     Running   0          3d")];
    if (sub==="apply") return [ok(`deployment.apps/${args[2]||"myapp"} configured`)];
    if (sub==="delete") return [ok(`${args[1]||"resource"} "${args[2]||"name"}" deleted`)];
    if (sub==="logs") return [o("Server started"), o("DB connected"), o("GET / 200")];
    return [inf(`kubectl ${sub}: executed`)];
  }

  // APT/PKG
  if (base==="apt"||base==="apt-get"||base==="pkg") {
    const sub=args[0];
    if (sub==="update") return [inf("Hit:1 http://archive.ubuntu.com jammy InRelease"),inf("Get:2 http://security.ubuntu.com jammy-security"),ok("Reading package lists... Done"),ok("Building dependency tree... Done")];
    if (sub==="upgrade") return [inf("Calculating upgrade..."),ok("0 to upgrade, 0 newly installed, 0 to remove")];
    if (sub==="install") {
      const pkgName=args.slice(1).filter(a=>!a.startsWith("-")).join(" ");
      if (!pkgName) return [er("apt: missing package name")];
      const p=_pkgs[pkgName];
      if (!p) return [wa(`E: Unable to locate package ${pkgName}`),sy(`Tip: try 'apt update' first or check spelling`)];
      if (p.installed) return [wa(`${pkgName} is already the newest version (${p.version}).`)];
      _pkgs[pkgName]={..._pkgs[pkgName],installed:true};
      return [{type:"PKG_INSTALL",pkg:pkgName,version:p.version,size:p.size}];
    }
    if (sub==="remove"||sub==="purge") return args[1]?[ok(`${args[1]} removed`),ok("Removing unused packages...")]:[er("apt: missing package")];
    if (sub==="search") return args[1]?Object.keys(_pkgs).filter(k=>k.includes(args[1])).map(k=>`${k} - ${_pkgs[k].version}`).map(o):[er("apt-cache search: missing keyword")];
    if (sub==="list"||sub==="show") return Object.entries(_pkgs).map(([k,v])=>o(`${k.padEnd(14)} ${v.version.padEnd(10)} ${v.installed?"[installed]":""}`.trim()));
    if (sub==="autoremove") return [ok("Removing 3 packages (auto-removed)"),ok("0 upgraded, 0 newly installed, 3 to remove")];
    return [er(`apt: unknown command '${sub}'`)];
  }

  // SNAP/FLATPAK
  if (base==="snap") { const sub=args[0]; return sub==="install"&&args[1]?[inf(`Installing snap: ${args[1]}`),ok(`${args[1]} installed`)]:[er("snap: try 'snap install <package>'")]; }
  if (base==="flatpak") { const sub=args[0]; return sub==="install"&&args[1]?[inf(`Installing flatpak: ${args[1]}`),ok(`${args[1]} installed`)]:[er("flatpak: try 'flatpak install <package>'")]; }

  // SYSTEMCTL
  if (base==="systemctl") {
    const sub=args[0],svc=args[1];
    if (sub==="status") return [ok(`● ${svc||"nginx"}.service — active (running)`),o("   Loaded: loaded"),ok("   Active: active (running) since Sat 2026-03-22 09:00:01 UTC")];
    if (["start","stop","restart","enable","disable","reload"].includes(sub)) return svc?[ok(`${sub}: ${svc} ${sub==="stop"?"stopped":sub+"ed"}`)]:[er(`systemctl ${sub}: missing service`)];
    if (sub==="list-units") return [inf("UNIT           LOAD   ACTIVE  DESCRIPTION"),o("nginx.service  loaded active  Web Server"),o("ssh.service    loaded active  SSH Server"),o("docker.service loaded active  Docker")];
    return [inf(`systemctl ${args.join(" ")}: executed`)];
  }
  if (base==="service") return args.length>=2?[ok(`${args[1]} ${args[0]} executed`)]:[er("service: missing arguments")];
  if (base==="journalctl") return [inf(`-- Logs for ${args.includes("-u")&&args[args.indexOf("-u")+1]||"system"} --`),o("Mar 22 09:00:01 neoterm nginx[123]: started"),o("Mar 22 09:01:00 neoterm sshd[456]: Accepted key"),o("Mar 22 09:05:00 neoterm cron[789]: job started")];

  // CRONTAB
  if (base==="crontab") {
    if (args.includes("-l")) return [..._crons.map(c=>o(`${c.schedule}  ${c.cmd}  # ${c.name}`)),sy("Use cron panel (⏰ tab) for visual editor")];
    if (args.includes("-r")) return [wa("All cron jobs removed")];
    if (args.includes("-e")) return [sy("Use the Cron tab for visual cron job management")];
    return [er("crontab: try -l (list) | -e (edit) | -r (remove)")];
  }

  // TAR/ZIP
  if (base==="tar") {
    if (args.some(a=>a.includes("c"))) { const out=args.filter(a=>!a.startsWith("-"))[0]; return [ok(`Archive created: ${out||"archive.tar.gz"}`)]; }
    if (args.some(a=>a.includes("x"))) { const f=args.filter(a=>!a.startsWith("-"))[0]; return [inf(`Extracting ${f||"archive"}...`),ok("Extraction complete")]; }
    return [er("tar: try -czf (create) | -xzf (extract)")];
  }
  if (base==="zip") return args[0]?[inf("Zipping..."),ok(`${args[0]} created`)]:[er("zip: missing filename")];
  if (base==="unzip") return args[0]?[inf(`Extracting ${args[0]}...`),ok("Archive extracted")]:[er("unzip: missing filename")];
  if (base==="gzip") return args[0]?[ok(`${args[0]}.gz created`)]:[er("gzip: missing file")];

  // NANO/VIM/EDITOR
  if (base==="nano"||base==="vim"||base==="vi"||base==="emacs") {
    const file=args[0];
    return file?[{type:"OPEN_EDITOR",file}]:[er(`${base}: missing filename`)];
  }

  // LESS/MORE
  if (base==="less"||base==="more") {
    const file=args[0];
    if (!file) return [er(`${base}: missing file`)];
    return [inf(`-- ${file} --`),o("Contents would appear here."),sy("Press q to quit (simulated)")];
  }

  // NANO/EDIT COMMAND
  if (base==="edit") return args[0]?[{type:"OPEN_EDITOR",file:args[0]}]:[er("edit: missing filename")];

  // BROWSER
  if (base==="browser"||base==="open"||base==="xdg-open") {
    const url=args[0];
    return url?[{type:"OPEN_BROWSER",url:url.startsWith("http")?url:"https://"+url}]:[er("browser: missing URL")];
  }

  // THEME
  if (base==="theme") {
    if (args[0]==="list") return THEMES.map(t=>o(`  ${t.id.padEnd(12)} ${t.name}`));
    if (args[0]==="set"&&args[1]) return [{type:"SET_THEME",theme:args[1]}];
    return [inf("theme list | theme set <name>"),...THEMES.map(t=>o(`  ${t.id}`))];
  }

  // PLUGINS
  if (base==="plugins") {
    if (args[0]==="list") return _plugins.map(p=>o(`  ${p.id.padEnd(12)} ${p.version.padEnd(8)} ${p.installed?"✓ installed":"  available"} — ${p.name}`));
    if (args[0]==="install"&&args[1]) {
      const p=_plugins.find(x=>x.id===args[1]);
      if (!p) return [er(`plugins: '${args[1]}' not found`)];
      if (p.installed) return [wa(`${args[1]} already installed`)];
      _plugins=_plugins.map(x=>x.id===args[1]?{...x,installed:true}:x);
      return [inf(`Installing ${args[1]}...`),ok(`✓ Plugin '${p.name}' installed`)];
    }
    if (args[0]==="remove"&&args[1]) {
      _plugins=_plugins.map(x=>x.id===args[1]?{...x,installed:false}:x);
      return [ok(`Plugin '${args[1]}' removed`)];
    }
    return [inf("plugins list | install <id> | remove <id>")];
  }

  // WHICH/WHERE
  if (base==="which"||base==="where") {
    const paths={node:"/usr/local/bin/node",npm:"/usr/local/bin/npm",python3:"/usr/bin/python3",git:"/usr/bin/git",docker:"/usr/bin/docker",curl:"/usr/bin/curl"};
    return args[0]?[o(paths[args[0]]||`${base}: ${args[0]}: not found`)]:[er(`${base}: missing argument`)];
  }

  // LOLCAT / FIGLET / COWSAY / BANNER
  if (base==="lolcat") return [ok("🌈 "+args.join(" ")+" 🌈")];
  if (base==="figlet"||base==="banner") {
    const t=(args[0]||"NeoTerm").toUpperCase();
    return [inf(` _   _ _____ ___  _____ _____ ____  __  __`),inf(`| \\ | | ____/ _ \\|_   _| ____|  _ \\|  \\/  |`),inf(`|  \\| |  _|| | | | | | |  _| | |_) | |\\/| |`),inf(`| |\\  | |__| |_| | | | | |___| _ <| |  | |`),inf(`|_| \\_|_____\\___/  |_| |_____|_| \\_|_|  |_|`)];
  }
  if (base==="cowsay") return [o(" "+("-".repeat(args.length+2))),o(`< ${args.join(" ")} >`),o(" "+("-".repeat(args.length+2))),o("        \\   ^__^"),o("         \\  (oo)\\_______"),o("            (__)\\       )\\/\\"),o("                ||----w |"),o("                ||     ||")];

  // SCREEN/TMUX
  if (base==="screen"||base==="tmux") return [ok(`${base}: new session created`),sy("Use tabs for multiple sessions (NeoTerm native)")];

  // MYSQL/PSQL/REDIS/SQLITE
  if (base==="mysql"||base==="psql"||base==="redis-cli"||base==="mongo"||base==="sqlite3") {
    const dbs={mysql:"MySQL 8.0","psql":"PostgreSQL 16","redis-cli":"Redis 7.2","mongo":"MongoDB 7.0","sqlite3":"SQLite 3.44"};
    return [inf(`Connected to ${dbs[base]||base}`),o(`${base}> SELECT 1; → 1`),sy("Type \\q or exit to quit")];
  }

  // MAKE / CMAKE
  if (base==="make") return [inf(`make: Building '${args[0]||"all"}'...`),ok("Build complete")];
  if (base==="cmake") return [inf("-- Configuring done"),inf("-- Build files written to: ./build"),ok("CMake completed")];

  // GCC/G++/CLANG
  if (base==="gcc"||base==="g++"||base==="clang") return args[0]?[ok(`Compiled: ${args[0].replace(/\.\w+$/,"")}  (0 errors, 0 warnings)`)]:[er(`${base}: missing input file`)];

  // GO/RUST
  if (base==="go") return [inf("Go 1.21.6"),o("go: command ok")];
  if (base==="cargo"||base==="rustc") return args[0]?[inf(`cargo ${args[0]}...`),ok("Finished release [optimized] target(s)")]:[er("cargo: missing command")];

  // CERTBOT
  if (base==="certbot") return [inf("Saving debug log to /var/log/letsencrypt/"),ok("Certificate obtained!"),ok("Certificate: /etc/letsencrypt/live/domain/fullchain.pem")];

  // EXIT
  if (base==="exit"||base==="quit") return [{type:"EXIT"}];

  return [er(`${isWin?"":"bash: "}${base}: command not found`)];
}

function findFileContent(filename, tree, path="/home/neo") {
  for (const [name, node] of Object.entries(tree)) {
    if (name===filename&&node.type==="file") return node.content||"";
    if (node.type==="dir"&&node.children) {
      const found=findFileContent(filename,node.children,path+"/"+name);
      if (found!==null) return found;
    }
  }
  return null;
}

/* ════════════════════════════ AI CALL ══ */
async function askAI(q) {
  const res = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"claude-sonnet-4-20250514",max_tokens:1000,
      system:`You are NeoTerm's AI assistant — an expert in Linux, Android, shell scripting, Git, Docker, Node.js, Python, networking, and all things terminal/dev.
Answer concisely for a mobile terminal screen (max 50 chars per line).
Use plain text only. No markdown symbols like **, ##, or backtick fences.
Prefix Linux commands with $ and Windows with >.
Be practical and direct.`,
      messages:[{role:"user",content:q}]
    })
  });
  const data=await res.json();
  return data.content?.map(b=>b.text||"").join("")||"No response";
}

/* ════════════════════════════════════ APP ══ */
let tabCounter=1;
const mkTab=(os)=>({
  id:++tabCounter,
  title:os==="win"?"pwsh":"bash",
  lines:[],cwd:"/home/neo",history:[],histIdx:-1
});

export default function App() {
  const [view,setView]       = useState("terminal");
  const [os,setOs]           = useState("linux");
  const [tabs,setTabs]       = useState([{id:1,title:"bash",lines:[],cwd:"/home/neo",history:[],histIdx:-1}]);
  const [activeTab,setActiveTab] = useState(1);
  const [input,setInput]     = useState("");
  const [acSuggs,setAcSuggs] = useState([]);
  const [acIdx,setAcIdx]     = useState(0);
  const [aiLoading,setAiLoading] = useState(false);
  const [notif,setNotif]     = useState("");
  const [theme,setTheme]     = useState(THEMES[0]);
  const [pkgs,setPkgs]       = useState({..._pkgs});
  const [crons,setCrons]     = useState([..._crons]);
  const [plugins,setPlugins] = useState([..._plugins]);
  const [fmPath,setFmPath]   = useState("/home/neo");
  const [editorFile,setEditorFile] = useState(null);
  const [editorContent,setEditorContent] = useState("");
  const [browserUrl,setBrowserUrl] = useState("https://google.com");
  const [sshState,setSshState] = useState({connected:false,host:null});
  const [showQuick,setShowQuick] = useState(false);
  const [time,setTime]       = useState(new Date());
  const [installAnim,setInstallAnim] = useState(null);
  const inputRef  = useRef();
  const outputRef = useRef();

  useEffect(()=>{const t=setInterval(()=>setTime(new Date()),1000);return()=>clearInterval(t);},[]);

  // Boot message
  useEffect(()=>{
    setTimeout(()=>{
      addLines(1,[
        {text:"╔═══════════════════════════════════════════╗",type:"li"},
        {text:"║   NeoTerm v3.0 — Beyond Termux            ║",type:"li"},
        {text:"╠═══════════════════════════════════════════╣",type:"li"},
        {text:"  🐧 Linux + 🪟 Windows — switchable",type:"lo"},
        {text:"  📦 247 packages  |  🤖 AI Assistant",type:"lo"},
        {text:"  📁 File Manager  |  📝 Code Editor",type:"lo"},
        {text:"  🔑 SSH Client    |  ⏰ Cron Scheduler",type:"lo"},
        {text:"  🔌 Plugin System |  🎨 8 Themes",type:"lo"},
        {text:"  🌐 Built-in Browser (bottom nav)",type:"lo"},
        {text:"  Type 'help' | tap ⚡ for quick commands",type:"lsys"},
        {text:"╚═══════════════════════════════════════════╝",type:"li"},
        {text:"",type:"lo"},
      ]);
    },400);
  },[]);

  useEffect(()=>{if(outputRef.current)outputRef.current.scrollTop=outputRef.current.scrollHeight;},[tabs]);

  const showNotif=useCallback((msg,color="var(--accent2)")=>{setNotif(msg);setTimeout(()=>setNotif(""),2200);},[]);

  const addLines=useCallback((tid,newLines)=>{
    setTabs(prev=>prev.map(t=>t.id===tid?{...t,lines:[...t.lines,...newLines]}:t));
  },[]);

  const setCwd=useCallback((tid,p)=>{
    setTabs(prev=>prev.map(t=>t.id===tid?{...t,cwd:p}:t));
  },[]);

  const activeTabData=tabs.find(t=>t.id===activeTab)||tabs[0];
  const prompt=()=>os==="linux"
    ?`neo@neoterm:${activeTabData?.cwd||"/home/neo"}$ `
    :`PS ${activeTabData?.cwd||"C:\\Users\\Neo"}> `;

  // Autocomplete
  const updateAc=(val)=>{
    if(!val.trim()){setAcSuggs([]);return;}
    const parts=val.split(/\s+/);
    const base=parts[0].toLowerCase();
    const hasSpace=val.includes(" ");
    let suggs=[];
    if(!hasSpace){
      suggs=ALL_CMDS.filter(c=>c.startsWith(base)&&c!==base).slice(0,6).map(c=>({cmd:c,type:"cmd"}));
    } else {
      const sub=parts[1]||"";
      const comp=COMPLETIONS.find(c=>c.cmd===base);
      if(comp) suggs=comp.subs.filter(s=>s.startsWith(sub)).slice(0,6).map(s=>({cmd:`${base} ${s}`,type:"sub"}));
      else {
        const files=["src/index.js","package.json","Dockerfile",".env","README.md","deploy.sh"];
        suggs=files.filter(f=>f.startsWith(sub)).slice(0,4).map(f=>({cmd:`${base} ${f}`,type:"file"}));
      }
    }
    setAcSuggs(suggs);setAcIdx(0);
  };

  const runCommand=async(rawCmd)=>{
    const cmd=rawCmd.trim();
    if(!cmd)return;
    const tid=activeTab;
    const cwd=activeTabData?.cwd||"/home/neo";
    addLines(tid,[{text:prompt()+cmd,type:"lp"}]);
    setTabs(prev=>prev.map(t=>t.id===tid?{...t,history:[cmd,...t.history.slice(0,99)],histIdx:-1}:t));
    setAcSuggs([]);

    // AI
    if(cmd.toLowerCase().startsWith("ai ")){
      const q=cmd.slice(3).trim();
      if(!q){addLines(tid,[{text:"ai: missing question",type:"le"}]);return;}
      setAiLoading(true);
      addLines(tid,[{text:"🤖 AI thinking...",type:"la"}]);
      try{
        const ans=await askAI(q);
        setTabs(prev=>prev.map(t=>{
          if(t.id!==tid)return t;
          const filtered=t.lines.filter(l=>l.text!=="🤖 AI thinking...");
          const ansLines=ans.split("\n").map(l=>({text:l,type:"la"}));
          return{...t,lines:[...filtered,{text:"╭─ 🤖 AI Answer ─────────────────────╮",type:"la"},...ansLines,{text:"╰─────────────────────────────────────╯",type:"la"},{text:"",type:"lo"}]};
        }));
      }catch{
        setTabs(prev=>prev.map(t=>{
          if(t.id!==tid)return t;
          const f=t.lines.filter(l=>l.text!=="🤖 AI thinking...");
          return{...t,lines:[...f,{text:"ai: connection error",type:"le"}]};
        }));
      }
      setAiLoading(false);return;
    }

    const results=processCmd(cmd,cwd,p=>setCwd(tid,p),os);
    if(!results||!results.length)return;

    for(const r of results){
      if(r.type==="CLEAR"){setTabs(prev=>prev.map(t=>t.id===tid?{...t,lines:[]}:t));return;}
      if(r.type==="HISTORY"){
        const hist=activeTabData?.history||[];
        setTabs(prev=>prev.map(t=>t.id===tid?{...t,lines:[...t.lines,...hist.slice(0,15).map((h,i)=>({text:`  ${String(i+1).padStart(3)}  ${h}`,type:"lo"}))]}:t));
        return;
      }
      if(r.type==="OPEN_EDITOR"){setEditorFile(r.file);const c=findFileContent(r.file,FILE_TREE["/home/neo"].children)||`# ${r.file}\n`;setEditorContent(c);setView("editor");return;}
      if(r.type==="OPEN_BROWSER"){setBrowserUrl(r.url);setView("browser");return;}
      if(r.type==="SET_THEME"){const t=THEMES.find(th=>th.id===r.theme);if(t){setTheme(t);showNotif(`Theme: ${t.name}`);}else addLines(tid,[{text:`theme: '${r.theme}' not found`,type:"le"}]);return;}
      if(r.type==="EXIT"){addLines(tid,[{text:"Session ended. Tab closed.",type:"lsys"}]);return;}
      if(r.type==="SWITCH_OS"){setOs(r.to);setCwd(tid,r.to==="linux"?"/home/neo":"C:\\Users\\Neo");showNotif(`Switched to ${r.to==="linux"?"🐧 Linux":"🪟 Windows"}`);return;}
      if(r.type==="PKG_INSTALL"){
        addLines(tid,[{text:`Reading package lists...`,type:"li"},{text:`Preparing to unpack ${r.pkg}...`,type:"lo"},{text:`Unpacking ${r.pkg} (${r.version})...`,type:"lo"}]);
        setInstallAnim({pkg:r.pkg,dur:"2s"});
        setTimeout(()=>{
          addLines(tid,[{text:`Setting up ${r.pkg} (${r.version})...`,type:"lo"},{text:`✓ ${r.pkg} installed successfully`,type:"ls"},{text:"",type:"lo"}]);
          setPkgs(p=>({...p,[r.pkg]:{...p[r.pkg],installed:true}}));
          setInstallAnim(null);
        },2200);
        return;
      }
      if(r.type==="INSTALL_ANIM"){
        addLines(tid,[{text:`Installing ${r.pkg}...`,type:"li"}]);
        setInstallAnim({pkg:r.pkg,dur:"2s"});
        setTimeout(()=>{addLines(tid,[{text:`✓ Done`,type:"ls"},{text:"",type:"lo"}]);setInstallAnim(null);},2200);
        return;
      }
    }
    addLines(tid,[...results.filter(r=>r.text!==undefined),{text:"",type:"lo"}]);
  };

  const handleKey=useCallback((e)=>{
    if(e.key==="Enter"){if(acSuggs.length&&input!==acSuggs[acIdx]?.cmd){setInput(acSuggs[acIdx]?.cmd||input);setAcSuggs([]);return;}runCommand(input);setInput("");}
    else if(e.key==="ArrowUp"){e.preventDefault();const h=activeTabData?.history||[];const ni=Math.min((activeTabData?.histIdx??-1)+1,h.length-1);setTabs(p=>p.map(t=>t.id===activeTab?{...t,histIdx:ni}:t));setInput(h[ni]||"");setAcSuggs([]);}
    else if(e.key==="ArrowDown"){e.preventDefault();const h=activeTabData?.history||[];const ni=Math.max((activeTabData?.histIdx??-1)-1,-1);setTabs(p=>p.map(t=>t.id===activeTab?{...t,histIdx:ni}:t));setInput(ni===-1?"":(h[ni]||""));setAcSuggs([]);}
    else if(e.key==="Tab"){e.preventDefault();if(acSuggs.length){setInput(acSuggs[acIdx]?.cmd||input);setAcSuggs([]);}else{const cmds=ALL_CMDS.filter(c=>c.startsWith(input));if(cmds.length===1)setInput(cmds[0]+" ");}}
    else if(e.key==="Escape"){setAcSuggs([]);}
    else if(e.key==="ArrowRight"&&acSuggs.length){e.preventDefault();setAcIdx(i=>(i+1)%acSuggs.length);}
  },[acSuggs,acIdx,input,activeTabData,activeTab]);

  const addTab=()=>{const t=mkTab(os);setTabs(prev=>[...prev,t]);setActiveTab(t.id);setTimeout(()=>inputRef.current?.focus(),100);};
  const closeTab=(id)=>{if(tabs.length===1){showNotif("Can't close last tab");return;}const n=tabs.filter(t=>t.id!==id);setTabs(n);if(activeTab===id)setActiveTab(n[n.length-1].id);};

  const QUICK_DATA=[
    {icon:"🌿",label:"git status",cmd:"git status"},{icon:"⬆️",label:"git push",cmd:"git push origin main"},
    {icon:"📦",label:"npm install",cmd:"npm install"},{icon:"▶️",label:"npm start",cmd:"npm start"},
    {icon:"🐳",label:"docker ps",cmd:"docker ps -a"},{icon:"🏗️",label:"docker build",cmd:"docker build -t myapp:latest ."},
    {icon:"🐍",label:"pip install",cmd:"pip install -r requirements.txt"},{icon:"🧪",label:"pytest",cmd:"pytest -v"},
    {icon:"💾",label:"disk usage",cmd:"df -h"},{icon:"🧠",label:"memory",cmd:"free -h"},
    {icon:"🌐",label:"curl ip",cmd:"curl ipinfo.io"},{icon:"📡",label:"ping",cmd:"ping -c 4 8.8.8.8"},
    {icon:"🤖",label:"ai help",cmd:"ai how to deploy a Node.js app to production"},{icon:"⚙️",label:"processes",cmd:"ps aux"},
    {icon:"🔒",label:"ssh-keygen",cmd:"ssh-keygen -t ed25519 -C 'dev@neoterm.io'"},{icon:"📋",label:"pm2 list",cmd:"pm2 list"},
    {icon:"🏠",label:"neofetch",cmd:"neofetch"},{icon:"📜",label:"crontab -l",cmd:"crontab -l"},
  ];

  // Apply theme to CSS vars
  const themeStyle=`
    :root{
      --bg:${theme.bg};
      --s1:${theme.bg}cc;
      --s2:${theme.bg}99;
      --s3:${theme.bg}55;
      --accent:${theme.accent};
      --accent2:${theme.accent2};
    }
  `;

  return (
    <>
      <style>{STYLES}</style>
      <style>{themeStyle}</style>
      <div className="scanlines"/>
      {notif&&<div className="notif">{notif}</div>}

      <div style={{display:"flex",flexDirection:"column",height:"100vh",maxWidth:480,margin:"0 auto",background:"var(--bg)"}}>

        {/* STATUS BAR */}
        <div className="statusbar">
          <span>{time.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
          <span style={{color:"var(--accent)",fontWeight:700,letterSpacing:".05em"}}>◈ NeoTerm</span>
          <span style={{display:"flex",gap:6,alignItems:"center"}}>
            {aiLoading&&<span className="spinner"/>}
            <span>🔋 87%</span>
          </span>
        </div>

        {/* MAIN CONTENT */}
        <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>

          {/* ───────────── TERMINAL VIEW ───────────── */}
          {view==="terminal"&&(
            <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
              {/* OS + Tab Controls */}
              <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 8px",background:"var(--s1)",borderBottom:"1px solid var(--border)",flexShrink:0}}>
                {/* OS toggle */}
                <div style={{display:"flex",borderRadius:8,overflow:"hidden",border:"1px solid var(--border)",flexShrink:0}}>
                  <button onClick={()=>{setOs("linux");setCwd(activeTab,"/home/neo");showNotif("🐧 Linux");}}
                    style={{padding:"4px 10px",border:"none",fontSize:11,fontFamily:"var(--sans)",fontWeight:700,cursor:"pointer",background:os==="linux"?"var(--accent2)":"var(--s2)",color:os==="linux"?"#0a0e1a":"var(--muted)",transition:"all .2s"}}>
                    🐧 LNX
                  </button>
                  <button onClick={()=>{setOs("win");setCwd(activeTab,"C:\\Users\\Neo");showNotif("🪟 Windows");}}
                    style={{padding:"4px 10px",border:"none",fontSize:11,fontFamily:"var(--sans)",fontWeight:700,cursor:"pointer",background:os==="win"?"var(--accent)":"var(--s2)",color:os==="win"?"#0a0e1a":"var(--muted)",transition:"all .2s"}}>
                    🪟 WIN
                  </button>
                </div>
                <div className="tabstrip" style={{flex:1,border:"none",background:"transparent",borderBottom:"none"}}>
                  {tabs.map(t=>(
                    <button key={t.id} className={`tab-item ${t.id===activeTab?"active":""}`}
                      onClick={()=>{setActiveTab(t.id);setTimeout(()=>inputRef.current?.focus(),50);}}>
                      {os==="linux"?"🐧":"🪟"} {t.title}
                      {tabs.length>1&&<span onClick={e=>{e.stopPropagation();closeTab(t.id);}} style={{marginLeft:3,opacity:.5,fontSize:9}}>✕</span>}
                    </button>
                  ))}
                </div>
                <button onClick={addTab} style={{padding:"4px 8px",borderRadius:6,border:"1px solid var(--border)",background:"var(--s2)",color:"var(--accent2)",fontSize:14,cursor:"pointer",flexShrink:0}}>＋</button>
                <button onClick={()=>setShowQuick(true)} style={{padding:"4px 8px",borderRadius:6,border:"1px solid var(--border)",background:"var(--s2)",color:"var(--accent3)",fontSize:13,cursor:"pointer",flexShrink:0}}>⚡</button>
              </div>

              {/* CWD */}
              <div style={{padding:"2px 12px",background:"var(--bg)",borderBottom:"1px solid var(--border)",fontSize:10,color:"var(--muted)",fontFamily:"var(--mono)",flexShrink:0}}>
                <span style={{color:os==="linux"?"var(--accent2)":"var(--accent)"}}>{os==="linux"?"🐧":"🪟"} </span>
                <span style={{color:"var(--accent)"}}>{activeTabData?.cwd}</span>
              </div>

              {/* OUTPUT */}
              <div className="term-out" ref={outputRef} onClick={()=>inputRef.current?.focus()}>
                {activeTabData?.lines.map((line,i)=>(
                  <div key={i} className={`${line.type||"lo"} fade-in`} style={{wordBreak:"break-all",whiteSpace:"pre-wrap"}}>{line.text}</div>
                ))}
                {installAnim&&(
                  <div style={{marginBottom:6}}>
                    <div style={{fontSize:11,color:"var(--accent3)"}}>Installing {installAnim.pkg}...</div>
                    <div className="pbar" style={{"--dur":installAnim.dur}}><div className="pfill" style={{width:"0%",animation:`progress ${installAnim.dur} ease forwards`}}/></div>
                  </div>
                )}
                {/* Live prompt */}
                <div style={{display:"flex",alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{color:"var(--accent2)",fontSize:"12.5px"}}>{prompt()}</span>
                  <span style={{color:"var(--text)",fontSize:"12.5px"}}>{input}</span>
                  <span className="cursor"/>
                </div>
              </div>

              {/* AUTOCOMPLETE */}
              {acSuggs.length>0&&(
                <div className="autocomplete">
                  {acSuggs.map((s,i)=>(
                    <div key={i} className={`ac-item ${i===acIdx?"selected":""}`}
                      onClick={()=>{setInput(s.cmd);setAcSuggs([]);inputRef.current?.focus();}}>
                      <span style={{flex:1,fontFamily:"var(--mono)",fontSize:12}}>{s.cmd}</span>
                      <span className="ac-type">{s.type}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* INPUT */}
              <div style={{position:"relative"}}>
                <div className="term-input-row">
                  <span style={{color:"var(--accent2)",fontSize:14,flexShrink:0}}>{os==="linux"?"❯":"›"}</span>
                  <input ref={inputRef} className="term-input" value={input}
                    onChange={e=>{setInput(e.target.value);updateAc(e.target.value);}}
                    onKeyDown={handleKey}
                    placeholder="Enter command... (type 'help')"
                    autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" inputMode="text"/>
                  <button className="run-btn" onClick={()=>{runCommand(input);setInput("");}}>RUN</button>
                </div>
              </div>

              {/* KBD STRIP */}
              <div className="kbd-strip">
                {["Tab","Ctrl+C","↑","↓","clear","ls","cd ~","pwd","git st","docker ps","ai help","||","&&",">>","$?"].map(k=>(
                  <button key={k} className="kbd-k" onClick={()=>{
                    if(k==="Tab"){const c=ALL_CMDS.find(c=>c.startsWith(input));if(c)setInput(c+" ");}
                    else if(k==="Ctrl+C"){addLines(activeTab,[{text:"^C",type:"lw"}]);setInput("");}
                    else if(k==="↑"){const h=activeTabData?.history||[];const ni=Math.min((activeTabData?.histIdx??-1)+1,h.length-1);setTabs(p=>p.map(t=>t.id===activeTab?{...t,histIdx:ni}:t));setInput(h[ni]||"");}
                    else if(k==="↓"){const h=activeTabData?.history||[];const ni=Math.max((activeTabData?.histIdx??-1)-1,-1);setTabs(p=>p.map(t=>t.id===activeTab?{...t,histIdx:ni}:t));setInput(ni===-1?"":(h[ni]||""));}
                    else if(k==="clear"){setTabs(prev=>prev.map(t=>t.id===activeTab?{...t,lines:[]}:t));}
                    else{setInput(p=>p+k);inputRef.current?.focus();}
                  }}>{k}</button>
                ))}
              </div>
            </div>
          )}

          {/* ───────────── FILE MANAGER ───────────── */}
          {view==="files"&&(
            <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
              <div style={{padding:"8px 12px",background:"var(--s1)",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                <span style={{fontSize:12,color:"var(--accent)",fontFamily:"var(--mono)",flex:1}}>{fmPath}</span>
                <button onClick={()=>{const p=fmPath.split("/").filter(Boolean);p.pop();setFmPath("/"+p.join("/")||"/home/neo");}}
                  style={{padding:"4px 10px",borderRadius:7,border:"1px solid var(--border)",background:"var(--s2)",color:"var(--text)",fontSize:11,cursor:"pointer"}}>← Up</button>
              </div>
              <div style={{flex:1,overflowY:"auto"}}>
                {/* Dirs */}
                {["projects","scripts"].map(d=>(
                  <div key={d} className="fm-item" onClick={()=>setFmPath(fmPath+"/"+d)}>
                    <span style={{fontSize:20}}>📁</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:"var(--accent)"}}>{d}/</div>
                      <div style={{fontSize:10,color:"var(--muted)"}}>directory</div>
                    </div>
                    <span style={{fontSize:14,color:"var(--muted)"}}>›</span>
                  </div>
                ))}
                {/* Files */}
                {[
                  {name:".bashrc",size:"256B",icon:"⚙️"},{name:".gitconfig",size:"180B",icon:"🌿"},
                  {name:"README.md",size:"780B",icon:"📄"},{name:"deploy.sh",size:"890B",icon:"🔧"},
                ].map(f=>(
                  <div key={f.name} className="fm-item" onClick={()=>{
                    const content=findFileContent(f.name,FILE_TREE["/home/neo"].children)||`# ${f.name}`;
                    setEditorFile(f.name);setEditorContent(content);setView("editor");
                  }}>
                    <span style={{fontSize:20}}>{f.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,color:"var(--text)"}}>{f.name}</div>
                      <div style={{fontSize:10,color:"var(--muted)"}}>{f.size}</div>
                    </div>
                    <button style={{padding:"3px 8px",borderRadius:6,border:"1px solid var(--border)",background:"var(--s2)",color:"var(--accent)",fontSize:10,cursor:"pointer"}}
                      onClick={e=>{e.stopPropagation();const c=findFileContent(f.name,FILE_TREE["/home/neo"].children)||"";setEditorFile(f.name);setEditorContent(c);setView("editor");}}>
                      Edit
                    </button>
                  </div>
                ))}
              </div>
              {/* FM Actions */}
              <div style={{padding:"8px",background:"var(--s1)",borderTop:"1px solid var(--border)",display:"flex",gap:6,flexShrink:0}}>
                {[["📄","New File"],["📁","New Dir"],["⬆️","Upload"],["🔍","Search"]].map(([icon,label])=>(
                  <button key={label} style={{flex:1,padding:"8px 4px",borderRadius:9,border:"1px solid var(--border)",background:"var(--s2)",color:"var(--text)",fontSize:10,cursor:"pointer",fontFamily:"var(--sans)",fontWeight:600}}
                    onClick={()=>showNotif(`${label} (coming soon)`)}>
                    {icon}<br/>{label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ───────────── CODE EDITOR ───────────── */}
          {view==="editor"&&(
            <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
              <div style={{padding:"6px 10px",background:"var(--s1)",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                <span style={{fontSize:12,color:"var(--accent)",fontFamily:"var(--mono)",flex:1}}>📝 {editorFile||"untitled"}</span>
                <button className="btn btn-accent" style={{padding:"4px 12px",fontSize:11}} onClick={()=>{showNotif(`${editorFile} saved ✓`);setView("files");}}>Save</button>
                <button className="btn btn-ghost" style={{padding:"4px 10px",fontSize:11}} onClick={()=>setView("files")}>✕</button>
              </div>
              {/* Line numbers + editor */}
              <div style={{flex:1,display:"flex",overflow:"hidden"}}>
                <div style={{width:32,background:"var(--s1)",borderRight:"1px solid var(--border)",overflowY:"hidden",flexShrink:0,paddingTop:12}}>
                  {editorContent.split("\n").map((_,i)=>(
                    <div key={i} style={{height:"1.8em",lineHeight:"1.8em",textAlign:"right",paddingRight:6,fontSize:11,color:"var(--muted)",fontFamily:"var(--mono)"}}>{i+1}</div>
                  ))}
                </div>
                <textarea className="editor-area" value={editorContent}
                  onChange={e=>setEditorContent(e.target.value)}
                  spellCheck="false" autoCorrect="off" autoCapitalize="off"/>
              </div>
              {/* Editor toolbar */}
              <div className="kbd-strip">
                {["Undo","Redo","Find","Format","Run","Copy All"].map(a=>(
                  <button key={a} className="kbd-k" style={{fontSize:10}} onClick={()=>{
                    if(a==="Copy All"){navigator.clipboard.writeText(editorContent);showNotif("Copied!");}
                    else if(a==="Run"){setView("terminal");setTimeout(()=>runCommand(`node ${editorFile||"file.js"}`),200);}
                    else showNotif(`${a} (Ctrl+${a[0]})`);
                  }}>{a}</button>
                ))}
              </div>
            </div>
          )}

          {/* ───────────── PACKAGES ───────────── */}
          {view==="packages"&&(
            <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
              <div style={{padding:"8px 12px",background:"var(--s1)",borderBottom:"1px solid var(--border)",flexShrink:0}}>
                <input className="field" placeholder="Search packages..." style={{borderRadius:20}}/>
              </div>
              <div style={{flex:1,overflowY:"auto"}}>
                <div className="sec">INSTALLED</div>
                {Object.entries(pkgs).filter(([,v])=>v.installed).map(([name,p])=>(
                  <div key={name} style={{padding:"10px 14px",borderBottom:"1px solid rgba(255,255,255,.04)",display:"flex",alignItems:"center",gap:10}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600}}>{name}</div>
                      <div style={{fontSize:10,color:"var(--muted)"}}>{p.version} · {p.size}</div>
                    </div>
                    <span style={{fontSize:11,color:"var(--accent2)",fontFamily:"var(--sans)",fontWeight:600}}>✓ installed</span>
                  </div>
                ))}
                <div className="sec">AVAILABLE</div>
                {Object.entries(pkgs).filter(([,v])=>!v.installed).map(([name,p])=>(
                  <div key={name} style={{padding:"10px 14px",borderBottom:"1px solid rgba(255,255,255,.04)",display:"flex",alignItems:"center",gap:10}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600}}>{name}</div>
                      <div style={{fontSize:10,color:"var(--muted)"}}>{p.version} · {p.size}</div>
                    </div>
                    <button className="btn btn-accent" style={{padding:"4px 10px",fontSize:11}}
                      onClick={()=>{setView("terminal");setTimeout(()=>runCommand(`apt install ${name}`),200);}}>
                      Install
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ───────────── SSH ───────────── */}
          {view==="ssh"&&(
            <div style={{flex:1,overflowY:"auto",padding:"12px"}}>
              <div style={{fontSize:14,fontWeight:700,marginBottom:12,color:"var(--accent)",fontFamily:"var(--sans)"}}>🔑 SSH Manager</div>
              {/* Saved hosts */}
              {SSH_HOSTS.map(h=>(
                <div key={h.id} className="ssh-host" style={{marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <span style={{fontSize:16}}>{h.status==="online"?"🟢":"🔴"}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700}}>{h.name}</div>
                      <div style={{fontSize:11,color:"var(--muted)",fontFamily:"var(--mono)"}}>{h.user}@{h.host}:{h.port}</div>
                    </div>
                    <button className="btn btn-accent" style={{padding:"5px 12px",fontSize:11}}
                      onClick={()=>{setView("terminal");setTimeout(()=>runCommand(`ssh ${h.user}@${h.host}`),200);}}>
                      Connect
                    </button>
                  </div>
                </div>
              ))}
              {/* Add host */}
              <div className="glass" style={{padding:14,marginTop:12}}>
                <div style={{fontSize:12,color:"var(--accent2)",fontFamily:"var(--sans)",fontWeight:700,marginBottom:10}}>+ Add New Host</div>
                {[["Name","My Server"],["Host","192.168.1.1"],["User","root"],["Port","22"]].map(([l,ph])=>(
                  <div key={l} style={{marginBottom:8}}>
                    <div style={{fontSize:10,color:"var(--muted)",marginBottom:4,fontFamily:"var(--sans)"}}>{l}</div>
                    <input className="field" placeholder={ph}/>
                  </div>
                ))}
                <button className="btn btn-green" style={{width:"100%",marginTop:4}} onClick={()=>showNotif("Host saved ✓")}>Save Host</button>
              </div>
              {/* Keygen */}
              <div className="glass" style={{padding:14,marginTop:10}}>
                <div style={{fontSize:12,color:"var(--accent5)",fontFamily:"var(--sans)",fontWeight:700,marginBottom:8}}>🔐 Key Management</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {["Generate Key","Copy Public Key","View Fingerprint"].map(a=>(
                    <button key={a} className="btn btn-ghost" style={{fontSize:11,padding:"6px 12px"}}
                      onClick={()=>{setView("terminal");setTimeout(()=>runCommand(a==="Generate Key"?"ssh-keygen -t ed25519":a==="Copy Public Key"?"cat ~/.ssh/id_ed25519.pub":"ssh-keygen -lf ~/.ssh/id_ed25519.pub"),200);}}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ───────────── CRON ───────────── */}
          {view==="cron"&&(
            <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
              <div style={{padding:"8px 12px",background:"var(--s1)",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
                <span style={{fontSize:13,fontWeight:700,fontFamily:"var(--sans)",color:"var(--accent)"}}>⏰ Cron Scheduler</span>
                <button className="btn btn-accent" style={{padding:"4px 12px",fontSize:11}} onClick={()=>showNotif("New job (edit fields below)")}>+ New</button>
              </div>
              <div style={{flex:1,overflowY:"auto"}}>
                {crons.map(job=>(
                  <div key={job.id} className="cron-row">
                    <button className={`toggle ${job.enabled?"on":"off"}`} onClick={()=>setCrons(c=>c.map(j=>j.id===job.id?{...j,enabled:!j.enabled}:j))}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600}}>{job.name}</div>
                      <div style={{fontSize:10,color:"var(--accent)",fontFamily:"var(--mono)"}}>{job.schedule}</div>
                      <div style={{fontSize:10,color:"var(--muted)",fontFamily:"var(--mono)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{job.cmd}</div>
                    </div>
                    <button style={{padding:"4px 8px",borderRadius:6,border:"1px solid var(--border)",background:"transparent",color:"var(--accent4)",fontSize:10,cursor:"pointer"}}
                      onClick={()=>setCrons(c=>c.filter(j=>j.id!==job.id))}>Del</button>
                  </div>
                ))}
                {/* New job form */}
                <div className="glass" style={{margin:12,padding:14}}>
                  <div style={{fontSize:12,color:"var(--accent3)",fontFamily:"var(--sans)",fontWeight:700,marginBottom:10}}>+ New Cron Job</div>
                  {[["Name","Daily backup"],["Schedule","0 2 * * *"],["Command","./backup.sh"]].map(([l,ph])=>(
                    <div key={l} style={{marginBottom:8}}>
                      <div style={{fontSize:10,color:"var(--muted)",marginBottom:3,fontFamily:"var(--sans)"}}>{l}</div>
                      <input className="field" placeholder={ph}/>
                    </div>
                  ))}
                  <div className="sec" style={{padding:0,margin:"8px 0 4px"}}>PRESETS</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {[["@daily","0 0 * * *"],["@hourly","0 * * * *"],["@weekly","0 0 * * 0"],["@reboot","@reboot"]].map(([l,v])=>(
                      <button key={l} className="kbd-k" style={{fontSize:10}} onClick={()=>showNotif(`Schedule: ${v}`)}>{l}</button>
                    ))}
                  </div>
                  <button className="btn btn-green" style={{width:"100%",marginTop:10}} onClick={()=>{showNotif("Cron job added ✓");}}>Add Job</button>
                </div>
              </div>
            </div>
          )}

          {/* ───────────── PLUGINS ───────────── */}
          {view==="plugins"&&(
            <div style={{flex:1,overflowY:"auto",padding:12}}>
              <div style={{fontSize:14,fontWeight:700,marginBottom:12,color:"var(--accent5)",fontFamily:"var(--sans)"}}>🔌 Plugin Store</div>
              {plugins.map(p=>(
                <div key={p.id} className="plugin-card" style={{marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                    <span style={{fontSize:24,flexShrink:0}}>{p.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700}}>{p.name} <span style={{fontSize:10,color:"var(--muted)"}}>{p.version}</span></div>
                      <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{p.desc}</div>
                    </div>
                    <button className={`install-btn ${p.installed?"btn-ghost":"btn-accent"}`}
                      style={{fontSize:11,padding:"5px 10px"}}
                      onClick={()=>{
                        setPlugins(prev=>prev.map(x=>x.id===p.id?{...x,installed:!x.installed}:x));
                        showNotif(p.installed?`${p.name} removed`:`${p.name} installed ✓`);
                      }}>
                      {p.installed?"Remove":"Install"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ───────────── THEMES ───────────── */}
          {view==="themes"&&(
            <div style={{flex:1,overflowY:"auto",padding:12}}>
              <div style={{fontSize:14,fontWeight:700,marginBottom:4,color:"var(--accent3)",fontFamily:"var(--sans)"}}>🎨 Themes</div>
              <div style={{fontSize:11,color:"var(--muted)",marginBottom:14}}>Tap to apply instantly</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {THEMES.map(t=>(
                  <div key={t.id} style={{borderRadius:12,padding:12,background:t.bg,border:`2px solid ${theme.id===t.id?t.accent:"rgba(255,255,255,.08)"}`,cursor:"pointer",transition:"all .2s"}}
                    onClick={()=>{setTheme(t);showNotif(`Theme: ${t.name} ✓`);}}>
                    <div style={{display:"flex",gap:4,marginBottom:8}}>
                      {[t.accent,t.accent2,"#fc8181","#f6ad55"].map((c,i)=>(
                        <div key={i} style={{width:14,height:14,borderRadius:"50%",background:c}}/>
                      ))}
                    </div>
                    <div style={{fontFamily:"var(--sans)",fontSize:12,fontWeight:700,color:t.accent}}>{t.name}</div>
                    <div style={{fontFamily:"var(--mono)",fontSize:10,color:"rgba(255,255,255,.4)",marginTop:2}}>$ echo hello</div>
                    {theme.id===t.id&&<div style={{fontSize:10,color:t.accent2,marginTop:4,fontFamily:"var(--sans)",fontWeight:600}}>✓ Active</div>}
                  </div>
                ))}
              </div>
              {/* Font size */}
              <div className="glass" style={{padding:14,marginTop:12}}>
                <div style={{fontSize:12,fontFamily:"var(--sans)",fontWeight:700,marginBottom:10}}>⚙️ Display Settings</div>
                {[["Font Size","14px",["12px","13px","14px","15px","16px"]],["Line Height","1.75",["1.5","1.65","1.75","2.0"]],["Opacity","95%",["80%","85%","90%","95%","100%"]]].map(([l,def,opts])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <span style={{fontSize:12,color:"var(--muted)"}}>{l}</span>
                    <select className="field" style={{width:"auto",padding:"4px 8px"}} defaultValue={def}>
                      {opts.map(o=><option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ───────────── BROWSER ───────────── */}
          {view==="browser"&&(
            <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
              <div className="browser-bar">
                <button style={{background:"transparent",border:"none",color:"var(--muted)",fontSize:16,cursor:"pointer",padding:"0 4px"}} onClick={()=>setView("terminal")}>←</button>
                <input className="browser-input" value={browserUrl} onChange={e=>setBrowserUrl(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&setBrowserUrl(browserUrl.startsWith("http")?browserUrl:"https://"+browserUrl)}/>
                <button style={{background:"var(--accent)",border:"none",borderRadius:20,padding:"6px 12px",color:"#0a0e1a",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"var(--sans)"}}
                  onClick={()=>setBrowserUrl(browserUrl)}>Go</button>
              </div>
              <div style={{display:"flex",gap:6,padding:"4px 10px",background:"var(--s1)",flexShrink:0}}>
                {["google.com","github.com","stackoverflow.com","npmjs.com","pypi.org"].map(u=>(
                  <button key={u} className="kbd-k" style={{fontSize:10}} onClick={()=>setBrowserUrl("https://"+u)}>{u}</button>
                ))}
              </div>
              <iframe src={browserUrl} title="browser" style={{flex:1,border:"none"}}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"/>
            </div>
          )}

          {/* ───────────── SETTINGS ───────────── */}
          {view==="settings"&&(
            <div style={{flex:1,overflowY:"auto",padding:12}}>
              <div style={{fontSize:14,fontWeight:700,marginBottom:14,color:"var(--accent6)",fontFamily:"var(--sans)"}}>⚙️ Settings</div>
              {[
                {title:"Shell",items:[["Default Shell","bash",["bash","zsh","fish","sh"]],["Startup Command",""],["History Size","1000"]]},
                {title:"Cloud Sync",items:[["Cloud Provider","None",["None","GitHub Gist","Google Drive","Dropbox"]],["Auto-sync","Off",["Off","On"]]]},
                {title:"AI Assistant",items:[["AI Model","claude-sonnet-4",["claude-sonnet-4","claude-haiku-4","claude-opus-4"]],["Response Style","concise",["concise","detailed","code-only"]]]},
                {title:"Network",items:[["Default SSH Key","~/.ssh/id_ed25519"],["SSH Timeout","30s"]]},
                {title:"Notifications",items:[["Cron Alerts","On",["On","Off"]],["Deploy Alerts","On",["On","Off"]]]},
              ].map(section=>(
                <div key={section.title} className="glass" style={{padding:14,marginBottom:10}}>
                  <div style={{fontSize:11,color:"var(--muted)",fontFamily:"var(--sans)",fontWeight:700,letterSpacing:".06em",marginBottom:10}}>{section.title.toUpperCase()}</div>
                  {section.items.map(([label,def,opts])=>(
                    <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <span style={{fontSize:12,color:"var(--text)"}}>{label}</span>
                      {opts
                        ?<select className="field" style={{width:"auto",padding:"4px 8px"}} defaultValue={def}>{opts.map(o=><option key={o}>{o}</option>)}</select>
                        :<input className="field" style={{width:120,padding:"4px 8px"}} defaultValue={def}/>
                      }
                    </div>
                  ))}
                </div>
              ))}
              <button className="btn btn-accent" style={{width:"100%"}} onClick={()=>showNotif("Settings saved ✓")}>Save Settings</button>
            </div>
          )}
        </div>

        {/* BOTTOM DOCK */}
        <div className="dock">
          {[
            {id:"terminal", icon:"⌨️", label:"Terminal"},
            {id:"files",    icon:"📁", label:"Files"},
            {id:"packages", icon:"📦", label:"Packages"},
            {id:"ssh",      icon:"🔑", label:"SSH"},
            {id:"cron",     icon:"⏰", label:"Cron"},
            {id:"plugins",  icon:"🔌", label:"Plugins"},
            {id:"themes",   icon:"🎨", label:"Themes"},
            {id:"browser",  icon:"🌐", label:"Browser"},
            {id:"settings", icon:"⚙️", label:"More"},
          ].map(item=>(
            <button key={item.id} className={`dock-btn ${view===item.id?"active":""}`}
              onClick={()=>setView(item.id)}>
              <span className="dock-icon">{item.icon}</span>
              <span>{item.label}</span>
              <div className="dock-pip"/>
            </button>
          ))}
        </div>
      </div>

      {/* QUICK PANEL */}
      {showQuick&&(
        <div className="overlay" onClick={()=>setShowQuick(false)}>
          <div className="sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 14px 10px"}}>
              <span style={{fontSize:15,fontWeight:700,color:"var(--accent3)",fontFamily:"var(--sans)"}}>⚡ Quick Commands</span>
              <button onClick={()=>setShowQuick(false)} style={{background:"transparent",border:"none",color:"var(--muted)",fontSize:20,cursor:"pointer"}}>✕</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,padding:"0 12px 16px"}}>
              {QUICK_DATA.map(q=>(
                <div key={q.label} style={{padding:"10px 6px",borderRadius:10,background:"var(--s2)",border:"1px solid var(--border)",textAlign:"center",cursor:"pointer",transition:"all .15s"}}
                  onClick={()=>{setInput(q.cmd);setShowQuick(false);setView("terminal");setTimeout(()=>inputRef.current?.focus(),100);}}>
                  <div style={{fontSize:18,marginBottom:4}}>{q.icon}</div>
                  <div style={{fontSize:10,color:"var(--text)",fontFamily:"var(--mono)",lineHeight:1.3}}>{q.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

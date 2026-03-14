#!/usr/bin/env node

import { spawnSync } from "child_process";

const args = process.argv.slice(2);
const question = args.join(" ");

if (!question) {
  console.log("Usage: querygit <question>");
  console.log('Example: querygit "who added the fastapi integration"');
  process.exit(1);
}

const apiKey = process.env.CEREBRAS_API_KEY;
if (!apiKey) {
  console.log("Error: CEREBRAS_API_KEY not set");
  console.log("Use: export CEREBRAS_API_KEY=your_api_key");
  process.exit(1);
}

async function askGit(question) {
  const prompt = `Convert this question to a git command. Only respond with the command, nothing else. Don't use backticks. Question: "${question}"`;

  const res = await fetch("https://api.cerebras.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama3.1-8b",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

function tokenize(cmd) {
  const tokens = [];
  const re = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  let m;
  while ((m = re.exec(cmd))) {
    tokens.push(m[1] ?? m[2] ?? m[0]);
  }
  return tokens;
}

function runGit(cmd) {
  const parts = tokenize(cmd.trim());

  if (parts[0] !== "git") {
    return "Error: Only git commands are allowed";
  }

  const result = spawnSync("git", parts.slice(1), {
    encoding: "utf-8",
    stdio: "pipe",
  });

  return result.stdout || result.stderr || "No results found";
}

const gitCmd = await askGit(question);
const result = runGit(gitCmd);

console.log();
console.log("  Model");
console.log("  -------");
console.log("  llama3.1-8b (Cerebras)");
console.log();
console.log("  Command");
console.log("  -------");
console.log(`  ${gitCmd}`);
console.log();
console.log("  Result");
console.log("  -------");
result.trimEnd().split("\n").forEach(line => console.log(`  ${line}`));
console.log();
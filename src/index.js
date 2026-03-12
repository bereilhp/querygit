#!/usr/bin/env node

import { execSync } from "child_process";

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

function runGit(cmd) {
  if (!cmd.trim().startsWith("git ")) {
    return "Error: Only git commands are allowed";
  }
  try {
    return execSync(cmd, { encoding: "utf-8", stdio: "pipe" });
  } catch (e) {
    return e.stdout || e.stderr || "No results found";
  }
}

const gitCmd = await askGit(question);
console.log(`\n> ${gitCmd}\n`);
console.log("============================================================");
console.log(runGit(gitCmd));
console.log("============================================================");
console.log(`\nModel: llama3.1-8b (Cerebras)\n`);

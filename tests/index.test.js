import { test, describe } from "node:test";
import assert from "node:assert";
import { spawnSync } from "child_process";

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

describe("querygit", () => {
  test("join args without quotes", () => {
    const args = ["hello", "how", "are", "you"];
    const question = args.join(" ");
    assert.equal(question, "hello how are you");
  });

  test("join args with quotes", () => {
    const args = ["who", "added", "fastapi"];
    const question = args.join(" ");
    assert.equal(question, "who added fastapi");
  });

  test("question with quotes", () => {
    const args = ['"show me commits"'];
    const question = args.join(" ");
    assert.equal(question, '"show me commits"');
  });

  describe("tokenize", () => {
    test("basic command", () => {
      const tokens = tokenize("git log --oneline");
      assert.deepEqual(tokens, ["git", "log", "--oneline"]);
    });

    test("handles double quotes", () => {
      const tokens = tokenize('git log --format="%h"');
      assert.deepEqual(tokens, ["git", "log", "--format=", "%h"]);
    });

    test("handles single quotes", () => {
      const tokens = tokenize("git log --author='John'");
      assert.deepEqual(tokens, ["git", "log", "--author=", "John"]);
    });
  });

  describe("runGit security", () => {
    test("rejects non-git command", () => {
      const result = runGit("ls -la");
      assert.equal(result, "Error: Only git commands are allowed");
    });

    test("semicolon is treated as literal arg, not shell separator", () => {
      const result = runGit("git --version; echo pwned");
      assert.equal(result.includes("pwned"), false);
      assert.equal(result.includes("unknown option"), true);
    });

    test("double ampersand does not execute second command", () => {
      const result = runGit("git --version && echo pwned");
      assert.match(result, /git version/);
      assert.equal(result.includes("pwned"), false);
    });

    test("pipe does not execute second command", () => {
      const result = runGit("git --version | echo pwned");
      assert.match(result, /git version/);
      assert.equal(result.includes("pwned"), false);
    });

    test("backticks do not execute command substitution", () => {
      const result = runGit("git --version `echo pwned`");
      assert.match(result, /git version/);
      assert.equal(result.includes("pwned"), false);
    });

    test("dollar parens do not execute subshell", () => {
      const result = runGit("git --version $(echo pwned)");
      assert.match(result, /git version/);
      assert.equal(result.includes("pwned"), false);
    });
  });
});

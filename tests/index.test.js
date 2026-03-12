import { test, describe } from "node:test";
import assert from "node:assert";

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
});

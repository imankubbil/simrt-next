import assert from "node:assert/strict";
import test from "node:test";
import { passwordError } from "../src/lib/password";

test("password baru harus cukup panjang dan aman untuk batas bcrypt", () => {
  assert.match(passwordError("warga123") || "", /minimal 12/);
  assert.equal(passwordError("PasswordBaru123!"), null);
  assert.match(passwordError("😀".repeat(20)) || "", /maksimal 72 byte/);
});

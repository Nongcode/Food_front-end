import { test } from "node:test";
import assert from "node:assert/strict";
import { GET, POST } from "../../app/api/bookings/route";
import { readJson } from "../helpers";

const GONE_MESSAGE = "Chức năng này đã thay đổi. Vui lòng tải lại trang.";

test("POST /api/bookings trả 410", async () => {
  const res = await POST();
  assert.equal(res.status, 410);
  assert.deepEqual(await readJson(res), { success: false, error: GONE_MESSAGE });
});

test("GET /api/bookings cũng trả 410", async () => {
  const res = await GET();
  assert.equal(res.status, 410);
  assert.equal((await readJson(res)).error, GONE_MESSAGE);
});

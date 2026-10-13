import assert from "node:assert/strict";
import test from "node:test";
import { bacaTandaTangan } from "../src/lib/signature";

test("TTD RT dan RW dapat diunggah, dipertahankan, atau dihapus terpisah", async () => {
  const data = new FormData();
  const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0]);
  data.set("ttdKetuaRw", new File([png], "rw.png", { type: "image/png" }));
  assert.equal(await bacaTandaTangan(data, "ttdKetuaRt", "hapusTtdKetuaRt"), undefined);
  assert.match(await bacaTandaTangan(data, "ttdKetuaRw", "hapusTtdKetuaRw") || "", /^data:image\/png;base64,/);

  data.set("hapusTtdKetuaRw", "on");
  assert.equal(await bacaTandaTangan(data, "ttdKetuaRw", "hapusTtdKetuaRw"), null);

  data.delete("hapusTtdKetuaRw");
  data.set("ttdKetuaRw", new File(["invalid"], "rw.png", { type: "image/png" }));
  await assert.rejects(bacaTandaTangan(data, "ttdKetuaRw", "hapusTtdKetuaRw"), /PNG atau JPG/);

  data.set("ttdKetuaRw", new File([new Uint8Array(512 * 1024 + 1)], "rw.png"));
  await assert.rejects(bacaTandaTangan(data, "ttdKetuaRw", "hapusTtdKetuaRw"), /512 KB/);
});

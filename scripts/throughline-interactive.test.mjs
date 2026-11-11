import { strict as assert } from "node:assert";
import { test } from "node:test";
import { compile } from "@0xbuff/throughline";
import { THROUGHLINE_DEMOS } from "../src/lib/throughline-demos.ts";

test("interactive documentation demos compile with the published Throughline package", () => {
  assert.deepEqual(Object.keys(THROUGHLINE_DEMOS).sort(), ["binary", "checkout", "counter", "references"]);
  for (const [id, demo] of Object.entries(THROUGHLINE_DEMOS)) {
    const trace = compile(demo.source);
    assert.equal(trace.version, 1, id);
    assert.equal(trace.frames.length, demo.expectedFrames, id);
    assert.equal(trace.frames[0].index, 0, id);
    assert.equal(trace.frames.at(-1)?.index, demo.expectedFrames - 1, id);
  }
});

test("the checkout demo preserves an unknown outcome until confirmation", () => {
  const trace = compile(THROUGHLINE_DEMOS.checkout.source);
  const get = (index, id) => trace.frames[index]?.state.entities.find((item) => item.id === id)?.value;
  assert.deepEqual(get(6, "order"), { status: "awaiting_payment" });
  assert.equal(get(6, "worker"), "outcome unknown");
  assert.equal(get(6, "status"), "processing");
  assert.equal(get(8, "provider"), "one charge: pay-order-1; retry deduplicated");
  assert.deepEqual(get(11, "order"), { status: "paid" });
  assert.equal(get(11, "status"), "confirmed");
});

test("checkout transfers preserve real link endpoints and never imply persistence", () => {
  const trace = compile(THROUGHLINE_DEMOS.checkout.source);
  const links = new Map(trace.frames[0].state.relations.map((link) => [link.id, link]));
  const expected = [
    ["persist"], ["enqueue"], ["report"], ["deliver"], ["charge"], [],
    ["retry"], ["charge"], ["receipt"], ["confirm", "persist"], ["report"],
  ];
  for (const [index, relationIds] of expected.entries()) {
    const frame = trace.frames[index + 1];
    assert.deepEqual(frame.state.transfers.map(({ relation }) => relation), relationIds, `Step ${index + 1}`);
    for (const transfer of frame.state.transfers) {
      const link = links.get(transfer.relation);
      assert.ok(link, `Unknown link ${transfer.relation}`);
      assert.ok(frame.state.entities.some((entity) => entity.id === link.from));
      assert.ok(frame.state.entities.some((entity) => entity.id === link.to));
    }
  }

  const state = (index, id) =>
    trace.frames[index].state.entities.find((entity) => entity.id === id)?.value;
  assert.equal(state(4, "provider"), "no charge", "delivery is not a persisted provider charge");
  assert.deepEqual(state(9, "order"), { status: "awaiting_payment" }, "confirmation is not an order write");
  assert.equal(state(10, "status"), "processing", "recording paid does not automatically notify the customer");
  assert.equal(state(11, "status"), "confirmed");
  assert.deepEqual(
    trace.frames[10].state.transfers.find(({ relation }) => relation === "persist")?.value,
    { status: "paid" },
  );
});

test("the counter and binary demos show their expected final values", () => {
  const counter = compile(THROUGHLINE_DEMOS.counter.source);
  const lastCounter = counter.frames.at(-1)?.state.entities.find((item) => item.id === "counter");
  assert.equal(lastCounter?.value, 2);

  const binary = compile(THROUGHLINE_DEMOS.binary.source);
  const lastSum = binary.frames.at(-1)?.state.entities.find((item) => item.id === "sum");
  assert.deepEqual(lastSum?.value, [1, 0, 0, 0, 1]);
});

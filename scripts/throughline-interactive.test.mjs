import { strict as assert } from "node:assert";
import { test } from "node:test";
import { compile } from "@0xbuff/throughline";
import { THROUGHLINE_DEMOS } from "../src/lib/throughline-demos.ts";

test("interactive documentation demos compile with the published Throughline package", () => {
  assert.deepEqual(Object.keys(THROUGHLINE_DEMOS).sort(), ["binary", "counter", "references"]);
  for (const [id, demo] of Object.entries(THROUGHLINE_DEMOS)) {
    const trace = compile(demo.source);
    assert.equal(trace.version, 1, id);
    assert.equal(trace.frames.length, demo.expectedFrames, id);
    assert.equal(trace.frames[0].index, 0, id);
    assert.equal(trace.frames.at(-1)?.index, demo.expectedFrames - 1, id);
  }
});

test("the counter and binary demos show their expected final values", () => {
  const counter = compile(THROUGHLINE_DEMOS.counter.source);
  const lastCounter = counter.frames.at(-1)?.state.entities.find((item) => item.id === "counter");
  assert.equal(lastCounter?.value, 2);

  const binary = compile(THROUGHLINE_DEMOS.binary.source);
  const lastSum = binary.frames.at(-1)?.state.entities.find((item) => item.id === "sum");
  assert.deepEqual(lastSum?.value, [1, 0, 0, 0, 1]);
});

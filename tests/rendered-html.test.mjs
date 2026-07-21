import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders Warm Antarctica and its first journey step", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Warm Antarctica<\/title>/i);
  assert.match(html, /Warm water reaches the Amundsen Sea shelf/i);
  assert.match(html, /Play journey/i);
  assert.match(html, /NASA: Pine Island Glacier/i);
  assert.doesNotMatch(html, /Your site is taking shape|SkeletonPreview/i);
});

test("journey data keeps one source per stage and a shared duration", async () => {
  const [journey, map] = await Promise.all([
    readFile(new URL("../app/journey.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/InteractiveMap.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(journey, /export const STAGE_DURATION = 5000/);
  assert.ok((journey.match(/sourceUrl: "https/g) ?? []).length >= 5);
  assert.match(journey, /id: "water"[\s\S]*id: "antarctica"[\s\S]*id: "ocean"[\s\S]*id: "newyork"/);
  assert.match(journey, /Warm deep water reaches George VI Ice Shelf/);
  assert.match(journey, /BAS: George VI Ice Shelf/);
  assert.match(journey, /Deep channels can reach Totten Glacier/);
  assert.match(journey, /NASA: Totten Glacier troughs/);
  assert.match(map, /const onSelectRef = useRef\(onSelect\)/);
  assert.match(map, /onSelectRef\.current\(id\)/);
  assert.match(map, /\}, \[\]\);/);
  assert.match(map, /prefers-reduced-motion: reduce/);
  assert.match(map, /new-york-water-cue/);
  assert.match(map, /not a flood boundary or forecast/);
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /journeyElapsed/);
  assert.match(page, /Resume journey/);
  assert.match(page, /Restart journey/);
  assert.match(page, /window\.setInterval/);
  assert.match(page, /aria-current=\{active === stop\.id \? "step" : undefined\}/);
  assert.match(page, /Map display note/);
  assert.match(page, /globe-map rendering limit/);
  assert.doesNotMatch(page, /render-note/);
});

test("guided Amundsen particles stay local and respect reduced motion", async () => {
  const map = await readFile(new URL("../app/InteractiveMap.tsx", import.meta.url), "utf8");
  assert.match(map, /amundsen-particles/);
  assert.match(map, /activeRef\.current !== "water" && activeRef\.current !== "antarctica"/);
  assert.match(map, /reducedMotion\.current \? undefined : window\.setInterval/);
  assert.match(map, /These particles explain the sourced local path; they are not live current measurements/);
  assert.match(map, /totten-particles/);
  assert.match(map, /layers\.warm/);
  assert.match(map, /layers\.ice/);
  assert.match(map, /layers\.global/);
});

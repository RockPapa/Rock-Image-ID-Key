const fs = require("fs");
const vm = require("vm");

global.window = {};
vm.runInThisContext(fs.readFileSync("data.js", "utf8"), { filename: "data.js" });

const unique = new Map();
for (const category of window.TREE_ID_DATA.categories) {
  for (const species of category.species) unique.set(species.id, species);
}

function queryName(scientific = "") {
  return scientific
    .replace(/\s+\(.+$/, "")
    .replace(/\s+\/.*$/, "")
    .replace(/[‘'][^’']+[’']/g, "")
    .trim();
}

const items = [...unique.values()]
  .map(species => ({ id: species.id, name: species.name, supplied: species.scientific, query: queryName(species.scientific) }))
  .filter(item => item.query && !/\bspp?\./i.test(item.query));

const results = [];
let cursor = 0;
async function worker() {
  while (cursor < items.length) {
    const item = items[cursor++];
    const url = `https://api.gbif.org/v1/species/match?verbose=true&name=${encodeURIComponent(item.query)}`;
    try {
      const response = await fetch(url);
      results.push({ ...item, http: response.status, ...(await response.json()) });
    } catch (error) {
      results.push({ ...item, error: error.message });
    }
  }
}

Promise.all(Array.from({ length: 10 }, worker)).then(() => {
  results.sort((a, b) => a.name.localeCompare(b.name));
  fs.writeFileSync("tmp/gbif-taxonomy-audit.json", JSON.stringify(results, null, 2) + "\n");
  const flagged = results.filter(result => result.error || result.matchType === "NONE" || (result.confidence ?? 0) < 90 || result.status === "SYNONYM");
  fs.writeFileSync("tmp/gbif-taxonomy-flags.tsv", [
    "name\tsupplied\tmatched\tstatus\tconfidence\tissue",
    ...flagged.map(result => [
      result.name,
      result.supplied,
      result.scientificName || "",
      result.status || result.matchType || "ERROR",
      result.confidence ?? "",
      result.note || result.error || ""
    ].join("\t"))
  ].join("\n") + "\n");
  console.log(`Checked ${results.length} names; flagged ${flagged.length}.`);
});

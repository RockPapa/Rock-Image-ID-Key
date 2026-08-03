const fs = require("fs");
const vm = require("vm");

const elements = new Map();
function element(id) {
  if (!elements.has(id)) {
    elements.set(id, {
      id,
      hidden: false,
      innerHTML: "",
      listeners: {},
      addEventListener(type, handler) { this.listeners[type] = handler; }
    });
  }
  return elements.get(id);
}

global.window = { scrollTo() {}, scrollBy() {}, addEventListener() {} };
global.document = {
  activeElement: null,
  getElementById: element,
  addEventListener() {},
  documentElement: null,
  body: null
};

vm.runInThisContext(fs.readFileSync("data.js", "utf8"), { filename: "data.js" });
vm.runInThisContext(fs.readFileSync("app.js", "utf8"), { filename: "app.js" });

const view = element("view");
const clickHandler = view.listeners.click;
const species = new Map();
for (const category of window.TREE_ID_DATA.categories) {
  for (const item of category.species) if (!species.has(item.id)) species.set(item.id, item);
}

const missing = [];
const descriptionMissing = [];
const detailMissing = [];
const reversed = [];
const assetUsers = new Map();
for (const item of species.values()) {
  clickHandler({ target: { closest() { return { dataset: { action: "species", species: item.id } }; } } });
  if (view.innerHTML.includes("No local WebP image is available")) missing.push(item);
  if (!view.innerHTML.includes("description-image-wrap")) descriptionMissing.push(item);
  if (!view.innerHTML.includes('data-action="image-only"')) detailMissing.push(item);

  const descriptionSrc = view.innerHTML.match(/description-image-wrap[\s\S]*?<img src="assets\/([^"]+)"/)?.[1];
  const detailSrc = view.innerHTML.match(/data-action="image-only" data-image="assets\/([^"]+)"/)?.[1];
  const descriptionKind = descriptionSrc && window.TREE_ID_DATA.asset_types?.[descriptionSrc]?.kind;
  const detailKind = detailSrc && window.TREE_ID_DATA.asset_types?.[detailSrc]?.kind;
  for (const src of [descriptionSrc, detailSrc].filter(Boolean)) {
    if (!assetUsers.has(src)) assetUsers.set(src, []);
    assetUsers.get(src).push(item);
  }
  if ((descriptionSrc && descriptionKind !== "description") || (detailSrc && detailKind !== "detail")) {
    reversed.push({ item, descriptionSrc, descriptionKind, detailSrc, detailKind });
  }
}

const oldMissing = missing.filter(item => item.source.includes("Old app"));
const bartramMissing = missing.filter(item => item.source.includes("Bartram"));
const newMissing = missing.filter(item => !item.source.includes("Old app") && !item.source.includes("Bartram"));
console.log(`Species audited: ${species.size}`);
console.log(`Local image matched: ${species.size - missing.length}`);
console.log(`Old-app species without a matched image: ${oldMissing.length}`);
for (const item of oldMissing) console.log(`OLD\t${item.id}\t${item.name}`);
console.log(`Bartram additions without a matched image: ${bartramMissing.length}`);
for (const item of bartramMissing) console.log(`BARTRAM\t${item.id}\t${item.name}`);
console.log(`New additions without a matched image: ${newMissing.length}`);
for (const item of newMissing) console.log(`ADDED\t${item.id}\t${item.name}`);

const oldDescriptionMissing = descriptionMissing.filter(item => item.source.includes("Old app"));
const oldDetailMissing = detailMissing.filter(item => item.source.includes("Old app"));
console.log(`Old-app species without a description panel: ${oldDescriptionMissing.length}`);
for (const item of oldDescriptionMissing) console.log(`OLD-DESCRIPTION\t${item.id}\t${item.name}`);
console.log(`Old-app species without an identification plate: ${oldDetailMissing.length}`);
for (const item of oldDetailMissing) console.log(`OLD-DETAIL\t${item.id}\t${item.name}`);
console.log(`Species with reversed or misclassified image roles: ${reversed.length}`);
for (const problem of reversed) {
  console.log(`REVERSED\t${problem.item.id}\t${problem.descriptionSrc || "-"}:${problem.descriptionKind || "-"}\t${problem.detailSrc || "-"}:${problem.detailKind || "-"}`);
}
const shared = [...assetUsers.entries()].filter(([_src, users]) => new Set(users.map(item => item.id)).size > 1);
console.log(`Assets assigned to more than one species: ${shared.length}`);
for (const [src, users] of shared) {
  console.log(`SHARED\t${src}\t${[...new Set(users.map(item => item.name))].join(" | ")}`);
}

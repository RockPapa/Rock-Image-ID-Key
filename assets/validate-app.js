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
  listeners: {},
  addEventListener(type, handler) { this.listeners[type] = handler; }
};

vm.runInThisContext(fs.readFileSync("data.js", "utf8"), { filename: "data.js" });
const appSource = fs.readFileSync("app.js", "utf8");
vm.runInThisContext(appSource, { filename: "app.js" });

const view = element("view");
const clickHandler = view.listeners.click;
const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function click(action, dataset = {}) {
  clickHandler({
    target: {
      closest() { return { dataset: { action, ...dataset } }; }
    }
  });
}

assert(view.innerHTML.includes("assets/page1.webp"), "Opening page did not render with the expected asset path.");
click("intro-next");
click("intro-next");
click("intro-next");
click("intro-next");
assert(view.innerHTML.includes("WHERE IS IT GROWING"), "Georgia region choices did not render.");
assert(view.innerHTML.includes("MOUNTAINS") && view.innerHTML.includes("PIEDMONT") && view.innerHTML.includes("COASTAL PLAIN"), "A regional choice is missing.");
click("choose-region", { region: "all" });
assert(view.innerHTML.includes("WHAT KIND OF SITE"), "Site-type choices did not render.");
assert(view.innerHTML.includes("DRY UPLAND") && view.innerHTML.includes("MOIST, WELL-DRAINED") && view.innerHTML.includes("WETLAND OR FLOODPLAIN"), "A site-type choice is missing.");
click("choose-habitat", { habitat: "all" });
assert(view.innerHTML.includes("BROAD, FLAT"), "Main foliage key did not render.");

click("broad");
assert(view.innerHTML.includes("SIMPLE") && view.innerHTML.includes("OPPOSITE"), "Broad-leaf branches did not render.");
click("branch", { branch: "simple-opposite" });
assert(view.innerHTML.includes("TOOTHLESS"), "Margin choices did not render.");
click("category", { category: "category-1" });
assert(view.innerHTML.includes("Flowering dogwood"), "Category species list did not render.");
assert(window.TREE_ID_DATA.categories.filter(category => category.species.some(species => species.id === "common-crape-myrtle")).length === 2, "Crape myrtle was not cross-listed for its variable leaf arrangement.");
click("species", { species: "flowering-dogwood" });
assert(view.innerHTML.includes("Wikipedia"), "Species Wikipedia link did not render.");
assert(view.innerHTML.includes("Image search"), "Species image-search link did not render.");
assert(view.innerHTML.includes("assets/flowering_dogwood"), "Existing flowering dogwood artwork was not matched.");
assert(view.innerHTML.includes("data-action=\"image-only\""), "Description IMAGE hotspot did not render.");
assert(!view.innerHTML.includes("Old app"), "Source badge is still visible on the species page.");
assert(!view.innerHTML.match(/<img[^>]+detail image/), "Detail image is still embedded on the description page.");
click("image-only", { image: "assets/flowering_dogwood_pix.png.webp", name: "Flowering dogwood" });
assert(view.innerHTML.includes("image-only-view"), "Image-only viewer did not render.");
click("special", { category: "special-deciduous-conifer" });
assert(view.innerHTML.includes("Baldcypress") && view.innerHTML.includes("Pond Cypress") && view.innerHTML.includes("Dawn redwood"), "Deciduous-conifer comparison omitted a species.");
click("special", { category: "special-palm-fan-or-sword-like-leaves" });
assert(view.innerHTML.includes("Ginkgo / maidenhair tree"), "Fan-shaped foliage route omitted ginkgo.");

click("pines");
assert(view.innerHTML.includes("TWO NEEDLE PINES") && view.innerHTML.includes("THREE NEEDLE PINES") && view.innerHTML.includes("FIVE NEEDLE PINES"), "Pine bundle-count choices did not render.");
click("pine-group", { pineGroup: "five" });
assert(view.innerHTML.includes("Eastern white pine"), "Five-needle pine page omitted Eastern white pine.");
assert(!view.innerHTML.includes("Pitch pine"), "Pitch pine is incorrectly listed as a five-needle pine.");

click("oaks");
assert(view.innerHTML.includes("assets/oaks.png.webp"), "White-oak/red-oak explanation page did not render.");
click("oak-group", { oakGroup: "white" });
assert(view.innerHTML.includes("White oak") && view.innerHTML.includes("Chinkapin oak"), "White-oak group is incomplete.");
assert(!view.innerHTML.includes("Northern red oak"), "A red oak is incorrectly listed in the white-oak group.");
click("oak-group", { oakGroup: "red" });
assert(view.innerHTML.includes("Northern red oak") && view.innerHTML.includes("Sawtooth oak") && view.innerHTML.includes("Shingle oak"), "Red-oak-type group is incomplete.");

click("species", { species: "bradford-pear-callery-pear" });
assert(view.innerHTML.includes("NATURALIZED NON-NATIVE"), "Naturalized-species status badge did not render.");
click("region");
click("choose-region", { region: "mountains" });
click("choose-habitat", { habitat: "dry" });
click("special", { category: "special-needles-or-scale-like-leaves" });
assert(view.innerHTML.includes("Virginia pine") && view.innerHTML.includes("Eastern white pine"), "Needles-or-scales results omitted individual pine species.");
assert(view.innerHTML.includes("Red spruce") && view.innerHTML.includes("Fraser fir") && view.innerHTML.includes("Carolina Hemlock") && view.innerHTML.includes("Eastern hemlock"), "Needles-or-scales results were incorrectly reduced by region or site filters.");
assert(view.innerHTML.includes("IDENTIFY PINES BY NEEDLE BUNDLES"), "Needle-bundle comparison guide is missing.");
assert(!view.innerHTML.includes("SHOW ALL GEORGIA &amp; ALL SITES"), "Needles-or-scales route should already show the complete comparison list.");
click("clear-filters");
assert(view.innerHTML.includes("SHOW ALL GEORGIA") && view.innerHTML.includes("NOT SURE / SHOW ALL"), "Show-all reset did not clear both filters.");

for (const category of window.TREE_ID_DATA.categories) {
  assert(category.id && category.title, "A category lacks an id or title.");
  assert(category.species.length > 0, `Empty category: ${category.id}.`);
  for (const species of category.species) {
    assert(species.id && species.name, `Incomplete species record in ${category.id}.`);
    assert(/^https:\/\/en\.wikipedia\.org\//.test(species.wikipedia), `Bad Wikipedia link: ${species.name}`);
    assert(/^https:\/\/www\.google\.com\/search/.test(species.search), `Bad search link: ${species.name}`);
    assert(Array.isArray(species.habitats) && species.habitats.length > 0, `Missing site assignment: ${species.name}`);
    assert(species.habitats.every(value => ["dry", "moist", "wet"].includes(value)), `Bad site assignment: ${species.name}`);
  }
}

const uniqueSpeciesRecords = [...new Map(
  window.TREE_ID_DATA.categories.flatMap(category => category.species).map(species => [species.id, species])
).values()];
const pineGuideSource = appSource.match(/const pineGroups = \{[\s\S]*?\n  \};/)?.[0] || "";
const oakGuideSource = appSource.match(/const oakGroups = \{[\s\S]*?\n  \};/)?.[0] || "";
for (const species of uniqueSpeciesRecords) {
  if (species.scientific?.startsWith("Pinus ")) {
    assert(pineGuideSource.includes(`"${species.id}"`), `Pine omitted from needle-bundle guide: ${species.name}`);
  }
  if (species.scientific?.startsWith("Quercus ")) {
    assert(oakGuideSource.includes(`"${species.id}"`), `Oak omitted from oak-group guide: ${species.name}`);
  }
}

for (const asset of window.TREE_ID_DATA.assets) {
  assert(fs.existsSync(`assets/${asset}`), `Missing asset: ${asset}`);
  assert(asset.endsWith(".webp"), `Non-WebP asset in manifest: ${asset}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const unique = new Set(window.TREE_ID_DATA.categories.flatMap(category => category.species.map(species => species.id)));
console.log(`Validation passed: ${window.TREE_ID_DATA.categories.length} categories, ${unique.size} distinct species, ${window.TREE_ID_DATA.assets.length} WebP assets.`);

(() => {
  "use strict";

  const data = window.TREE_ID_DATA;
  const view = document.getElementById("view");
  const backButton = document.getElementById("backButton");
  const homeButton = document.getElementById("homeButton");
  const regionButton = document.getElementById("regionButton");
  const habitatButton = document.getElementById("habitatButton");
  const skipButton = document.getElementById("skipButton");
  const scrollHint = document.getElementById("scrollHint");
  const history = [];
  let activeRegion = "all";
  let activeHabitat = "all";

  const regionChoices = {
    mountains: {
      title: "MOUNTAINS",
      note: "Blue Ridge, Ridge and Valley, and the north Georgia highlands"
    },
    piedmont: {
      title: "PIEDMONT",
      note: "Georgia's rolling central uplands"
    },
    "coastal-plain": {
      title: "COASTAL PLAIN",
      note: "Upper and lower Coastal Plain, coast, and barrier islands"
    },
    all: {
      title: "SHOW ALL GEORGIA",
      note: "Choose this when the region is uncertain or the tree was planted"
    }
  };

  const habitatChoices = {
    dry: {
      title: "DRY UPLAND",
      note: "Ridgetops, rocky slopes, sandhills, dunes, and well-drained soils"
    },
    moist: {
      title: "MOIST, WELL-DRAINED",
      note: "Ordinary forests, protected slopes, coves, and rich woodland soils"
    },
    wet: {
      title: "WETLAND OR FLOODPLAIN",
      note: "Swamps, pond margins, streambanks, bottomlands, and periodically flooded areas"
    },
    all: {
      title: "NOT SURE / SHOW ALL",
      note: "Choose this for planted trees or when the normal site type is uncertain"
    }
  };

  const introPages = [
    { src: "assets/page1.webp", alt: "Tree ID introduction", ratio: 0.562764456, welcome: true },
    { src: "assets/before-we-start1.webp", alt: "Simple and compound leaf introduction", ratio: 0.5 },
    { src: "assets/before-we-start2.webp", alt: "How to distinguish a leaf from a leaflet", ratio: 0.5 },
    { src: "assets/before-we-start3.webp", alt: "Opposite and alternate leaf arrangements", ratio: 0.5 }
  ];

  const branches = [
    {
      id: "simple-opposite",
      title: "Simple opposite leaves",
      description: "One blade per leaf, with whole leaves paired at the same twig node.",
      categoryIds: ["category-1", "category-2", "category-3"]
    },
    {
      id: "simple-alternate",
      title: "Simple alternate leaves",
      description: "One blade per leaf, with whole leaves staggered along the twig.",
      categoryIds: ["category-4", "category-5", "category-6"]
    },
    {
      id: "compound-opposite",
      title: "Compound opposite leaves",
      description: "Several leaflets per leaf, with whole compound leaves paired at each node.",
      categoryIds: ["category-7", "category-8", "category-9"]
    },
    {
      id: "compound-alternate",
      title: "Compound alternate leaves",
      description: "Several leaflets per leaf, with whole compound leaves staggered along the twig.",
      categoryIds: ["category-10", "category-11", "category-12"]
    }
  ];

  const broadEvergreens = new Set([
    "carolina-laurel-cherry", "southern-magnolia", "sweetbay-magnolia",
    "redbay", "live-oak", "loblolly-bay", "buckwheat-tree",
    "american-holly", "yaupon-holly", "dahoon-holly", "devilwood-american-olive",
    "swampbay", "wax-myrtle", "darlington-oak", "large-gallberry",
    "myrtle-leaved-holly", "mountain-laurel", "purple-rhododendron",
    "rosebay-rhododendron", "tree-lyonia-staggerbush", "chapman-oak",
    "myrtle-oak", "sand-live-oak", "anise-tree", "evergreen-bayberry",
    "odorless-bayberry", "drooping-leucothoe", "fetterbush",
    "fetterbush-or-pipestem", "gallberry-or-inkberry", "burford-holly",
    "privets", "leatherleaf-mahonia-oregon-grape", "nandina-heavenly-bamboo"
  ]);

  const pineGroups = {
    two: {
      title: "TWO NEEDLE PINES",
      note: "Needles are primarily held in bundles of two. Slash, Table Mountain, shortleaf, and loblolly pine are cross-listed because bundle counts can vary.",
      ids: ["virginia-pine", "spruce-pine", "slash-pine", "table-mountain-pine", "shortleaf-pine", "loblolly-pine"]
    },
    three: {
      title: "THREE NEEDLE PINES",
      note: "Needles are primarily held in bundles of three. Several variable species are also listed on the two-needle page.",
      ids: ["slash-pine", "table-mountain-pine", "shortleaf-pine", "loblolly-pine", "longleaf-pine", "pitch-pine", "pond-pine"]
    },
    five: {
      title: "FIVE NEEDLE PINES",
      note: "Needles are held in bundles of five.",
      ids: ["eastern-white-pine"]
    }
  };

  const oakGroups = {
    white: {
      title: "WHITE OAKS",
      note: "Leaves generally have rounded lobes without bristle tips. Acorns mature in one growing season.",
      ids: ["white-oak", "post-oak", "chestnut-oak", "swamp-chestnut-oak", "live-oak", "overcup-oak", "chinkapin-oak", "bluff-oak-bastard-white-oak", "chapman-oak", "oglethorpe-oak", "sand-live-oak", "sand-post-oak-scrub-post-oak"]
    },
    red: {
      title: "RED OAKS",
      note: "Leaves generally have pointed lobes or bristle-tipped teeth. Native red-oak acorns mature in two growing seasons. Sawtooth oak is included here as a practical bristle-tipped match, although it is not a North American red oak.",
      ids: ["northern-red-oak", "southern-red-oak", "black-oak", "scarlet-oak", "water-oak", "willow-oak", "pin-oak", "laurel-oak", "turkey-oak", "blackjack-oak", "darlington-oak", "bluejack-oak", "shingle-oak", "sawtooth-oak", "arkansas-oak", "cherrybark-oak", "georgia-oak", "myrtle-oak", "shumard-oak"]
    }
  };

  const groupAssetStems = new Set([
    "ashes", "birches", "buckeyes", "cherries", "dogwoods", "elms",
    "hackberries", "hickories", "hollys", "hornbeams", "magnolias",
    "maples", "oaks", "pines", "red-oaks", "white-oaks", "compound-list",
    "alternate-compound", "alternate-leaves", "alternate-simple",
    "opposite-leaves", "trees-with-lobed-leaves", "place-holder", "background"
  ]);

  const categories = new Map(data.categories.map(category => [category.id, category]));
  const branchMap = new Map(branches.map(branch => [branch.id, branch]));
  const uniqueSpecies = new Map();

  for (const category of data.categories) {
    for (const species of category.species) {
      if (!uniqueSpecies.has(species.id)) uniqueSpecies.set(species.id, { ...species, categories: [] });
      uniqueSpecies.get(species.id).categories.push(category.id);
    }
  }

  let current = { type: "intro", index: 0 };

  function escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalize(value = "") {
    return value.toLowerCase().replace(/\.webp$/i, "").replace(/\.(jpg|png)$/i, "")
      .replace(/\b(copy|pix|detail|image)\b/g, "").replace(/[^a-z0-9]+/g, "");
  }

  function tokens(value = "") {
    return value.toLowerCase().replace(/\.(jpg|png)\.webp$/i, "")
      .replace(/\b(copy|pix|detail|image)\b/g, " ")
      .split(/[^a-z0-9]+/).filter(token => token.length > 2);
  }

  function assetStem(file) {
    return file.toLowerCase().replace(/\.(jpg|png)\.webp$/i, "").replaceAll("_", "-");
  }

  const speciesAssetAliases = {
    "eastern-redbud": ["redbud"],
    "possumhaw": ["deciduous holly"],
    "mockernut-hickory": ["mockernut"],
    "eastern-redcedar": ["redcedar"],
    "allegheny-chinkapin": ["chinkapin"],
    "american-beech": ["beech"]
  };

  const speciesWithoutLocalAssets = new Set([
    "chinkapin-oak",
    "blackhaw",
    "sand-live-oak",
    "two-winged-silverbell",
    "swamp-chestnut-oak",
    "bluff-oak-bastard-white-oak",
    "sand-post-oak-scrub-post-oak",
    "ohio-buckeye-fetid-buckeye"
  ]);

  const unusableSpeciesAssets = new Set([
    "loblolly_bay.png.webp"
  ]);

  function imageCandidates(species) {
    if (speciesWithoutLocalAssets.has(species.id)) return [];

    const aliases = [
      ...species.name.split("/").map(part => part.trim()).filter(Boolean),
      ...(speciesAssetAliases[species.id] || [])
    ];
    const aliasNorms = aliases.map(normalize).filter(value => value.length > 3);
    const aliasTokens = aliases.map(tokens);

    return data.assets
      .filter(file => {
        const stem = assetStem(file).replace(/-(copy|pix).*$/, "");
        return !unusableSpeciesAssets.has(file) && !groupAssetStems.has(stem) && !/(^|-)list($|-)|leaves|placeholder/.test(stem);
      })
      .map(file => {
        const fileNorm = normalize(file);
        const fileTokens = tokens(file);
        const baseNorm = normalize(assetStem(file).replace(/-(copy|pix|detail|image).*$/, ""));
        let score = 0;

        for (let i = 0; i < aliasNorms.length; i += 1) {
          const aliasNorm = aliasNorms[i];
          const commonTokens = aliasTokens[i];
          if (baseNorm === aliasNorm) score = Math.max(score, 112);
          else if (fileNorm === aliasNorm) score = Math.max(score, 100);
          else if (fileNorm.includes(aliasNorm) || (fileNorm.length >= 8 && aliasNorm.endsWith(fileNorm))) score = Math.max(score, 78);

          const overlap = commonTokens.filter(token => fileTokens.includes(token)).length;
          if (overlap >= 2) score = Math.max(score, 30 + overlap * 12);
        }

        if (/\.jpg\.webp$/i.test(file)) score += 7;
        if (/\.png\.webp$/i.test(file)) score += 4;
        if (/pix/i.test(file)) score -= 2;
        const kind = data.asset_types?.[file]?.kind || (/\.jpg\.webp$/i.test(file) ? "description" : "detail");
        return { file, score, kind };
      })
      .filter(candidate => candidate.score >= 48)
      .sort((a, b) => b.score - a.score || a.file.localeCompare(b.file))
      .reduce((selected, candidate) => {
        if (!selected.some(item => item.kind === candidate.kind)) selected.push(candidate);
        return selected;
      }, [])
      .map(candidate => ({ src: `assets/${candidate.file}`, kind: candidate.kind }));
  }

  function page(title, intro, body, options = {}) {
    const heading = options.rawTitle ? title : escapeHtml(title);
    const showFilters = !["intro", "region", "habitat", "image-only"].includes(current.type);
    return `
      <section class="page view-enter">
        <h1 class="page-heading">${heading}</h1>
        ${showFilters ? `<p class="filter-summary"><strong>${escapeHtml(regionLabel())}</strong><span aria-hidden="true"> · </span><strong>${escapeHtml(habitatLabel())}</strong></p>` : ""}
        ${intro ? `<p class="page-intro">${intro}</p>` : ""}
        ${body}
      </section>`;
  }

  function setHeader() {
    const isFirst = current.type === "intro" && current.index === 0;
    backButton.hidden = isFirst || history.length === 0;
    skipButton.hidden = current.type !== "intro" || current.index === 0;
    homeButton.hidden = current.type === "intro" || current.type === "foliage";
    regionButton.hidden = current.type === "intro" || current.type === "region";
    habitatButton.hidden = current.type === "intro" || current.type === "region" || current.type === "habitat";
  }

  function navigate(next, remember = true) {
    if (remember) {
      history.push({
        state: { ...current },
        scrollY: window.scrollY || document.documentElement?.scrollTop || document.body?.scrollTop || 0
      });
    }
    current = next;
    render();
    resetScroll();
  }

  function goBack() {
    if (!history.length) return;
    const previous = history.pop();
    current = previous.state;
    render();
    restoreScroll(previous.scrollY);
  }

  function goHome() {
    history.length = 0;
    current = { type: "foliage" };
    render();
    resetScroll();
  }

  function speciesMatchesRegion(species) {
    if (activeRegion === "all") return true;
    const knownRegions = species.regions || [];
    return knownRegions.length === 0 || knownRegions.includes(activeRegion);
  }

  function speciesMatchesHabitat(species) {
    if (activeHabitat === "all") return true;
    const knownHabitats = species.habitats || [];
    return knownHabitats.length === 0 || knownHabitats.includes(activeHabitat);
  }

  function filteredSpecies(species) {
    return species.filter(item => speciesMatchesRegion(item) && speciesMatchesHabitat(item));
  }

  function regionLabel() {
    return regionChoices[activeRegion]?.title || regionChoices.all.title;
  }

  function habitatLabel() {
    return habitatChoices[activeHabitat]?.title || habitatChoices.all.title;
  }

  function resetScroll() {
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    window.scrollTo(0, 0);
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => window.scrollTo(0, 0));
    }
  }

  function restoreScroll(scrollY = 0) {
    const applyPosition = () => window.scrollTo(0, scrollY);
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => requestAnimationFrame(applyPosition));
    } else {
      applyPosition();
    }
  }

  function updateScrollHint() {
    if (!scrollHint || !document.documentElement || !document.body || !window.innerHeight) return;
    const pageHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    const viewportHeight = window.innerHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const scrollable = current.type !== "intro" && pageHeight > viewportHeight + 48;
    const nearBottom = scrollTop + viewportHeight >= pageHeight - 56;
    scrollHint.hidden = !scrollable || nearBottom;
  }

  function scheduleScrollHint() {
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(updateScrollHint);
    else updateScrollHint();
  }

  function renderIntro() {
    const intro = introPages[current.index];
    const label = current.index === introPages.length - 1 ? "Continue to the tree key" : "Continue";
    view.innerHTML = `
      <section class="intro-view">
        <div class="intro-artboard ${intro.welcome ? "welcome" : ""}" style="--ratio:${intro.ratio}">
          <img src="${intro.src}" alt="${escapeHtml(intro.alt)}">
          <button class="intro-next" type="button" data-action="intro-next" aria-label="${label}"></button>
          ${intro.welcome ? `<button class="intro-skip-key" type="button" data-action="skip-key">SKIP TO THE KEY</button>` : ""}
        </div>
      </section>`;
  }

  function renderRegion() {
    const buttons = Object.entries(regionChoices).map(([id, choice]) => `
      <button class="key-button region-choice ${id === "all" ? "secondary" : ""}" type="button" data-action="choose-region" data-region="${id}">
        <span class="${id === "all" ? "accent-cyan" : "accent-orange"}">${escapeHtml(choice.title)}</span>
        <span class="key-note">${escapeHtml(choice.note)}</span>
      </button>`).join("");
    view.innerHTML = page(
      "WHERE IS IT GROWING?",
      "Choose a Georgia region to shorten later lists. Species with uncertain or overlapping ranges will remain available.",
      `<div class="key-grid">${buttons}</div>`
    );
  }

  function renderHabitat() {
    const buttons = Object.entries(habitatChoices).map(([id, choice]) => `
      <button class="key-button habitat-choice ${id === "all" ? "secondary" : ""}" type="button" data-action="choose-habitat" data-habitat="${id}">
        <span class="${id === "all" ? "accent-cyan" : "accent-orange"}">${escapeHtml(choice.title)}</span>
        <span class="key-note">${escapeHtml(choice.note)}</span>
      </button>`).join("");
    view.innerHTML = page(
      "WHAT KIND OF SITE?",
      `Region: <strong class="accent-cyan">${escapeHtml(regionLabel())}</strong>. Choose the plant's normal habitat, not how wet the soil happens to be today.`,
      `<div class="key-grid">${buttons}</div>`
    );
  }

  function renderFoliage() {
    view.innerHTML = page(
      "TREE ID KEY",
      `Region: <strong class="accent-cyan">${escapeHtml(regionLabel())}</strong><br>Site: <strong class="accent-cyan">${escapeHtml(habitatLabel())}</strong><br>Begin with the foliage that best matches your plant.`,
      `<div class="key-grid">
        <button class="key-button" data-action="broad" type="button"><span class="accent-cyan">BROAD, FLAT</span> LEAVES<span class="key-note">Deciduous or evergreen</span></button>
        <button class="key-button" data-action="special" data-category="special-needles-or-scale-like-leaves" type="button"><span class="accent-orange">NEEDLES</span> OR <span class="accent-orange">SCALES</span><span class="key-note">Pines, spruce, fir, hemlock, and redcedar</span></button>
        <button class="key-button" data-action="special" data-category="special-deciduous-conifer" type="button">DECIDUOUS <span class="accent-orange">CONIFER</span></button>
        <button class="key-button" data-action="special" data-category="special-palm-fan-or-sword-like-leaves" type="button"><span class="accent-cyan">PALM, FAN,</span> OR <span class="accent-cyan">SWORD-LIKE</span> LEAVES</button>
        <button class="key-button secondary" data-action="evergreen" type="button">Broad evergreen shortcut</button>
        <button class="key-button secondary" data-action="search" type="button">Browse or search all trees and shrubs</button>
        <button class="key-button secondary" data-action="region" type="button">Change Georgia region</button>
        <button class="key-button secondary" data-action="habitat" type="button">Change site type</button>
      </div>`
    );
  }

  function renderBroad() {
    const buttons = branches.map(branch => `
      <button class="key-button" type="button" data-action="branch" data-branch="${branch.id}">
        ${branch.title.replace(/(simple|compound|opposite|alternate)/gi, match => `<span class="${/simple|compound/i.test(match) ? "accent-orange" : "accent-cyan"}">${match.toUpperCase()}</span>`)}
        <span class="key-note">${branch.description}</span>
      </button>`).join("");

    view.innerHTML = page(
      "BROAD, FLAT LEAVES",
      "Follow one whole leaf back to the twig, then choose its structure and arrangement.",
      `<div class="key-grid">${buttons}</div>`
    );
  }

  function renderBranch() {
    const branch = branchMap.get(current.id);
    const buttons = branch.categoryIds.map(categoryId => {
      const category = categories.get(categoryId);
      const count = category ? filteredSpecies(category.species).length : 0;
      if (!category || !count) {
        return `<button class="key-button" type="button" disabled>${escapeHtml(category?.title || "No trees listed")}<span class="key-note">No consistently matching species currently listed</span></button>`;
      }
      const margin = category.title.match(/(toothless|toothed|lobed)/i)?.[1] || category.title;
      return `<button class="key-button" type="button" data-action="category" data-category="${category.id}"><span class="accent-orange">${margin.toUpperCase()}</span> ${/compound/i.test(branch.title) ? "LEAFLETS" : "LEAVES"}<span class="key-note">${count} possible match${count === 1 ? "" : "es"} for the selected region and site</span></button>`;
    }).join("");

    view.innerHTML = page(branch.title.toUpperCase(), escapeHtml(branch.description), `<div class="key-grid">${buttons}</div>`);
  }

  function speciesButton(species) {
    return `<button class="species-button" type="button" data-action="species" data-species="${escapeHtml(species.id)}"><span class="species-name">${escapeHtml(species.name)}${species.variable ? " †" : ""}${species.whorled ? " ‡" : ""}</span>${species.scientific ? `<span class="scientific-name">${escapeHtml(species.scientific)}</span>` : ""}</button>`;
  }

  function showAllButton(total, visible) {
    if ((activeRegion === "all" && activeHabitat === "all") || visible >= total) return "";
    const hidden = total - visible;
    return `<button class="key-button secondary filter-reset" type="button" data-action="clear-filters">SHOW ALL GEORGIA &amp; ALL SITES<span class="key-note">${hidden} additional possible match${hidden === 1 ? "" : "es"}</span></button>`;
  }

  function renderCategory(categoryId = current.id) {
    const category = categories.get(categoryId);
    const isNeedleCategory = category.id === "special-needles-or-scale-like-leaves";
    const alwaysShowAll = isNeedleCategory || category.id === "special-deciduous-conifer";
    const hasOaks = category.species.some(species => species.scientific?.startsWith("Quercus "));
    const regionSiteMatches = alwaysShowAll ? category.species : filteredSpecies(category.species);
    let visibleSpecies = regionSiteMatches;
    if (hasOaks) visibleSpecies = visibleSpecies.filter(species => !species.scientific?.startsWith("Quercus "));
    const pineButton = isNeedleCategory
      ? `<button class="species-button" type="button" data-action="pines"><span class="species-name accent-orange">IDENTIFY PINES BY NEEDLE BUNDLES</span><span class="scientific-name">Optional comparison guide; all matching pine species are also listed below</span></button>`
      : "";
    const oakButton = hasOaks
      ? `<button class="species-button" type="button" data-action="oaks"><span class="species-name accent-cyan">OAKS</span><span class="scientific-name">Compare white-oak and red-oak groups</span></button>`
      : "";
    const items = pineButton + visibleSpecies.map(speciesButton).join("") + oakButton + showAllButton(category.species.length, regionSiteMatches.length);
    const note = alwaysShowAll
      ? isNeedleCategory
        ? "All needle- and scale-leaved species are shown for comparison. Region and site badges remain on each species page."
        : "All deciduous conifers are shown because this is a short comparison list. Region and site badges remain on each species page."
      : category.kind === "special"
      ? "Choose a tree or shrub to view available artwork and reference links."
      : "† Variable foliage is cross-listed. ‡ The species may also have whorled leaves.";
    view.innerHTML = page(category.title.toUpperCase(), note, `<div class="species-list">${items}</div>`);
  }

  function renderPineIndex() {
    const buttons = Object.entries(pineGroups).map(([id, group]) => `
      <button class="key-button" type="button" data-action="pine-group" data-pine-group="${id}">
        <span class="accent-orange">${escapeHtml(group.title)}</span>
        <span class="key-note">${filteredSpecies(group.ids.map(speciesId => uniqueSpecies.get(speciesId)).filter(Boolean)).length} possible matches for the selected region and site</span>
      </button>`).join("");
    view.innerHTML = page("PINES", "Count the needles held together at the base of one bundle.", `<div class="key-grid">${buttons}</div>`);
  }

  function renderPineGroup() {
    const group = pineGroups[current.id];
    const allSpecies = group.ids.map(id => uniqueSpecies.get(id)).filter(Boolean);
    const species = filteredSpecies(allSpecies);
    view.innerHTML = page(group.title, escapeHtml(group.note), `<div class="species-list">${species.map(speciesButton).join("")}${showAllButton(allSpecies.length, species.length)}</div>`);
  }

  function renderOakGuide() {
    view.innerHTML = `
      <section class="oak-guide-view view-enter" aria-label="How to distinguish white oaks and red oaks">
        <div class="oak-guide">
          <img src="assets/oaks.png.webp" alt="Oaks have multiple terminal buds. White oaks have rounded lobes without bristles; red oaks have pointed lobes usually with bristles.">
          <button class="oak-guide-choice white" type="button" data-action="oak-group" data-oak-group="white" aria-label="Open white oaks"></button>
          <button class="oak-guide-choice red" type="button" data-action="oak-group" data-oak-group="red" aria-label="Open red oaks"></button>
        </div>
      </section>`;
  }

  function renderOakGroup() {
    const group = oakGroups[current.id];
    const allSpecies = group.ids.map(id => uniqueSpecies.get(id)).filter(Boolean);
    const species = filteredSpecies(allSpecies);
    view.innerHTML = page(group.title, escapeHtml(group.note), `<div class="species-list">${species.map(speciesButton).join("")}${showAllButton(allSpecies.length, species.length)}</div>`);
  }

  function renderEvergreen() {
    const species = [...uniqueSpecies.values()]
      .filter(item => broadEvergreens.has(item.id) && !item.scientific?.startsWith("Quercus ") && speciesMatchesRegion(item))
      .sort((a, b) => a.name.localeCompare(b.name));
    const oakButton = `<button class="species-button" type="button" data-action="oaks"><span class="species-name accent-cyan">OAKS</span><span class="scientific-name">Compare white-oak and red-oak groups</span></button>`;
    view.innerHTML = page(
      "BROAD EVERGREEN LEAVES",
      "This is a shortcut. Each tree also remains in its normal simple/compound and opposite/alternate pathway.",
      `<div class="species-list">${species.map(speciesButton).join("")}${oakButton}</div>`
    );
  }

  function renderSearch() {
    const species = filteredSpecies([...uniqueSpecies.values()]).sort((a, b) => a.name.localeCompare(b.name));
    view.innerHTML = page(
      "ALL TREES & SHRUBS",
      `${species.length} possible matches are shown for ${escapeHtml(regionLabel())} and ${escapeHtml(habitatLabel())}. Broadly adaptable or uncertain species remain visible.`,
      `<input class="search-box" id="treeSearch" type="search" placeholder="Search common or scientific name" aria-label="Search trees">
       <div class="species-list" id="searchResults">${species.map(speciesButton).join("")}</div>`
    );

    const input = document.getElementById("treeSearch");
    const results = document.getElementById("searchResults");
    input.addEventListener("input", () => {
      const query = input.value.trim().toLowerCase();
      const matches = species.filter(item => `${item.name} ${item.scientific || ""}`.toLowerCase().includes(query));
      results.innerHTML = matches.length ? matches.map(speciesButton).join("") : `<p class="empty-message">No matching tree was found.</p>`;
    });
  }

  function renderSpecies() {
    const species = uniqueSpecies.get(current.id);
    const localImages = imageCandidates(species);
    const categoryNames = species.categories.map(id => categories.get(id)?.title).filter(Boolean);
    const nativeRegionNames = (species.regions || []).map(id => regionChoices[id]?.title).filter(Boolean);
    const habitatNames = (species.habitats || []).map(id => habitatChoices[id]?.title).filter(Boolean);
    const statusBadge = species.origin_status === "Naturalized non-native" || species.source === "Naturalized non-native"
      ? `<span class="badge status-badge">NATURALIZED NON-NATIVE</span>`
      : species.origin_status === "Planted non-native to Georgia"
      ? `<span class="badge planted-badge">PLANTED NON-NATIVE TO GEORGIA</span>`
      : species.origin_status === "Georgia native" || species.source === "UGA native list"
      ? `<span class="badge native-badge">GEORGIA NATIVE</span>`
      : "";
    const descriptionImage = localImages.find(image => image.kind === "description")?.src;
    const detailImage = localImages.find(image => image.kind === "detail")?.src;
    let gallery = "";
    if (descriptionImage) {
      const hotspot = detailImage
        ? `<button class="image-hotspot" type="button" data-action="image-only" data-image="${escapeHtml(detailImage)}" data-name="${escapeHtml(species.name)}" aria-label="Open ${escapeHtml(species.name)} image by itself"></button>`
        : "";
      gallery = `<div class="gallery">
        <div class="description-image-wrap">
          <img src="${descriptionImage}" alt="${escapeHtml(species.name)} description image" loading="eager">
          ${hotspot}
        </div>
      </div>`;
    } else if (!detailImage) {
      gallery = `<div class="image-missing">No local WebP image is available yet. Use either reference link below to see photographs.</div>`;
    }

    const localImageButton = detailImage && !descriptionImage
      ? `<button class="link-button local-image-button" type="button" data-action="image-only" data-image="${escapeHtml(detailImage)}" data-name="${escapeHtml(species.name)}">IMAGE</button>`
      : "";

    const notes = [
      species.note,
      species.variable ? "Leaf shape or margin varies, so this tree may appear in more than one pathway." : null,
      species.whorled ? "Leaves may also occur in whorls of three or more at a node." : null
    ].filter(Boolean);

    view.innerHTML = page(
      escapeHtml(species.name),
      "",
      `<article class="species-card">
        ${species.scientific ? `<p class="latin">${escapeHtml(species.scientific)}</p>` : ""}
        <div class="badges">
          ${statusBadge}
          ${categoryNames.map(name => `<span class="badge">${escapeHtml(name)}</span>`).join("")}
          ${nativeRegionNames.map(name => `<span class="badge region-badge">${escapeHtml(name)}</span>`).join("")}
          ${habitatNames.map(name => `<span class="badge habitat-badge">${escapeHtml(name)}</span>`).join("")}
        </div>
        ${gallery}
        ${species.georgia_range ? `<p class="georgia-range"><strong>Georgia range:</strong> ${escapeHtml(species.georgia_range)}</p>` : ""}
        ${notes.map(note => `<p>${escapeHtml(note)}</p>`).join("")}
        <div class="external-links">
          ${localImageButton}
          <a class="link-button" href="${escapeHtml(species.wikipedia)}" target="_blank" rel="noopener noreferrer">Wikipedia</a>
          <a class="link-button search-link" href="${escapeHtml(species.search)}" target="_blank" rel="noopener noreferrer">Image search</a>
        </div>
      </article>`,
      { rawTitle: true }
    );
  }

  function renderImageOnly() {
    view.innerHTML = `
      <section class="image-only-view view-enter" aria-label="${escapeHtml(current.name)} image-only view">
        <img id="fullScreenSpeciesImage" src="${escapeHtml(current.src)}" alt="${escapeHtml(current.name)} identification image">
        <p class="rotate-note">Rotate your phone if another position makes the image larger.</p>
      </section>`;

    const image = document.getElementById("fullScreenSpeciesImage");
    const fitToVisiblePage = () => {
      if (!image.naturalWidth || !image.naturalHeight) return;
      const visibleWidth = document.documentElement.clientWidth;
      const visibleHeight = window.innerHeight;
      const scale = Math.min(visibleWidth / image.naturalWidth, visibleHeight / image.naturalHeight);
      image.style.width = `${Math.floor(image.naturalWidth * scale)}px`;
      image.style.height = `${Math.floor(image.naturalHeight * scale)}px`;
    };
    image.addEventListener("load", fitToVisiblePage, { once: true });
    if (image.complete) fitToVisiblePage();
  }

  function render() {
    setHeader();
    switch (current.type) {
      case "intro": renderIntro(); break;
      case "region": renderRegion(); break;
      case "habitat": renderHabitat(); break;
      case "foliage": renderFoliage(); break;
      case "broad": renderBroad(); break;
      case "branch": renderBranch(); break;
      case "category": renderCategory(); break;
      case "pines": renderPineIndex(); break;
      case "pine-group": renderPineGroup(); break;
      case "oaks": renderOakGuide(); break;
      case "oak-group": renderOakGroup(); break;
      case "evergreen": renderEvergreen(); break;
      case "search": renderSearch(); break;
      case "species": renderSpecies(); break;
      case "image-only": renderImageOnly(); break;
      default: renderFoliage();
    }
    scheduleScrollHint();
  }

  view.addEventListener("click", event => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;

    if (action === "intro-next") {
      if (current.index < introPages.length - 1) navigate({ type: "intro", index: current.index + 1 });
      else navigate({ type: "region" });
    } else if (action === "skip-key") navigate({ type: "region" });
    else if (action === "region") navigate({ type: "region" });
    else if (action === "choose-region") {
      activeRegion = target.dataset.region || "all";
      navigate({ type: "habitat" });
    }
    else if (action === "habitat") navigate({ type: "habitat" });
    else if (action === "choose-habitat") {
      activeHabitat = target.dataset.habitat || "all";
      navigate({ type: "foliage" });
    }
    else if (action === "clear-filters") {
      activeRegion = "all";
      activeHabitat = "all";
      render();
      resetScroll();
    }
    else if (action === "broad") navigate({ type: "broad" });
    else if (action === "branch") navigate({ type: "branch", id: target.dataset.branch });
    else if (action === "category" || action === "special") navigate({ type: "category", id: target.dataset.category });
    else if (action === "pines") navigate({ type: "pines" });
    else if (action === "pine-group") navigate({ type: "pine-group", id: target.dataset.pineGroup });
    else if (action === "oaks") navigate({ type: "oaks" });
    else if (action === "oak-group") navigate({ type: "oak-group", id: target.dataset.oakGroup });
    else if (action === "evergreen") navigate({ type: "evergreen" });
    else if (action === "search") navigate({ type: "search" });
    else if (action === "species") navigate({ type: "species", id: target.dataset.species });
    else if (action === "image-only") navigate({ type: "image-only", src: target.dataset.image, name: target.dataset.name });
  });

  backButton.addEventListener("click", goBack);
  homeButton.addEventListener("click", goHome);
  regionButton.addEventListener("click", () => navigate({ type: "region" }));
  habitatButton.addEventListener("click", () => navigate({ type: "habitat" }));
  skipButton.addEventListener("click", () => navigate({ type: "region" }));
  scrollHint.addEventListener("click", () => {
    window.scrollBy({ top: Math.round(window.innerHeight * 0.72), behavior: "smooth" });
  });
  window.addEventListener("scroll", updateScrollHint, { passive: true });
  window.addEventListener("resize", () => {
    if (current.type === "image-only") renderImageOnly();
    scheduleScrollHint();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && history.length) goBack();
    if (event.key === "ArrowLeft" && history.length && !/input/i.test(document.activeElement?.tagName)) goBack();
    if (event.key === "ArrowRight" && current.type === "intro") {
      if (current.index < introPages.length - 1) navigate({ type: "intro", index: current.index + 1 });
      else navigate({ type: "region" });
    }
  });

  render();
})();

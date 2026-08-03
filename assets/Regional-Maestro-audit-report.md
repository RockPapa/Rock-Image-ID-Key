# Regional Tree ID Maestro — fact-check and optimization audit

Audit date: 2026-08-02

## Scope

- Reviewed all 256 distinct tree and shrub records across 15 key categories.
- Checked scientific names against Kew Plants of the World Online and an automated GBIF backbone comparison.
- Rechecked Georgia-region and site filters against the UGA Extension source list, with conservative manual assignments for planted, naturalized, and Bartram additions.
- Audited all 270 local WebP assets for missing files, duplicate assignments, and reversed description/detail roles.
- Validated the intro, region, site, broadleaf, pine, oak, species, image-only, filter-reset, and deciduous-conifer paths.
- Audited all 255 unique Wikipedia destinations through the MediaWiki API.

## Material corrections

- Corrected Georgia calamint to *Clinopodium carolinianum* and scarlet calamint to *Clinopodium coccineum*.
- Updated fever-tree to *Pinckneya pubens* (syn. *P. bracteata*).
- Updated pyramid magnolia to *Magnolia fraseri* var. *pyramidata* (syn. *M. pyramidata*).
- Updated pond cypress to *Taxodium distichum* var. *imbricarium* (syn. *T. ascendens*).
- Moved mapleleaf viburnum and oakleaf hydrangea to the simple-opposite-lobed pathway.
- Corrected a range-parser error that had treated “scattered throughout the Coastal Plain” as statewide.
- Added explicit Georgia-region assignments for previously unresolved planted, naturalized, and Bartram taxa. Every species now has at least one region and one site assignment.
- Corrected habitat coverage for red maple, poison sumac, loblolly pine, water oak, laurel oak, groundsel bush, both calamints, paulownia, sawtooth oak, chinaberry, paper birch, and gray birch.
- Removed seven false image matches caused by similar common names. No local asset is now assigned to more than one species.
- Clarified that sawtooth oak is placed with red-oak-type choices as a practical bristle-tipped match, not as a North American red oak.

## Usability and navigation improvements

- Added compact Region · Site context to key and species pages.
- Added a “Show all Georgia & all sites” recovery button when filters hide possible matches.
- Added visible Georgia native, naturalized non-native, and planted non-native status badges where source data establishes status.
- Changed the introductory Skip action so it still passes through Region and Site selection.
- Preserved all three deciduous conifers on their comparison page while retaining each species’ regional and site badges.
- Kept the existing scroll-position restoration behavior when returning from a species or image page.

## Automated validation result

- 15 categories
- 256 distinct species
- 269 category placements
- 270 WebP assets
- 0 missing region assignments
- 0 missing site assignments
- 0 reversed image roles
- 0 assets assigned to multiple species
- 0 missing Wikipedia destinations

## Known content gaps

- Buckwheat tree and loblolly bay are the only old-app species for which no matching local description plate or identification plate was found.
- Eastern redbud, persimmon, and blackgum have local identification artwork but no separate local description panel identified by the audit.
- Most later UGA additions intentionally use Wikipedia and image-search links until dedicated artwork is supplied.

## Taxonomy note

Plant taxonomies differ among current backbones. The app retains several names accepted by Kew and familiar in southeastern references even where GBIF reports them as synonyms: *Myrica caroliniensis*, *Myrica inodora*, *Sapindus marginatus*, *Vaccinium elliottii*, *Carya tomentosa*, and *Berberis bealei*. Synonyms are displayed where they materially help users.

## Interpretation note

Region and site selections are identification aids, not strict county-level distribution maps. Multi-region and multi-site assignments are intentionally inclusive for adaptable, planted, naturalized, or imperfectly documented taxa. A tree found outside its usual region or habitat can always be recovered with “Show all Georgia & all sites.”

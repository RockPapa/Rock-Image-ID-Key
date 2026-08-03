require "json"

root = File.expand_path(__dir__)
data = File.read(File.join(root, "data.js"), encoding: "UTF-8")
payload = JSON.parse(data.sub(/\Awindow\.TREE_ID_DATA\s*=\s*/, "").sub(/;\s*\z/, ""))
species = payload.fetch("categories").flat_map { |category| category.fetch("species") }.uniq { |item| item["id"] }

wet_only = /buttonbush|pond cypress|water-elm|corkwood|pond apple|water locust|water tupelo|ogeechee tupelo|swamp cottonwood|florida willow|coastal plain willow|swamp-privet|pinckneya|fever-tree/i
moist_wet = /swamp|river birch|willow|baldcypress|titi|bay$|sweetbay|redbay|dahoon|possumhaw|winterberry|gallberry|inkberry|fetterbush|sweetspire|clethra|pepperbush|alder|water hickory|pumpkin ash|pond pine|loblolly pine|laurel oak|overcup oak|water oak|silver maple|red maple/i
dry_only = /spanish dagger|tree yucca|adam.s needle|beargrass|turkey oak|bluejack oak|sand live oak|sand post oak|scrub post oak|myrtle oak|dwarf sumac|smoketree/i
dry_moist = /pine|post oak|blackjack oak|chestnut oak|scarlet oak|black oak|southern red oak|sassafras|persimmon|sumac|hickory|juniper|redcedar|serviceberry|hawthorn|crabapple|plum|locust|sparkleberry|deerberry|blueberry|palmetto|prickly-ash|hercules/i
moist_only = /fraser fir|red spruce|hemlock|sugar maple|yellow birch|sweet birch|american beech|yellowwood|buckeye|mountain laurel|rhododendron|silverbell|stewartia|witch-hazel|spice-bush|yellow-root|hydrangea|basswood/i

records = {}
species.each do |item|
  text = "#{item.fetch("name")} #{item["scientific"]}".downcase
  habitats = if text.match?(wet_only)
               ["wet"]
             elsif text.match?(moist_wet)
               %w[moist wet]
             elsif text.match?(dry_only)
               ["dry"]
             elsif text.match?(moist_only)
               ["moist"]
             elsif text.match?(dry_moist)
               %w[dry moist]
             else
               %w[dry moist wet]
             end
  records[item.fetch("id")] = habitats
end

# Species-specific refinements override broad common-name rules.
{
  "eastern-white-pine" => %w[dry moist],
  "spruce-pine" => %w[moist wet],
  "longleaf-pine" => %w[dry],
  "slash-pine" => %w[moist wet],
  "pitch-pine" => %w[dry moist],
  "table-mountain-pine" => %w[dry],
  "atlantic-white-cedar" => %w[wet],
  "dawn-redwood" => %w[moist wet],
  "florida-torreya-stinking-cedar" => %w[moist],
  "northern-wild-raisin" => %w[moist wet],
  "hobblebush-witch-hobble" => %w[moist wet],
  "mimosa-silk-tree" => %w[dry moist],
  "buffalo-nut-oil-nut" => %w[moist],
  "shingle-oak" => %w[moist wet],
  "red-tip-photinia" => %w[dry moist],
  "common-crape-myrtle" => %w[dry moist],
  "ginkgo-maidenhair-tree" => %w[dry moist],
  "osage-orange-hedge-apple" => %w[dry moist wet],
  "blackgum" => %w[dry moist wet],
  "red-maple" => %w[dry moist wet],
  "poison-sumac-thunderwood" => %w[wet],
  "loblolly-pine" => %w[dry moist wet],
  "water-oak" => %w[dry moist wet],
  "laurel-oak" => %w[dry moist wet],
  "live-oak" => %w[dry moist],
  "sand-live-oak" => %w[dry],
  "swamp-chestnut-oak" => %w[moist wet],
  "cherrybark-oak" => %w[moist wet],
  "shumard-oak" => %w[moist wet],
  "willow-oak" => %w[moist wet],
  "pin-oak" => %w[moist wet],
  "chapman-oak" => %w[dry],
  "arkansas-oak" => %w[moist],
  "georgia-oak" => %w[dry],
  "oglethorpe-oak" => %w[moist wet],
  "southern-magnolia" => %w[moist],
  "pawpaw" => %w[moist],
  "eastern-redbud" => %w[dry moist],
  "flowering-dogwood" => %w[dry moist],
  "american-sycamore" => %w[moist wet],
  "yellow-poplar-tuliptree" => %w[moist],
  "american-elm" => %w[moist wet],
  "winged-elm" => %w[dry moist],
  "american-holly" => %w[dry moist wet],
  "yaupon-holly" => %w[dry moist wet],
  "southern-wax-myrtle" => %w[moist wet],
  "wax-myrtle" => %w[moist wet],
  "saw-palmetto" => %w[dry moist],
  "needle-palm" => %w[moist wet],
  "dwarf-palmetto-bluestem-palmetto" => %w[moist wet],
  "groundsel-bush" => %w[moist wet],
  "georgia-basil-georgia-calamint" => %w[dry],
  "red-basil-scarlet-calamint" => %w[dry],
  "paulownia-tomentosa" => %w[dry moist],
  "princess-tree-paulownia" => %w[dry moist],
  "sawtooth-oak" => %w[dry moist],
  "chinaberry" => %w[dry moist],
  "paper-birch" => %w[moist],
  "gray-birch" => %w[dry moist],
  "burford-holly" => %w[dry moist],
  "autumn-olive" => %w[dry moist],
  "privets" => %w[dry moist wet],
  "tatarian-honeysuckle-bush-honeysuckle" => %w[dry moist],
  "leatherleaf-mahonia-oregon-grape" => %w[moist],
  "nandina-heavenly-bamboo" => %w[dry moist],
  "bradford-pear-callery-pear" => %w[dry moist]
}.each { |id, habitats| records[id] = habitats if records.key?(id) }

File.write(File.join(root, "species-habitat.json"), JSON.pretty_generate(records) + "\n")
counts = %w[dry moist wet].to_h { |habitat| [habitat, records.count { |_id, values| values.include?(habitat) }] }
puts "Wrote habitat assignments for #{records.length} species: #{counts}."

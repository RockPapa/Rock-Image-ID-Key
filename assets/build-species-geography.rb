require "json"
require "nokogiri"

root = File.expand_path(__dir__)
source = File.join(root, "tmp", "ga-tree-list.html")
abort "Missing #{source}" unless File.exist?(source)

doc = Nokogiri::HTML(File.read(source, encoding: "UTF-8"))
table = doc.at_css("h2#Native_trees").xpath("following::table[1]")

mountain_terms = /mountain|blue ridge|ridge and valley|appalachian|northwest|dade county|walker county|rabun county|habersham county|floyd county|white county|union county|towns county|yonah|pigeon mountain/i
coastal_terms = /coastal plain|coast|island|southwest georgia|decatur county|early county|pulaski county|liberty county/i

records = {}
table.css("tr").drop(1).each do |row|
  cells = row.css("th,td").map { |cell| cell.text.gsub(/\[[^\]]*\]|\s+/, " ").strip }
  next if cells.length < 4
  scientific = cells[1][/([A-Z][a-z-]+\s+(?:×\s*)?[a-z][a-z-]+)/, 1]
  next unless scientific

  range = cells[3]
  regions = []
  if range.match?(/state.?wide|throughout the state/i)
    regions = %w[mountains piedmont coastal-plain]
  else
    regions << "mountains" if range.match?(mountain_terms)
    regions << "piedmont" if range.match?(/piedmont/i)
    regions << "coastal-plain" if range.match?(coastal_terms)
  end

  key = scientific.gsub(/\s+×\s+/, " ").split.first(2).join(" ").downcase
  records[key] = { "regions" => regions.uniq, "range" => range }
end

# Expert corrections for the regional key. These Georgia occurrences are
# confined to the mountains and must not be broadened by coarse range text.
records["picea rubens"] = { "regions" => ["mountains"], "range" => "Mountains; high elevations" }
records["abies fraseri"] = { "regions" => ["mountains"], "range" => "Mountains; highest elevations" }
records["pinus strobus"] = { "regions" => ["mountains"], "range" => "Mountains" }
records["metasequoia glyptostroboides"] = { "regions" => %w[mountains piedmont], "range" => "Planted ornamental: Mountains and Piedmont" }
records["pinckneya pubens"] = { "regions" => %w[coastal-plain], "range" => "Wet areas of the Coastal Plain" }
records["magnolia fraseri var. pyramidata"] = { "regions" => %w[coastal-plain], "range" => "Coastal Plain" }
records["taxodium distichum var. imbricarium"] = { "regions" => %w[coastal-plain], "range" => "Coastal Plain" }
records["viburnum cassinoides"] = { "regions" => ["mountains"], "range" => "Southern Appalachian mountains; primarily high-elevation moist sites" }
records["viburnum lantanoides"] = { "regions" => ["mountains"], "range" => "Southern Appalachian mountains; commonly above about 4,500 feet" }

# Native, planted, and naturalized taxa not resolved by the structured range table.
{
  "maclura pomifera" => [%w[mountains piedmont coastal-plain], "Naturalized statewide"],
  "lagerstroemia indica" => [%w[mountains piedmont coastal-plain], "Commonly planted statewide"],
  "ginkgo biloba" => [%w[mountains piedmont coastal-plain], "Planted statewide"],
  "quercus imbricaria" => [%w[mountains piedmont], "Rare in Georgia; Mountains and northern Piedmont"],
  "photinia × fraseri" => [%w[mountains piedmont coastal-plain], "Commonly planted statewide"],
  "pyrularia pubera" => [%w[mountains piedmont], "Common in the Mountains; also occurs in the northern Piedmont"],
  "albizia julibrissin" => [%w[mountains piedmont coastal-plain], "Naturalized statewide"],
  "paulownia tomentosa" => [%w[mountains piedmont coastal-plain], "Naturalized or planted statewide"],
  "annona glabra" => [%w[coastal-plain], "Coastal Plain"],
  "elliottia racemosa" => [%w[coastal-plain], "Coastal Plain; naturally known from Tattnall County"],
  "persea palustris" => [%w[coastal-plain], "Coastal Plain"],
  "morella cerifera" => [%w[piedmont coastal-plain], "Piedmont and Coastal Plain"],
  "quercus acutissima" => [%w[mountains piedmont coastal-plain], "Naturalized or planted statewide"],
  "morus rubra" => [%w[mountains piedmont coastal-plain], "Statewide"],
  "morus alba" => [%w[mountains piedmont coastal-plain], "Naturalized or planted statewide"],
  "broussonetia papyrifera" => [%w[mountains piedmont coastal-plain], "Naturalized or planted statewide"],
  "betula papyrifera" => [%w[mountains], "Occasionally planted; most suitable in the Mountains"],
  "betula populifolia" => [%w[mountains], "Occasionally planted; most suitable in the Mountains"],
  "populus grandidentata" => [%w[mountains], "Mountains"],
  "quercus palustris" => [%w[mountains piedmont], "Primarily planted in Mountains and Piedmont"],
  "aesculus parviflora" => [%w[coastal-plain], "Southwestern Coastal Plain"],
  "robinia viscosa" => [%w[mountains], "Mountains"],
  "melia azedarach" => [%w[mountains piedmont coastal-plain], "Naturalized statewide"],
  "carya illinoinensis" => [%w[piedmont coastal-plain], "Primarily Piedmont and Coastal Plain; widely planted"],
  "yucca gloriosa" => [%w[coastal-plain], "Coastal Plain"]
}.each do |scientific, (regions, range)|
  records[scientific] = { "regions" => regions, "range" => range }
end

# Broad Georgia-region assignments for the UGA Extension shrub selections.
# Multi-region assignments are intentionally inclusive for a beginner-facing key.
shrub_regions = {
  "calycanthus floridus" => %w[mountains piedmont],
  "callicarpa americana" => %w[piedmont coastal-plain],
  "viburnum dentatum" => %w[mountains piedmont coastal-plain],
  "viburnum cassinoides" => %w[mountains],
  "viburnum lantanoides" => %w[mountains],
  "euonymus atropurpureus" => %w[mountains piedmont],
  "clinopodium carolinianum" => %w[piedmont coastal-plain],
  "viburnum acerifolium" => %w[mountains piedmont],
  "hydrangea quercifolia" => %w[piedmont coastal-plain],
  "clinopodium coccineum" => %w[coastal-plain],
  "euonymus americanus" => %w[mountains piedmont coastal-plain],
  "vaccinium darrowii" => %w[coastal-plain],
  "vaccinium stamineum" => %w[mountains piedmont coastal-plain],
  "agarista populifolia" => %w[piedmont coastal-plain],
  "lyonia lucida" => %w[coastal-plain],
  "vaccinium virgatum" => %w[piedmont coastal-plain],
  "illicium parviflorum" => %w[coastal-plain],
  "lindera benzoin" => %w[mountains piedmont coastal-plain],
  "leucothoe fontanesiana" => %w[mountains piedmont],
  "fothergilla gardenii" => %w[coastal-plain],
  "ilex glabra" => %w[coastal-plain],
  "baccharis halimifolia" => %w[coastal-plain],
  "vaccinium pallidum" => %w[mountains piedmont],
  "zenobia pulverulenta" => %w[coastal-plain],
  "crataegus spathulata" => %w[piedmont coastal-plain],
  "vaccinium elliottii" => %w[piedmont coastal-plain],
  "vaccinium corymbosum" => %w[mountains piedmont coastal-plain],
  "clethra alnifolia" => %w[mountains piedmont coastal-plain],
  "itea virginica" => %w[mountains piedmont coastal-plain],
  "xanthorhiza simplicissima" => %w[mountains piedmont],
  "yucca filamentosa" => %w[piedmont coastal-plain],
  "sabal minor" => %w[coastal-plain],
  "rhapidophyllum hystrix" => %w[coastal-plain],
  "serenoa repens" => %w[coastal-plain]
}
shrub_regions.each do |scientific, regions|
  records[scientific] = { "regions" => regions, "range" => regions.map { |id| id.split("-").map(&:capitalize).join(" ") }.join(", ") }
end

# Common naturalized shrubs. These broad assignments keep them available where
# they are frequently planted or escaped; they are not native-range claims.
{
  "ilex cornuta" => %w[mountains piedmont coastal-plain],
  "elaeagnus umbellata" => %w[mountains piedmont coastal-plain],
  "ligustrum spp." => %w[mountains piedmont coastal-plain],
  "lonicera tatarica" => %w[mountains piedmont],
  "berberis bealei" => %w[mountains piedmont coastal-plain],
  "nandina domestica" => %w[mountains piedmont coastal-plain],
  "pyrus calleryana" => %w[mountains piedmont coastal-plain]
}.each do |scientific, regions|
  records[scientific] = { "regions" => regions, "range" => "Naturalized or commonly planted: #{regions.map { |id| id.split("-").map(&:capitalize).join(" ") }.join(", ")}" }
end

File.write(File.join(root, "species-geography.json"), JSON.pretty_generate(records) + "\n")
puts "Wrote geography for #{records.length} taxa."

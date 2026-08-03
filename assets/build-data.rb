require "json"
require "open3"
require "time"

root = File.expand_path(__dir__)
source_path = File.join(root, "TreeID-characteristic-master-list.md")
assets_path = File.join(root, "assets")
geography_path = File.join(root, "species-geography.json")
geography = File.exist?(geography_path) ? JSON.parse(File.read(geography_path, encoding: "UTF-8")) : {}
habitat_path = File.join(root, "species-habitat.json")
habitats = File.exist?(habitat_path) ? JSON.parse(File.read(habitat_path, encoding: "UTF-8")) : {}

categories = []
wiki_overrides = {
  "Clinopodium carolinianum" => "Clinopodium",
  "Magnolia fraseri var. pyramidata" => "Magnolia_fraseri",
  "Taxodium distichum var. imbricarium" => "Taxodium_ascendens"
}
current = nil
outside = false
stopped = false

File.foreach(source_path, encoding: "UTF-8") do |raw|
  line = raw.strip

  if line.start_with?("# Decisions needed")
    stopped = true
    next
  end
  next if stopped

  if (match = line.match(/^# (\d+)\.\s+(.+)$/))
    outside = false
    current = {
      id: "category-#{match[1]}",
      order: match[1].to_i,
      title: match[2],
      kind: "broadleaf",
      species: []
    }
    categories << current
    next
  end

  if line == "# Trees outside the twelve broadleaf headings"
    outside = true
    current = nil
    next
  end

  if outside && (match = line.match(/^##\s+(.+)$/))
    id = "special-" + match[1].downcase.gsub(/[^a-z0-9]+/, "-").gsub(/^-|-$/, "")
    current = {
      id: id,
      order: 100 + categories.length,
      title: match[1],
      kind: "special",
      species: []
    }
    categories << current
    next
  end

  next unless current && line.start_with?("- ")
  next if line.include?("No consistently lobed species")

  entry = line.sub(/^-\s+/, "")
  name, remainder = entry.split(/\s+—\s+/, 2)
  next unless name && remainder

  scientific = remainder[/\*([^*]+)\*/, 1]&.strip
  source = if remainder.include?("[OLD]") && remainder.include?("[BARTRAM]")
             "Old app + Bartram"
           elsif remainder.include?("[BARTRAM]")
             "Bartram addition"
           elsif remainder.include?("[ADDED]")
             "New addition"
           elsif remainder.include?("[UGA]")
             "UGA native list"
           elsif remainder.include?("[NATURALIZED]")
             "Naturalized non-native"
           else
             "Old app"
           end

  note = remainder.split(/\s+—\s+/, 2)[1]&.strip
  canonical_scientific = scientific.to_s.split(/\s+\(/, 2).first.split(" / ").first.strip
  wiki_term = if wiki_overrides.key?(canonical_scientific)
                wiki_overrides.fetch(canonical_scientific)
              elsif canonical_scientific.match?(/\bspp?\./i)
                canonical_scientific.split.first
              else
                canonical_scientific.empty? ? name : canonical_scientific
              end
  search_term = [name, canonical_scientific, "tree identification"].reject(&:empty?).join(" ")

  current[:species] << {
    id: name.downcase.gsub(/[^a-z0-9]+/, "-").gsub(/^-|-$/, ""),
    name: name,
    scientific: scientific,
    source: source,
    origin_status: if remainder.include?("[NATURALIZED]")
                     "Naturalized non-native"
                   elsif remainder.include?("[PLANTED]")
                     "Planted non-native to Georgia"
                   elsif remainder.include?("[UGA]") || remainder.include?("[NATIVE]")
                     "Georgia native"
                   end,
    variable: entry.include?("†"),
    whorled: entry.include?("‡"),
    note: note,
    wikipedia: "https://en.wikipedia.org/wiki/#{wiki_term.gsub(" ", "_")}",
    search: "https://www.google.com/search?tbm=isch&q=#{search_term.gsub(" ", "+")}",
    category_id: current[:id],
    regions: geography.fetch(canonical_scientific.downcase, {}).fetch("regions", []),
    georgia_range: geography.fetch(canonical_scientific.downcase, {}).fetch("range", ""),
    habitats: habitats.fetch(name.downcase.gsub(/[^a-z0-9]+/, "-").gsub(/^-|-$/, ""), [])
  }
end

assets = Dir.children(assets_path)
  .select { |name| name.downcase.end_with?(".webp") }
  .sort

asset_types = assets.to_h do |name|
  output, status = Open3.capture2("webpinfo", "-summary", File.join(assets_path, name))
  width = output[/Width:\s+(\d+)/, 1].to_i
  height = output[/Height:\s+(\d+)/, 1].to_i
  kind = status.success? && width.positive? && height.positive? && height > width * 1.12 ? "description" : "detail"
  [name, { kind: kind, width: width, height: height }]
end

payload = {
  generated_at: Time.now.utc.iso8601,
  categories: categories,
  assets: assets,
  asset_types: asset_types
}

output = "window.TREE_ID_DATA = #{JSON.pretty_generate(payload)};\n"
File.write(File.join(root, "data.js"), output)

species_count = categories.sum { |category| category[:species].length }
puts "Generated data.js with #{categories.length} categories and #{species_count} category placements."

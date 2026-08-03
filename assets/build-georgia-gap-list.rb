require "json"
require "nokogiri"

root = File.expand_path(__dir__)
data = File.read(File.join(root, "data.js"), encoding: "UTF-8")
app = JSON.parse(data.sub(/\Awindow\.TREE_ID_DATA\s*=\s*/, "").sub(/;\s*\z/, ""))

canonical = ->(name) do
  words = name.to_s.gsub(/[××]/, " ").scan(/[A-Z][a-z-]+|[a-z][a-z-]+/)
  words.first(2).join(" ").downcase
end

present = app.fetch("categories").flat_map { |c| c.fetch("species") }
  .map { |s| canonical.call(s["scientific"].to_s.split(/\s+\(/).first) }.to_h { |n| [n, true] }

tree_doc = Nokogiri::HTML(File.read(File.join(root, "tmp/ga-tree-list.html"), encoding: "UTF-8"))
tree_table = tree_doc.at_css("h2#Native_trees").xpath("following::table[1]")
trees = tree_table.css("tr").drop(1).map do |row|
  cells = row.css("th,td").map { |x| x.text.gsub(/\[[^\]]*\]|\s+/, " ").strip }
  next if cells.length < 3
  scientific = cells[1][/([A-Z][a-z-]+\s+(?:×\s*)?[a-z][a-z-]+)/, 1]
  next unless scientific
  { family: cells[0], scientific: scientific.gsub(/\s+/, " "), common: cells[2], range: cells[3].to_s }
end.compact
missing_trees = trees.reject { |t| present[canonical.call(t[:scientific])] }
native_tree_names = trees.map { |t| canonical.call(t[:scientific]) }.to_h { |n| [n, true] }

uga_doc = Nokogiri::HTML(File.read(File.join(root, "tmp/uga-b987.html"), encoding: "UTF-8"))
shrub_heading = uga_doc.css("h2").find { |h| h.text.strip == "Shrubs" }
shrubs = []
node = shrub_heading&.next_element
while node && !(node.name == "h2" && node.text.strip == "Woody Vines")
  if node.name == "h3"
    text = node.text.gsub(/\s+/, " ").strip
    if text =~ /\A(.+?)\s*\/\s*([A-Z][a-z-]+\s+[a-z][a-z-]+)/
      shrubs << { common: Regexp.last_match(1).strip, scientific: Regexp.last_match(2) }
    end
  end
  node = node.next_element
end
missing_shrubs = shrubs.reject do |s|
  name = canonical.call(s[:scientific])
  present[name] || native_tree_names[name]
end

families = missing_trees.group_by { |t| t[:family] }
out = <<~MD
  # Georgia native trees and shrubs not yet represented in Tree ID Maestro

  Generated #{Time.now.strftime("%B %-d, %Y")} by comparing scientific names, not filenames or common-name variants.

  ## Scope and cautions

  - **Trees and large shrubs:** a structured statewide table of 201 named taxa, checked against the University of Georgia Warnell checklist. Warnell estimates about 268 native trees under its definition and notes unresolved taxonomy—especially hawthorns and basswoods—so the 70 entries below are the **definite, name-matched gaps**, not invented resolutions of disputed taxa.
  - **Shrubs:** the shrub section of UGA Extension publication B987. This is a useful statewide native-landscape selection, **not a complete botanical flora of every small shrub taxon in Georgia**. Woody vines are excluded.
  - A name can appear here when Maestro contains a close relative, synonym, hybrid, or genus-level treatment but not this exact binomial. Those are good candidates for review rather than automatic addition.
  - Chinaberry (*Melia azedarach*) is not on the native lists. It has been added separately to Maestro as a naturalized non-native and labeled accordingly.

  ## Summary

  - #{trees.length} native tree/large-shrub taxa in the statewide source
  - #{missing_trees.length} exact taxa not yet represented in Maestro
  - #{shrubs.length} shrubs in the UGA Extension selection
  - #{missing_shrubs.length} additional shrub taxa not represented in Maestro or already listed in the tree section

  ## Missing native trees and large shrubs

MD

families.sort.each do |family, entries|
  out << "### #{family}\n\n"
  entries.sort_by { |x| x[:common] }.each do |x|
    range = x[:range].empty? ? "" : " — #{x[:range]}"
    out << "- #{x[:common]} — *#{x[:scientific]}*#{range}\n"
  end
  out << "\n"
end

out << "## Missing shrubs from UGA Extension B987\n\n"
missing_shrubs.sort_by { |x| x[:common] }.each do |x|
  out << "- #{x[:common]} — *#{x[:scientific]}*\n"
end

out << <<~MD

  ## Sources

  - [UGA Warnell: Check List for Native Trees in Georgia](https://warnell.uga.edu/sites/default/files/inline-files/Check%20List%20of%20Native%20Trees%20In%20Georgia%20ARBOR-01.pdf)
  - [UGA Extension: Native Plants for Georgia, Part I—Trees, Shrubs and Woody Vines](https://fieldreport.caes.uga.edu/publications/B987/native-plants-for-georgia-part-i-trees-shrubs-and-woody-vines/)

MD


File.write(File.join(root, "Georgia-native-trees-and-shrubs-not-in-Maestro.md"), out)
puts "Wrote #{missing_trees.length} missing tree taxa and #{missing_shrubs.length} missing UGA shrub selections."

gap_path = File.join(__dir__, "Georgia-native-trees-and-shrubs-not-in-Maestro.md")
master_path = File.join(__dir__, "TreeID-characteristic-master-list.md")
gap = File.read(gap_path, encoding: "UTF-8")

tree_section = gap[/## Missing native trees and large shrubs(.*?)## Missing shrubs/m, 1].to_s
shrub_section = gap[/## Missing shrubs.*?(.*?)## Sources/m, 1].to_s
entries = (tree_section + shrub_section).scan(/^- (.+?) — \*([^*]+)\*(?: — (.+))?$/).map do |name, scientific, range|
  { name: name, scientific: scientific, range: range }
end

# These two review rows are already represented by the same biological species.
skip = {
  "Myrica cerifera" => "Wax myrtle is already present as Morella cerifera (also Myrica cerifera).",
  "Rhus copallina" => "Winged sumac is added once under Rhus copallinum."
}

special = {
  "Tsuga" => "Needles or scale-like leaves",
  "Torreya" => "Needles or scale-like leaves",
  "Taxodium" => "Deciduous conifer",
  "Yucca" => "Palm or sword-like evergreen leaves",
  "Sabal" => "Palm or sword-like evergreen leaves",
  "Rhapidophyllum" => "Palm or sword-like evergreen leaves",
  "Serenoa" => "Palm or sword-like evergreen leaves"
}

exact = {
  "Acer nigrum" => 3,
  "Toxicodendron vernix" => 10,
  "Cotinus obovatus" => 4,
  "Aralia spinosa" => 11,
  "Sambucus canadensis" => 8,
  "Cornus drummondii" => 1,
  "Cyrilla racemiflora" => 4,
  "Vaccinium arboreum" => 4,
  "Quercus arkansana" => 5,
  "Quercus myrtifolia" => 4,
  "Quercus geminata" => 4,
  "Aesculus glabra" => 8,
  "Cladrastis kentukea" => 10,
  "Leitneria floridana" => 4,
  "Fraxinus quadrangulata" => 8,
  "Fraxinus profunda" => 8,
  "Forestiera acuminata" => 1,
  "Sorbus americana" => 11,
  "Cephalanthus occidentalis" => 1,
  "Pinckneya bracteata" => 1,
  "Sapindus marginatus" => 10,
  "Callicarpa americana" => 2,
  "Vaccinium darrowii" => 4,
  "Vaccinium stamineum" => 4,
  "Sabal minor" => nil,
  "Lyonia lucida" => 4,
  "Agarista populifolia" => 4,
  "Clinopodium georgianum" => 2,
  "Vaccinium pallidum" => 5,
  "Zenobia pulverulenta" => 5,
  "Vaccinium elliottii" => 5,
  "Hydrangea quercifolia" => 2,
  "Vaccinium virgatum" => 4,
  "Clinopodium coccinea" => 2,
  "Vaccinium corymbosum" => 5,
  "Calycanthus floridus" => 1,
  "Rhus copallinum" => 11,
  "Xanthorhiza simplicissima" => 12
}

genus_category = {
  "Rhus" => 11, "Ilex" => 5, "Viburnum" => 2, "Euonymus" => 2,
  "Clethra" => 5, "Kalmia" => 4, "Rhododendron" => 4, "Lyonia" => 4,
  "Quercus" => 6, "Hamamelis" => 5, "Illicium" => 4, "Carya" => 11,
  "Myrica" => 5, "Prunus" => 5, "Malus" => 5, "Zanthoxylum" => 11,
  "Salix" => 5, "Sideroxylon" => 4, "Styrax" => 5, "Ulmus" => 5,
  "Planera" => 5, "Leucothoe" => 5, "Fothergilla" => 5, "Baccharis" => 5,
  "Crataegus" => 5, "Lindera" => 4, "Itea" => 5
}

by_heading = Hash.new { |hash, key| hash[key] = [] }
entries.each do |entry|
  next if skip.key?(entry[:scientific])
  genus = entry[:scientific].split.first
  heading = special[genus]
  category = exact.key?(entry[:scientific]) ? exact[entry[:scientific]] : genus_category[genus]
  heading ||= category
  abort "No key placement for #{entry.inspect}" unless heading

  note = entry[:range] ? " — Georgia range: #{entry[:range]}" : ""
  by_heading[heading] << "- #{entry[:name]} — *#{entry[:scientific]}* `[UGA]`#{note}"
end

master = File.read(master_path, encoding: "UTF-8")
unless master.include?("[UGA]")
  lines = master.lines
  output = []
  lines.each do |line|
    output << line
    heading = if (match = line.match(/^# (\d+)\./))
                match[1].to_i
              elsif (match = line.match(/^## (Needles or scale-like leaves|Deciduous conifer|Palm or sword-like evergreen leaves)/))
                match[1]
              end
    next unless heading && by_heading[heading]&.any?
    output << "\n" unless output.last.end_with?("\n\n")
    output.concat(by_heading[heading].sort.map { |entry| entry + "\n" })
  end
  File.write(master_path, output.join)
end

puts "Accounted for #{entries.length} review rows: added #{by_heading.values.flatten.length}, merged #{skip.length} duplicates/synonyms."

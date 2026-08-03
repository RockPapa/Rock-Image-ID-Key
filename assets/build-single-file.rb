root = File.expand_path(__dir__)

html = File.read(File.join(root, "index.html"), encoding: "UTF-8")
css = File.read(File.join(root, "styles.css"), encoding: "UTF-8")
data = File.read(File.join(root, "data.js"), encoding: "UTF-8")
app = File.read(File.join(root, "app.js"), encoding: "UTF-8")

html.sub!(%r{\s*<link rel="stylesheet" href="styles\.css">}, "\n  <style>\n#{css}\n  </style>")
html.sub!(%r{\s*<script src="data\.js"></script>}, "\n  <script>\n#{data}\n  </script>")
html.sub!(%r{\s*<script src="app\.js"></script>}, "\n  <script>\n#{app}\n  </script>")

output = File.join(root, "TreeID-Maestro.html")
File.write(output, html)
puts "Created #{output}"

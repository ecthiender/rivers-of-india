#!/bin/bash
# Minify GeoJSON files (.geojson)
set -e

filepath="$1"

if [[ -z "$filepath" ]]; then
  echo "You have to pass a filepath to minify."
  exit 1
fi

target_file="$filepath.minified"

echo "Minifying $filepath .."
cat "$filepath" | jq -c -M > "$target_file"
echo "Done. New file saved as $target_file"

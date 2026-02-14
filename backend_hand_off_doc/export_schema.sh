#!/bin/bash

# Export current collections schema from SQLite database
# Note: PocketBase 0.22.0 doesn't have 'collections export' command
OUTPUT_DIR="migrations"
DATE=$(date +%Y%m%d)
OUTPUT_FILE="${OUTPUT_DIR}/schema_${DATE}.json"

mkdir -p "$OUTPUT_DIR"

echo "Exporting schema to: $OUTPUT_FILE"

# Export collections from SQLite database
sqlite3 pb_data/data.db "SELECT json_object('name', name, 'type', type, 'schema', json(schema), 'listRule', listRule, 'viewRule', viewRule, 'createRule', createRule, 'updateRule', updateRule, 'deleteRule', deleteRule) FROM _collections ORDER BY name;" > /tmp/collections_raw.json

# Format the JSON output
python3 << 'PYEOF' > "$OUTPUT_FILE"
import json

with open('/tmp/collections_raw.json', 'r') as f:
    lines = f.readlines()

collections = []
for line in lines:
    if line.strip():
        collections.append(json.loads(line.strip()))

print(json.dumps(collections, indent=2))
PYEOF

echo "Schema exported successfully!"
echo "File: $OUTPUT_FILE"

# Also update latest
cp "$OUTPUT_FILE" "${OUTPUT_DIR}/schema_latest.json"
echo "Updated: ${OUTPUT_DIR}/schema_latest.json"

# Cleanup
rm -f /tmp/collections_raw.json

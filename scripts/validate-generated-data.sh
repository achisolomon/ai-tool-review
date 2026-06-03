#!/bin/bash
# Post-generation validation script
# Checks that generated data.js uses correct category names from _categories.yaml

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DATA_FILE="${PROJECT_ROOT}/js/data.js"
CATEGORIES_FILE="${PROJECT_ROOT}/data/_tools/_categories.yaml"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

errors=0

echo "Validating generated data..."

# Check that files exist
if [[ ! -f "$DATA_FILE" ]]; then
    echo -e "${RED}ERROR: $DATA_FILE not found${NC}"
    exit 1
fi

if [[ ! -f "$CATEGORIES_FILE" ]]; then
    echo -e "${RED}ERROR: $CATEGORIES_FILE not found${NC}"
    exit 1
fi

# Check for common bad capitalization patterns
# These indicate the fallback capitalize logic was used instead of YAML names
echo "Checking for bad capitalization patterns..."

bad_patterns=(
    '"Ai '      # Should be "AI "
    '"Api '     # Should be "API "
    '"Llm '     # Should be "LLM "
    '"Ml '      # Should be "ML "
    '"Ide"'     # Should be "IDE"
    '"Ides"'    # Should be "IDEs"
    '" Ai"'     # Mid-word "Ai"
    '" Api"'    # Mid-word "Api"
    '" Llm"'    # Mid-word "Llm"
)

for pattern in "${bad_patterns[@]}"; do
    if grep -q "$pattern" "$DATA_FILE"; then
        echo -e "${RED}ERROR: Found bad pattern '$pattern' in $DATA_FILE${NC}"
        grep -n "$pattern" "$DATA_FILE" | head -5
        ((errors++))
    fi
done

# Extract all "name" values from data.js that are category/subcategory names
# (not tool names - those come from markdown frontmatter)
echo "Checking category names match _categories.yaml..."

# Get all unique name values that appear in category context
# Using sed for macOS compatibility (grep -P not available)
category_names=$(grep '"name":' "$DATA_FILE" | sed 's/.*"name": *"\([^"]*\)".*/\1/' | sort -u)

# Get all names from _categories.yaml
yaml_names=$(grep 'name:' "$CATEGORIES_FILE" | sed 's/.*name: *"\([^"]*\)".*/\1/' | sort -u)

# Verify all YAML category names appear correctly in generated output
# This catches cases where YAML names are being ignored
missing_count=0
while IFS= read -r yaml_name; do
    [[ -z "$yaml_name" ]] && continue
    if ! grep -qF "\"$yaml_name\"" "$DATA_FILE"; then
        echo -e "${RED}ERROR: Category name '$yaml_name' from YAML not found in generated data${NC}"
        ((missing_count++))
    fi
done <<< "$yaml_names"

if [[ $missing_count -gt 0 ]]; then
    ((errors += missing_count))
fi

# Final summary
echo ""
if [[ $errors -eq 0 ]]; then
    echo -e "${GREEN}Validation passed! No bad patterns found.${NC}"
    exit 0
else
    echo -e "${RED}Validation failed with $errors error(s).${NC}"
    echo "The generator may be falling back to auto-capitalization instead of using _categories.yaml"
    exit 1
fi

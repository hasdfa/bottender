#!/bin/bash
set -e

# =============================================================================
# Bump versions for @vraksha packages
# =============================================================================
#
# Usage:
#   ./scripts/bump-versions.sh <version>
#
# Example:
#   ./scripts/bump-versions.sh 2.0.0
#   ./scripts/bump-versions.sh 2.0.0-beta.1
#
# =============================================================================

if [ -z "$1" ]; then
    echo "Usage: $0 <version>"
    echo "Example: $0 2.0.0"
    exit 1
fi

VERSION="$1"

echo "================================================"
echo "📦 Bumping all packages to version: $VERSION"
echo "================================================"

# Packages to update
PACKAGES=(
    "packages/bottender-express/package.json"
    "packages/bottender-handlers/package.json"
    "packages/bottender/package.json"
    "packages/bottender-dialogflow/package.json"
    "packages/bottender-facebook/package.json"
    "packages/bottender-luis/package.json"
    "packages/bottender-qna-maker/package.json"
    "packages/bottender-rasa/package.json"
    "packages/create-bottender-app/package.json"
)

for pkg in "${PACKAGES[@]}"; do
    echo "Updating $pkg..."
    # Use node to update JSON properly
    node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('$pkg', 'utf8'));
        pkg.version = '$VERSION';
        fs.writeFileSync('$pkg', JSON.stringify(pkg, null, 2) + '\n');
    "
done

# Also update lerna.json
echo "Updating lerna.json..."
node -e "
    const fs = require('fs');
    const lerna = JSON.parse(fs.readFileSync('lerna.json', 'utf8'));
    lerna.version = '$VERSION';
    fs.writeFileSync('lerna.json', JSON.stringify(lerna, null, 2) + '\n');
"

echo ""
echo "✅ All packages updated to version $VERSION"
echo ""
echo "Current versions:"
grep -h '"version"' packages/*/package.json lerna.json | head -10

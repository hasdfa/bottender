#!/bin/bash
set -e

# =============================================================================
# Publish @vraksha packages to npm
# =============================================================================
#
# Prerequisites:
#   1. npm login to @vraksha scope: npm login --scope=@vraksha
#   2. Ensure @vraksha organization exists on npm
#   3. All changes committed to git
#
# Usage:
#   ./scripts/publish-vraksha.sh [--dry-run]
#
# =============================================================================

DRY_RUN=""
if [ "$1" == "--dry-run" ]; then
    DRY_RUN="--dry-run"
    echo "🔍 DRY RUN MODE - No actual publishing will occur"
fi

echo "================================================"
echo "📦 Publishing @vraksha packages"
echo "================================================"

# Step 1: Verify npm authentication
echo ""
echo "Step 1: Verifying npm authentication..."
if ! npm whoami --scope=@vraksha 2>/dev/null; then
    echo "❌ Not logged in to npm with @vraksha scope"
    echo "   Run: npm login --scope=@vraksha"
    exit 1
fi
echo "✅ Authenticated as: $(npm whoami)"

# Step 2: Clean build
echo ""
echo "Step 2: Clean build..."
pnpm clean
pnpm install
pnpm compile

# Step 3: Run tests
echo ""
echo "Step 3: Running tests..."
pnpm test

# Step 4: Verify git status
echo ""
echo "Step 4: Verifying git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Working directory has uncommitted changes"
    git status --short
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 5: Publish packages
# Order matters: publish dependencies first
echo ""
echo "Step 5: Publishing packages..."

PACKAGES=(
    "packages/bottender-express"      # No deps on other @vraksha packages
    "packages/bottender-handlers"     # No deps on other @vraksha packages
    "packages/bottender"              # Depends on bottender-express
    "packages/bottender-dialogflow"   # Depends on bottender
    "packages/bottender-facebook"     # Depends on bottender
    "packages/bottender-luis"         # Depends on bottender
    "packages/bottender-qna-maker"    # Depends on bottender
    "packages/bottender-rasa"         # Depends on bottender
)

for pkg in "${PACKAGES[@]}"; do
    echo ""
    echo "Publishing $pkg..."
    cd "$pkg"

    # pnpm publish converts workspace:* to actual versions automatically
    pnpm publish --access public --no-git-checks $DRY_RUN

    cd - > /dev/null
done

echo ""
echo "================================================"
echo "✅ All packages published successfully!"
echo "================================================"

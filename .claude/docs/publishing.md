# Publishing

All packages are published under the `@vraksha` npm scope.

## Pre-publish Checklist

1. Create @vraksha npm organization (if not exists)
2. Login: `npm login --scope=@vraksha`
3. Bump versions: `pnpm bump-versions <version>`
4. Commit changes
5. Publish

## Commands

```bash
pnpm bump-versions 2.0.0      # Bump all packages
pnpm publish:vraksha:dry      # Dry run
pnpm publish:vraksha          # Publish
```

The publish script handles dependency order automatically.

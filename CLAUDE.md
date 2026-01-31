# Vraksha Bottender

A framework for building conversational user interfaces, forked from [Bottender](https://github.com/Yoctol/bottender).

## Project Structure

```
packages/
├── bottender/              # @vraksha/bottender - Main framework
├── bottender-express/      # @vraksha/bottender-express - Express server integration
├── bottender-handlers/     # @vraksha/bottender-handlers - Handler utilities
├── bottender-dialogflow/   # @vraksha/bottender-dialogflow - Dialogflow NLU
├── bottender-facebook/     # @vraksha/bottender-facebook - Facebook connector
├── bottender-luis/         # @vraksha/bottender-luis - Microsoft LUIS NLU
├── bottender-qna-maker/    # @vraksha/bottender-qna-maker - QnA Maker NLU
├── bottender-rasa/         # @vraksha/bottender-rasa - Rasa NLU
└── create-bottender-app/   # CLI for scaffolding new projects
```

## Development

### Prerequisites

- Node.js >= 24
- pnpm >= 9

### Setup

```bash
pnpm install  # Installs dependencies and compiles
```

### Commands

```bash
pnpm compile          # Compile TypeScript
pnpm test             # Run linter and tests
pnpm testonly         # Run tests only
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix lint errors
pnpm clean            # Clean build artifacts
```

## Publishing

All packages are published under the `@vraksha` npm scope.

### Pre-publish Checklist

1. **Create @vraksha npm organization** (if not exists)
2. **Login to npm**: `npm login --scope=@vraksha`
3. **Bump versions**: `pnpm bump-versions <version>`
4. **Commit changes**
5. **Publish**

### Publish Commands

```bash
# Bump all packages to a specific version
pnpm bump-versions 2.0.0

# Dry run (test without publishing)
pnpm publish:vraksha:dry

# Actual publish
pnpm publish:vraksha
```

### Publish Order

The publish script handles dependency order automatically:

1. `@vraksha/bottender-express` (no internal deps)
2. `@vraksha/bottender-handlers` (no internal deps)
3. `@vraksha/bottender` (depends on express)
4. NLU packages (depend on bottender)
5. `create-bottender-app`

## Package Migration

Packages were renamed from `@bottender/*` to `@vraksha/bottender-*`:

| Old Name | New Name |
|----------|----------|
| `bottender` | `@vraksha/bottender` |
| `@bottender/express` | `@vraksha/bottender-express` |
| `@bottender/handlers` | `@vraksha/bottender-handlers` |
| `@bottender/dialogflow` | `@vraksha/bottender-dialogflow` |
| `@bottender/facebook` | `@vraksha/bottender-facebook` |
| `@bottender/luis` | `@vraksha/bottender-luis` |
| `@bottender/qna-maker` | `@vraksha/bottender-qna-maker` |
| `@bottender/rasa` | `@vraksha/bottender-rasa` |

**Note:** `@bottender/jfs` is an external dependency and was NOT renamed.

## Workspace Dependencies

Local package dependencies use `workspace:*` protocol. pnpm automatically converts these to actual versions during publish.

## Testing

```bash
pnpm test           # Full test suite (compile + lint + tests)
pnpm testonly       # Jest tests only
pnpm testonly:watch # Jest in watch mode
pnpm testonly:cov   # Jest with coverage
```

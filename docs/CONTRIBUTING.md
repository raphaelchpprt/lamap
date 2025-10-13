# Contributing Guidelines

## Language Policy

### ✅ English (Required)

All **technical** content must be in English:

- **Code comments**
- **Variable/function names**
- **Git commit messages**
- **Documentation for developers**
- **README files**
- **Type definitions**
- **Error messages in logs**

**Example:**
```typescript
// ✅ GOOD: English comments
// Initialize map with default configuration
const map = new mapboxgl.Map({
  center: [2.3522, 46.6034], // Center of France
  zoom: 6,
});

// ❌ BAD: French comments
// Initialiser la carte avec la configuration par défaut
const map = new mapboxgl.Map({
  center: [2.3522, 46.6034], // Centre de la France
  zoom: 6,
});
```

### 🇫🇷 French (User-Facing Only)

French is **only** used for content visible to end users:

- **UI text** (buttons, labels, placeholders)
- **User error messages**
- **Alerts and notifications**
- **Form labels**

**Example:**
```typescript
// ✅ GOOD: English code, French UI
export default function AddButton() {
  const handleClick = () => {
    // Handle button click
    console.log('Button clicked');
  };

  return (
    <Button onClick={handleClick}>
      Ajouter une initiative {/* French UI text */}
    </Button>
  );
}

// User-facing error message in French
if (!name) {
  setError('Le nom est requis'); // French for user
  console.error('Validation error: name is required'); // English for dev
}
```

## Git Commit Messages

### Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

✅ **GOOD:**
```
feat(map): restrict map to metropolitan France

Add geographic bounds to limit map navigation:
- maxBounds: [-5.5, 41.0, 10.0, 51.5]
- minZoom increased from 3 to 5
- Covers all metropolitan France

All tests passing: 112/112 ✅
```

✅ **GOOD:**
```
fix: resolve map display issue with height constraints

The map container had 0px height due to broken CSS cascade.

Fixed by:
- Added h-full to html and body in layout.tsx
- Added flex-1 wrapper around MapView in page.tsx
- Added h-full w-full to Map wrapper

Closes #42
```

❌ **BAD:**
```
feat: ajout de la limitation géographique

J'ai ajouté des bounds pour la France.
```

❌ **BAD:**
```
fix bug
```

### Subject Guidelines

- Use **imperative mood** ("add" not "added" or "adds")
- **No period** at the end
- Maximum **50 characters**
- Start with **lowercase** (after type)

✅ `feat: add user authentication`
❌ `feat: Added user authentication.`
❌ `feat: Adds user authentication`

### Body Guidelines

- Wrap at **72 characters**
- Explain **what** and **why**, not how
- Use bullet points for multiple changes
- Reference issues: `Closes #123`, `Fixes #456`

## Code Comments

### When to Comment

✅ **DO comment:**
- Complex business logic
- Non-obvious algorithms
- Workarounds for bugs
- Public API documentation (JSDoc)
- Configuration constants

❌ **DON'T comment:**
- Obvious code
- What the code does (code should be self-documenting)
- Redundant information

### Examples

✅ **GOOD:**
```typescript
// Geographic bounds for metropolitan France
// Format: [west, south, east, north] (LngLatBoundsLike)
const FRANCE_BOUNDS: [number, number, number, number] = [
  -5.5, // West (Brest)
  41.0, // South (Corsica)
  10.0, // East (Strasbourg)
  51.5, // North (Dunkerque)
];

/**
 * Validates initiative data before submission
 * 
 * @param data - Raw form data
 * @returns Validation result with typed data or errors
 */
export function validateInitiative(data: unknown) {
  // Implementation
}
```

❌ **BAD:**
```typescript
// This variable stores the bounds
const FRANCE_BOUNDS = [-5.5, 41.0, 10.0, 51.5];

// This function validates initiatives
function validateInitiative(data) {
  // Return validation result
  return result;
}
```

## TypeScript

### Naming Conventions

```typescript
// Components: PascalCase
MapContainer.tsx
InitiativeCard.tsx

// Functions/variables: camelCase
getUserInitiatives()
const isVerified = true

// Types/Interfaces: PascalCase
interface Initiative {}
type InitiativeType = ...

// Constants: UPPER_SNAKE_CASE
const MAX_RADIUS_KM = 50
const DEFAULT_MAP_CENTER = [2.3522, 48.8566]

// Files (utilities): kebab-case
format-date.ts
validate-coordinates.ts
```

### Type Documentation

Always document complex types:

```typescript
/**
 * Core initiative type representing a circular economy/ESS organization
 */
export interface Initiative {
  id: string;
  name: string;
  type: InitiativeType;
  /** Optional description (max 500 characters) */
  description?: string;
  /** Geographic location in GeoJSON format */
  location: GeoJSONPoint;
  verified: boolean;
  created_at: string;
}
```

## Testing

### Test File Naming

```
ComponentName.test.tsx       // Unit test
ComponentName.integration.test.tsx  // Integration test
```

### Test Structure

```typescript
describe('ComponentName', () => {
  // Setup
  const mockData = { ... };

  it('should render correctly', () => {
    // Arrange
    // Act
    // Assert
  });

  it('should handle user interaction', async () => {
    // Test implementation
  });
});
```

## Pull Requests

### Title

Same format as commit messages:

```
feat(map): add clustering support
fix: resolve mobile layout issue
```

### Description Template

```markdown
## What

Brief description of changes.

## Why

Why these changes are needed.

## How

Technical approach (if complex).

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing done
- [ ] No console errors

## Screenshots (if UI changes)

Before | After
```

## Questions?

Check the documentation:
- [Architecture Guidelines](./CONTEXT_ENGINEERING_GUIDELINES.md)
- [Learning Context](./LEARNING_CONTEXT.md)
- [Best Practices](./BEST_PRACTICES.md)

---

**Remember:** Code in English, UI in French! 🇬🇧💻🇫🇷

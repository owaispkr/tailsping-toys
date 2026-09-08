---
description: 'Shared code documentation and TypeScript formatting standards'
applyTo: '**/*.{js,mjs,ts,astro}'
---

# Coding Standards

## Comments and documentation

- Comment intent, constraints, and non-obvious decisions: explain **why** the code exists or why an approach was chosen.
- Do not restate mechanics that are already clear from names, types, and control flow.
- Prefer clearer code over comments that compensate for unclear naming or structure.
- Treat outdated comments as bugs. Update or remove them in the same change as the code they describe.
- Use TSDoc/JSDoc for public contracts. Use inline comments only where local reasoning cannot be made self-explanatory.

## TypeScript formatting

TypeScript must use:

- indentation consistent with the surrounding file; use one additional level for nested blocks and `case` clauses;
- single quotes, except when avoiding escapes makes another quote style clearer;
- semicolons;
- trailing commas in multiline arrays, objects, imports, exports, parameters, and calls;
- spaces inside object braces and no spaces inside array brackets.

ESLint enforces the quote, semicolon, comma, and bracket-spacing rules for `.ts` files. Indentation remains a review convention because the existing code uses both two- and four-space styles. Run lint through the `quality-checks` skill after making changes. JavaScript and Astro frontmatter should follow the same conventions where practical, even where generated content or template parsing prevents automatic enforcement.

# Changelog

All notable changes to Novelys are documented here.

## [1.0.0] - 2026-03-09

### Monorepo and foundations

- Initialized the `Novelys` monorepo with a clear separation:
  - `services/api` for the Express + SQLite backend
  - `apps/mobile` for the Expo/React Native mobile app
  - `packages/shared` for shared contracts/types
- Set up workspace tooling with `pnpm` and `turbo`.
- Refactored API/mobile modules to improve long-term maintainability.

### API (backend)

- Added the core Express API with:
  - book search
  - user library (CRUD)
  - reading lists (CRUD + item management)
  - user preferences
  - recent searches
  - reading statistics
- Integrated Drizzle + SQLite for local storage.
- Added server-side normalization for Google Books data.
- Added support for Google Books external ratings (`averageRating`, `ratingsCount`) exposed to mobile.
- Added a database seeder for easier dev/test environments.

### API security

- Protected API access with Bearer token authentication.
- Added mobile configuration for API token usage.
- Improved network error handling and user-facing error messages.

### Mobile - complete reading experience

- Delivered a full mobile reading experience:
  - Library, Search, Lists, Profile, and Book detail screens
  - API-connected navigation and data flows
  - state management through context providers
- Stabilized Android release startup:
  - Metro/Tailwind fixes
  - required Expo/RN dependencies (autolinking, fonts, worklets)
  - startup crash fixes for release builds

### Theme and design system

- Introduced semantic color tokens to unify styling.
- Migrated hardcoded colors to theme/token-based usage.
- Fixed `System` theme mode behavior to avoid Android inconsistencies/crashes.
- Improved visual consistency across core screens.

### Search

- Switched to instant search (removed manual search button).
- Added progressive loading (`Search more`).
- Added swipe action on search cards for quick add to `To read`.
- Cleaned up recent-searches UI (hidden when empty).
- Added a custom confirmation before clearing all recent searches.

### Library and lists

- Added half-star ratings (`0.5` steps) up to `5`.
- Displayed stars on cards where relevant.
- Added library sorting by author/date.
- Added ascending/descending sort order.
- Reworked the filters block to reduce visual clutter.
- Added status selection through a dropdown menu in filters.
- Added swipe actions on cards:
  - left => `Reading`
  - right => `Read`
- UX rule: hide rating section in edit mode unless status is `Read`.

### Recommendations and discovery

- Added personalized recommendations based on:
  - user library
  - user lists
  - derived text seeds (authors/categories/title tokens)
- Added an `Explore` section prioritizing recent books.
- Added a vertical recommendations feed with progressive loading.
- Made recommendations language-aware using user profile preferences.
- Stabilized language behavior to avoid FR/EN switching during loading.

### UI and user feedback

- Added polished empty states (visual + centered copy).
- Added a dedicated custom loading state (book/spinner style) instead of plain text.
- Added custom confirmation dialogs for destructive actions:
  - deleting a book
  - deleting a list
  - clearing recent searches

### Docker and deployment

- Added production Docker setup for `services/api`.
- Added/updated `compose` and multi-stage Dockerfile configuration.
- Fixed non-interactive `pnpm` builds (`CI=true`) for container stability.
- Fixed `node_modules` copy strategy for runtime container execution.

### Release and metadata

- Standardized `package.json` metadata:
  - version `1.0.0`
  - author metadata
- Added MIT license.
- Added/updated READMEs (root + API + mobile + shared), in English.
- Updated mobile assets (icons/splash) with Expo configuration.

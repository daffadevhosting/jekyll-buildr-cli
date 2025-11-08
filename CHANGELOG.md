# Changelog

All notable changes to the `jekyll-buildr-cli` project will be documented in this file.

## [0.2.0] - 2025-11-08

### Added
-   Seamless web-based authentication flow, similar to Vercel CLI and Wrangler CLI.
    -   Users now log in via their web browser, eliminating the need for `.env` files or GitHub OAuth App setup.
-   `generate-post` command: Generate new Jekyll blog posts with AI.
-   `generate-component` command: Generate new Jekyll components (e.g., in `_includes`) with AI.
-   `generate-image` command: Generate images with AI (Pro feature).
-   `isJekyllProject` check: Commands now verify if they are run inside a Jekyll project directory.
-   `saveFile` helper: Centralized function for creating directories and writing files.

### Changed
-   **BREAKING CHANGE:** Authentication mechanism completely overhauled.
    -   Removed reliance on `dotenv` and Firebase client SDK for CLI authentication.
    -   Removed GitHub Device Flow.
-   `create` command: Updated to use the new web-based authentication.
-   `build` command: Now includes a check to ensure it's run within a Jekyll project.
-   Updated `README.md` for npm publication, including installation instructions, prerequisites, and command details.

### Removed
-   `dotenv` dependency.
-   `firebase` client SDK dependency.
-   Hardcoded `GITHUB_OAUTH_CLIENT_ID` and `firebaseConfig` from `src/auth.ts`.

## [0.1.1] - 2025-11-08

### Added
-   `login` command: Initial implementation using GitHub Device Flow and `.env` configuration.
-   `logout` command: To clear local session credentials.
-   Integration of `create` command with `jekyll-buildr.vercel.app/api/ai` endpoint.

### Changed
-   `create` command: Now requires authentication and calls the AI API.

## [0.1.0] - 2025-11-08

### Added
-   Initial project setup for `jekyll-buildr-cli`.
-   Basic `build` command to execute `jekyll build`.
-   Placeholder `create` command.
-   Basic `package.json` and `tsconfig.json` configuration.

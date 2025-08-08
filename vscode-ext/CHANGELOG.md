# Changelog

## [1.1.0] - 2024-08-08

### Security & Compatibility Updates

#### Security Improvements
- Added Content Security Policy (CSP) to webview for enhanced security
- Replaced deprecated `vscode-resource` scheme with modern `asWebviewUri` API
- Added input validation and sanitization for git commands
- Added timeout protection for git operations (30 seconds)
- Improved error handling to prevent information leakage
- Added nonce-based script execution for enhanced XSS protection

#### Compatibility Updates
- Updated VSCode engine requirement from `^1.30.2` to `^1.74.0` (2022 release)
- Replaced deprecated `vscode` npm package with modern `@vscode/test-electron` and `@vscode/test-cli`
- Updated all dependencies to current secure versions:
  - `execa`: `^1.0.0` → `^8.0.1`
  - `typescript`: `^3.3.1` → `^5.3.3`
  - `eslint`: `^5.13.0` → `^8.56.0`
  - `@types/node`: `^10.12.21` → `20.x`
  - `@types/mocha`: `^2.2.42` → `^10.0.6`
  - `cross-env`: `^5.2.0` → `^7.0.3`

#### Technical Improvements
- Modernized test configuration for new VSCode test runner
- Updated JavaScript configuration for better type checking
- Enhanced error handling and user feedback
- Improved git command validation and sanitization
- Added maximum commit limit protection (100 commits max)

#### Bug Fixes
- Fixed message escaping in git commit messages
- Improved handling of empty git repositories
- Better error recovery for failed git operations

### Breaking Changes
- Minimum VSCode version is now 1.74.0 (November 2022)
- Test runner configuration has changed (for extension developers)

### Migration Guide
- No action required for end users
- Extension developers should update their VSCode installation to version 1.74.0 or later
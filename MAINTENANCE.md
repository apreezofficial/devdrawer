# Routine maintenance

Use this checklist for focused dependency updates and release preparation.

## Before changing dependencies

- Review the changed packages and their release notes. Keep dependency changes separate from tool features or visual redesigns.
- Review changes to package scripts and install hooks before running an installation.
- Keep the dependency manifest and lockfile consistent. Avoid unrelated formatting or lockfile churn.
- Use a supported Node.js version for the project's pinned Next.js release.

## Validation in an isolated checkout

The current package scripts provide:

- `npm test` for the Node test suite.
- `npm run check:seo` for SEO checks.
- `npm run build` for the Next.js build.

Run only after reviewing the checkout and dependencies. Record the commands and results in the pull request; listing them here does not mean they have passed.

## Manual smoke checks

- Check smart paste and the command palette with synthetic input.
- Check representative text, JSON, color, image, and encoding tools.
- Check responsive navigation and both supported visual themes.
- Test the optional assistant separately with non-sensitive sample text and test credentials. Confirm the no-provider configuration remains usable.

## Pull request evidence

Describe the reason for the update, the affected packages or behavior, the checks actually completed, and any remaining limitations. Keep API keys and user input out of screenshots, fixtures, and logs.

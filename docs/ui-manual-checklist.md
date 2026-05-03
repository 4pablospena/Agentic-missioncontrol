# UI manual checklist

Quick pass before a release or large UI change. Not automated; run in the browser.

## Layout and sidebar

- Collapse and expand the sidebar; icons and tooltips behave when collapsed.
- Resize the sidebar (if enabled); content panels still scroll correctly (`min-h-0` chain).
- Command palette opens (⌘K / Ctrl+K); internal routes and External resources resolve.

## Breakpoints

- Narrow viewport (~375px): sidebar drawer, primary actions reachable, no horizontal clip on main panels.
- Tablet (~768px): grids reflow (Monitoring, Memory, Tasks) without cramped headers.

## Focus and keyboard

- Tab through login form: logical order, visible focus ring on inputs and primary button.
- Open profile dropdown (sidebar footer): Escape closes; Sign out reachable by keyboard.
- Modal dialogs (e.g. Memory delete): focus trapped or returns sensibly after close.

## Theming

- Toggle light / dark from profile menu: primary contrast readable on buttons and badges (Overview status, login).

## Dense pages

- **Monitoring**: section headings read top-to-bottom; cards don’t visually merge.
- **Memory**: tabs switch without layout jump; long lists scroll inside their region.

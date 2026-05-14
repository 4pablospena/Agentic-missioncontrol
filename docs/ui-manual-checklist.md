# UI manual checklist

Quick pass before a release or large UI change. Not automated; run in the browser.

## Layout and sidebar

- Desktop: primary sidebar stays visible; nav highlights match the current route.
- Mobile (~375px): open the drawer from the top bar menu or the in-page menu control; **Escape** closes it; backdrop tap closes. Optional: use **Saltar al contenido** (skip link) to focus the main region.
- Resize behavior: main content uses `min-h-0` / overflow chains so panels scroll inside the shell.
- **Command palette (⌘K)** is not mounted in this app shell (no `UDashboardSearch`). Use sidebar navigation, in-page search (Memory, Workspace, Logs), and direct URLs for internal routes.

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

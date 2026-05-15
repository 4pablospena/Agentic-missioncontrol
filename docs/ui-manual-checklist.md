# UI manual checklist

Quick pass before a release or large UI change. Not automated; run in the browser.

## Layout and sidebar

- Desktop: sidebar con secciones (Principal, Observabilidad, Herramientas); el ítem activo coincide con la ruta.
- Mobile (~375px): abrir el menú desde la barra superior; **Escape** cierra el drawer; tocar el fondo cierra. Probar **Saltar al contenido**.
- Todas las páginas autenticadas usan `DashboardPageShell` (cabecera retro + cuerpo con scroll).
- Navegación completa sin URL manual: Chat, Monitorización, Registros, Memoria, Programador (+ Workspace/Office/Diagnostics si están activos).
- **Command palette (⌘K)** no existe; usar sidebar, búsquedas en página y URLs directas.

## Breakpoints

- Narrow viewport (~375px): sidebar drawer, primary actions reachable, no horizontal clip on main panels.
- Tablet (~768px): grids reflow (Monitoring, Memory, Tasks) without cramped headers.

## Focus and keyboard

- Tab through login form: logical order, visible focus ring on inputs and primary button.
- Open profile dropdown (sidebar footer): Escape closes; Sign out reachable by keyboard.
- Modal dialogs (e.g. Memory delete): focus trapped or returns sensibly after close.

## Theming

- Toggle light / dark from profile menu: primary contrast readable on buttons and badges (Overview status, login).

## OpenClaw bridge

- **Monitorización** y **Diagnostics**: tarjeta `BridgeConnectionStatus` muestra mock/gateway/error en español; botón Comprobar refresca salud.
- **Inicio**: no debe aparecer banner de bridge (solo onboarding en español).

## Botones y estados vacíos

- Formularios: `RetroButton` con `type="button"` cuando no hay `to`.
- `CommonEmptyState` con CTA `onClick`: el botón es `type="button"`.
- Inicio / Misiones / Agentes: skeletons mientras carga; empty states en español con CTA útiles.

## Dense pages

- **Monitorización**: secciones legibles; tarjeta bridge arriba; cards no se fusionan.
- **Memoria**: pestañas Explorar / Inyectar / Instantáneas sin salto de layout.

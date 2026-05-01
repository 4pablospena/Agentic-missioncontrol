# Frontend Architecture Guidelines — SOLID Principles

> Drop this file in your project root and your AI agent (Claude, Cursor, Windsurf) will follow clean architecture principles by default. SOLID adapted to real frontend: composables, services, views, and components.

> These instructions apply to all frontend work in this project.
> Follow them when generating, refactoring, or reviewing code.
> The goal is a codebase that is scalable, easy to iterate, and safe to hand off to any developer.

> **Framework scope:** Examples use Vue 3 + TypeScript (Composition API). For React, replace `composables` → `hooks`, `defineProps` → prop types, `provide/inject` → Context API. The principles apply equally.

---

## S — Single Responsibility Principle

Every module has one reason to exist and one reason to change.

**Layer separation (enforce strictly):**

- `models/` — data contracts and TypeScript interfaces only. No logic.
- `services/` — API communication only. One service per domain (`BillingAPI`, `AuthAPI`...).
- `composables/` — reactive state and business logic per domain. No direct API calls.
- `views/` — page-level components. Orchestrate composables and pass data down to components. No business logic, no direct API calls.
- `components/` — presentation only. Receive data via props, emit events. No business logic, no direct API calls.
- `utils/` — pure functions only. No side effects, no state.

**Rules:**

- If you need "and" to describe what a module does, split it.
- If a view or component exceeds 400 lines, propose a split before continuing. Also flag any file under 400 lines that has more than one clear responsibility.
- Views integrate composables — they never contain business logic directly.
- Composables delegate data fetching to services — they never call `fetch` directly.

---

## O — Open/Closed Principle

Code should be open for extension and closed for modification.

**Rules:**

- Shared utilities (fetch factories, loggers, formatters) must be configurable via parameters, not modified per use case.
- When adding a new service or API integration, extend existing abstractions — do not fork them.
- New error types must extend the base error class, not add new `catch` branches throughout the codebase.
- Prefer composition over modification: wrap, extend, or configure — don't rewrite.

**Example pattern:**

```ts
// Correct: extend the factory, don't fork it
const useAdminFetch = useCustomFetch("/api/admin");
const usePublicFetch = useCustomFetch("/api/public");
```

---

## L — Liskov Substitution Principle

Subtypes must be substitutable for their base types without breaking the application.

**Rules:**

- If a component wraps a native HTML element (`button`, `input`, `a`...), it must forward all standard HTML attributes using `v-bind="$attrs"`. Consumers should not need to know they are using a wrapper.
- Extended components (`IconButton`, `AdminUserCard`) must be drop-in replacements for their base (`BaseButton`, `UserCard`) without breaking the parent's layout or event expectations.
- Do not throw errors for prop combinations that the base interface claims to support. If a prop is optional in the base, the extended component must also treat it as optional.
- Event signatures must remain consistent: if `BaseInput` emits `update:modelValue`, `SearchInput` must emit the same event with the same payload type.

**Example pattern:**

```vue
<!-- Correct: wrapper forwards all native attributes -->
<template>
  <button v-bind="$attrs" :class="styles" @click="handleClick">
    <slot />
  </button>
</template>

<script setup>
defineOptions({ inheritAttrs: false });
</script>
```

---

## I — Interface Segregation Principle

No module should depend on interfaces it does not use.

**Rules:**

- Each composable exposes only what its domain needs. No god objects.
- Define one TypeScript interface per operation, not one mega-interface for all:
  - `CreateUserPayload`, `UpdateUserPayload`, `DeleteUserPayload` — never `UserPayload` with all optional fields.
- Component props must be strictly typed with `defineProps<{...}>`. Only declare props the component actually uses.
- Avoid passing full objects when only one field is needed. Destructure at the boundary.

**Red flag:** if a composable interface has more than 10 members, review whether it should be split.

---

## D — Dependency Inversion Principle

High-level modules must not depend on low-level implementations.

**Rules:**

- Services never call `fetch` directly — they depend on a configurable fetch abstraction.
- No module reads `import.meta.env` directly — environment variables are consumed through a dedicated config abstraction (`useUrl`, `useConfig`, or similar).
- Composables do not instantiate services internally — services are imported as modules, making them replaceable in tests.
- Prefer `provide/inject` over direct cross-composable imports when composables need to share state.
- `utils/` and `models/` must never import framework-specific code (`ref`, `reactive`, `useState`...). They must be pure TypeScript, framework-agnostic, and independently testable.
- For testability: composables should accept an optional service instance as an argument, allowing easy mocking in Vitest/Jest without network calls.

**Example pattern:**

```ts
// Wrong: direct dependency on implementation
const res = await fetch(`${import.meta.env.VITE_API_URL}/users`);

// Correct: depend on abstraction
const { apiUrl } = useUrl();
const res = await useCustomFetch(apiUrl)("/users");

// For testing: injectable service
export function useUser(userService = defaultUserService) {
  // composable logic using userService
}
```

---

## General Rules for AI Agents

When generating or refactoring code in this project, always:

1. **Check the layer** — is this logic in the right place? (service vs composable vs view vs component)
2. **Check the size** — if a file exceeds 400 lines, propose a split before continuing. Also flag files with multiple responsibilities regardless of size.
3. **Check the types** — `any` is never acceptable. If the type is unknown, create an interface.
4. **Check the interface** — is the module exposing more than it needs to?
5. **Check the dependencies** — is this module depending on a concrete implementation it shouldn't know about?
6. **Check substitutability** — if this component wraps a native element or extends another component, does it forward attributes and maintain event contracts?

When in doubt, ask: _"does this module have exactly one reason to change?"_

---

## Audit Checklist

Run this before marking any refactoring task as done:

- [ ] No view or component exceeds 400 lines
- [ ] No file has more than one clear responsibility, regardless of size
- [ ] No use of `any` in TypeScript
- [ ] No direct `fetch` calls outside service layer
- [ ] No direct `import.meta.env` reads outside config abstraction
- [ ] Each composable interface has a single, well-defined domain
- [ ] All props are strictly typed with `defineProps<{...}>`
- [ ] Components wrapping native elements use `v-bind="$attrs"` and `inheritAttrs: false`
- [ ] Views contain no business logic — orchestration only
- [ ] `utils/` and `models/` contain no framework-specific imports
- [ ] Tests cover critical composables and services

---

# SHACL UI

This package publishes a collection of SHACL UI components for Vue 3. It is based on SHACL 1.0 and DASH and may include elements in the next SHACL version currently under development in the SHACL Working Group.

## Changelog

### 0.3.0

- Add `ResourceShell` component.
- Add `createResourceManager` and `useResourceManagerContext` composables.

### 0.2.x

- Add `Playground` component.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm storybook
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build:lib
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
pnpm test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```

### Testing with local project

Build the library.

```sh
pnpm build:lib
pnpm pack
```

Install the library in the local project. Use an absolute path to the tgz file.

```sh
pnpm add ~/kurrawong/shacl-ui/shacl-ui/kurrawongai-shacl-ui-0.3.0.tgz
```

### Publish

```sh
pnpm publish --access public --no-git-checks
```

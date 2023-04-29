# Explorers Game

## Development

After cloning and running `npm install`, use these commands to get the code running.

### Website

`npx nx run web:serve`

### Servers

#### Real-time server

`npx nx run room-server:serve`

#### API server

`npx nx run api-server:serve`

### Storybooks

#### Component Library Storybook

`npx nx run components:storybook`

## Stack, Patterns, Attribution

- [react-three-fiber](https://github.com/pmndrs/react-three-fiber) for 3D graphics
- miniplex ECS
- [stitches](https://stitches.dev/) for CSS-in-JS
- [radix-ui](https://www.radix-ui.com/) for building design system
- [xstate](https://xstate.js.org/) for state + logic
- static site hosting on netlify
- game server hosting on fly.io
- [nx](https://nx.dev/) for managing the monorepo
- github actions for CI

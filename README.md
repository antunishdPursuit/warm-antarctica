# Warm Antarctica

An interactive map that explains the link between warm water near Antarctic ice shelves, grounded ice loss, the global ocean, and local sea-level effects in New York.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Checks

```bash
npm run lint
npm test
```

`npm test` builds the app and checks the first journey stage, stage order, shared timing, and stable map-callback pattern.

## Development notes

- The map initializes once; active journey stages control camera moves afterward.
- Each story card links to one official source.
- See [Play Journey reliability](docs/play-journey-reliability.md) before changing map or journey state.
- See [MapLibre polar-circle research](docs/maplibre-polar-limit.md) before changing Antarctica rendering.

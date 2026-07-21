# Warm Antarctica

Warm Antarctica is an interactive learning map. It explains one connected
climate story:

1. Relatively warm ocean water can reach Antarctic ice shelves.
2. Ocean heat can thin an ice shelf from below.
3. When grounded ice moves into the ocean, it adds water to the global ocean.
4. That global rise can contribute to local sea-level effects in New York.

The map does **not** show a direct route of Antarctic water to New York. Local
sea level also has several causes.

## Run locally

```bash
npm install
npm run dev
```

Open the local address printed by the command. It is normally
`http://localhost:3000`; it may use another port if that one is busy.

## Test

```bash
npm run lint
npm test
git diff --check
```

`npm test` builds the app and checks the first journey stage, the guided
sequence and shared timing, reduced-motion safeguards, and the Story mode
wheel contract that prevents map zoom from taking over story scrolling.

## Data, sources, and limits

- Each story card links to one primary scientific source.
- The optional Southern Ocean Currents view uses a dated Copernicus Marine
  modeled daily-mean field: July 20, 2026, at 15.81 m depth.
- It uses `GLOBAL_ANALYSISFORECAST_PHY_001_024` and
  `cmems_mod_glo_phy-cur_anfc_0.083deg_P1D-m`. The map credits: “Generated
  using E.U. Copernicus Marine Service Information,” DOI
  [10.48670/moi-00016](https://doi.org/10.48670/moi-00016).
- Current particles are a simplified display of a sampled model field. They
  are not live observations, do not show flow beneath ice shelves, and do not
  show a path to New York.
- The raw NetCDF download remains local and is excluded from Git. Only the
  processed display data is committed.

Read [the dated-current documentation](docs/dated-southern-ocean-currents.md)
for the data workflow and [the MapLibre polar rendering note](docs/maplibre-polar-limit.md)
for the South Pole display limitation.

## How OpenAI tools contributed

### Codex

I used Codex as a collaborative development tool to inspect the codebase,
implement the interactive map and its accessibility behavior, run lint and
test checks, diagnose rendering and Story mode issues, and prepare project
documentation.

### GPT-5.6

I used GPT-5.6 to research the scientific framing, compare technical options,
help write and refine the explanatory content, and suggest implementation and
test approaches. I reviewed the results and made the final product, science,
and design decisions.

## Development notes

- The map initializes once; active journey stages control later camera moves.
- See [Play Journey reliability](docs/play-journey-reliability.md) before
  changing map or journey state.

## License

MIT. See [LICENSE](LICENSE).

# Antarctica polar-circle research

## Finding

The black circle is a MapLibre globe-projection limit with GeoJSON/vector geometry at the South Pole. It is not a bad Antarctica marker or a bad map coordinate in this project.

MapLibre represents vector geometry in Web Mercator tiles. Those tiles do not reach the exact poles. On a globe, complex geometry that crosses a pole can leave a circular gap or render incorrectly. The MapLibre maintainers confirm that arbitrary pole geometry is not currently supported; their issue remains open.

## What we checked

- MapLibre issue [#6072](https://github.com/maplibre/maplibre-gl-js/issues/6072): reports the same pole circle with GeoJSON on a globe. A maintainer explains the Web Mercator tile limit and says the issue has no general built-in fix.
- MapLibre issue [#5433](https://github.com/maplibre/maplibre-gl-js/issues/5433): reports related Antarctica rendering artifacts.
- Stack Overflow search: no matching MapLibre globe/pole solution found.
- Reddit search: Reddit blocked automated access, so it did not provide evidence we can rely on.

## What will not fix it

- Moving the Antarctica marker.
- Changing a few Antarctica coordinates.
- Covering the gap with an HTML marker. That was the earlier moving circle and is not a valid globe layer.
- Updating MapLibre alone. The project uses a newer release than the initial report, and the issue remains open.

## Viable next steps

1. **Recommended:** keep MapLibre for navigation and add a custom WebGL globe layer for the polar cap/Antarctica geometry. This follows the maintainer's suggested workaround and keeps the current interaction model.
2. Switch to a globe engine with native polar geometry support. This is a larger rebuild and needs a new framework decision.
3. Avoid views centered on the exact South Pole. This reduces visibility of the issue but does not solve it.

Do not implement option 1 or 2 without Dennis's approval: each changes the map-rendering approach.

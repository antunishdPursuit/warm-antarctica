# Current and wave mode: data plan

Status: research complete; no live layer added yet.

## Why this is not a quick visual change

The project must not show an invented particle field as measured ocean water.
A source-backed current layer needs actual eastward and northward velocity values,
a date, a depth, and a clear source note. A wave layer needs its own values and
must not be shown as an ocean current.

## Verified sources

### Surface currents

- [NASA OSCAR v2.0](https://data.nasa.gov/dataset/ocean-surface-current-analyses-real-time-oscar-surface-currents-final-0-25-degree-version--dffa2)
- Global 0.25-degree, daily-average current vectors.
- The values represent an assumed well-mixed **top 30 m** of the ocean.
- This is useful for a clearly named surface-current mode only. It must not
  represent comparatively warm Circumpolar Deep Water moving below an Antarctic
  ice shelf.
- The raw NASA grid requires Earthdata access. The app must package a dated
  subset during its build; it should not ask a visitor to sign in.

### Waves

- [NOAA/PacIOOS WAVEWATCH III global model](https://catalog.data.gov/dataset/wavewatch-iii-ww3-global-wave-model)
- The model offers wave height, period, and direction fields on a global grid.
- It is a forecast model, not an observed record and not a current field.
- The source offers public data access, but a production use needs a server-side
  fetch and a dated snapshot so the learning map works when the source is slow
  or unavailable.

## Safe first release

1. Create a small build script that downloads one dated OSCAR surface-current
   subset and one dated WAVEWATCH III wave subset.
2. Convert each into small static vector files stored with the app.
3. Add mode buttons: `Story`, `Surface currents`, and `Waves`.
4. Use separate colours and a short source card for each mode.
5. Disable particle animation when a visitor asks for reduced motion.
6. Keep the warm-water/ice-shelf story as a separate local illustration with
   its existing NASA source. Never join a surface-current particle to New York.

## Data-access decision still needed

To ship actual OSCAR values, the project needs an Earthdata account or a
server-side process that has approved access. Do not put a personal access token
in browser code, the repository, or the deployed site.

Until that access exists, the correct state is to keep the current four-stop
map and source notes unchanged rather than claim a live current layer.

## Checks before release

- Record source, date, grid size, depth, and model/observation status in the UI.
- Verify that a surface-current label appears wherever OSCAR data appear.
- Verify that a wave label appears wherever WAVEWATCH III data appear.
- Check keyboard controls, reduced motion, desktop, and mobile.
- Test that Story mode still works without any data download at page load.

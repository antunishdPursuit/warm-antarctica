# Dated Southern Ocean current view

The optional **Currents** mode shows a single dated, near-surface Southern
Ocean current field. It is separate from the guided learning story.

## Data used

- **Product:** Copernicus Marine Global Ocean Physics Analysis and Forecast
  (`GLOBAL_ANALYSISFORECAST_PHY_001_024`)
- **Dataset:** `cmems_mod_glo_phy-cur_anfc_0.083deg_P1D-m`
- **Date:** July 20, 2026
- **Depth:** 15.81 m
- **Variables:** `uo` (eastward current) and `vo` (northward current), in
  meters per second
- **Area:** 75 degrees south to 50 degrees south, worldwide longitude range

This is a modeled daily-mean field. It is not a direct observation at every
point and it does not represent water moving beneath Antarctic ice shelves.
It must not be read as a route from Antarctica to New York.

## How the browser data is made

The NetCDF download remains local in `outputs/` and is ignored by Git. Run:

```powershell
.\.venv\Scripts\python.exe scripts\prepare_southern_ocean_currents.py
```

The script creates `app/data/southern-ocean-currents.json`. It samples the
original one-twelfth-degree grid to a roughly one-degree display grid, keeping
only valid vectors. The map animates particles along those sampled directions;
the animation speed is deliberately increased so the flow is visible.

## Refreshing the view

1. Sign in with the local Copernicus Marine Toolbox setup described in
   [Copernicus setup](./copernicus-toolbox-setup.md).
2. Download the same area, depth, and variables for a new date into
   `outputs/currents/`.
3. Update `INPUT` and the `date` value in
   `scripts/prepare_southern_ocean_currents.py`.
4. Run the script above.
5. Check the displayed date and depth in Currents mode, then run `npm test`.

## Primary sources

- [Copernicus Marine product description](https://data.marine.copernicus.eu/product/GLOBAL_ANALYSISFORECAST_PHY_001_024/description?option=-&product_id=-&task=results&view=-)
- [Copernicus Marine subset command reference](https://help.marine.copernicus.eu/en/articles/7972861-copernicus-marine-toolbox-cli-subset)

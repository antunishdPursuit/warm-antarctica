"""Reduce one sourced Copernicus current field for the browser prototype."""

from __future__ import annotations

import json
import math
from pathlib import Path

import xarray as xr

INPUT = Path("outputs/currents/southern-ocean-2026-07-20-15m.nc")
OUTPUT = Path("app/data/southern-ocean-currents.json")
STEP = 12  # 1-degree display grid from the original 1/12-degree source grid.


def main() -> None:
    data = xr.open_dataset(INPUT)
    vectors: list[list[float]] = []
    for latitude in data.latitude.values[::STEP]:
        for longitude in data.longitude.values[::STEP]:
            eastward = float(data.uo.sel(latitude=latitude, longitude=longitude, method="nearest").isel(time=0, depth=0))
            northward = float(data.vo.sel(latitude=latitude, longitude=longitude, method="nearest").isel(time=0, depth=0))
            if math.isfinite(eastward) and math.isfinite(northward):
                vectors.append([round(float(longitude), 3), round(float(latitude), 3), round(eastward, 4), round(northward, 4)])
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps({
        "source": "Copernicus Marine Global Ocean Physics Analysis and Forecast (GLOBAL_ANALYSISFORECAST_PHY_001_024)",
        "dataset": "cmems_mod_glo_phy-cur_anfc_0.083deg_P1D-m",
        "date": "2026-07-20",
        "depthMeters": 15.81,
        "units": "m s-1",
        "bounds": [-180, -75, 179.917, -50],
        "samplingDegrees": 1,
        "vectors": vectors,
    }, separators=(",", ":")))
    print(f"Wrote {len(vectors)} vectors to {OUTPUT}")


if __name__ == "__main__":
    main()

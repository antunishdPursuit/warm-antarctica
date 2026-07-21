"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type Map } from "maplibre-gl";
import { feature } from "topojson-client";
import land from "world-atlas/land-50m.json";
import "maplibre-gl/dist/maplibre-gl.css";
import type { ShelfRegion } from "./journey";

export type StopId = "antarctica" | "water" | "ocean" | "newyork";

const views: Record<StopId, maplibregl.FlyToOptions> = {
  antarctica: { center: [0, -63], zoom: 0.85, pitch: 18, bearing: 0, duration: 1800 },
  water: { center: [-104, -72.5], zoom: 3.35, pitch: 48, bearing: -20, duration: 1800 },
  ocean: { center: [-28, -42], zoom: 1.15, pitch: 12, bearing: 0, duration: 1800 },
  newyork: { center: [-74.0, 40.7], zoom: 4.25, pitch: 50, bearing: -18, duration: 1800 },
};

const bellingshausenWaterView: maplibregl.FlyToOptions = { center: [-72, -72], zoom: 3.15, pitch: 46, bearing: 18, duration: 1800 };

const hotspots = [
  { id: "antarctica", coordinates: [0, -78] },
  { id: "water", coordinates: [-104, -72.5] },
  { id: "ocean", coordinates: [-28, -42] },
  { id: "newyork", coordinates: [-74.0, 40.7] },
];

const amundsenPaths = [
  [[-136, -65], [-126, -67], [-116, -69], [-106, -72], [-101, -75]],
  [[-131, -66], [-122, -68], [-113, -70], [-104, -72.5], [-101, -75]],
  [[-127, -67], [-119, -69], [-111, -71], [-105, -73], [-101, -75]],
] as [number, number][][];

const bellingshausenPaths = [
  [[-95, -65], [-88, -67], [-81, -69], [-75, -71], [-70, -73]],
  [[-91, -66], [-84, -68], [-78, -70], [-73, -72], [-70, -73]],
  [[-87, -67], [-82, -69], [-76, -71], [-72, -72.5], [-70, -73]],
] as [number, number][][];

const regionalWaterPoints: Record<ShelfRegion, [number, number]> = {
  amundsen: [-104, -72.5],
  bellingshausen: [-72, -72],
};

const regionalShelfPoints: Record<ShelfRegion, [number, number]> = {
  amundsen: [-101, -75],
  bellingshausen: [-70, -73],
};

function pointAlongPath(path: [number, number][], progress: number): [number, number] {
  const scaled = progress * (path.length - 1);
  const start = path[Math.floor(scaled)] ?? path[0];
  const end = path[Math.min(Math.ceil(scaled), path.length - 1)] ?? start;
  const amount = scaled - Math.floor(scaled);
  return [start[0] + (end[0] - start[0]) * amount, start[1] + (end[1] - start[1]) * amount];
}

function particleFeatures(paths: [number, number][][], progress: number) {
  return {
    type: "FeatureCollection" as const,
    features: paths.flatMap((path, pathIndex) => [0, 0.45].map((offset) => ({
      type: "Feature" as const,
      properties: {},
      geometry: { type: "Point" as const, coordinates: pointAlongPath(path, (progress + offset + pathIndex * 0.12) % 1) },
    }))),
  };
}

function setStageVisuals(instance: Map, active: StopId, region: ShelfRegion) {
  const showLocalFlow = active === "water" || active === "antarctica";
  const showAmundsen = showLocalFlow && region === "amundsen";
  const showBellingshausen = showLocalFlow && region === "bellingshausen";
  instance.setLayoutProperty("amundsen-flow-line", "visibility", showAmundsen ? "visible" : "none");
  instance.setLayoutProperty("amundsen-flow-glow", "visibility", showAmundsen ? "visible" : "none");
  instance.setLayoutProperty("amundsen-particle-glow", "visibility", showAmundsen ? "visible" : "none");
  instance.setLayoutProperty("amundsen-particle-core", "visibility", showAmundsen ? "visible" : "none");
  instance.setLayoutProperty("bellingshausen-flow-line", "visibility", showBellingshausen ? "visible" : "none");
  instance.setLayoutProperty("bellingshausen-flow-glow", "visibility", showBellingshausen ? "visible" : "none");
  instance.setLayoutProperty("bellingshausen-particle-glow", "visibility", showBellingshausen ? "visible" : "none");
  instance.setLayoutProperty("bellingshausen-particle-core", "visibility", showBellingshausen ? "visible" : "none");
  instance.setLayoutProperty("ice-shelf-heat-halo", "visibility", active === "antarctica" ? "visible" : "none");
  instance.setLayoutProperty("global-ocean-band-glow", "visibility", active === "ocean" ? "visible" : "none");
  instance.setLayoutProperty("global-ocean-band-core", "visibility", active === "ocean" ? "visible" : "none");
  instance.setLayoutProperty("new-york-water-glow", "visibility", active === "newyork" ? "visible" : "none");
  instance.setLayoutProperty("new-york-water-line", "visibility", active === "newyork" ? "visible" : "none");
}

export function InteractiveMap({ active, region, onSelect }: { active: StopId; region: ShelfRegion; onSelect: (id: StopId) => void }) {
  const node = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const onSelectRef = useRef(onSelect);
  const activeRef = useRef(active);
  const regionRef = useRef(region);
  const reducedMotion = useRef(false);

  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { activeRef.current = active; }, [active]);
  useEffect(() => { regionRef.current = region; }, [region]);

  useEffect(() => {
    if (!node.current || map.current) return;
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const instance = new maplibregl.Map({
      container: node.current,
      style: { version: 8, sources: {}, layers: [{ id: "ocean", type: "background", paint: { "background-color": "#061b2b" } }] },
      center: [0, -55],
      zoom: 1.2,
      pitch: 16,
      attributionControl: false,
    });
    map.current = instance;
    instance.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");
    instance.on("load", () => {
      instance.setProjection({ type: "globe" });
      const landFeature = feature(land as never, (land as { objects: { land: never } }).objects.land);
      instance.addSource("land", { type: "geojson", data: landFeature });
      instance.addLayer({ id: "land-fill", type: "fill", source: "land", paint: { "fill-color": "#8fc8d5", "fill-opacity": 0.72 } });
      instance.addLayer({ id: "land-line", type: "line", source: "land", paint: { "line-color": "#d5fbff", "line-opacity": 0.38, "line-width": 0.7 } });
      instance.addSource("hotspots", { type: "geojson", data: { type: "FeatureCollection", features: hotspots.map((point) => ({ type: "Feature", properties: { id: point.id }, geometry: { type: "Point", coordinates: point.id === "water" ? regionalWaterPoints[regionRef.current] : point.coordinates } })) } });
      instance.addLayer({ id: "hotspot-halo", type: "circle", source: "hotspots", paint: { "circle-radius": 15, "circle-color": "#7de6f4", "circle-opacity": 0.12, "circle-stroke-color": "#baf9ff", "circle-stroke-width": 1 } });
      instance.addLayer({ id: "hotspot-core", type: "circle", source: "hotspots", paint: { "circle-radius": 4.5, "circle-color": "#efffff", "circle-stroke-color": "#42c6df", "circle-stroke-width": 2 } });
      instance.addSource("global-ocean-bands", { type: "geojson", data: { type: "FeatureCollection", features: [
        { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[-170,-55],[-130,-53],[-90,-55],[-50,-52],[-10,-54],[30,-52],[70,-55],[110,-53],[150,-55]] } },
        { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[-170,-61],[-130,-59],[-90,-61],[-50,-58],[-10,-60],[30,-58],[70,-61],[110,-59],[150,-61]] } },
        { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[-170,-67],[-130,-65],[-90,-67],[-50,-64],[-10,-66],[30,-64],[70,-67],[110,-65],[150,-67]] } },
      ] } });
      instance.addLayer({ id: "global-ocean-band-glow", type: "line", source: "global-ocean-bands", layout: { visibility: "none" }, paint: { "line-color": "#5de0f4", "line-opacity": 0.24, "line-width": 15, "line-blur": 8 } });
      instance.addLayer({ id: "global-ocean-band-core", type: "line", source: "global-ocean-bands", layout: { visibility: "none" }, paint: { "line-color": "#9af5ff", "line-opacity": 0.62, "line-width": 2.2, "line-blur": 1 } });
      instance.addSource("amundsen-flow", { type: "geojson", data: { type: "FeatureCollection", features: amundsenPaths.map((coordinates) => ({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates } })) } });
      instance.addLayer({ id: "amundsen-flow-glow", type: "line", source: "amundsen-flow", layout: { visibility: "none" }, paint: { "line-color": "#ffb85e", "line-opacity": 0.34, "line-width": 7, "line-blur": 3 } });
      instance.addLayer({ id: "amundsen-flow-line", type: "line", source: "amundsen-flow", layout: { visibility: "none" }, paint: { "line-color": "#ffd28c", "line-opacity": 0.9, "line-width": 2.5, "line-dasharray": [1, 1.4] } });
      // These particles explain the sourced local path; they are not live current measurements.
      instance.addSource("amundsen-particles", { type: "geojson", data: particleFeatures(amundsenPaths, 0) });
      instance.addLayer({ id: "amundsen-particle-glow", type: "circle", source: "amundsen-particles", layout: { visibility: "none" }, paint: { "circle-radius": 10, "circle-color": "#ffb85e", "circle-opacity": 0.38, "circle-blur": 0.7 } });
      instance.addLayer({ id: "amundsen-particle-core", type: "circle", source: "amundsen-particles", layout: { visibility: "none" }, paint: { "circle-radius": 2.8, "circle-color": "#fff0c8", "circle-stroke-color": "#ffbd61", "circle-stroke-width": 1, "circle-opacity": 1 } });
      instance.addSource("bellingshausen-flow", { type: "geojson", data: { type: "FeatureCollection", features: bellingshausenPaths.map((coordinates) => ({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates } })) } });
      instance.addLayer({ id: "bellingshausen-flow-glow", type: "line", source: "bellingshausen-flow", layout: { visibility: "none" }, paint: { "line-color": "#d9935a", "line-opacity": 0.34, "line-width": 7, "line-blur": 3 } });
      instance.addLayer({ id: "bellingshausen-flow-line", type: "line", source: "bellingshausen-flow", layout: { visibility: "none" }, paint: { "line-color": "#ffe0ad", "line-opacity": 0.9, "line-width": 2.5, "line-dasharray": [1, 1.4] } });
      // This is a local explanatory path for George VI Ice Shelf, not a measured parcel track.
      instance.addSource("bellingshausen-particles", { type: "geojson", data: particleFeatures(bellingshausenPaths, 0) });
      instance.addLayer({ id: "bellingshausen-particle-glow", type: "circle", source: "bellingshausen-particles", layout: { visibility: "none" }, paint: { "circle-radius": 10, "circle-color": "#d9935a", "circle-opacity": 0.38, "circle-blur": 0.7 } });
      instance.addLayer({ id: "bellingshausen-particle-core", type: "circle", source: "bellingshausen-particles", layout: { visibility: "none" }, paint: { "circle-radius": 2.8, "circle-color": "#fff0d5", "circle-stroke-color": "#eab477", "circle-stroke-width": 1, "circle-opacity": 1 } });
      instance.addSource("ice-shelf-heat", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: regionalShelfPoints[regionRef.current] } } });
      instance.addLayer({ id: "ice-shelf-heat-halo", type: "circle", source: "ice-shelf-heat", layout: { visibility: "none" }, paint: { "circle-radius": 20, "circle-color": "#ffb35e", "circle-opacity": 0.72, "circle-stroke-color": "#ffe0a8", "circle-stroke-width": 1 } });
      // These lines are a visual cue for local sea-level exposure, not a flood boundary or forecast.
      instance.addSource("new-york-water-cue", { type: "geojson", data: { type: "FeatureCollection", features: [
        { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[-86, 29], [-82, 33], [-78, 37], [-74, 40.7], [-69, 44]] } },
        { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[-84, 28], [-80, 32], [-76, 36], [-72.5, 39.7], [-67.5, 43]] } },
        { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[-82, 27], [-78, 31], [-74.5, 35], [-71, 38.8], [-66, 42]] } },
      ] } });
      instance.addLayer({ id: "new-york-water-glow", type: "line", source: "new-york-water-cue", layout: { visibility: "none" }, paint: { "line-color": "#62ddec", "line-opacity": 0.28, "line-width": 11, "line-blur": 6 } });
      instance.addLayer({ id: "new-york-water-line", type: "line", source: "new-york-water-cue", layout: { visibility: "none" }, paint: { "line-color": "#c4fbff", "line-opacity": 0.88, "line-width": 2.1 } });
      instance.on("click", "hotspot-core", (event) => { const id = event.features?.[0]?.properties?.id as StopId | undefined; if (id) onSelectRef.current(id); });
      instance.on("mouseenter", "hotspot-core", () => { instance.getCanvas().style.cursor = "pointer"; });
      instance.on("mouseleave", "hotspot-core", () => { instance.getCanvas().style.cursor = ""; });
      setStageVisuals(instance, activeRef.current, regionRef.current);
      instance.flyTo({ ...views.water, duration: reducedMotion.current ? 0 : views.water.duration });
    });
    let particleProgress = 0;
    const particleTimer = reducedMotion.current ? undefined : window.setInterval(() => {
      if (activeRef.current !== "water" && activeRef.current !== "antarctica") return;
      particleProgress = (particleProgress + 0.018) % 1;
      const currentRegion = regionRef.current;
      const source = instance.getSource(`${currentRegion}-particles`) as maplibregl.GeoJSONSource | undefined;
      source?.setData(particleFeatures(currentRegion === "amundsen" ? amundsenPaths : bellingshausenPaths, particleProgress));
    }, 80);
    return () => { if (particleTimer) window.clearInterval(particleTimer); instance.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    if (!map.current?.isStyleLoaded()) return;
    const view = active === "water" && region === "bellingshausen" ? bellingshausenWaterView : views[active];
    map.current.flyTo({ ...view, duration: reducedMotion.current ? 0 : view.duration });
    const hotspotSource = map.current.getSource("hotspots") as maplibregl.GeoJSONSource | undefined;
    hotspotSource?.setData({ type: "FeatureCollection", features: hotspots.map((point) => ({ type: "Feature", properties: { id: point.id }, geometry: { type: "Point", coordinates: point.id === "water" ? regionalWaterPoints[region] : point.coordinates } })) });
    const heatSource = map.current.getSource("ice-shelf-heat") as maplibregl.GeoJSONSource | undefined;
    heatSource?.setData({ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: regionalShelfPoints[region] } });
    setStageVisuals(map.current, active, region);
  }, [active, region]);
  return <div className="map-canvas" ref={node} aria-label="Interactive globe map with Antarctica, Southern Ocean, Atlantic, and New York hotspots" />;
}

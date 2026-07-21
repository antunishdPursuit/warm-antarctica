"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type Map } from "maplibre-gl";
import { feature } from "topojson-client";
import land from "world-atlas/land-50m.json";
import "maplibre-gl/dist/maplibre-gl.css";

export type StopId = "antarctica" | "water" | "ocean" | "newyork";

const views: Record<StopId, maplibregl.FlyToOptions> = {
  antarctica: { center: [0, -63], zoom: 0.85, pitch: 18, bearing: 0, duration: 1800 },
  water: { center: [-104, -72.5], zoom: 3.35, pitch: 48, bearing: -20, duration: 1800 },
  ocean: { center: [-28, -42], zoom: 1.15, pitch: 12, bearing: 0, duration: 1800 },
  newyork: { center: [-74.0, 40.7], zoom: 4.25, pitch: 50, bearing: -18, duration: 1800 },
};

const hotspots = [
  { id: "antarctica", coordinates: [0, -78] },
  { id: "water", coordinates: [-104, -72.5] },
  { id: "ocean", coordinates: [-28, -42] },
  { id: "newyork", coordinates: [-74.0, 40.7] },
];

export function InteractiveMap({ active, onSelect }: { active: StopId; onSelect: (id: StopId) => void }) {
  const node = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const onSelectRef = useRef(onSelect);
  const reducedMotion = useRef(false);

  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

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
      instance.addSource("hotspots", { type: "geojson", data: { type: "FeatureCollection", features: hotspots.map((point) => ({ type: "Feature", properties: { id: point.id }, geometry: { type: "Point", coordinates: point.coordinates } })) } });
      instance.addLayer({ id: "hotspot-halo", type: "circle", source: "hotspots", paint: { "circle-radius": 15, "circle-color": "#7de6f4", "circle-opacity": 0.12, "circle-stroke-color": "#baf9ff", "circle-stroke-width": 1 } });
      instance.addLayer({ id: "hotspot-core", type: "circle", source: "hotspots", paint: { "circle-radius": 4.5, "circle-color": "#efffff", "circle-stroke-color": "#42c6df", "circle-stroke-width": 2 } });
      instance.addSource("global-ocean-bands", { type: "geojson", data: { type: "FeatureCollection", features: [
        { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[-170,-55],[-130,-53],[-90,-55],[-50,-52],[-10,-54],[30,-52],[70,-55],[110,-53],[150,-55]] } },
        { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[-170,-61],[-130,-59],[-90,-61],[-50,-58],[-10,-60],[30,-58],[70,-61],[110,-59],[150,-61]] } },
        { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[-170,-67],[-130,-65],[-90,-67],[-50,-64],[-10,-66],[30,-64],[70,-67],[110,-65],[150,-67]] } },
      ] } });
      instance.addLayer({ id: "global-ocean-band-glow", type: "line", source: "global-ocean-bands", paint: { "line-color": "#5de0f4", "line-opacity": 0, "line-width": 15, "line-blur": 8 } });
      instance.addLayer({ id: "global-ocean-band-core", type: "line", source: "global-ocean-bands", paint: { "line-color": "#9af5ff", "line-opacity": 0, "line-width": 2.2, "line-blur": 1 } });
      instance.addSource("amundsen-flow", { type: "geojson", data: { type: "FeatureCollection", features: [
        { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[-136,-65],[-126,-67],[-116,-69],[-106,-72],[-101,-75]] } },
        { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[-131,-66],[-122,-68],[-113,-70],[-104,-72.5],[-101,-75]] } },
        { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[-127,-67],[-119,-69],[-111,-71],[-105,-73],[-101,-75]] } },
      ] } });
      instance.addLayer({ id: "amundsen-flow-glow", type: "line", source: "amundsen-flow", paint: { "line-color": "#ffb85e", "line-opacity": 0.34, "line-width": 7, "line-blur": 3 } });
      instance.addLayer({ id: "amundsen-flow-line", type: "line", source: "amundsen-flow", paint: { "line-color": "#ffd28c", "line-opacity": 0.9, "line-width": 2.5, "line-dasharray": [1, 1.4] } });
      instance.addSource("ice-shelf-heat", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [-101, -75] } } });
      instance.addLayer({ id: "ice-shelf-heat-halo", type: "circle", source: "ice-shelf-heat", paint: { "circle-radius": 20, "circle-color": "#ffb35e", "circle-opacity": 0, "circle-stroke-color": "#ffe0a8", "circle-stroke-width": 1 } });
      // These lines are a visual cue for local sea-level exposure, not a flood boundary or forecast.
      instance.addSource("new-york-water-cue", { type: "geojson", data: { type: "FeatureCollection", features: [
        { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[-86, 29], [-82, 33], [-78, 37], [-74, 40.7], [-69, 44]] } },
        { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[-84, 28], [-80, 32], [-76, 36], [-72.5, 39.7], [-67.5, 43]] } },
        { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[-82, 27], [-78, 31], [-74.5, 35], [-71, 38.8], [-66, 42]] } },
      ] } });
      instance.addLayer({ id: "new-york-water-glow", type: "line", source: "new-york-water-cue", paint: { "line-color": "#62ddec", "line-opacity": 0, "line-width": 11, "line-blur": 6 } });
      instance.addLayer({ id: "new-york-water-line", type: "line", source: "new-york-water-cue", paint: { "line-color": "#c4fbff", "line-opacity": 0, "line-width": 2.1 } });
      instance.on("click", "hotspot-core", (event) => { const id = event.features?.[0]?.properties?.id as StopId | undefined; if (id) onSelectRef.current(id); });
      instance.on("mouseenter", "hotspot-core", () => { instance.getCanvas().style.cursor = "pointer"; });
      instance.on("mouseleave", "hotspot-core", () => { instance.getCanvas().style.cursor = ""; });
      instance.flyTo({ ...views.water, duration: reducedMotion.current ? 0 : views.water.duration });
    });
    return () => { instance.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    if (!map.current?.isStyleLoaded()) return;
    map.current.flyTo({ ...views[active], duration: reducedMotion.current ? 0 : views[active].duration });
    map.current.setPaintProperty("amundsen-flow-line", "line-opacity", active === "water" || active === "antarctica" ? 0.9 : 0);
    map.current.setPaintProperty("amundsen-flow-glow", "line-opacity", active === "water" || active === "antarctica" ? 0.34 : 0);
    map.current.setPaintProperty("ice-shelf-heat-halo", "circle-opacity", active === "antarctica" ? 0.72 : 0);
    map.current.setPaintProperty("global-ocean-band-glow", "line-opacity", active === "ocean" ? 0.24 : 0);
    map.current.setPaintProperty("global-ocean-band-core", "line-opacity", active === "ocean" ? 0.62 : 0);
    map.current.setPaintProperty("new-york-water-glow", "line-opacity", active === "newyork" ? 0.28 : 0);
    map.current.setPaintProperty("new-york-water-line", "line-opacity", active === "newyork" ? 0.88 : 0);
  }, [active]);
  return <div className="map-canvas" ref={node} aria-label="Interactive globe map with Antarctica, Southern Ocean, Atlantic, and New York hotspots" />;
}

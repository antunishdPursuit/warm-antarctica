"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type Map } from "maplibre-gl";
import { feature } from "topojson-client";
import land from "world-atlas/land-110m.json";
import "maplibre-gl/dist/maplibre-gl.css";

export type StopId = "antarctica" | "water" | "ocean" | "newyork";

const views: Record<StopId, maplibregl.FlyToOptions> = {
  antarctica: { center: [0, -78], zoom: 1.4, pitch: 35, bearing: 0, duration: 1800 },
  water: { center: [-112, -75], zoom: 3.1, pitch: 52, bearing: -24, duration: 1800 },
  ocean: { center: [-28, -42], zoom: 1.15, pitch: 12, bearing: 0, duration: 1800 },
  newyork: { center: [-74.0, 40.7], zoom: 4.25, pitch: 50, bearing: -18, duration: 1800 },
};

const hotspots = [
  { id: "antarctica", coordinates: [0, -78] },
  { id: "water", coordinates: [-112, -75] },
  { id: "ocean", coordinates: [-28, -42] },
  { id: "newyork", coordinates: [-74.0, 40.7] },
];

export function InteractiveMap({ active, onSelect }: { active: StopId; onSelect: (id: StopId) => void }) {
  const node = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);

  useEffect(() => {
    if (!node.current || map.current) return;
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
      instance.addSource("southern-ocean", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[-170,-61],[-130,-59],[-90,-61],[-50,-58],[-10,-60],[30,-58],[70,-61],[110,-59],[150,-61]] } } });
      instance.addLayer({ id: "southern-ocean-flow", type: "line", source: "southern-ocean", paint: { "line-color": "#53d9ef", "line-opacity": 0.78, "line-width": 2.4, "line-dasharray": [1, 2] } });
      instance.on("click", "hotspot-core", (event) => { const id = event.features?.[0]?.properties?.id as StopId | undefined; if (id) onSelect(id); });
      instance.on("mouseenter", "hotspot-core", () => { instance.getCanvas().style.cursor = "pointer"; });
      instance.on("mouseleave", "hotspot-core", () => { instance.getCanvas().style.cursor = ""; });
    });
    return () => { instance.remove(); map.current = null; };
  }, [onSelect]);

  useEffect(() => { if (map.current?.isStyleLoaded()) map.current.flyTo(views[active]); }, [active]);
  return <div className="map-canvas" ref={node} aria-label="Interactive globe map with Antarctica, Southern Ocean, Atlantic, and New York hotspots" />;
}

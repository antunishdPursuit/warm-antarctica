"use client";
import { useEffect, useState } from "react";
import { InteractiveMap, type StopId } from "./InteractiveMap";

const stops: { id: StopId; step: string; label: string; title: string; text: string; source: string }[] = [
  { id: "antarctica", step: "01", label: "Antarctica", title: "Ice shelves hold back land ice.", text: "Start with the continent and the floating shelves around its edge. Their loss can let more grounded ice behind them move toward the ocean.", source: "NASA: ice shelves and sea-level rise" },
  { id: "water", step: "02", label: "Warm water", title: "Ocean heat can thin ice shelves from below.", text: "This is a local Antarctic process. The warm-water view explains change near the shelf; it is not a route from Antarctica to New York.", source: "NASA Sea Level Change" },
  { id: "ocean", step: "03", label: "Global ocean", title: "Added land ice changes the global ocean.", text: "When grounded land ice enters the sea, it adds water to the global ocean. The glowing band shows a connected Southern Ocean system, not a direct current path.", source: "NASA ice-sheet mass change" },
  { id: "newyork", step: "04", label: "New York", title: "Local sea level has several causes.", text: "Antarctic ice loss is one contributor. Ocean warming, currents, land motion, and storms also shape what New York and the East Coast experience.", source: "NOAA local sea level" },
];

export default function Home() {
  const [active, setActive] = useState<StopId>("antarctica");
  const [playing, setPlaying] = useState(false);
  const item = stops.find((stop) => stop.id === active) ?? stops[0];
  useEffect(() => {
    if (!playing) return;
    const start = stops.findIndex((stop) => stop.id === active);
    const timers = stops.slice(start + 1).map((stop, index) => window.setTimeout(() => setActive(stop.id), (index + 1) * 3200));
    const end = window.setTimeout(() => setPlaying(false), (timers.length + 1) * 3200);
    return () => { timers.forEach(window.clearTimeout); window.clearTimeout(end); };
  }, [playing]);
  return <main>
    <header className="topbar"><a href="#top" className="brand">Antarctica: Connected</a><a href="#sources">Sources</a></header>
    <section id="top" className="intro"><div><p className="eyebrow">Interactive climate learning map</p><h1>See how Antarctica connects to the East Coast.</h1><p>Rotate the globe, choose a map stop, or run the guided journey. The map shows linked processes, not warm water traveling straight to New York.</p></div><button className="journey-button" onClick={() => setPlaying((value) => !value)} aria-pressed={playing}>{playing ? "Pause journey" : "Start the journey"}</button></section>
    <section className="experience" aria-label="Interactive map experience"><InteractiveMap active={active} onSelect={setActive} /><div className="map-note">Drag to rotate · Scroll to zoom · Select a glowing point</div><aside className="story-card" aria-live="polite"><p className="eyebrow">{item.step} · {item.label}</p><h2>{item.title}</h2><p>{item.text}</p><span>{item.source}</span></aside><nav className="stopbar" aria-label="Map stops">{stops.map((stop) => <button key={stop.id} className={active === stop.id ? "active" : ""} onClick={() => { setPlaying(false); setActive(stop.id); }}><b>{stop.step}</b>{stop.label}</button>)}</nav></section>
    <section className="method" id="sources"><p className="eyebrow">Accuracy rule</p><h2>Antarctic change matters. A direct river to New York is not the explanation.</h2><p>Each stop uses a source-backed explanation. This first build focuses on understanding the process, not a numbers dashboard.</p><div className="links"><a href="https://sealevel.nasa.gov/news/266/how-ice-shelf-loss-drives-sea-level-rise/" target="_blank" rel="noreferrer">NASA: ice shelves</a><a href="https://science.nasa.gov/earth/explore/earth-indicators/ice-sheets/" target="_blank" rel="noreferrer">NASA: ice sheets</a><a href="https://oceanservice.noaa.gov/facts/sealevel.html" target="_blank" rel="noreferrer">NOAA: local sea level</a></div></section>
  </main>;
}

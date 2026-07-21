"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { InteractiveMap, type StopId } from "./InteractiveMap";
import { journeyStops, STAGE_DURATION } from "./journey";

export default function Home() {
  const [active, setActive] = useState<StopId>("water");
  const [playing, setPlaying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [journeyElapsed, setJourneyElapsed] = useState(0);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const journeyElapsedRef = useRef(0);
  const item = journeyStops.find((stop) => stop.id === active) ?? journeyStops[0];
  const activeIndex = journeyStops.findIndex((stop) => stop.id === active);

  const selectStop = useCallback((id: StopId) => {
    setPlaying(false);
    setCountdown(null);
    journeyElapsedRef.current = 0;
    setJourneyElapsed(0);
    setActive(id);
  }, []);

  useEffect(() => {
    if (countdown === null) return;
    const timer = window.setTimeout(() => {
      if (countdown > 0) setCountdown(countdown - 1);
      else {
        setCountdown(null);
        journeyElapsedRef.current = 0;
        setJourneyElapsed(0);
        setPlaying(true);
      }
    }, countdown > 0 ? 700 : 500);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (!playing) return;
    const totalDuration = journeyStops.length * STAGE_DURATION;
    const startedAt = performance.now() - journeyElapsedRef.current;
    const timer = window.setInterval(() => {
      const elapsed = Math.min(performance.now() - startedAt, totalDuration);
      const stageIndex = Math.min(Math.floor(elapsed / STAGE_DURATION), journeyStops.length - 1);
      journeyElapsedRef.current = elapsed;
      setJourneyElapsed(elapsed);
      setActive(journeyStops[stageIndex].id);
      if (elapsed >= totalDuration) {
        window.clearInterval(timer);
        setPlaying(false);
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [playing]);

  function startJourney() {
    setPlaying(false);
    setActive("water");
    journeyElapsedRef.current = 0;
    setJourneyElapsed(0);
    setCountdown(3);
  }

  function toggleJourney() {
    if (playing) { setPlaying(false); return; }
    if (journeyElapsed > 0 && journeyElapsed < journeyStops.length * STAGE_DURATION) { setPlaying(true); return; }
    startJourney();
  }

  return <main className="map-product"><section className="map-experience" aria-label="Interactive Antarctica map"><InteractiveMap active={active} onSelect={selectStop} />
    <header className="map-header"><div className="header-links"><a href="#top">Antarctica: Connected</a><span className="project-kicker">Interactive climate learning map</span><button className="sources-trigger" onClick={() => setSourcesOpen(true)} aria-expanded={sourcesOpen} aria-controls="sources-drawer">Sources</button></div></header>
    <div className="map-intro" id="top"><h1>Explore the system.</h1><p>Rotate the globe or use the four stops to trace Antarctica&apos;s connection to East Coast sea level.</p></div>
    <div className="map-help">Drag to rotate · Scroll to zoom · Select a glowing point</div>
    <details className="map-legend" open><summary>Map key</summary><ul><li><i className="legend-warm" />Warm water near the ice shelf</li><li><i className="legend-global" />Global ocean connection</li><li><i className="legend-local" />Symbolic New York water-level cue</li></ul></details>
    <aside className="story-card" aria-live="polite"><p className="eyebrow">{item.step} · {item.label}</p><h2>{item.title}</h2><p>{item.text}</p>{active === "antarctica" && <section className="ice-cutaway" aria-label="Simplified ice-shelf cutaway"><p className="eyebrow">What happens beneath the shelf</p><div className="cutaway-ice">Floating ice shelf</div><div className="cutaway-water"><span>Warm water</span><b>→ → →</b></div><div className="cutaway-grounded">Grounded ice behind the shelf</div><p>Warm water moves below the floating shelf, where it can add heat from underneath.</p></section>}<a className="card-source" href={item.sourceUrl} target="_blank" rel="noreferrer">Source: {item.sourceName} ↗</a>{playing && <strong className="journey-progress">Journey in progress · {activeIndex + 1} of {journeyStops.length}</strong>}</aside>
    {countdown !== null && <div className="journey-countdown" role="status" aria-live="assertive"><span>{countdown === 0 ? "Go" : countdown}</span><p>{countdown === 0 ? "Follow the warm-water pathway." : "The journey starts now"}</p></div>}
    <div className="map-actions"><button onClick={toggleJourney} aria-pressed={playing}>{playing ? "Pause" : journeyElapsed > 0 && journeyElapsed < journeyStops.length * STAGE_DURATION ? "Resume journey" : journeyElapsed > 0 ? "Restart journey" : "Play journey"}</button><button onClick={() => selectStop("water")}>Reset view</button></div>
    <nav className="stopbar" aria-label="Map stops">{journeyStops.map((stop) => <button key={stop.id} className={active === stop.id ? "active" : ""} onClick={() => selectStop(stop.id)} aria-current={active === stop.id ? "step" : undefined}><b>{stop.step}</b><span>{stop.label}</span></button>)}</nav>
    {sourcesOpen && <aside className="sources-drawer" id="sources-drawer" aria-label="Project sources"><div className="drawer-heading"><div><p className="eyebrow">Sources</p><h2>What supports each step</h2></div><button onClick={() => setSourcesOpen(false)} aria-label="Close sources">→</button></div><ol>{journeyStops.map((stop) => <li key={stop.id}><span>{stop.step}</span><div><b>{stop.label}</b><a href={stop.sourceUrl} target="_blank" rel="noreferrer">{stop.sourceName} ↗</a></div></li>)}</ol></aside>}
  </section><footer className="render-note"><strong>Map rendering note:</strong> The circular gap at Antarctica&apos;s South Pole is a known limitation of the globe map&apos;s rendering. It is not an ice, ocean, or climate-change feature in this experience.</footer></main>;
}

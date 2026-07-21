"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InteractiveMap, type StopId, type StoryLayers } from "./InteractiveMap";
import { getGuidedJourneyStageIndex, getJourneyStops, GUIDED_JOURNEY_DURATION, guidedJourneyStages, type ShelfRegion } from "./journey";

export default function Home() {
  const [active, setActive] = useState<StopId>("water");
  const [playing, setPlaying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [journeyElapsed, setJourneyElapsed] = useState(0);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [region, setRegion] = useState<ShelfRegion>("amundsen");
  const [storyLayers, setStoryLayers] = useState<StoryLayers>({ warm: true, ice: true, global: true });
  const [checkAnswer, setCheckAnswer] = useState<"grounded" | "floating" | "route" | null>(null);
  const [checkOpen, setCheckOpen] = useState(false);
  const [storyMode, setStoryMode] = useState(false);
  const journeyElapsedRef = useRef(0);
  const stops = useMemo(() => getJourneyStops(region), [region]);
  const item = stops.find((stop) => stop.id === active) ?? stops[0];
  const journeyStageIndex = getGuidedJourneyStageIndex(journeyElapsed);

  const selectStop = useCallback((id: StopId) => {
    setPlaying(false);
    setCountdown(null);
    journeyElapsedRef.current = 0;
    setJourneyElapsed(0);
    setCheckAnswer(null);
    setCheckOpen(false);
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
    const totalDuration = GUIDED_JOURNEY_DURATION;
    const startedAt = performance.now() - journeyElapsedRef.current;
    const timer = window.setInterval(() => {
      const elapsed = Math.min(performance.now() - startedAt, totalDuration);
      const stageIndex = getGuidedJourneyStageIndex(elapsed);
      const stage = guidedJourneyStages[stageIndex];
      journeyElapsedRef.current = elapsed;
      setJourneyElapsed(elapsed);
      setActive(stage.id);
      if (stage.region) setRegion(stage.region);
      if (elapsed >= totalDuration) {
        window.clearInterval(timer);
        setPlaying(false);
        setCheckOpen(true);
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [playing, stops]);

  function startJourney() {
    setPlaying(false);
    setRegion("amundsen");
    setActive("water");
    journeyElapsedRef.current = 0;
    setJourneyElapsed(0);
    setCheckAnswer(null);
    setCheckOpen(false);
    setCountdown(3);
  }

  function toggleJourney() {
    if (playing) { setPlaying(false); return; }
    if (journeyElapsed > 0 && journeyElapsed < GUIDED_JOURNEY_DURATION) { setPlaying(true); return; }
    startJourney();
  }

  function selectRegion(nextRegion: ShelfRegion) {
    setPlaying(false);
    setCountdown(null);
    journeyElapsedRef.current = 0;
    setJourneyElapsed(0);
    setCheckAnswer(null);
    setCheckOpen(false);
    setRegion(nextRegion);
    setActive("water");
  }

  function toggleLayer(layer: keyof StoryLayers) {
    setStoryLayers((current) => ({ ...current, [layer]: !current[layer] }));
  }

  function toggleStoryMode() {
    setStoryMode((enabled) => !enabled);
    setPlaying(false);
    setCountdown(null);
    journeyElapsedRef.current = 0;
    setJourneyElapsed(0);
    setCheckAnswer(null);
    setCheckOpen(false);
  }

  const moveStory = useCallback((direction: -1 | 1) => {
    const currentIndex = stops.findIndex((stop) => stop.id === active);
    const next = stops[Math.max(0, Math.min(stops.length - 1, currentIndex + direction))];
    if (!next || next.id === active) return;
    setPlaying(false);
    setCountdown(null);
    journeyElapsedRef.current = 0;
    setJourneyElapsed(0);
    setCheckAnswer(null);
    setCheckOpen(false);
    setActive(next.id);
  }, [active, stops]);

  return <main className="map-product"><section className="map-experience" aria-label="Interactive Antarctica map"><InteractiveMap active={active} region={region} layers={storyLayers} storyMode={storyMode} onSelect={selectStop} onStoryStep={moveStory} />
    <header className="map-header"><div className="header-links"><a href="#top">Warm Antarctica</a><span className="project-kicker">Interactive climate learning map</span><button className="sources-trigger" onClick={() => setSourcesOpen((open) => !open)} aria-expanded={sourcesOpen} aria-controls="sources-drawer">Sources</button></div></header>
    <div className="map-intro" id="top"><h1>Explore the system.</h1><p>Rotate the globe or use the four stops to trace Antarctica&apos;s connection to East Coast sea level.</p></div>
    <div className="map-help">Drag to rotate &middot; Scroll to zoom &middot; Select a glowing point</div>
    {storyMode && <p className="story-mode-status" role="status">Story mode is on. Scroll over the globe to change stops.</p>}
    <details className="map-legend" open><summary>Map key</summary><ul><li><i className="legend-warm" />Warm water near the selected ice shelf</li><li><i className="legend-global" />Global ocean connection</li><li><i className="legend-local" />Symbolic New York water-level cue</li></ul></details>
    <aside className="story-card" aria-live="polite"><p className="eyebrow">{item.step} &middot; {item.label}</p><h2>{item.title}</h2><p>{item.text}</p>{active === "antarctica" && <section className="ice-cutaway" aria-label="Simplified ice-shelf cutaway"><p className="eyebrow">What happens beneath the shelf</p><div className="cutaway-ice">Floating ice shelf</div><div className="cutaway-water"><span>Warm water</span><b>&rarr; &rarr; &rarr;</b></div><div className="cutaway-grounded">Grounded ice behind the shelf</div><p>Warm water moves below the floating shelf, where it can add heat from underneath.</p></section>}{active === "water" && <section className="shelf-compare" aria-label="Compare Antarctic ice shelves"><p className="eyebrow">Compare a shelf</p><div><button className={region === "amundsen" ? "active" : ""} onClick={() => selectRegion("amundsen")} aria-pressed={region === "amundsen"}>Amundsen</button><button className={region === "bellingshausen" ? "active" : ""} onClick={() => selectRegion("bellingshausen")} aria-pressed={region === "bellingshausen"}>George VI</button><button className={region === "totten" ? "active" : ""} onClick={() => selectRegion("totten")} aria-pressed={region === "totten"}>Totten</button></div><p>{region === "amundsen" ? "Pine Island and Thwaites" : region === "bellingshausen" ? "Eastern Bellingshausen Sea" : "Sabrina Coast, East Antarctica"}</p></section>}<a className="card-source" href={item.sourceUrl} target="_blank" rel="noreferrer">Source: {item.sourceName} &#8599;</a>{active === "newyork" && <><button className="quick-check-trigger" onClick={() => setCheckOpen((open) => !open)} aria-expanded={checkOpen} aria-controls="journey-check">Quick check</button>{checkOpen && <section className="journey-check" id="journey-check" aria-label="End-of-journey check"><p className="eyebrow">Quick check</p><h3>What directly adds water to the global ocean?</h3><div><button className={checkAnswer === "grounded" ? "correct" : ""} onClick={() => setCheckAnswer("grounded")}>Grounded ice moving into the sea</button><button className={checkAnswer === "floating" ? "incorrect" : ""} onClick={() => setCheckAnswer("floating")}>A floating ice shelf thinning</button><button className={checkAnswer === "route" ? "incorrect" : ""} onClick={() => setCheckAnswer("route")}>Warm water traveling to New York</button></div>{checkAnswer && <p className={checkAnswer === "grounded" ? "answer-feedback correct" : "answer-feedback incorrect"}>{checkAnswer === "grounded" ? "Correct. Grounded ice adds water when it moves into the sea." : "Not quite. Floating ice shelves already displace water, and this map does not show a direct water route to New York."}</p>}</section>}</>}{playing && <strong className="journey-progress">Journey in progress &middot; {journeyStageIndex + 1} of {guidedJourneyStages.length} &middot; {guidedJourneyStages[journeyStageIndex].label}</strong>}</aside>
    {countdown !== null && <div className="journey-countdown" role="status" aria-live="assertive"><span>{countdown === 0 ? "Go" : countdown}</span><p>{countdown === 0 ? "Follow the warm-water pathway." : "The journey starts now"}</p></div>}
    <div className="map-actions"><button onClick={toggleJourney} aria-pressed={playing} disabled={storyMode}>{playing ? "Pause" : journeyElapsed > 0 && journeyElapsed < GUIDED_JOURNEY_DURATION ? "Resume journey" : journeyElapsed > 0 ? "Restart journey" : "Play journey"}</button><button onClick={toggleStoryMode} aria-pressed={storyMode}>{storyMode ? "Exit story mode" : "Story mode"}</button><button onClick={() => selectStop("water")}>Reset view</button><details className="layer-controls"><summary>Layers</summary><div className="layer-panel"><p className="eyebrow">Show on map</p><button onClick={() => toggleLayer("warm")} aria-pressed={storyLayers.warm}>Warm-water paths</button><button onClick={() => toggleLayer("ice")} aria-pressed={storyLayers.ice}>Ice-shelf response</button><button onClick={() => toggleLayer("global")} aria-pressed={storyLayers.global}>Global connection</button></div></details></div>
    <nav className="stopbar" aria-label="Map stops">{stops.map((stop) => <button key={stop.id} className={active === stop.id ? "active" : ""} onClick={() => selectStop(stop.id)} aria-current={active === stop.id ? "step" : undefined}><b>{stop.step}</b><span>{stop.label}</span></button>)}</nav>
    {sourcesOpen && <aside className="sources-drawer" id="sources-drawer" aria-label="Project sources"><div className="drawer-heading"><div><p className="eyebrow">Sources</p><h2>What supports each step</h2></div></div><ol>{stops.map((stop) => <li key={stop.id}><span>{stop.step}</span><div><b>{stop.label}</b><a href={stop.sourceUrl} target="_blank" rel="noreferrer">{stop.sourceName} &#8599;</a></div></li>)}</ol><details className="map-display-note"><summary>Map display note</summary><p>The circular gap at Antarctica&apos;s South Pole is a known globe-map rendering limit. It is not an ice, ocean, or climate-change feature in this experience.</p></details></aside>}
  </section></main>;
}

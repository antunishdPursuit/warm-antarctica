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
  const [storyStageIndex, setStoryStageIndex] = useState(0);
  const [currentsVisible, setCurrentsVisible] = useState(true);
  const [legendOpen, setLegendOpen] = useState(true);
  const [introOpen, setIntroOpen] = useState(true);
  const journeyElapsedRef = useRef(0);
  const introStartRef = useRef<HTMLButtonElement>(null);
  const stops = useMemo(() => getJourneyStops(region), [region]);
  const item = stops.find((stop) => stop.id === active) ?? stops[0];
  const journeyStageIndex = getGuidedJourneyStageIndex(journeyElapsed);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setLegendOpen(!window.matchMedia("(max-width: 700px)").matches));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!introOpen) return;
    introStartRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIntroOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [introOpen]);

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
    setIntroOpen(false);
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
    const next = !storyMode;
    setStoryMode(next);
    setPlaying(false);
    setCountdown(null);
    journeyElapsedRef.current = 0;
    setJourneyElapsed(0);
    setCheckAnswer(null);
    setCheckOpen(false);
    if (next) {
      setStoryStageIndex(0);
      setRegion("amundsen");
      setActive("water");
    }
  }

  const currentLayerVisible = active === "ocean" && currentsVisible;

  const moveStory = useCallback((direction: -1 | 1) => {
    const nextIndex = Math.max(0, Math.min(guidedJourneyStages.length - 1, storyStageIndex + direction));
    if (nextIndex === storyStageIndex) return;
    const next = guidedJourneyStages[nextIndex];
    setPlaying(false);
    setCountdown(null);
    journeyElapsedRef.current = 0;
    setJourneyElapsed(0);
    setCheckAnswer(null);
    setCheckOpen(false);
    setActive(next.id);
    if (next.region) setRegion(next.region);
    setStoryStageIndex(nextIndex);
  }, [storyStageIndex]);

  return <main className="map-product"><section className="map-experience" aria-label="Interactive Antarctica map"><InteractiveMap active={active} region={region} layers={storyLayers} storyMode={storyMode} currentsMode={currentLayerVisible} onSelect={selectStop} onStoryStep={moveStory} />
    <header className="map-header"><div className="header-links"><a href="#top">Warm Antarctica</a></div></header>
    <div className="map-intro" id="top"><h1>Explore the system.</h1><p>Rotate the globe or use the four stops to trace Antarctica&apos;s connection to East Coast sea level.</p></div>
    <div className="map-help">Drag to rotate &middot; Scroll to zoom &middot; Select a glowing point</div>
    {introOpen && <div className="intro-modal-backdrop"><section className="intro-modal" role="dialog" aria-modal="true" aria-labelledby="intro-title" aria-describedby="intro-description"><p className="eyebrow">Interactive climate learning map</p><h2 id="intro-title">Warm Antarctica</h2><p id="intro-description">Follow a four-step story from warm water near Antarctic ice shelves to global sea-level effects in New York. The map explains a connected system, not a direct water route to New York.</p><div><button ref={introStartRef} onClick={startJourney}>Start journey</button><button onClick={() => setIntroOpen(false)}>Explore on my own</button></div><p className="intro-modal-hint">Drag to rotate, scroll to zoom, or select a glowing point.</p></section></div>}
    {storyMode && <p className="story-mode-status" role="status">Story mode is on. Scroll over the globe to change stops.</p>}
    {currentLayerVisible && <aside className="currents-note" role="status"><p className="eyebrow">Dated current view</p><strong>Southern Ocean currents</strong><span>July 20, 2026 &middot; 15.81 m depth &middot; modeled daily mean</span><p>Arrows show modeled direction. Particles animate along it outside ice shelves. They do not show a route to New York.</p><span>Generated using E.U. Copernicus Marine Service Information &middot; DOI: 10.48670/moi-00016</span><a href="https://data.marine.copernicus.eu/product/GLOBAL_ANALYSISFORECAST_PHY_001_024/description?option=-&product_id=-&task=results&view=-" target="_blank" rel="noreferrer">Copernicus Marine source &#8599;</a></aside>}
    <aside className="story-card" aria-live="polite"><p className="eyebrow">{item.step} &middot; {item.label}</p><h2>{item.title}</h2><p>{item.text}</p>{active === "antarctica" && <section className="ice-cutaway" aria-label="Simplified ice-shelf cutaway"><p className="eyebrow">What happens beneath the shelf</p><div className="cutaway-ice">Floating ice shelf</div><div className="cutaway-water"><span>Warm water</span><b>&rarr; &rarr; &rarr;</b></div><div className="cutaway-grounded">Grounded ice behind the shelf</div><p>Warm water moves below the floating shelf, where it can add heat from underneath.</p></section>}{active === "water" && <section className="shelf-compare" aria-label="Compare Antarctic ice shelves"><p className="eyebrow">Compare a shelf</p><div><button className={region === "amundsen" ? "active" : ""} onClick={() => selectRegion("amundsen")} aria-pressed={region === "amundsen"}>Amundsen</button><button className={region === "bellingshausen" ? "active" : ""} onClick={() => selectRegion("bellingshausen")} aria-pressed={region === "bellingshausen"}>George VI</button><button className={region === "totten" ? "active" : ""} onClick={() => selectRegion("totten")} aria-pressed={region === "totten"}>Totten</button></div><p>{region === "amundsen" ? "Pine Island and Thwaites" : region === "bellingshausen" ? "Eastern Bellingshausen Sea" : "Sabrina Coast, East Antarctica"}</p></section>}<a className="card-source" href={item.sourceUrl} target="_blank" rel="noreferrer">Source: {item.sourceName} &#8599;</a>{currentLayerVisible && <section className="currents-inline"><p>Current view: July 20, 2026 &middot; 15.81 m depth &middot; modeled daily mean</p><p>Generated using E.U. Copernicus Marine Service Information &middot; DOI: 10.48670/moi-00016</p><a href="https://data.marine.copernicus.eu/product/GLOBAL_ANALYSISFORECAST_PHY_001_024/description?option=-&product_id=-&task=results&view=-" target="_blank" rel="noreferrer">Copernicus Marine source &#8599;</a></section>}{active === "newyork" && <><button className="quick-check-trigger" onClick={() => setCheckOpen((open) => !open)} aria-expanded={checkOpen} aria-controls="journey-check">Quick check</button>{checkOpen && <section className="journey-check" id="journey-check" aria-label="End-of-journey check"><p className="eyebrow">Quick check</p><h3>What directly adds water to the global ocean?</h3><div><button className={checkAnswer === "grounded" ? "correct" : ""} onClick={() => setCheckAnswer("grounded")}>Grounded ice moving into the sea</button><button className={checkAnswer === "floating" ? "incorrect" : ""} onClick={() => setCheckAnswer("floating")}>A floating ice shelf thinning</button><button className={checkAnswer === "route" ? "incorrect" : ""} onClick={() => setCheckAnswer("route")}>Warm water traveling to New York</button></div>{checkAnswer && <p className={checkAnswer === "grounded" ? "answer-feedback correct" : "answer-feedback incorrect"}>{checkAnswer === "grounded" ? "Correct. Grounded ice adds water when it moves into the sea." : "Not quite. Floating ice shelves already displace water, and this map does not show a direct water route to New York."}</p>}</section>}</>}{playing && <strong className="journey-progress">Journey in progress &middot; {journeyStageIndex + 1} of {guidedJourneyStages.length} &middot; {guidedJourneyStages[journeyStageIndex].label}</strong>}</aside>
    {countdown !== null && <div className="journey-countdown" role="status" aria-live="assertive"><span>{countdown === 0 ? "Go" : countdown}</span><p>{countdown === 0 ? "Follow the warm-water pathway." : "The journey starts now"}</p></div>}
    <div className="map-actions"><button onClick={toggleJourney} aria-pressed={playing} disabled={storyMode}>{playing ? "Pause" : journeyElapsed > 0 && journeyElapsed < GUIDED_JOURNEY_DURATION ? "Resume journey" : journeyElapsed > 0 ? "Restart journey" : "Play journey"}</button><button onClick={toggleStoryMode} aria-pressed={storyMode}>{storyMode ? "Exit story mode" : "Story mode"}</button><button onClick={() => selectStop("water")}>Reset view</button>{active === "ocean" && <button className="currents-toggle" onClick={() => setCurrentsVisible((visible) => !visible)} aria-pressed={currentsVisible}>{currentsVisible ? "Hide currents" : "Show currents"}</button>}<details className="layer-controls"><summary>Layers</summary><div className="layer-panel"><p className="eyebrow">Show on map</p><button onClick={() => toggleLayer("warm")} aria-pressed={storyLayers.warm}>Warm-water paths</button><button onClick={() => toggleLayer("ice")} aria-pressed={storyLayers.ice}>Ice-shelf response</button><button onClick={() => toggleLayer("global")} aria-pressed={storyLayers.global}>Global connection</button></div></details></div>
    <details className="map-legend" open={legendOpen} onToggle={(event) => setLegendOpen(event.currentTarget.open)}><summary>Map key</summary><ul><li><i className="legend-warm" />Warm water near the selected ice shelf</li><li><i className="legend-global" />Global ocean connection</li><li><i className="legend-local" />Symbolic New York water-level cue</li></ul></details>
    <nav className="stopbar" aria-label="Map stops">{stops.map((stop) => <button key={stop.id} className={active === stop.id ? "active" : ""} onClick={() => selectStop(stop.id)} aria-current={active === stop.id ? "step" : undefined}><b>{stop.step}</b><span>{stop.label}</span></button>)}</nav>
    <div className="sources-utility"><button className="sources-trigger" onClick={() => setSourcesOpen((open) => !open)} aria-expanded={sourcesOpen} aria-controls="sources-drawer">Sources</button><details className="map-display-note"><summary>Map display note</summary><p>The circular gap at Antarctica&apos;s South Pole is a known globe-map rendering limit. It is not an ice, ocean, or climate-change feature in this experience.</p></details></div>
    {sourcesOpen && <aside className="sources-drawer" id="sources-drawer" aria-label="Project sources"><div className="drawer-heading"><div><p className="eyebrow">Sources</p><h2>What supports each step</h2></div></div><ol>{stops.map((stop) => <li key={stop.id}><span>{stop.step}</span><div><b>{stop.label}</b><a href={stop.sourceUrl} target="_blank" rel="noreferrer">{stop.sourceName} &#8599;</a></div></li>)}</ol></aside>}
  </section></main>;
}

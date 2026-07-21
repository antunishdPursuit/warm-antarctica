import type { StopId } from "./InteractiveMap";

export const STAGE_DURATION = 5000;

export type JourneyStop = {
  id: StopId;
  step: string;
  label: string;
  title: string;
  text: string;
  sourceName: string;
  sourceUrl: string;
};

export const journeyStops: JourneyStop[] = [
  {
    id: "water",
    step: "01",
    label: "Warm water",
    title: "Warm water reaches the Amundsen Sea shelf.",
    text: "Near Pine Island and Thwaites, relatively warm Circumpolar Deep Water can move from the Southern Ocean through deep channels toward ice shelves.",
    sourceName: "NASA: Pine Island Glacier",
    sourceUrl: "https://science.nasa.gov/earth/earth-observatory/channel-beneath-pine-island-glacier-48637/",
  },
  {
    id: "antarctica",
    step: "02",
    label: "Antarctica",
    title: "Ocean heat can thin ice shelves from below.",
    text: "When this water reaches an ice shelf, it adds heat from below. Thinner shelves hold back less of the grounded ice behind them.",
    sourceName: "NASA: Ice shelf loss",
    sourceUrl: "https://sealevel.nasa.gov/news/266/how-ice-shelf-loss-drives-sea-level-rise/",
  },
  {
    id: "ocean",
    step: "03",
    label: "Global ocean",
    title: "Grounded ice adds water to the global ocean.",
    text: "As grounded ice moves into the sea, it adds water to the global ocean. The Southern Ocean connects this change to the wider system.",
    sourceName: "NASA: Ice sheets",
    sourceUrl: "https://science.nasa.gov/earth/explore/earth-indicators/ice-sheets/",
  },
  {
    id: "newyork",
    step: "04",
    label: "New York",
    title: "Local sea level has several causes.",
    text: "Antarctic ice loss is one contributor alongside ocean warming, currents, land motion, and storms.",
    sourceName: "NOAA: Local sea level",
    sourceUrl: "https://oceanservice.noaa.gov/facts/sealevel.html",
  },
];

# Play Journey reliability note

## What broke

The map setup effect depended on `onSelect`. The page created that function again on every render. Countdown changes and journey-stage changes therefore tore down and rebuilt the MapLibre map. Each rebuilt map ran its startup camera move to Warm water, which caused shaking and prevented later stages from holding.

## Rule for future map work

Create the map once. Do not put changing page callbacks or state in the map-creation effect dependency list. Keep changing callbacks in a ref, and use a separate effect for active-stage camera moves.

## Guardrails

- `InteractiveMap` stores the current selection callback in `onSelectRef`.
- The map-creation effect has an empty dependency list.
- `journey.ts` owns the ordered stages and one shared duration.
- `npm test` checks the stage order, shared duration, one source per stage, and the stable callback pattern.

## Check before sharing

1. Select **Play journey** and wait through all four stages.
2. Confirm each stage remains visible for five seconds.
3. Confirm the globe does not rebuild or return to Warm water during the journey.
4. Run `npm run lint` and `npm test`.

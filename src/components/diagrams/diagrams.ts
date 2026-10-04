import type { Node, Group, Label } from './ArchDiagram.astro';

interface Diagram { width: number; height: number; title: string; description: string; nodes: Node[]; edges: string[]; groups?: Group[]; labels?: Label[] }

export const diagrams: Record<string, Diagram> = {
  cascadenet: {
    width: 720,
    height: 430,
    title: 'CascadeNet architecture',
    description:
      'CascadeNet architecture: a React, Vite and Mapbox dashboard calls a FastAPI backend with a MongoDB cache. The backend uses an AI/ML engine with two lanes (LSTM predictor to action router to four agencies; hazard generator and dependency graph to cascade simulator to ROI and Singularity Index outputs) and a geospatial engine using Rasterio, SciPy and GeoPandas. Derived from the repository README and code; to be confirmed.',
    groups: [
      { x: 20, y: 168, w: 510, h: 250, label: 'AI/ML engine' },
      { x: 550, y: 168, w: 150, h: 250, label: 'Geospatial engine' },
    ],
    labels: [
      { x: 36, y: 212, text: 'Forecast, then alert' },
      { x: 36, y: 288, text: 'Simulate, then decide' },
      { x: 566, y: 214, text: 'Rasterio' },
      { x: 566, y: 238, text: 'SciPy splines' },
      { x: 566, y: 262, text: 'GeoPandas' },
    ],
    nodes: [
      { x: 210, y: 10, w: 300, h: 44, t1: 'Dashboard', t2: 'React · Vite · Mapbox' },
      { x: 210, y: 84, w: 300, h: 44, t1: 'FastAPI backend', t2: 'Python · MongoDB cache' },
      { x: 36, y: 220, w: 140, h: 44, t1: 'LSTM predictor' },
      { x: 206, y: 220, w: 140, h: 44, t1: 'Action router' },
      { x: 376, y: 220, w: 140, h: 44, t1: '4 agencies' },
      { x: 36, y: 296, w: 150, h: 48, t1: 'Hazard generator', t2: '100 scenarios' },
      { x: 36, y: 356, w: 150, h: 48, t1: 'Dependency graph', t2: 'NetworkX + RF' },
      { x: 226, y: 326, w: 150, h: 48, t1: 'Cascade simulator', t2: '24 h, event-driven' },
      { x: 406, y: 326, w: 110, h: 48, t1: 'ROI · SI', t2: 'knapsack' },
    ],
    edges: [
      'M360 54 V84',
      'M360 128 V148 H275 V168',
      'M360 148 H625 V168',
      'M176 242 H206',
      'M346 242 H376',
      'M186 320 L226 342',
      'M186 380 L226 358',
      'M376 350 H406',
    ],
  },
  telemetryiq: {
    width: 720,
    height: 340,
    title: 'TelemetryIQ architecture',
    description:
      'TelemetryIQ architecture from docker-compose and code: mock services expose Prometheus gauges scraped every 2 seconds, with Grafana reading from Prometheus, and also post metrics to the FastAPI backend, which stores them in MongoDB, scores them with Isolation Forest and Random Forest models on 15 features, correlates with change events, and serves a Next.js dashboard. Derived from the repository; to be confirmed.',
    nodes: [
      { x: 20, y: 130, w: 170, h: 60, t1: 'Mock services', t2: '3 failure scenarios' },
      { x: 270, y: 20, w: 170, h: 52, t1: 'Prometheus', t2: 'scrape every 2 s' },
      { x: 510, y: 20, w: 190, h: 52, t1: 'Grafana', t2: 'Prometheus datasource' },
      { x: 270, y: 130, w: 170, h: 60, t1: 'FastAPI backend', t2: 'ingest · scan · correlate' },
      { x: 270, y: 250, w: 170, h: 52, t1: 'MongoDB', t2: 'metrics · changes' },
      { x: 510, y: 130, w: 190, h: 60, t1: 'Isolation Forest', t2: '+ Random Forest' },
      { x: 510, y: 250, w: 190, h: 52, t1: 'Next.js dashboard' },
    ],
    edges: [
      'M190 140 L270 52',
      'M190 160 H270',
      'M440 46 H510',
      'M355 190 V250',
      'M440 160 H510',
      'M510 276 H475 V180 H440',
    ],
  },
};

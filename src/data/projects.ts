// Project card data. Only facts carried over from the previous site; anything unverified is a TODO(athul).

export interface Project {
  slug: string;
  title: string;
  outcome: string;
  summary?: string;
  metric?: { value: string; label: string };
  metricTodo?: string;
  award?: string;
  stack: string[];
  repo: string;
  caseStudy?: boolean;
  span: 'lead' | 'side';
}

export const projects: Project[] = [
  {
    slug: 'cascadenet',
    title: 'CascadeNet',
    outcome: 'Flood-response simulator that forecasts reservoir outflow and routes multi-agency evacuations on Kerala 2018 flood topologies.',
    summary:
      'Three layers: LSTM forecasting of outflow and node inundation, NetworkX routing under simulated bridge and road failures, and a FastAPI geospatial pipeline built on GeoPandas and Rasterio.',
    metricTodo:
      "TODO(athul): measured metric + how measured (old site claimed '100+ scenarios' and '<20 s dispatch to 5 stakeholders')",
    award: '1st · Hackathena 2026',
    stack: ['PyTorch LSTM', 'NetworkX', 'GeoPandas', 'FastAPI'],
    repo: 'https://github.com/Athullvr/CascadeNet',
    caseStudy: true,
    span: 'lead',
  },
  {
    slug: 'telemetryiq',
    title: 'TelemetryIQ',
    outcome: 'Two-stage ML observability: Isolation Forest flags anomalies in service telemetry, Random Forest classifies the root cause.',
    metricTodo: 'TODO(athul): measured metric (e.g. precision/recall, detection latency)',
    // TODO(athul): confirm BeachHack H4C 2nd place was for TelemetryIQ (repo is named TEAM-KORE-HFC).
    award: '2nd · BeachHack H4C',
    stack: ['Isolation Forest', 'Random Forest', 'Prometheus', 'Grafana'],
    repo: 'https://github.com/Athullvr/TEAM-KORE-HFC',
    caseStudy: true,
    span: 'side',
  },
  {
    slug: 'metro-connect',
    title: 'Metro Connect',
    outcome: 'Offline-first journey planner across Kochi Metro, Water Metro and feeder buses, with LLM-assisted disruption replanning.',
    metric: { value: '25 + 6', label: 'Kochi Metro stations + Water Metro routes covered' },
    stack: ['React', 'Vite', 'Serverless', 'PWA'],
    repo: 'https://github.com/Athullvr/Metro-Connect',
    span: 'side',
  },
];

export const proof = [
  { rank: '1st', event: 'Hackathena 2026', meta: 'National · Jyothi Engineering College', href: '/work/cascadenet' },
  // TODO(athul): confirm BeachHack project is TelemetryIQ.
  { rank: '2nd', event: 'BeachHack H4C', meta: '36-hour flagship · CCE', href: '/work/telemetryiq' },
  // TODO(athul): no project linked for Push to Prod; link target is the work section for now.
  { rank: 'Top 150', event: 'Push to Prod: Frontier', meta: 'Anthropic × Elevation Capital · Bengaluru', href: '/#work' },
] as const;

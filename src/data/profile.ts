import { site } from './site';

export const about = [
  'I am a second-year B.Tech CSE student at Christ College of Engineering, Irinjalakuda, Kerala (2025-2029).',
  'I build ML systems end to end: model training, FastAPI services, and the Prometheus and Grafana monitoring around them.',
  'My geospatial work (GeoPandas, Rasterio, NetworkX) comes from building flood-response and transit-routing tools for Kerala.',
  'Right now I am focused on LLM evals and serving.',
];

export const timeline = [
  {
    group: 'Experience',
    date: 'Jun 2026 - Present',
    title: 'IPR Lead',
    org: 'Christ College of Engineering',
    text: 'Led intellectual property awareness and innovation initiatives on campus; coordinated student projects aligned with startup pipelines.',
  },
  {
    group: 'Education',
    date: '2025 - 2029',
    title: 'B.Tech Computer Science',
    org: 'Christ College of Engineering, Irinjalakuda',
    text: 'Second year. Studying NPTEL Machine Learning alongside coursework.',
  },
  {
    group: 'Volunteering',
    date: 'Feb 2026',
    title: 'Technical Volunteer, IEDC CCE',
    org: 'Techletics, CCE',
    text: 'Ran scoring and progression boards for "Belfort of Wall Street", a 30-hour startup simulation.',
  },
  {
    group: 'Volunteering',
    date: 'Feb 2026',
    title: 'District Cluster Volunteer, IEDC Thrissur',
    org: 'Thrissur District IEDC Summit',
    text: 'Coordinated pitches, judging line-ups and participant communication for the Health Domain track.',
  },
] as const;

export const skills: { group: string; items: { name: string; href?: string }[] }[] = [
  {
    group: 'Machine learning',
    items: [
      { name: 'TensorFlow/Keras, LSTM', href: '/work/cascadenet' },
      { name: 'scikit-learn', href: '/work/telemetryiq' },
      { name: 'Pandas, NumPy', href: '/work/cascadenet' },
    ],
  },
  {
    group: 'LLMOps',
    items: [
      { name: 'LLM API via serverless proxy', href: `${site.github}/Metro-Connect` },
      // TODO(athul): add evals / tracing / serving tools here once shipped in a project.
    ],
  },
  {
    group: 'Infra & observability',
    items: [
      { name: 'FastAPI', href: '/work/cascadenet' },
      { name: 'Prometheus, Grafana', href: '/work/telemetryiq' },
      { name: 'Docker', href: '/work/telemetryiq' },
      { name: 'Git, CI/CD', href: site.github },
    ],
  },
  {
    group: 'Geospatial',
    items: [
      { name: 'GeoPandas, Rasterio', href: '/work/cascadenet' },
      { name: 'NetworkX', href: '/work/cascadenet' },
      { name: 'ArcGIS, QGIS' },
    ],
  },
];

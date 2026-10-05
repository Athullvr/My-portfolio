// Project card data. Only facts carried over from the previous site.

export interface Project {
  slug: string;
  title: string;
  outcome: string;
  summary?: string;
  metric?: { value: string; label: string };
  award?: string;
  stack: string[];
  repo: string;
  caseStudy?: boolean;
  span: 'lead' | 'side';
}

// Case-study projects live in src/content/projects (MDX). Only card-only projects are listed here.
export const extraProjects: Project[] = [
  {
    slug: 'metro-connect',
    title: 'Metro Connect',
    outcome: 'Offline-first journey planner across Kochi Metro, Water Metro and feeder buses, with LLM-assisted disruption replanning.',
    metric: { value: '25 + 6', label: 'Kochi Metro stations + Water Metro routes covered' },
    // TODO(athul): Metro Connect repo not audited yet; confirm outcome and coverage numbers.
    stack: ['React', 'Vite', 'Serverless', 'PWA'],
    repo: 'https://github.com/Athullvr/Metro-Connect',
    span: 'side',
  },
];

export const proof = [
  { rank: '1st', event: 'Hackathena 2026', meta: 'National · Jyothi Engineering College', href: '/work/cascadenet' },
  { rank: '2nd', event: 'BeachHack H4C', meta: '36-hour flagship · CCE', href: '/work/telemetryiq' },
  { rank: 'Top 150', event: 'Push to Prod: Frontier', meta: 'Anthropic × Elevation Capital · Bengaluru', href: '/#work' },
] as const;

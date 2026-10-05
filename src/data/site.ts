// Single source of truth for identity, contact and social links.
// Do not hard-code emails or profile URLs anywhere else. The email may appear only in mailto links and JSON-LD .

export const site = {
  name: 'Athul VR',
  handle: 'athul.vr',
  url: 'https://athul-vr.vercel.app',
  email: 'athuulvr@gmail.com',
  github: 'https://github.com/Athullvr',
  linkedin: 'https://linkedin.com/in/athul-vr-bb67a8379',
  resume: '/resume.pdf',
  jobTitle: 'MLOps engineer (student)',
  positioning:
    'MLOps engineer (student) taking models from notebook to monitored service, now focused on LLM evals and serving.',
  description:
    'Athul VR is a 2nd-year B.Tech CSE student and MLOps engineer taking models from notebook to monitored service, now focused on LLM evals and serving.',
  status: 'B.Tech CSE · 2nd year · Kerala, India · 2 hackathon podiums',
  availability: 'Open to remote 1-month internships, Dec-Jan, IST',
  location: 'Thrissur, Kerala, India',
  college: 'Christ College of Engineering',
  nav: [
    { label: 'Work', href: '/#work' },
    { label: 'About', href: '/#about' },
  ],
} as const;

export const mailto = `mailto:${site.email}`;

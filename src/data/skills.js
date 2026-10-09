/**
 * The creative toolbox. No percentages or ratings — just what each tool is for.
 *
 * `learned`: covered in the NUML Web Development course.
 * `usedIn`:  EDIT — add project slugs (from projects.js) once you've confirmed a tool was used there,
 *            e.g. usedIn: ['shopcalmcanvas']. It then shows a "used in" badge.
 */
export const skillGroups = [
  {
    id: 'frontend',
    title: 'Frontend Development',
    kind: 'code',
    blurb: 'Structure, style and behaviour — the bones of every site I build.',
    skills: [
      { name: 'HTML5', note: 'Semantic, accessible page structure.', learned: true, usedIn: [] },
      { name: 'CSS3', note: 'Layouts, responsive design and gentle motion.', learned: true, usedIn: [] },
      { name: 'JavaScript', note: 'Interactivity and logic in the browser.', learned: true, usedIn: [] },
      { name: 'React', note: 'Building interfaces from reusable components.', learned: true, usedIn: [] },
      { name: 'Vite', note: 'Fast local development and production builds.', learned: true, usedIn: [] },
    ],
  },
  {
    id: 'tools',
    title: 'Development Tools',
    kind: 'code',
    blurb: 'Keeping work safe, shared and online.',
    skills: [
      { name: 'Git', note: 'Version control — saving every step of the work.', learned: true, usedIn: [] },
      { name: 'GitHub', note: 'Hosting repositories and sharing code.', learned: true, usedIn: [] },
      { name: 'Vercel', note: 'Deploying sites to the web.', learned: true, usedIn: [] },
    ],
  },
  {
    id: 'ai',
    title: 'AI Tools',
    kind: 'code',
    blurb: 'A thinking partner while I plan, learn and build.',
    skills: [{ name: 'Claude', note: 'The AI assistant in my workflow — for brainstorming, learning and problem-solving.', learned: false, usedIn: [] }],
  },
  {
    id: 'cms',
    title: 'CMS',
    kind: 'code',
    blurb: 'Sites that clients can update themselves.',
    skills: [{ name: 'WordPress', note: 'Content-managed websites.', learned: false, usedIn: [] }],
  },
  {
    id: 'creative',
    title: 'Creative Tools',
    kind: 'art',
    blurb: 'Where visuals, edits and little animations happen.',
    skills: [
      { name: 'Adobe Photoshop', note: 'Image editing, compositing and visual experiments.', usedIn: [] },
      { name: 'Canva', note: 'Social posts, layouts and quick visual design.', usedIn: [] },
      { name: 'CapCut', note: 'Editing short videos.', usedIn: [] },
      { name: 'FlipaClip', note: 'Frame-by-frame animation.', usedIn: [] },
    ],
  },
  {
    id: 'productivity',
    title: 'Productivity',
    kind: 'art',
    blurb: 'Planning, writing and organising.',
    skills: [
      { name: 'Microsoft Excel', note: 'Organising data and plans.', usedIn: [] },
      { name: 'Microsoft Word', note: 'Writing and documents.', usedIn: [] },
    ],
  },
];

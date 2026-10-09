/**
 * Personal details & small bits of copy. Edit freely.
 * Empty strings ('') are hidden on the site, so visitors never see placeholders.
 */
export const site = {
  name: 'Noor',
  wordmark: 'noor.',
  title: 'Frontend Developer & Creative Digital Artist',
  tagline: 'Where code meets creativity.',
  roles: ['Frontend Developer', 'Creative Thinker', 'Digital Creator'],

  // EDIT: contact details — empty values stay hidden
  email: '', // e.g. 'hello@yourdomain.com'
  socials: [
    { label: 'LinkedIn', href: '', icon: 'linkedin' },
    { label: 'GitHub', href: '', icon: 'github' },
    // { label: 'Instagram', href: '', icon: 'instagram' },
  ],

  // EDIT: put your résumé PDF in /public and set e.g. '/noor-resume.pdf'
  resumeUrl: '',

  // EDIT: import your photo and assign it, e.g.
  //   import portrait from '../assets/images/noor.webp';   →   portrait: portrait,
  // Until then, the illustrated Noor is shown in the polaroid.
  portrait: null,

  // Contact form endpoint (Formspree, Web3Forms, Getform…) — set VITE_FORM_ENDPOINT in .env
  formEndpoint: import.meta.env?.VITE_FORM_ENDPOINT || '',
};

export const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About Me' },
  { id: 'skills', label: 'My Skills' },
  { id: 'projects', label: 'My Projects' },
  { id: 'creative', label: 'Creative Corner' },
  { id: 'journey', label: 'My Journey' },
  { id: 'contact', label: 'Contact' },
];

/** What Noor (sitting) says in "A little tour". Hover a stop and she explains it. */
export const tour = {
  hello: 'Hi, I’m Noor! Welcome to my little world ✿ Pick a stop and I’ll tell you what’s inside.',
  stops: [
    { id: 'about', label: 'About me', mark: '♡', color: '#F6D3C2', say: 'This is me — a frontend developer with a Chemistry background and a very curious mind.' },
    { id: 'journey', label: 'My journey', mark: '⚗', color: '#B4D8DC', say: 'Here’s how I went from Chemistry to code, one chapter at a time.' },
    { id: 'skills', label: 'My toolbox', mark: '</>', color: '#B9AADB', say: 'My toolbox: HTML, CSS, JavaScript, React, Vite, Git… and Claude, the AI assistant in my workflow.' },
    { id: 'projects', label: 'My projects', mark: '◰', color: '#8FB9C0', say: 'Real websites I’ve built — including Equitytech and my own brand, ShopCalmCanvas.' },
    { id: 'creative', label: 'Creative corner', mark: '✎', color: '#F6D3C2', say: 'Where my design, writing and animation experiments live.' },
    { id: 'playground', label: 'Playground', mark: '✦', color: '#E9E2F6', say: 'Want to play? There’s a little playground where you can fling flowers around.' },
    { id: 'contact', label: 'Say hello', mark: '✉', color: '#B4D8DC', say: 'Have an idea? I’d love to hear about it — let’s create something together!' },
  ],
};

/** Milestones shown on the scroll companion's trail (in page order). */
export const trail = [
  { id: 'home', label: 'Hello' },
  { id: 'tour', label: 'Tour' },
  { id: 'about', label: 'About' },
  { id: 'journey', label: 'Journey' },
  { id: 'skills', label: 'Toolbox' },
  { id: 'projects', label: 'Projects' },
  { id: 'creative', label: 'Creative' },
  { id: 'mind', label: 'Me, me' },
  { id: 'approach', label: 'Approach' },
  { id: 'playground', label: 'Play' },
  { id: 'contact', label: 'Say hi' },
];

export const traits = [
  { label: 'Curiosity', note: 'Always asking how things work.', color: 'aqua' },
  { label: 'Creativity', note: 'Ideas first, then pixels.', color: 'lavender' },
  { label: 'Imagination', note: 'Little worlds, big ideas.', color: 'peach' },
  { label: 'Analytical thinking', note: 'A chemist’s eye for detail.', color: 'teal' },
  { label: 'Learning new things', note: 'One new tool at a time.', color: 'lavender' },
  { label: 'Visual storytelling', note: 'Design that says something.', color: 'aqua' },
];

export const notes = [
  'A little obsessed with beautiful design.',
  'Always finding something new to learn.',
  'Turning random ideas into creative experiments.',
  'Finding art in the little details.',
];

export const approach = [
  {
    step: 'Understand',
    text: 'I start by understanding the project’s purpose, audience and goals.',
    art: 'understand',
  },
  {
    step: 'Design',
    text: 'I explore the layout, visual identity and user experience to create a coherent direction.',
    art: 'design',
  },
  {
    step: 'Develop',
    text: 'I turn the design into a functional, responsive frontend using suitable modern technologies.',
    art: 'develop',
  },
  {
    step: 'Refine',
    text: 'I test, improve and optimise the website for usability, responsiveness, accessibility and performance.',
    art: 'refine',
  },
];

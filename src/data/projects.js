/**
 * Projects. Add an object to publish a new case study — it appears in the gallery
 * and at  /#/work/<slug>.
 *
 * Screenshots: save them in src/assets/projects/ (WebP, ~1600px wide), then e.g.
 *   import equitytechHome from '../assets/projects/equitytech-home.webp';
 * and set  image: equitytechHome   (and  gallery: [{ src, alt, caption }]).
 * Until an image is set, a soft illustrated preview is shown (never a fake screenshot).
 *
 * Only write what you can confirm. Empty fields are hidden in the case study.
 */
export const projects = [
  {
    slug: 'equitytech',
    name: 'Equitytech',
    url: 'https://www.equitytech.pk/',
    linkLabel: 'Visit Website',
    domain: 'equitytech.pk',
    repo: '',
    category: 'Corporate Website · Web Development',
    type: 'corporate',
    relationship: 'Client project', // EDIT if needed
    year: '',
    image: null,
    mobileImage: null,
    gallery: [],
    tint: ['#B4D8DC', '#648F9B'],
    summary:
      'A professional corporate website developed to create a polished digital presence for a technology company. This project reflects my experience with frontend implementation, visual presentation, responsive layouts and structured website design.',
    objective: '', // EDIT
    contribution: 'Frontend implementation, visual presentation, responsive layouts and structured website design.',
    approach: '', // EDIT: how you approached the design
    challenges: '', // EDIT: only verified challenges & solutions
    // EDIT: confirm the final stack before launch
    stack: ['HTML', 'CSS', 'JavaScript'],
  },
  {
    slug: 'shopcalmcanvas',
    name: 'ShopCalmCanvas',
    url: 'https://www.shopcalmcanvas.com/',
    linkLabel: 'Explore ShopCalmCanvas',
    domain: 'shopcalmcanvas.com',
    repo: '',
    category: 'E-commerce · Frontend Development · Print-on-Demand',
    type: 'shop',
    relationship: 'My own brand',
    year: '',
    image: null,
    mobileImage: null,
    gallery: [],
    tint: ['#B9AADB', '#776991'],
    summary:
      'ShopCalmCanvas is my own lifestyle e-commerce brand, where I bring together web development, product presentation and creative visual design. The website combines an elegant shopping experience with product collections and an integrated print-on-demand workflow.',
    objective: '',
    contribution: 'Web development, product presentation and creative visual design for my own brand.',
    approach: '',
    challenges: '',
    // EDIT: add the verified print-on-demand / commerce integration details
    stack: ['React', 'Vite', 'JavaScript'],
    integrations: [], // e.g. ['Printful'] once confirmed
  },

  /* ── Template for your other completed projects ─────────────────
  {
    slug: 'my-project',
    name: 'My Project',
    url: '',
    linkLabel: 'Visit Website',
    domain: 'my-project.com',
    repo: '',
    category: 'React Application',
    type: 'app',            // corporate | shop | app
    relationship: 'Personal project',
    year: '',
    image: null,
    mobileImage: null,
    gallery: [],
    tint: ['#F6D3C2', '#776991'],
    summary: '',
    objective: '',
    contribution: '',
    approach: '',
    challenges: '',
    stack: [],
  },
  ────────────────────────────────────────────────────────────────── */
];

/** How many completed projects in total (shown in the "more projects" note). */
export const totalCompletedProjects = '5+';

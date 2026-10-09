/**
 * Creative Corner. Add only your own work.
 *
 *  design:    { title, src, alt, tool }                 — images (import from ../assets/creative/)
 *  writing:   { title, excerpt, link, kind }            — text-led pieces (link optional)
 *  animation: { title, src, poster, tool, link }        — videos (mp4/webm) or external links
 */
export const creative = {
  design: [],
  writing: [],
  animation: [],
};

export const creativeAreas = [
  {
    id: 'design',
    letter: 'A',
    title: 'Graphic Design',
    intro: 'Photoshop work, Canva designs, creative compositions and digital visual experiments.',
    tools: ['Photoshop', 'Canva'],
    empty: 'a new piece is on its way',
  },
  {
    id: 'writing',
    letter: 'B',
    title: 'Content Creation & Writing',
    intro: 'Content writing, creative storytelling, social media content and visual communication.',
    tools: ['Writing', 'Social', 'Storytelling'],
    empty: 'words are being polished',
  },
  {
    id: 'animation',
    letter: 'C',
    title: 'Animation & Video',
    intro: 'FlipaClip animations, CapCut edits, animated short videos and little experiments in motion.',
    tools: ['FlipaClip', 'CapCut'],
    empty: 'frames are still being drawn',
  },
];

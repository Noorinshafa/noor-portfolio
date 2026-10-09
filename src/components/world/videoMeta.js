// Facts about src/assets/video/noor-hero.mp4 (generated from Noor's character animation).
// The file stacks the colour frames on top and a greyscale alpha matte underneath,
// so the background can be removed in the browser with plain H.264 / VP9 video.
// Frames are upscaled 2x (Lanczos + light sharpening) for crisp rendering on retina screens.
// Frames 0–191 are the original animation; frames 192–281 replay 190→101 backwards,
// so looping from frame 100 to the end gives a seamless typing loop.
export const VIDEO = {
  width: 672,
  colorHeight: 1364,
  alphaOffset: 1396, // colour height + 32px gap
  totalHeight: 2760,
  fps: 24,
  feetPad: 12 / 682, // transparent rows under her feet
  laptop: [0.63, 0.29], // laptop lid (u, v) once it is open
  openAt: 2.6, // seconds — the moment the lid lifts
  loopStart: 100 / 24,
  loopEnd: 11.7,
  stillAt: 6.25, // a nice typing frame for reduced-motion
};

// The sitting "tour guide" clip: played forward then backward (frames 0→191→1),
// so it loops seamlessly on its own. Upscaled 1.2x.
export const SITTING = {
  width: 996,
  colorHeight: 768,
  alphaOffset: 800,
  totalHeight: 1568,
  stillAt: 7.5,
};

// Standing with arms crossed (About section): the camera slowly circles her; the clip
// plays forward then backward (frames 0→239→1) so it loops seamlessly. Upscaled 1.3x.
export const STANDING = {
  width: 682,
  colorHeight: 928,
  alphaOffset: 960,
  totalHeight: 1888,
  stillAt: 2.5,
};

// Interlude (between Creative Corner and "A Little Bit of Everything…"): Noor uncrosses her arms
// and taps a floating "run" tile, which turns into a Git tile. Static camera; played forward then
// backward so it loops seamlessly on its own. Upscaled 1.5x.
export const INTERLUDE = {
  width: 546,
  colorHeight: 1060,
  alphaOffset: 1092,
  totalHeight: 2152,
  stillAt: 0.8,
};

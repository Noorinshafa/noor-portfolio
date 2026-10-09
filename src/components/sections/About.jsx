import { useCallback, useEffect, useState } from 'react';
import Reveal from '../animations/Reveal';
import SectionHeading from '../ui/SectionHeading';
import AlphaVideo from '../world/AlphaVideo';
import { STANDING } from '../world/videoMeta';
import { supportsWebGL2 } from './Hero';
import useReducedMotion from '../../hooks/useReducedMotion';
import { site } from '../../data/site';
import characterPortrait from '../../assets/images/noor-character-portrait.webp';
import standingWebm from '../../assets/video/noor-standing.webm';
import standingMp4 from '../../assets/video/noor-standing.mp4';
import standingStill from '../../assets/images/noor-standing.webp';

/** Tiny doodles that reference code, art and science. */
const Doodle = {
  code: (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <rect x="4" y="8" width="40" height="32" rx="7" fill="#E3F0F1" stroke="#648F9B" strokeWidth="2" />
      <path d="M18 20l-5 4 5 4M30 20l5 4-5 4M26 17l-4 14" stroke="#385A69" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  art: (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 6c11 0 19 8 19 17 0 6-4 8-8 8h-4c-2 0-3 2-2 4 2 3 0 7-5 7C13 42 5 34 5 24S13 6 24 6z" fill="#E9E2F6" stroke="#776991" strokeWidth="2" />
      <circle cx="16" cy="20" r="3" fill="#B9AADB" />
      <circle cx="24" cy="14" r="3" fill="#F6D3C2" />
      <circle cx="32" cy="19" r="3" fill="#8FB9C0" />
    </svg>
  ),
  science: (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M19 6h10M21 6v12L10 38a3 3 0 0 0 3 4h22a3 3 0 0 0 3-4L27 18V6" fill="#FBEAE1" stroke="#776991" strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 31h20" stroke="#B9AADB" strokeWidth="2" />
      <circle cx="22" cy="35" r="2" fill="#B9AADB" />
      <circle cx="28" cy="33" r="1.5" fill="#8FB9C0" />
    </svg>
  ),
};

export default function About() {
  const reduced = useReducedMotion();
  const [use3D, setUse3D] = useState(false);
  useEffect(() => setUse3D(supportsWebGL2()), []);
  const onFail = useCallback(() => setUse3D(false), []);

  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="wrap about__grid">
        <div className="about__scrapbook">
          <span className="about__arch" aria-hidden="true">
            <span className="about__rays" />
          </span>
          <span className="about__floor" aria-hidden="true" />

          {/* Noor standing in front of her own introduction, arms crossed */}
          <Reveal className="about__noor-wrap" variant="rise">
            {use3D ? (
              <AlphaVideo
                className="about__noor"
                webm={standingWebm}
                mp4={standingMp4}
                meta={STANDING}
                reducedMotion={reduced}
                onFail={onFail}
                label="Noor’s character standing confidently with her arms crossed, smiling, with her laptop and tote bag at her feet."
              />
            ) : (
              <img className="about__noor about__still" src={standingStill} alt="Noor’s character standing confidently with her arms crossed" loading="lazy" />
            )}
          </Reveal>

          <p className="scribble about__hi" aria-hidden="true">
            hi, that’s me ✿
          </p>

          <Reveal className="polaroid polaroid--mini" variant="tilt" delay={250}>
            <span className="tape tape--top" aria-hidden="true" />
            {site.portrait ? (
              <img src={site.portrait} alt={`Portrait of ${site.name}`} loading="lazy" />
            ) : (
              <img src={characterPortrait} alt="Close-up of Noor’s character in a lavender hijab with sunglasses resting on top" loading="lazy" width="260" height="420" />
            )}
            <span className="polaroid__caption scribble">{site.portrait ? 'the real me ✿' : 'my character ✿'}</span>
          </Reveal>

          <Reveal className="sticky sticky--lav" delay={200}>A curious mind</Reveal>
          <Reveal className="sticky sticky--aqua" delay={300}>Creative soul</Reveal>
          <Reveal className="sticky sticky--peach" delay={400}>Always learning</Reveal>

          <div className="doodles" aria-hidden="true">
            <span className="doodle doodle--code">{Doodle.code}</span>
            <span className="doodle doodle--art">{Doodle.art}</span>
            <span className="doodle doodle--science">{Doodle.science}</span>
          </div>
        </div>

        <div className="about__copy">
          <SectionHeading
            eyebrow="About me · the girl behind the code"
            lead="More Than Just a"
            accent="Developer."
            id="about-title"
          />
          <Reveal className="about__text" delay={120}>
            <p className="about__lead">
              Behind every line of code, there’s a little curiosity, a lot of imagination and a girl who loves creating
              things.
            </p>
            <p>
              My journey has taken me from studying Chemistry to exploring the world of frontend development. My academic
              background helped me develop an analytical approach to learning and problem-solving. Web development
              introduced me to a space where I could combine that logical mindset with visual creativity.
            </p>
            <p>
              I enjoy transforming ideas into responsive, beautiful and functional websites. But coding is only one part
              of what I love doing. Graphic design, content creation, writing and animation give me other ways to express
              my creativity.
            </p>
            <p>
              I’m someone who enjoys learning, experimenting and discovering new ways to bring ideas to life. My goal is to
              continue growing as a frontend developer while exploring the creative possibilities of technology.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import HeroScene from './HeroScene';
import { VIDEO } from './videoMeta';
import heroMp4 from '../../assets/video/noor-hero.mp4';
import heroWebm from '../../assets/video/noor-hero.webm';

/**
 * Plays Noor's character animation through WebGL (removing its background with the
 * stacked alpha matte) and runs the laptop "tech burst". Pauses off-screen.
 */
const HeroWorld = forwardRef(function HeroWorld({ reducedMotion, onReady, onError, label }, ref) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const sceneRef = useRef(null);

  useImperativeHandle(ref, () => ({
    replay: () => {
      const v = videoRef.current;
      const s = sceneRef.current;
      if (!v || !s) return;
      s.reset();
      v.currentTime = 0;
      v.play().catch(() => {});
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const lite = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;
    let scene;
    try {
      scene = new HeroScene(canvas, video, { lite, reducedMotion });
      sceneRef.current = scene;
    } catch (err) {
      onError?.(err);
      return undefined;
    }

    let raf = 0;
    let visible = false;
    let ready = false;
    const loop = (now) => {
      if (video.currentTime >= VIDEO.loopEnd) video.currentTime = VIDEO.loopStart; // seamless typing loop
      scene.render(now);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (reducedMotion || raf || !visible || document.hidden) return;
      video.play().catch(() => {});
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      video.pause();
    };

    const onFrameReady = () => {
      if (!ready) {
        ready = true;
        onReady?.();
      }
      if (reducedMotion) scene.render();
    };
    video.addEventListener('loadeddata', onFrameReady);
    video.addEventListener('seeked', onFrameReady);
    if (reducedMotion) {
      const seekStill = () => (video.currentTime = VIDEO.stillAt);
      if (video.readyState >= 1) seekStill();
      else video.addEventListener('loadedmetadata', seekStill, { once: true });
    }
    video.addEventListener('error', () => onError?.(new Error('video failed')));

    const ro = new ResizeObserver(() => {
      scene.resize();
      scene.render();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);
    const onPointer = (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = canvas.getBoundingClientRect();
      scene.setPointer((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2), (e.clientY - (r.top + r.height * 0.4)) / (window.innerHeight / 2));
      scene.setPointerNDC(((e.clientX - r.left) / r.width) * 2 - 1, 1 - ((e.clientY - r.top) / r.height) * 2);
    };
    window.addEventListener('pointermove', onPointer, { passive: true });
    const onLost = (e) => {
      e.preventDefault();
      stop();
      onError?.(new Error('WebGL context lost'));
    };
    canvas.addEventListener('webglcontextlost', onLost);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      video.removeEventListener('loadeddata', onFrameReady);
      video.removeEventListener('seeked', onFrameReady);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onPointer);
      canvas.removeEventListener('webglcontextlost', onLost);
      scene.dispose();
      sceneRef.current = null;
    };
  }, [reducedMotion, onReady, onError]);

  return (
    <>
      <video ref={videoRef} className="hero-video-src" muted playsInline preload="auto" crossOrigin="anonymous" aria-hidden="true" tabIndex={-1}>
        <source src={heroWebm} type="video/webm" />
        <source src={heroMp4} type="video/mp4" />
      </video>
      <canvas ref={canvasRef} className="world-canvas" role="img" aria-label={label} />
    </>
  );
});

export default HeroWorld;
